import { downloadBlob } from './generateProject'

export function isValidProject(project) {
  if (!project || typeof project !== 'object' || typeof project.name !== 'string') return false
  if (!Array.isArray(project.pages) || project.pages.length === 0) return false

  const validElements = (elements) =>
    Array.isArray(elements) &&
    elements.every(
      (element) =>
        element &&
        typeof element === 'object' &&
        typeof element.id === 'string' &&
        typeof element.type === 'string' &&
        element.props &&
        typeof element.props === 'object' &&
        element.style &&
        typeof element.style === 'object' &&
        (element.children === undefined || validElements(element.children))
    )

  return project.pages.every(
    (page) =>
      page &&
      typeof page === 'object' &&
      typeof page.id === 'string' &&
      typeof page.name === 'string' &&
      typeof page.path === 'string' &&
      validElements(page.root)
  )
}

export async function readWorkspaceFile(file) {
  const contents = await file.text()
  let saved
  try {
    saved = JSON.parse(contents)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  if (saved?.format !== 'workspace68-project' || saved.version !== 1 || !isValidProject(saved.project)) {
    throw new Error('This is not a valid workspace68 project file.')
  }
  return saved.project
}

export function downloadWorkspaceFile(project) {
  const safeName =
    (project.name || 'workspace')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase() || 'workspace'
  const file = {
    format: 'workspace68-project',
    version: 1,
    savedAt: new Date().toISOString(),
    project,
  }
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `${safeName}.workspace68.json`)
}
