// src/data/components.js
var COMPONENTS = {
  section: {
    label: "Section",
    icon: "\u25AD",
    description: "Full-width band. Drop blocks inside.",
    canHaveChildren: true,
    defaults: {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "80px 32px",
        width: "100%",
        backgroundColor: "#ffffff"
      },
      props: {}
    }
  },
  container: {
    label: "Container",
    icon: "\u25A3",
    description: "Max-width wrapper for content.",
    canHaveChildren: true,
    defaults: {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "24px",
        maxWidth: "1120px",
        margin: "0 auto",
        width: "100%"
      },
      props: {}
    }
  },
  row: {
    label: "Row",
    icon: "\u25A4",
    description: "Horizontal flex row. Put columns inside.",
    canHaveChildren: true,
    defaults: {
      style: {
        display: "flex",
        flexDirection: "row",
        gap: "24px",
        justifyContent: "flex-start",
        alignItems: "stretch",
        width: "100%",
        flexWrap: "wrap"
      },
      props: {}
    }
  },
  column: {
    label: "Column",
    icon: "\u25A5",
    description: "Vertical flex column.",
    canHaveChildren: true,
    defaults: {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        flex: "1 1 0%",
        minWidth: "0px"
      },
      props: {}
    }
  },
  heading: {
    label: "Heading",
    icon: "Aa",
    description: "Big headline text.",
    canHaveChildren: false,
    defaults: {
      style: {
        fontSize: "48px",
        fontWeight: "700",
        color: "#0f172a",
        textAlign: "left",
        lineHeight: "1.15",
        margin: "0px",
        letterSpacing: "-0.02em"
      },
      props: { text: "Build something amazing", level: 1 }
    }
  },
  text: {
    label: "Text",
    icon: "\xB6",
    description: "Paragraph of body text.",
    canHaveChildren: false,
    defaults: {
      style: {
        fontSize: "18px",
        color: "#475569",
        lineHeight: "1.7",
        margin: "0px"
      },
      props: { text: "Write something compelling here. Double-click this text to edit it, and use the property panel on the right to style it." }
    }
  },
  button: {
    label: "Button",
    icon: "\u25C9",
    description: "Clickable button. Configure its action.",
    canHaveChildren: false,
    defaults: {
      style: {
        display: "inline-block",
        padding: "14px 28px",
        backgroundColor: "#dc2626",
        color: "#ffffff",
        borderRadius: "10px",
        fontSize: "16px",
        fontWeight: "600",
        textDecoration: "none",
        textAlign: "center",
        cursor: "pointer",
        alignSelf: "flex-start",
        boxShadow: "0 4px 12px rgba(220,38,38,0.3)"
      },
      props: { text: "Get started" }
    }
  },
  image: {
    label: "Image",
    icon: "\u{1F5BC}",
    description: "Picture from a URL.",
    canHaveChildren: false,
    defaults: {
      style: {
        width: "100%",
        height: "auto",
        borderRadius: "12px",
        objectFit: "cover"
      },
      props: {
        src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
        alt: "Image"
      }
    }
  },
  spacer: {
    label: "Spacer",
    icon: "\u2423",
    description: "Vertical breathing room.",
    canHaveChildren: false,
    defaults: {
      style: { height: "32px", width: "100%" },
      props: {}
    }
  },
  divider: {
    label: "Divider",
    icon: "\u2500",
    description: "Horizontal separator line.",
    canHaveChildren: false,
    defaults: {
      style: { width: "100%", borderTop: "1px solid #e2e8f0" },
      props: {}
    }
  }
};

// src/lib/tree.js
function walk(nodes, fn, parent = null) {
  for (const node of nodes) {
    fn(node, parent);
    if (node.children?.length) walk(node.children, fn, node);
  }
}
function findById(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children?.length) {
      const found = findById(n.children, id);
      if (found) return found;
    }
  }
  return null;
}
function findContainerInfo(nodes, id) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) return { parent: null, containerId: "root", index: i };
  }
  let result = null;
  walk(nodes, (node, parent) => {
    if (node.id === id && parent) {
      const index = parent.children ? parent.children.findIndex((c) => c.id === id) : 0;
      result = { parent, containerId: parent.id, index };
    }
  });
  return result;
}
function isDescendant(nodes, ancestorId, id) {
  const a = findById(nodes, ancestorId);
  if (!a) return false;
  return !!findById(a.children || [], id);
}

