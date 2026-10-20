// Standalone test of the drop-resolution logic. Run: node scripts/test-dnd.mjs
// Uses a tiny DOM-free harness by re-implementing the tree helpers the same
// way lib/tree.js does, so we exercise the real src/lib/dnd.js module.

import { resolveDrop, getInsertTarget, editorCollisionDetection, dropIdFor } from '../src/lib/dnd.js'

let failures = 0
function check(name, actual, expected) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) {
    console.log(`  ok   ${name}`)
  } else {
    failures++
    console.log(`  FAIL ${name}\n       expected ${e}\n       actual   ${a}`)
  }
}

// ---- fixtures -------------------------------------------------------------
// root: [ section S1 (children: [ column C1 (children: [ heading H1 ]) ]) ]
const H1 = { id: 'H1', type: 'heading', style: {}, props: { text: 'hi' } }
const C1 = { id: 'C1', type: 'column', style: {}, props: {}, children: [H1] }
const S1 = { id: 'S1', type: 'section', style: {}, props: {}, children: [C1] }
const page = { root: [S1] }

const canvasOver = (id, containerId, extra = {}) => ({
  id,
  rect: { top: 100, bottom: 200, left: 0, right: 500, height: 100, width: 500 },
  data: { current: { source: 'canvas', containerId, elementId: id, ...extra } },
})
const containerOver = (containerId) => ({
  id: dropIdFor(containerId),
  rect: { top: 0, bottom: 600, left: 0, right: 500, height: 600, width: 500 },
  data: { current: { type: 'container', containerId } },
})

console.log('\nresolveDrop — container droppables')
check(
  'drop heading on empty column -> inside that column',
  resolveDrop(containerOver('C1'), page, 'heading'),
  { containerId: 'C1', index: null }
)
check(
  'drop section on root -> stays at root',
  resolveDrop(containerOver('root'), page, 'section'),
  { containerId: 'root', index: null }
)
check(
  'drop heading on root -> tucked into first section column',
  resolveDrop(containerOver('root'), page, 'heading'),
  { containerId: 'C1', index: null }
)

console.log('\nresolveDrop — canvas elements (siblings)')
check(
  'drop text on heading, pointer in top half -> before heading',
  resolveDrop(canvasOver('H1', 'C1'), page, 'text', null, 120),
  { containerId: 'C1', index: 0 }
)
check(
  'drop text on heading, pointer in bottom half -> after heading',
  resolveDrop(canvasOver('H1', 'C1'), page, 'text', null, 190),
  { containerId: 'C1', index: 1 }
)
check(
  'drop text on column -> goes inside the column',
  resolveDrop(canvasOver('C1', 'S1'), page, 'text', null, 150),
  { containerId: 'C1', index: null }
)
check(
  'drop section on column -> nests inside the column',
  resolveDrop(canvasOver('C1', 'S1'), page, 'section', null, 150),
  { containerId: 'C1', index: null }
)

console.log('\nresolveDrop — cycle protection')
check(
  'drop column into its own child -> rejected',
  resolveDrop(containerOver('C1'), page, 'column', 'C1'),
  null
)
check(
  'drop column into itself -> rejected',
  resolveDrop(containerOver('C1'), page, 'column', 'C1'),
  null
)
check(
  'drop heading into a sibling container is allowed',
  resolveDrop(containerOver('C1'), page, 'heading', 'H1'),
  { containerId: 'C1', index: null }
)

console.log('\ngetInsertTarget — click to insert')
check(
  'no selection -> root section column',
  getInsertTarget(page, null, 'heading'),
  { containerId: 'C1', index: null }
)
check(
  'selection is a leaf -> insert after it',
  getInsertTarget(page, 'H1', 'text'),
  { containerId: 'C1', index: 1 }
)
check(
  'selection is a container -> insert inside it',
  getInsertTarget(page, 'C1', 'text'),
  { containerId: 'C1', index: null }
)
check(
  'section always lands at root',
  getInsertTarget(page, 'H1', 'section'),
  { containerId: 'root', index: null }
)

console.log('\ncollision detection')
{
  // pointer inside H1 only
  const rects = new Map([
    ['H1', { top: 100, bottom: 200, left: 0, right: 500, height: 100, width: 500 }],
    [dropIdFor('C1'), { top: 50, bottom: 400, left: 0, right: 500, height: 350, width: 500 }],
    [dropIdFor('S1'), { top: 0, bottom: 600, left: 0, right: 500, height: 600, width: 500 }],
  ])
  const containers = [
    { id: 'H1', data: { current: { source: 'canvas', containerId: 'C1', depth: 2 } } },
    { id: dropIdFor('C1'), data: { current: { type: 'container', containerId: 'C1', depth: 1 } } },
    { id: dropIdFor('S1'), data: { current: { type: 'container', containerId: 'S1', depth: 0 } } },
  ]
  const collisions = editorCollisionDetection({
    droppableContainers: containers,
    droppableRects: rects,
    pointerCoordinates: { x: 100, y: 150 },
  })
  check('deepest element wins (heading beats column)', collisions[0].id, 'H1')
}
{
  // pointer in the column's padding, below the heading
  const rects = new Map([
    ['H1', { top: 100, bottom: 200, left: 0, right: 500, height: 100, width: 500 }],
    [dropIdFor('C1'), { top: 50, bottom: 400, left: 0, right: 500, height: 350, width: 500 }],
  ])
  const containers = [
    { id: 'H1', data: { current: { source: 'canvas', containerId: 'C1', depth: 2 } } },
    { id: dropIdFor('C1'), data: { current: { type: 'container', containerId: 'C1', depth: 1 } } },
  ]
  const collisions = editorCollisionDetection({
    droppableContainers: containers,
    droppableRects: rects,
    pointerCoordinates: { x: 100, y: 300 },
  })
  check('only the column is under the pointer', collisions.map((c) => c.id), [dropIdFor('C1')])
}

console.log(failures === 0 ? '\nAll tests passed.\n' : `\n${failures} test(s) failed.\n`)
process.exit(failures === 0 ? 0 : 1)
