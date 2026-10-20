// Shared drop-resolution logic for the editor.
//
// The whole editor (left palette + canvas) lives in ONE DndContext, so a
// single droppable registry is shared and `over` can always point at a real
// container. This module turns "what is the pointer over?" into
// "which container + which index should this land in?".

import { COMPONENTS } from '../data/components'
import * as T from './tree'

export const ROOT_ID = 'root'

/** Container droppables are registered under this prefix. */
export const DROP_PREFIX = 'ws-drop:'

export function dropIdFor(containerId) {
  return `${DROP_PREFIX}${containerId}`
}

/** A container can accept children: section, container, row, column. */
export function isContainerType(type) {
  return !!COMPONENTS[type]?.canHaveChildren
}

function isPointWithinRect(point, rect) {
  return (
    rect.top <= point.y &&
    point.y <= rect.bottom &&
    rect.left <= point.x &&
    point.x <= rect.right
  )
}

/**
 * Collision detection for the editor.
 *
 * dnd-kit's default `closestCenter` picks whichever droppable has the
 * closest *centre* to the pointer, so a drop anywhere inside a large
 * section snaps to a random child instead of landing where the cursor is.
 *
 * We use a pointer-in-rect test instead, then rank the hits by how deeply
 * nested they are in the page tree. The deepest match wins, so hovering a
 * heading targets that heading (a position between siblings), while
 * hovering the empty padding of a column targets the column itself.
 * At equal depth an explicit container droppable beats the element's own
 * sortable droppable, so empty containers stay easy to drop into.
 */
export function editorCollisionDetection(args) {
  const { droppableContainers, droppableRects, pointerCoordinates } = args
  if (!pointerCoordinates) return []

  const collisions = []
  for (const container of droppableContainers) {
    const rect = droppableRects.get(container.id)
    if (!rect || !isPointWithinRect(pointerCoordinates, rect)) continue

    const data = container.data?.current
    const depth = typeof data?.depth === 'number' ? data.depth : 0
    const isContainerDrop = data?.type === 'container'

    // Deeper wins; at equal depth prefer the container droppable.
    const priority = depth * 2 + (isContainerDrop ? 1 : 0)
    collisions.push({
      id: container.id,
      data: { droppableContainer: container, value: -priority },
    })
  }

  return collisions.sort((a, b) => a.data.value - b.data.value)
}

/** The first child of `containerId` that can itself hold children. */
function firstColumnChild(root, containerId) {
  const container = T.findById(root, containerId)
  if (!container) return null
  const col = container.children?.find((c) => COMPONENTS[c.type]?.canHaveChildren)
  return col ? col.id : null
}

/**
 * Where does a block dropped on the page background go?
 *
 * Content blocks are never left naked at the root — the page is made of
 * sections, so we tuck the block into the last section's column, which
 * reads as "append to the end of the page".
 */
export function resolveRootTarget(elements, draggedType) {
  const root = elements.root || []
  if (!draggedType || draggedType === 'section') {
    return { containerId: ROOT_ID, index: null }
  }
  const sections = root.filter((s) => s.type === 'section')
  const target = sections[sections.length - 1] || root[root.length - 1]
  if (!target) return { containerId: ROOT_ID, index: null }
  const col = target.children?.find((c) => COMPONENTS[c.type]?.canHaveChildren)
  return { containerId: col ? col.id : target.id, index: null }
}

/**
 * Work out the destination container + insertion index for a drop.
 *
 * @param over        dnd-kit `over` object (`id`, `rect`, `data`)
 * @param elements    `{ root: [...] }` — the current page tree
 * @param draggedType component type of the dragged item (e.g. 'heading')
 * @param activeId    id of the dragged element (null for palette drags)
 * @param pointerY    pointer Y in viewport coords — decides "before" vs "after"
 */
