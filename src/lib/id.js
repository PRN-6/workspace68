export function uid(prefix = 'el') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    // Keep underscores here so the next rule can turn them into hyphens
    // instead of silently deleting them.
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function sanitizePath(name) {
  const slug = slugify(name) || 'page'
  return '/' + slug
}