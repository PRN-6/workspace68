// Workspace68 design document helpers.
//
// The project is the design document. Keeping a version here makes future
// structural changes recoverable through explicit migrations rather than
// implicit shape assumptions.

export const DESIGN_DOC_VERSION = 1

export function normalizeDesignDoc(project) {
  if (!project || typeof project !== 'object') return project
  const next = { ...project }
  if (typeof next.designDocVersion !== 'number') {
    next.designDocVersion = DESIGN_DOC_VERSION
  }
  if (!Array.isArray(next.pages)) next.pages = []
  return next
}

export function isDesignDoc(project) {
  return !!project && typeof project === 'object' && Array.isArray(project.pages)
}