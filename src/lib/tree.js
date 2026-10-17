// Pure helpers that operate on mutated (cloned) element trees.
// The doc root is an array of elements; container elements hold `children`.

export function walk(nodes, fn, parent = null) {
  for (const node of nodes) {
    fn(node, parent)
    if (node.children?.length) walk(node.children, fn, node)
  }
}

export function findById(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children?.length) {
      const found = findById(n.children, id)
      if (found) return found
    }
  }
  return null
}

// Returns { list, index } for the array that directly contains `id`.
export function findContainerList(nodes, id) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) return { list: nodes, index: i }
    if (nodes[i].children?.length) {
      const r = findContainerList(nodes[i].children, id)
      if (r) return r
    }
  }
  return null
}

export function findParent(nodes, id, parent = null) {
  for (const node of nodes) {
    if (node.id === id) return parent
    if (node.children?.length) {
      const found = findParent(node.children, id, node)
      if (found !== undefined) return found
    }
  }
  return undefined
}

export function findContainerInfo(nodes, id) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) return { parent: null, containerId: 'root', index: i }
  }
  let result = null
  walk(nodes, (node, parent) => {
    if (node.id === id && parent) {
      const index = parent.children ? parent.children.findIndex((c) => c.id === id) : 0
      result = { parent, containerId: parent.id, index }
    }
  })
  return result
}

export function getList(root, containerId) {
  if (containerId === 'root') return root
  const c = findById(root, containerId)
  return c ? c.children : null
}

export function removeById(nodes, id) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      nodes.splice(i, 1)
      return true
    }
    if (nodes[i].children?.length && removeById(nodes[i].children, id)) return true
  }
  return false
}

export function isDescendant(nodes, ancestorId, id) {
  const a = findById(nodes, ancestorId)
  if (!a) return false
  return !!findById(a.children || [], id)
}

export function collectIds(nodes, out = []) {
  for (const n of nodes) {
    out.push(n.id)
    if (n.children?.length) collectIds(n.children, out)
  }
  return out
}

export function collectByType(nodes, type, out = []) {
  for (const n of nodes) {
    if (n.type === type) out.push(n)
    if (n.children?.length) collectByType(n.children, type, out)
  }
  return out
}

export function deepCloneElement(el) {
  const clone = {
    ...el,
    props: { ...(el.props || {}) },
    style: { ...(el.style || {}) },
    animation: { ...(el.animation || {}) },
    action: { ...(el.action || {}) },
  }
  if (el.children?.length) clone.children = el.children.map(deepCloneElement)
  return clone
}

export function countElements(nodes) {
  let n = 0
  walk(nodes, () => n++)
  return n
}