// src/lib/dnd.js
var ROOT_ID = "root";
var DROP_PREFIX = "ws-drop:";
function dropIdFor(containerId) {
  return `${DROP_PREFIX}${containerId}`;
}
function isContainerType(type) {
  return !!COMPONENTS[type]?.canHaveChildren;
}
function isPointWithinRect(point, rect) {
  return rect.top <= point.y && point.y <= rect.bottom && rect.left <= point.x && point.x <= rect.right;
}
function editorCollisionDetection(args) {
  const { droppableContainers, droppableRects, pointerCoordinates } = args;
  if (!pointerCoordinates) return [];
  const collisions = [];
  for (const container of droppableContainers) {
    const rect = droppableRects.get(container.id);
    if (!rect || !isPointWithinRect(pointerCoordinates, rect)) continue;
    const data = container.data?.current;
    const depth = typeof data?.depth === "number" ? data.depth : 0;
    const isContainerDrop = data?.type === "container";
    const priority = depth * 2 + (isContainerDrop ? 1 : 0);
    collisions.push({
      id: container.id,
      data: { droppableContainer: container, value: -priority }
    });
  }
  return collisions.sort((a, b) => a.data.value - b.data.value);
}
function firstColumnChild(root, containerId) {
  const container = findById(root, containerId);
  if (!container) return null;
  const col = container.children?.find((c) => COMPONENTS[c.type]?.canHaveChildren);
  return col ? col.id : null;
}
function resolveRootTarget(elements, draggedType) {
  const root = elements.root || [];
  if (!draggedType || draggedType === "section") {
    return { containerId: ROOT_ID, index: null };
  }
  const sections = root.filter((s) => s.type === "section");
  const target = sections[sections.length - 1] || root[root.length - 1];
  if (!target) return { containerId: ROOT_ID, index: null };
  const col = target.children?.find((c) => COMPONENTS[c.type]?.canHaveChildren);
  return { containerId: col ? col.id : target.id, index: null };
}
function resolveDrop(over, elements, draggedType, activeId = null, pointerY = null) {
  if (!over) return null;
  const data = over.data?.current;
  const root = elements.root || [];
  const isInvalidTarget = (containerId) => !!activeId && (activeId === containerId || isDescendant(root, activeId, containerId));
  if (data?.type === "container") {
    const containerId = data.containerId;
    if (containerId === ROOT_ID) {
      return resolveRootTarget(elements, draggedType);
    }
    if (isInvalidTarget(containerId)) return null;
    const col = firstColumnChild(root, containerId);
    const target = col || containerId;
    if (isInvalidTarget(target)) return null;
    return { containerId: target, index: null };
  }
  if (data?.source === "canvas") {
    const overEl = findById(root, over.id);
    if (!overEl) return null;
    const parentId = data.containerId || ROOT_ID;
    if (isContainerType(overEl.type)) {
      const col = firstColumnChild(root, overEl.id);
      const target = col || overEl.id;
      if (isInvalidTarget(target)) return null;
      return { containerId: target, index: null };
    }
    const list = parentId === ROOT_ID ? root : findById(root, parentId)?.children;
    if (!list) return null;
    const index = list.findIndex((x) => x.id === over.id);
    if (index < 0) return { containerId: parentId, index: null };
    let insertAt = index;
    if (pointerY != null && over.rect) {
      const midY = over.rect.top + over.rect.height / 2;
      if (pointerY > midY) insertAt = index + 1;
    }
    if (isInvalidTarget(parentId)) return null;
    return { containerId: parentId, index: insertAt };
  }
  return null;
}
function getInsertTarget(elements, selectedId, draggedType) {
  const root = elements.root || [];
  if (draggedType === "section") {
    if (selectedId) {
      const info = findContainerInfo(root, selectedId);
      if (info?.containerId === ROOT_ID) {
        return { containerId: ROOT_ID, index: info.index + 1 };
      }
    }
    return { containerId: ROOT_ID, index: null };
  }
  if (selectedId) {
    const sel = findById(root, selectedId);
    if (sel && isContainerType(sel.type)) {
      const col = firstColumnChild(root, sel.id);
      return { containerId: col || sel.id, index: null };
    }
    const info = findContainerInfo(root, selectedId);
    if (info?.containerId) {
      const list = info.containerId === ROOT_ID ? root : findById(root, info.containerId)?.children;
      const listIndex = list ? list.findIndex((x) => x.id === selectedId) : -1;
      return {
        containerId: info.containerId,
        index: listIndex >= 0 ? listIndex + 1 : null
      };
    }
  }
  return resolveRootTarget(elements, draggedType);
}

