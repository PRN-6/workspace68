import { create } from 'zustand'
import { uid, sanitizePath } from '../lib/id'
import * as T from '../lib/tree'
import { buildElement } from '../data/components'
import { createPortfolioPage } from '../data/templates'
import { isValidProject } from '../lib/workspaceFile'

const WORKSPACES_KEY = 'workspace68.projects.v1'

function freshPage(name = 'Home', path = '/') {
  return { id: uid('page'), name, path, root: [] }
}

function newWorkspace(name, project = { name, pages: [freshPage()] }) {
  return { id: uid('workspace'), name, project, updatedAt: new Date().toISOString() }
}

const PORTFOLIO_THEME = {
  backgroundColor: {
    '#0b1220': '#090909',
    '#f8fafc': '#111111',
    '#f5f5f5': '#111111',
    '#a5b4fc': '#e11d2e',
    '#ffffff': '#1b1b1b',
  },
  color: {
    '#f8fafc': '#f5f5f5',
    '#a5b4fc': '#ff3347',
    '#a1aaba': '#b0b0b0',
    '#111827': '#ffffff',
    '#0f172a': '#f5f5f5',
    '#6366f1': '#ff3347',
    '#c7d2fe': '#ff6b73',
    '#64748b': '#b0b0b0',
  },
}

function migratePortfolioTheme(project) {
  if (project.themeVersion >= 3) return project
  const migrated = structuredClone(project)
  let hasPortfolioStarter = false
  for (const page of migrated.pages) {
    T.walk(page.root, (element) => {
      if (element.name === 'Hero') hasPortfolioStarter = true
      if (element.name === 'Selected work') hasPortfolioStarter = true
      for (const [key, colors] of Object.entries(PORTFOLIO_THEME)) {
        if (colors[element.style[key]]) element.style[key] = colors[element.style[key]]
      }
    })
  }
  if (!hasPortfolioStarter) return project
  migrated.themeVersion = 3
  return migrated
}

function sanitizeProjectLayout(project) {
  if (!project || !Array.isArray(project.pages)) return project
  let modified = false
  const updated = structuredClone(project)

  for (const page of updated.pages) {
    if (!Array.isArray(page.root)) continue

    // 1. Sections must NEVER have position: 'absolute' or fixed dimensions that break page flow
    T.walk(page.root, (element) => {
      if (element.type === 'section' && (element.style?.position === 'absolute' || element.layout?.mode === 'free')) {
        modified = true
        delete element.style.position
        delete element.style.left
        delete element.style.top
        delete element.style.right
        delete element.style.bottom
        delete element.style.width
        delete element.style.height
        delete element.style.margin
        delete element.layout
      }
    })

    // 2. Prevent orphan non-section content blocks sitting naked at page.root
    const sections = page.root.filter((el) => el.type === 'section')
    if (sections.length > 0) {
      const nonSections = page.root.filter((el) => el.type !== 'section')
      if (nonSections.length > 0) {
        modified = true
        page.root = page.root.filter((el) => el.type === 'section')
        const targetSection = sections[0]
        const col = targetSection.children?.find((c) => COMPONENTS[c.type]?.canHaveChildren)
        const targetList = col ? col.children : targetSection.children
        if (targetList) {
          for (const item of nonSections) {
            if (item.style?.position === 'absolute') {
              delete item.style.position
              delete item.style.left
              delete item.style.top
              delete item.style.right
              delete item.style.bottom
              delete item.style.margin
              delete item.layout
            }
            targetList.push(item)
          }
        }
      }
    }
  }

  return modified ? updated : project
}

function restoreWorkspaces() {
  try {
    const saved = JSON.parse(localStorage.getItem(WORKSPACES_KEY) || 'null')
    if (!Array.isArray(saved?.workspaces)) return null
    let hasChanges = false
    const workspaces = saved.workspaces
      .filter(
        (workspace) =>
          workspace &&
          typeof workspace.id === 'string' &&
          typeof workspace.name === 'string' &&
          isValidProject(workspace.project)
      )
      .map((workspace) => {
        let project = workspace.project
        if (project.name === 'My Portfolio') {
          project = migratePortfolioTheme(project)
        }
        project = sanitizeProjectLayout(project)
        if (project !== workspace.project) {
          hasChanges = true
          return { ...workspace, project, updatedAt: new Date().toISOString() }
        }
        return workspace
      })
    const active = workspaces.find((workspace) => workspace.id === saved.currentWorkspaceId)
    if (!workspaces.length || !active) return null
    if (hasChanges) {
      localStorage.setItem(WORKSPACES_KEY, JSON.stringify({ ...saved, workspaces }))
    }
    return { workspaces, currentWorkspaceId: active.id, project: active.project }
  } catch (error) {
    console.error('Could not restore saved workspace projects:', error)
    return null
  }
}

