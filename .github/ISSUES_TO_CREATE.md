# Curated GitHub Issues for Community Contribution

This document contains ready-to-publish GitHub issues crafted specifically for **workspace68** (`PRN-6/workspace68`). You can copy and paste these directly into [GitHub Issues](https://github.com/PRN-6/workspace68/issues/new) or create them via script.

---

## 🟢 Issue 1: Keyboard Shortcuts Cheat Sheet & Quick-Access Modal
- **Title:** `[FEAT] Add Keyboard Shortcuts Modal & Cheat Sheet`
- **Labels:** `good first issue`, `enhancement`, `ui/ux`
- **Description:**
  ### Description
  The visual editor already supports keyboard actions such as `Ctrl+Z` (Undo), `Ctrl+Y` / `Ctrl+Shift+Z` (Redo), `Delete` / `Backspace` (Delete selected component), and `Escape` (Deselect). However, new users do not have a quick discovery mechanism or visible shortcut modal.

  ### Proposed Solution
  1. Add a small keyboard icon button to the top `Toolbar.jsx`.
  2. Clicking it (or pressing `?` / `Ctrl+/`) opens a clean Material 3 / Tailwind modal displaying all available shortcuts.
  3. Include a list:
     - Undo: `Ctrl+Z` / `Cmd+Z`
     - Redo: `Ctrl+Y` / `Cmd+Shift+Z`
     - Delete block: `Delete` / `Backspace`
     - Deselect block: `Escape`
     - Switch viewports: `1` (Desktop), `2` (Tablet), `3` (Mobile) (optional enhancement)

  ### Files to touch
  - `src/components/editor/Toolbar.jsx`
  - `src/components/editor/` (new `KeyboardShortcutsModal.jsx`)

---

## 🟢 Issue 2: Additional Pre-built UI Blocks (Accordion, Tabs, Pricing Card)
- **Title:** `[FEAT] Add Accordion, Tabs, and Pricing Card components to component palette`
- **Labels:** `good first issue`, `enhancement`, `components`
- **Description:**
  ### Description
  Expand the library of drag-and-drop components in the left palette (`LeftSidebar.jsx` and `src/data/components.js`) with high-demand website building blocks.

  ### Components to Add
  - **Accordion / FAQ Item:** Collapsible question and answer block.
  - **Tabs Container:** Interactive tabbed content switcher.
  - **Pricing Tier Card:** Pre-styled pricing card with tier title, price tag, feature list with checkmarks, and CTA button.

  ### Acceptance Criteria
  - Block renders cleanly on canvas in Desktop, Tablet, and Mobile viewport modes.
  - Props (title, text, colors) are editable via `PropertiesPanel.jsx`.
  - Exported React code in `src/lib/` outputs valid, self-contained JSX and Tailwind classes.

---

## 🟡 Issue 3: Canvas Zoom In / Zoom Out and Fit-to-Screen Controls
- **Title:** `[FEAT] Add Canvas Zoom Controls (Zoom In, Zoom Out, Reset 100%)`
- **Labels:** `enhancement`, `help wanted`, `canvas`
- **Description:**
  ### Description
  When working on large landing pages or inspecting fine details, users need the ability to zoom in and out of the canvas workspace.

  ### Proposed Solution
  - Add zoom state (`zoomLevel: 100`) to `src/store/editorStore.js`.
  - Add Zoom controls in `src/components/editor/Toolbar.jsx` (`-`, `100%`, `+`, `Fit`).
  - Apply CSS transform `scale(zoomLevel / 100)` and `transform-origin: top center` to the canvas container in `Canvas.jsx`.
  - Ensure drag-and-drop coordinates with `@dnd-kit` calculate properly under scaled container.

---

## 🟡 Issue 4: Export to HTML + Tailwind CSS (Single File Download)
- **Title:** `[FEAT] Add Single-file HTML + Tailwind Export Option`
- **Labels:** `enhancement`, `export`, `help wanted`
- **Description:**
  ### Description
  Currently, workspace68 exports a complete React project as a `.zip` archive. Many users and designers also want a lightweight single `.html` file export that includes Tailwind CDN or embedded styles so they can preview or deploy without Node.js tooling.

  ### Proposed Solution
  - In the export menu/dialog, add an option: **Export Standalone HTML**.
  - Generate an `index.html` incorporating the rendered canvas DOM, typography fonts from Google Fonts, and Tailwind CSS CDN.
  - Trigger direct browser file download `project.html`.

  ### Files to touch
  - `src/lib/codeGenerator.js` (or new `htmlGenerator.js`)
  - `src/components/editor/Toolbar.jsx`

---

## 🟡 Issue 5: Custom Color Palette & CSS Variable Theme Customizer
- **Title:** `[FEAT] Custom Project Color Palette & Theme Tokens Manager`
- **Labels:** `enhancement`, `properties-panel`
- **Description:**
  ### Description
  Enable users to define global project colors (Primary, Secondary, Background, Text) that components can reference rather than picking colors block by block.

  ### Proposed Solution
  - Add a **Theme / Global Styles** tab in `LeftSidebar.jsx`.
  - Let users configure primary, accent, and neutral colors.
  - Inject these as CSS variables or Tailwind utility mappings during canvas rendering and code export.

---

## 🔴 Issue 6: E2E Automated Tests using Playwright
- **Title:** `[CHORE] Add Playwright end-to-end tests for canvas builder & export`
- **Labels:** `testing`, `ci`, `good first issue`
- **Description:**
  ### Description
  To prevent regressions as new features are added, we need basic automated end-to-end (E2E) tests.

  ### Proposed Scope
  1. Setup Playwright in the repository.
  2. Write test cases:
     - Verify homepage and visual canvas loads.
     - Test dragging a component from sidebar to canvas.
     - Test switching viewports (Desktop -> Mobile).
     - Test dark/light theme toggle.
     - Verify ZIP export trigger generates a file without unhandled errors.
  3. Add `npm run test:e2e` script to `package.json`.
