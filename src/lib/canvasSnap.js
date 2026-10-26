// Pure helpers for canvas snapping. They are intentionally framework and DOM
// free so they can be tested directly.

export const DEFAULT_GRID = 8

export function snapToGrid(value, grid = DEFAULT_GRID) {
  if (typeof value !== 'number' || Number.isNaN(value)) return value
  return Math.round(value / grid) * grid
}

export function selectionBounds(rects = []) {
  if (!Array.isArray(rects) || rects.length === 0) return null
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity
  for (const rect of rects) {
    left = Math.min(left, rect.left)
    top = Math.min(top, rect.top)
    right = Math.max(right, rect.left + rect.width)
    bottom = Math.max(bottom, rect.top + rect.height)
  }
  return { left, top, right, bottom, width: right - left, height: bottom - top }
}

export function guideCandidates(value, targets = [], tolerance = 6) {
  const result = []
  for (const target of targets) {
    if (Math.abs(target - value) <= tolerance) result.push(target)
  }
  return result
}