function snapshot(state) {
  return state.project.pages.map((p) => ({ ...p, root: structuredClone(p.root) }))
}

function withCurrentPage(state, fn) {
  const pages = snapshot(state)
  const page = pages.find((p) => p.id === state.currentPageId)
  if (!page) return null
  fn(page)
  const past = [...state.past, state.project.pages].slice(-60)
  return { project: { ...state.project, pages }, past, future: [] }
}

const restored = restoreWorkspaces()
const FIRST_PROJECT = { name: 'My Portfolio', pages: [createPortfolioPage()] }
const FIRST_WORKSPACE = newWorkspace(FIRST_PROJECT.name, FIRST_PROJECT)
const INITIAL_WORKSPACES = restored?.workspaces || [FIRST_WORKSPACE]
const INITIAL_WORKSPACE_ID = restored?.currentWorkspaceId || FIRST_WORKSPACE.id

const useEditorStore = create((set, get) => ({
  project: restored?.project || FIRST_PROJECT,
  workspaces: INITIAL_WORKSPACES,
  currentWorkspaceId: INITIAL_WORKSPACE_ID,
  currentPageId: (restored?.project || FIRST_PROJECT).pages[0].id,
  selectedId: null,
  hoveredId: null,
  editingId: null,
  viewport: 'desktop', // desktop | tablet | mobile
  darkMode: true,
  previewMode: false,
  previewPageId: null,
  rightTab: 'style', // style | action | animation
  leftTab: 'blocks', // blocks | layers
  past: [],
  future: [],

  init: (pages) => {
    const list = pages && pages.length ? pages : [freshPage()]
    set({ project: { ...get().project, pages: list }, currentPageId: list[0].id, selectedId: null, editingId: null, past: [], future: [] })
  },

  currentPage: () => {
    const s = get()
    return s.project.pages.find((p) => p.id === s.currentPageId) || s.project.pages[0]
  },

  selectElement: (id) => set({ selectedId: id, editingId: null }),
  setHovered: (id) => set({ hoveredId: id }),
  setEditing: (id) => set({ editingId: id }),
  setViewport: (v) => set({ viewport: v }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  setRightTab: (tab) => set({ rightTab: tab }),
  setLeftTab: (tab) => set({ leftTab: tab }),

  setProjectName: (name) =>
    set((s) => ({ project: { ...s.project, name } })),

  togglePreview: () =>
    set((s) => ({
      previewMode: !s.previewMode,
      previewPageId: s.previewMode ? null : s.currentPageId,
    })),

  setPreviewPage: (id) => set({ previewPageId: id }),

  setCurrentPage: (id) => set({ currentPageId: id, selectedId: null, editingId: null }),

  addPage: () =>
    set((s) => {
      const name = `Page ${s.project.pages.length + 1}`
      const path = sanitizePath(name)
      const pages = snapshot(s)
      pages.push(freshPage(name, path))
      const past = [...s.past, s.project.pages].slice(-60)
      return {
        project: { ...s.project, pages },
        past,
        future: [],
        currentPageId: pages[pages.length - 1].id,
        selectedId: null,
      }
    }),

  removePage: (id) =>
    set((s) => {
      if (s.project.pages.length <= 1) return s
      const pages = snapshot(s).filter((p) => p.id !== id)
      const past = [...s.past, s.project.pages].slice(-60)
      const currentPageId = s.currentPageId === id ? pages[0].id : s.currentPageId
      return { project: { ...s.project, pages }, past, future: [], currentPageId, selectedId: null, editingId: null }
    }),

  setPageName: (id, name) =>
    set((s) => {
      const pages = snapshot(s).map((p) =>
        p.id === id ? { ...p, name, path: sanitizePath(name) } : p
      )
      return { project: { ...s.project, pages } }
    }),

  setPagePath: (id, path) =>
    set((s) => {
      const normalized = `/${String(path).trim().replace(/^\/+|\/+$/g, '')}`
      const pages = snapshot(s).map((p) => (p.id === id ? { ...p, path: normalized || '/' } : p))
      return { project: { ...s.project, pages } }
    }),

  replaceCurrentPageRoot: (root) =>
    set((s) => {
      if (!Array.isArray(root)) return s
      const next = withCurrentPage(s, (page) => {
        page.root = structuredClone(root)
      })
      if (!next) return s
      return {
        ...next,
        selectedId: null,
        hoveredId: null,
        editingId: null,
        previewMode: false,
        previewPageId: null,
      }
    }),

  renameProject: (name) => set((s) => ({ project: { ...s.project, name } })),

  createWorkspace: () =>
    set((s) => {
      const workspace = newWorkspace('Untitled project')
      return {
        workspaces: [...s.workspaces, workspace],
        currentWorkspaceId: workspace.id,
        project: workspace.project,
        currentPageId: workspace.project.pages[0].id,
        selectedId: null,
        editingId: null,
        previewMode: false,
        previewPageId: null,
        past: [],
        future: [],
      }
    }),

  openWorkspace: (id) =>
    set((s) => {
      const workspace = s.workspaces.find((item) => item.id === id)
      if (!workspace) return s
      return {
        currentWorkspaceId: workspace.id,
        project: workspace.project,
        currentPageId: workspace.project.pages[0].id,
        selectedId: null,
        editingId: null,
        previewMode: false,
        previewPageId: null,
        past: [],
        future: [],
      }
    }),

  importWorkspace: (project) =>
    set((s) => {
      const sanitized = sanitizeProjectLayout(structuredClone(project))
      const workspace = newWorkspace(project.name || 'Imported project', sanitized)
      return {
        workspaces: [...s.workspaces, workspace],
        currentWorkspaceId: workspace.id,
        project: workspace.project,
        currentPageId: workspace.project.pages[0].id,
        selectedId: null,
        editingId: null,
        previewMode: false,
        previewPageId: null,
        past: [],
        future: [],
      }
    }),

  deleteWorkspace: (id) =>
    set((s) => {
      if (s.workspaces.length <= 1) return s
      const workspaces = s.workspaces.filter((workspace) => workspace.id !== id)
      if (s.currentWorkspaceId !== id) return { workspaces }
      const next = workspaces[0]
      return {
        workspaces,
        currentWorkspaceId: next.id,
        project: next.project,
        currentPageId: next.project.pages[0].id,
        selectedId: null,
        editingId: null,
        previewMode: false,
        previewPageId: null,
        past: [],
        future: [],
      }
    }),

  insertElement: (type, containerId = 'root', index = null) => {
    const el = buildElement(type)
    set((s) => {
      const next = withCurrentPage(s, (page) => {
        let destContainerId = containerId
        let destIndex = index

        // Prevent non-section content blocks from being placed naked at page.root
        if (type !== 'section' && destContainerId === 'root' && page.root.length > 0) {
          const firstSection = page.root.find((n) => n.type === 'section') || page.root[0]
          if (firstSection && COMPONENTS[firstSection.type]?.canHaveChildren) {
            const col = firstSection.children?.find((c) => COMPONENTS[c.type]?.canHaveChildren)
            destContainerId = col ? col.id : firstSection.id
            destIndex = null
          }
        }

        const list = destContainerId === 'root' ? page.root : T.findById(page.root, destContainerId)?.children
        if (!list) return
        list.splice(destIndex == null ? list.length : destIndex, 0, el)
      })
      if (!next) return s
      return { ...next, selectedId: el.id, editingId: null }
    })
    return el.id
  },

  moveElement: (activeId, toContainerId, toIndex = null) => {
    set((s) => {
      if (T.isDescendant(s.currentPage().root, activeId, toContainerId)) return s
      return withCurrentPage(s, (page) => {
        const src = T.findContainerList(page.root, activeId)
        if (!src) return
        const dest = toContainerId === 'root' ? page.root : T.findById(page.root, toContainerId)?.children
        if (!dest) return
        const [el] = src.list.splice(src.index, 1)
        let idx = toIndex == null ? dest.length : toIndex
        if (src.list === dest && src.index < idx) idx -= 1
        idx = Math.max(0, Math.min(idx, dest.length))
        dest.splice(idx, 0, el)
      })
    })
  },

  updateProps: (id, patch) =>
    set((s) =>
      withCurrentPage(s, (page) => {
        const el = T.findById(page.root, id)
        if (el) Object.assign(el.props, patch)
      })
    ),

  updateStyle: (id, patch) =>
    set((s) =>
      withCurrentPage(s, (page) => {
        const el = T.findById(page.root, id)
        if (el) Object.assign(el.style, patch)
      })
    ),

  setElementLayout: (id, stylePatch, layout) =>
    set((s) =>
      withCurrentPage(s, (page) => {
        const el = T.findById(page.root, id)
        if (!el) return
        Object.assign(el.style, stylePatch)
        el.layout = layout
      })
    ),

  restoreElementFlow: (id) =>
    set((s) =>
      withCurrentPage(s, (page) => {
        const el = T.findById(page.root, id)
        if (!el) return
        const flowStyle = el.layout?.flowStyle || {}
        for (const key of ['position', 'left', 'top', 'right', 'bottom', 'width', 'height', 'margin']) {
          delete el.style[key]
        }
        Object.assign(el.style, flowStyle)
        delete el.style.position
        delete el.layout
      })
    ),

  updateElement: (id, patch) =>
    set((s) =>
      withCurrentPage(s, (page) => {
        const el = T.findById(page.root, id)
        if (el) Object.assign(el, patch)
      })
    ),

  updateAction: (id, patch) =>
    set((s) =>
      withCurrentPage(s, (page) => {
        const el = T.findById(page.root, id)
        if (el) {
          el.action = { ...el.action, ...patch }
          if (patch.type === 'none') { el.action.value = ''; el.action.newTab = true }
        }
      })
    ),

  updateAnimation: (id, patch) =>
    set((s) =>
      withCurrentPage(s, (page) => {
        const el = T.findById(page.root, id)
        if (el) {
          el.animation = { ...el.animation, ...patch }
          if (patch.type === 'none') { el.animation.trigger = 'scroll'; el.animation.delay = 0 }
        }
      })
    ),

  removeElement: (id) =>
    set((s) => {
      const next = withCurrentPage(s, (page) => {
        T.removeById(page.root, id)
      })
      if (!next) return s
      const page = next.project.pages.find((p) => p.id === s.currentPageId)
      const stillExists = s.selectedId && T.findById(page.root, s.selectedId)
      return { ...next, selectedId: stillExists ? s.selectedId : null, editingId: null }
    }),

  duplicateElement: (id) =>
    set((s) => {
      let newId = null
      const next = withCurrentPage(s, (page) => {
        const loc = T.findContainerList(page.root, id)
        if (!loc) return
        const clone = T.deepCloneElement(loc.list[loc.index])
        const reassign = (el) => {
          el.id = uid()
          if (el.children?.length) el.children.forEach(reassign)
        }
        reassign(clone)
        newId = clone.id
        loc.list.splice(loc.index + 1, 0, clone)
      })
      if (!next) return s
      return newId ? { ...next, selectedId: newId, editingId: null } : next
    }),

  undo: () =>
    set((s) => {
      if (!s.past.length) return s
      const prev = s.past[s.past.length - 1]
      return {
        project: { ...s.project, pages: prev },
        past: s.past.slice(0, -1),
        future: [s.project.pages, ...s.future].slice(0, 60),
        selectedId: null,
        editingId: null,
      }
    }),

  redo: () =>
    set((s) => {
      if (!s.future.length) return s
      const [next, ...rest] = s.future
      return {
        project: { ...s.project, pages: next },
        past: [...s.past, s.project.pages].slice(-60),
        future: rest,
        selectedId: null,
        editingId: null,
      }
    }),

  reset: () =>
    set({ project: { name: 'My Portfolio', pages: [createPortfolioPage()] }, currentPageId: null, selectedId: null, editingId: null, past: [], future: [] }),
}))

let saveTimer
function saveWorkspaceLibrary(state) {
  try {
    localStorage.setItem(
      WORKSPACES_KEY,
      JSON.stringify({
        workspaces: state.workspaces,
        currentWorkspaceId: state.currentWorkspaceId,
      })
    )
  } catch (error) {
    console.error('Could not save workspace projects in this browser:', error)
  }
}

useEditorStore.subscribe((state, previous) => {
  if (
    state.project === previous.project &&
    state.workspaces === previous.workspaces &&
    state.currentWorkspaceId === previous.currentWorkspaceId
  ) {
    return
  }
  if (state.project !== previous.project) {
    const workspaces = state.workspaces.map((workspace) =>
      workspace.id === state.currentWorkspaceId
        ? { ...workspace, name: state.project.name || workspace.name, project: state.project, updatedAt: new Date().toISOString() }
        : workspace
    )
    if (workspaces.some((workspace, index) => workspace !== state.workspaces[index])) {
      useEditorStore.setState({ workspaces })
      return
    }
  }
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveWorkspaceLibrary(useEditorStore.getState()), 200)
})

window.addEventListener('pagehide', () => {
  clearTimeout(saveTimer)
  saveWorkspaceLibrary(useEditorStore.getState())
})

export { useEditorStore }