export function resolveDrop(over, elements, draggedType, activeId = null, pointerY = null) {
  if (!over) return null

  const data = over.data?.current
  const root = elements.root || []

  // A container can never be dropped into itself or one of its descendants.
  const isInvalidTarget = (containerId) =>
    !!activeId && (activeId === containerId || T.isDescendant(root, activeId, containerId))

  // ---- Case 1: dropped on a container droppable (`ws-drop:<containerId>`) ----
  if (data?.type === 'container') {
    const containerId = data.containerId
    if (containerId === ROOT_ID) {
      return resolveRootTarget(elements, draggedType)
    }
    if (isInvalidTarget(containerId)) return null
    const col = firstColumnChild(root, containerId)
    const target = col || containerId
    if (isInvalidTarget(target)) return null
    return { containerId: target, index: null }
  }

  // ---- Case 2: dropped on a canvas element (sortable) ----
  if (data?.source === 'canvas') {
    const overEl = T.findById(root, over.id)
    if (!overEl) return null

    const parentId = data.containerId || ROOT_ID

    // Hovering a container means "drop inside it".
    if (isContainerType(overEl.type)) {
      const col = firstColumnChild(root, overEl.id)
      const target = col || overEl.id
      if (isInvalidTarget(target)) return null
      return { containerId: target, index: null }
    }

    // Otherwise treat the hovered element as a sibling: insert before or
    // after it depending on which half of it the pointer is in.
    const list = parentId === ROOT_ID ? root : T.findById(root, parentId)?.children
    if (!list) return null

    const index = list.findIndex((x) => x.id === over.id)
    if (index < 0) return { containerId: parentId, index: null }

    let insertAt = index
    if (pointerY != null && over.rect) {
      const midY = over.rect.top + over.rect.height / 2
      if (pointerY > midY) insertAt = index + 1
    }

    if (isInvalidTarget(parentId)) return null
    return { containerId: parentId, index: insertAt }
  }

  return null
}

/**
 * Where should a palette block land when it is *clicked* (not dragged)?
 *
 * Prefers the current selection so clicking a block behaves like
 * "insert next to what I have selected".
 */
export function getInsertTarget(elements, selectedId, draggedType) {
  const root = elements.root || []

  // Sections always live at the root of the page.
  if (draggedType === 'section') {
    if (selectedId) {
      const info = T.findContainerInfo(root, selectedId)
      if (info?.containerId === ROOT_ID) {
        return { containerId: ROOT_ID, index: info.index + 1 }
      }
    }
    return { containerId: ROOT_ID, index: null }
  }

  if (selectedId) {
    const sel = T.findById(root, selectedId)
    // Selected a container: drop inside it.
    if (sel && isContainerType(sel.type)) {
      const col = firstColumnChild(root, sel.id)
      return { containerId: col || sel.id, index: null }
    }
    // Selected a leaf: drop right after it, in the same container.
    const info = T.findContainerInfo(root, selectedId)
    if (info?.containerId) {
      const list =
        info.containerId === ROOT_ID ? root : T.findById(root, info.containerId)?.children
      const listIndex = list ? list.findIndex((x) => x.id === selectedId) : -1
      return {
        containerId: info.containerId,
        index: listIndex >= 0 ? listIndex + 1 : null,
      }
    }
  }

  return resolveRootTarget(elements, draggedType)
}

/**
 * Describe what the pointer is over, for drop feedback in the UI.
 * Returns `position`: 'inside' | 'before' | 'after' | null.
 */
export function describeOver(over, elements, pointerY) {
  if (!over) return { position: null, overId: null }

  const data = over.data?.current

  if (data?.type === 'container') {
    return { position: 'inside', overId: null }
  }

  if (data?.source === 'canvas') {
    const overEl = T.findById(elements.root || [], over.id)
    if (overEl && isContainerType(overEl.type)) {
      return { position: 'inside', overId: over.id }
    }
    let position = 'before'
    if (pointerY != null && over.rect) {
      const midY = over.rect.top + over.rect.height / 2
      position = pointerY > midY ? 'after' : 'before'
    }
    return { position, overId: over.id }
  }

  return { position: null, overId: null }
}
