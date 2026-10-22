// Local-first project storage.
//
// Every project the user creates is written to localStorage first, so the
// editor works with no account, no server and no network. When a user signs
// in, `src/lib/projects.js` transparently mirrors the same data to Supabase.

const KEY = 'workspace68.local.projects.v1'
const ACTIVE_KEY = 'workspace68.local.active.v1'

export const LOCAL_ID_PREFIX = 'local_'

export function isLocalId(id) {
  return typeof id === 'string' && id.startsWith(LOCAL_ID_PREFIX)
}

function safeParse(raw, fallback) {
  try {
    const value = JSON.parse(raw)
    return value ?? fallback
  } catch {
    return fallback
  }
}

function readAll() {
  if (typeof window === 'undefined') return []
  const parsed = safeParse(window.localStorage.getItem(KEY), [])
  return Array.isArray(parsed) ? parsed.filter((p) => p && typeof p.id === 'string') : []
}

function writeAll(projects) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(projects))
  } catch (error) {
    console.error('Could not save projects in this browser:', error)
  }
}

/** A local project row, shaped like a Supabase `projects` row. */
function makeRow({ id, name, document, status = 'draft', slug = null }) {
  return {
    id,
    name,
    document,
    status,
    slug,
    owner_id: null,
    source: 'local',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export function listLocalProjects() {
  return readAll()
    .map(({ source, ...row }) => ({ ...row, source: 'local' }))
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
}

export function getLocalProject(id) {
  if (!isLocalId(id)) return null
  const found = readAll().find((p) => p.id === id)
  if (!found) return null
  return { ...found, source: 'local' }
}

export function createLocalProject(name, document) {
  const id = `${LOCAL_ID_PREFIX}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  const row = makeRow({ id, name, document })
  const projects = readAll()
  projects.push(row)
  writeAll(projects)
  return { ...row, source: 'local' }
}

export function saveLocalProject(id, document, name) {
  const projects = readAll()
  const index = projects.findIndex((p) => p.id === id)
  if (index === -1) {
    const created = createLocalProject(name || document?.name || 'Untitled', document)
    return created
  }
  projects[index] = {
    ...projects[index],
    name: name || document?.name || projects[index].name,
    document,
    updated_at: new Date().toISOString(),
  }
  writeAll(projects)
  return { ...projects[index], source: 'local' }
}

export function deleteLocalProject(id) {
  writeAll(readAll().filter((p) => p.id !== id))
}

/** Mirror a local project into the cloud library under a new cloud id. */
export function snapshotLocalProject(id) {
  const found = getLocalProject(id)
  if (!found) return null
  return { name: found.name, document: structuredClone(found.document) }
}

export function setActiveLocalProject(id) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ACTIVE_KEY, id)
  } catch {
    /* storage unavailable — non-fatal */
  }
}

export function getActiveLocalProjectId() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(ACTIVE_KEY)
}