// scripts/test-dnd.mjs
var failures = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  ok   ${name}`);
  } else {
    failures++;
    console.log(`  FAIL ${name}
       expected ${e}
       actual   ${a}`);
  }
}
var H1 = { id: "H1", type: "heading", style: {}, props: { text: "hi" } };
var C1 = { id: "C1", type: "column", style: {}, props: {}, children: [H1] };
var S1 = { id: "S1", type: "section", style: {}, props: {}, children: [C1] };
var page = { root: [S1] };
var canvasOver = (id, containerId, extra = {}) => ({
  id,
  rect: { top: 100, bottom: 200, left: 0, right: 500, height: 100, width: 500 },
  data: { current: { source: "canvas", containerId, elementId: id, ...extra } }
});
var containerOver = (containerId) => ({
  id: dropIdFor(containerId),
  rect: { top: 0, bottom: 600, left: 0, right: 500, height: 600, width: 500 },
  data: { current: { type: "container", containerId } }
});
console.log("\nresolveDrop \u2014 container droppables");
check(
  "drop heading on empty column -> inside that column",
  resolveDrop(containerOver("C1"), page, "heading"),
  { containerId: "C1", index: null }
);
check(
  "drop section on root -> stays at root",
  resolveDrop(containerOver("root"), page, "section"),
  { containerId: "root", index: null }
);
check(
  "drop heading on root -> tucked into first section column",
  resolveDrop(containerOver("root"), page, "heading"),
  { containerId: "C1", index: null }
);
console.log("\nresolveDrop \u2014 canvas elements (siblings)");
check(
  "drop text on heading, pointer in top half -> before heading",
  resolveDrop(canvasOver("H1", "C1"), page, "text", null, 120),
  { containerId: "C1", index: 0 }
);
check(
  "drop text on heading, pointer in bottom half -> after heading",
  resolveDrop(canvasOver("H1", "C1"), page, "text", null, 190),
  { containerId: "C1", index: 1 }
);
check(
  "drop text on column -> goes inside the column",
  resolveDrop(canvasOver("C1", "S1"), page, "text", null, 150),
  { containerId: "C1", index: null }
);
check(
  "drop section on column -> nests inside the column",
  resolveDrop(canvasOver("C1", "S1"), page, "section", null, 150),
  { containerId: "C1", index: null }
);
console.log("\nresolveDrop \u2014 cycle protection");
check(
  "drop column into its own child -> rejected",
  resolveDrop(containerOver("C1"), page, "column", "C1"),
  null
);
check(
  "drop column into itself -> rejected",
  resolveDrop(containerOver("C1"), page, "column", "C1"),
  null
);
check(
  "drop heading into a sibling container is allowed",
  resolveDrop(containerOver("C1"), page, "heading", "H1"),
  { containerId: "C1", index: null }
);
console.log("\ngetInsertTarget \u2014 click to insert");
check(
  "no selection -> root section column",
  getInsertTarget(page, null, "heading"),
  { containerId: "C1", index: null }
);
check(
  "selection is a leaf -> insert after it",
  getInsertTarget(page, "H1", "text"),
  { containerId: "C1", index: 1 }
);
check(
  "selection is a container -> insert inside it",
  getInsertTarget(page, "C1", "text"),
  { containerId: "C1", index: null }
);
check(
  "section always lands at root",
  getInsertTarget(page, "H1", "section"),
  { containerId: "root", index: null }
);
console.log("\ncollision detection");
{
  const rects = /* @__PURE__ */ new Map([
    ["H1", { top: 100, bottom: 200, left: 0, right: 500, height: 100, width: 500 }],
    [dropIdFor("C1"), { top: 50, bottom: 400, left: 0, right: 500, height: 350, width: 500 }],
    [dropIdFor("S1"), { top: 0, bottom: 600, left: 0, right: 500, height: 600, width: 500 }]
  ]);
  const containers = [
    { id: "H1", data: { current: { source: "canvas", containerId: "C1", depth: 2 } } },
    { id: dropIdFor("C1"), data: { current: { type: "container", containerId: "C1", depth: 1 } } },
    { id: dropIdFor("S1"), data: { current: { type: "container", containerId: "S1", depth: 0 } } }
  ];
  const collisions = editorCollisionDetection({
    droppableContainers: containers,
    droppableRects: rects,
    pointerCoordinates: { x: 100, y: 150 }
  });
  check("deepest element wins (heading beats column)", collisions[0].id, "H1");
}
{
  const rects = /* @__PURE__ */ new Map([
    ["H1", { top: 100, bottom: 200, left: 0, right: 500, height: 100, width: 500 }],
    [dropIdFor("C1"), { top: 50, bottom: 400, left: 0, right: 500, height: 350, width: 500 }]
  ]);
  const containers = [
    { id: "H1", data: { current: { source: "canvas", containerId: "C1", depth: 2 } } },
    { id: dropIdFor("C1"), data: { current: { type: "container", containerId: "C1", depth: 1 } } }
  ];
  const collisions = editorCollisionDetection({
    droppableContainers: containers,
    droppableRects: rects,
    pointerCoordinates: { x: 100, y: 300 }
  });
  check("only the column is under the pointer", collisions.map((c) => c.id), [dropIdFor("C1")]);
}
console.log(failures === 0 ? "\nAll tests passed.\n" : `
${failures} test(s) failed.
`);
process.exit(failures === 0 ? 0 : 1);
