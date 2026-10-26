# M3E Canvas → Workspace68 Integration Analysis

Research and planning only. No application source was modified.

## 1. Executive summary

M3E Canvas (`lnkiai/m3e-canvas`) is a client-only Material 3 Expressive screen sketchpad implemented in Next.js 16 + React 19 + TypeScript, with no backend. Its strongest reusable value for Workspace68 is not Material Android styling, but its **structured document model** (`Doc` with `Group[]`, `Frame[]`, theme, platform, prompt edit), **interaction/prompt architecture**, **local persistence**, and **screen-flow/preview concepts**. Workspace68 already has a richer production website-builder domain (pages, sections, blocks, responsive preview, AI, export, auth/sync) but its canvas state is a flexible tree of styled blocks and it lacks several editor affordances present in M3E: alignment snapping/guides, group locking/free-mode transforms, 4dp grid, command-level undo metadata, share-link persistence, structured theme tokens, and serialised structured prompts with layout derivation.

Recommended direction: retain Workspace68's React/Vite/Zustand/block-tree foundation and use M3E only as a pattern source for **document schema evolution**, **canvas selection/transform affordances**, **undo/redo metadata**, **theme tokens**, **screen-flow preview**, and **prompt serialization**. Do not import Material 3 part rendering or Android frames.

## 2. Reference repository architecture

- Framework: static Next.js app (`app/page.tsx`, `app/layout.tsx`, `next.config.ts` output `export`), TypeScript, Tailwind CSS v4 (`@tailwindcss/postcss`), `motion/react`, `html-to-image`.
- Main entry: `app/Editor.tsx` (4,992 lines) contains almost all editor, canvas, history, persistence, DnD coordinate transformations, interactions, and preview orchestration.
- Data model: `lib/tokens.ts` defines `Doc`, `Group`, `Frame`, `Item`, animation/theme types (19,000+ lines). `lib/project.ts` validates project shape.
- Utility modules:
  - `lib/ai.ts` – BYOK AI (OpenAI/Claude/Gemini/DeepSeek), draftDesign, descriptions.
  - `lib/prompt.ts` – structured multilingual design-to-prompt serialization.
  - `lib/theme.ts`, `lib/color.ts`, `lib/tokens.ts` – theme/color/token logic.
  - `lib/tidy.ts`, `lib/rail.ts`, `lib/shapes.ts` – layout helpers and Android-derived loading-indicator shapes.
  - `lib/share.ts` – share links/hashes.
  - `lib/i18n.ts` – i18n.
- Rendering components: `components/M3Node.tsx`, `components/Preview.tsx`, `components/Layers.tsx`, `components/Inspector.tsx`, `components/PartsPalette.tsx`, `components/Skeleton`, etc.
- State management: React hooks + refs in `Editor.tsx`; no global store. Document state is a `Doc` rendered directly. Undo history is ref-based snapshots (`Snapshot[]`), with `pastRef`/`futureRef`.
- Persistence: `localStorage` keys `m3e:doc`, `m3e:ui`, `m3e:doc:before`, `m3e:doc:editor`; optional cross-tab Web Locks. Import/export via JSON (`saveProject`, `readProject`, `isProject`).
- Responsive/mobile: CSS/media breakpoint + mobile-specific seed (`mobileSeed`), single-screen mobile editor (`Mobile` component). Desktop-first full editor.
- Testing: Vitest (`npm test`) with extensive lib tests.

## 3. Detailed M3E feature analysis with source evidence

### 3.1 Canvas rendering and coordinate system
- **What user sees**: infinite-ish canvas world with phone/desktop frames; panning and zoom.
- **Interaction**: wheel/ctrl+wheel pan/zoom; space drag pan; glides to screen.
- **Evidence**: `Editor.tsx` types `View = { x,y,z }`, constants `MIN_Z=0.25`, `MAX_Z=3`, `GLIDE_*`, `View` transforms, `measureEls` refs; frame rectangles via `frameRect`, `frameSizeOf`, `frameLengthOf` (`tokens.ts`).
- **State**: UI view kept in React state and `localStorage` (`UI_KEY`) via `ui.view`.
- **Reusable**: coordinate/view persistence and keyboard zoom could be adapted; avoid frame-specific Android geometry.

### 3.2 Drag/drop
- M3E is custom pointer DnD (not dnd-kit). `DragState` includes base item and original offsets, snapping, guides, settling/vanishing ghost.
- Evidence: `DragState` type and constants `SNAP_*`, `GRID=4`, `snap`/`guide` fields; interaction transitions via `SETTLE_MS`, `GAP_TWEEN`.
- **Reusable concept**: measured pointer offsets, free vs connected groups, snap state. Workspace68 already uses `@dnd-kit` with custom collision (`editorCollisionDetection` in `src/lib/dnd.js`), so adapt concepts rather than replacing DnD.

### 3.3 Data model: Item/Group/Frame
- `Item` properties: layout, style, action, notes, AI history, tabs, card media variants, progress values, etc.
- `Group`: connected (axis + auto layout) or free (`free`, `pos` map), `locked`.
- `Frame`: name, x/y, optional w/h, note, swipes, place, length.
- **Evidence**: `tokens.ts` types around lines 1626-2349.
- **Persistence**: `isProject` validation with strict optionals (`project.ts`).
- **Workspace adaptation**: versioned design document, component envelope, group metadata, locked sections, free-position plus normal flow model.

### 3.4 Selection, transform, snapping, guides
- Selection array `selectedIds`; marquee gesture; arrow nudging.
- Dragging computes alignment guides (`Guide`) with tolerance `GUIDE_PX=7`, `SNAP_CROSS`/`SNAP_MAIN`; 4dp grid `onGrid`.
- Evidence: `Guide`, `Gesture` types, `Guide` state, `snap`.
- Workspace adaptation: add optional snap-to-grid/guides and multi-select transforms without replacing existing click selection/duplicate.

### 3.5 Multi-selection, grouping, z-index/layers
- Group creation/ungroup and free groups retained offsets (`collapseFree` likely).
- Layers panel sorts/group management.
- Z-order represented by group/item order.
- Evidence: `components/Layers.tsx`, `explodeGroup`, `freeRadii`.
- Workspace adaptation: DOM tree already has hierarchy; add optional ordering/group locks in PropertiesPanel and layers view.

### 3.6 Multi-screen/responsive frames
- Phone (412×892) and desktop (1280×800), same-named screens are one screen at two widths; `carryItemSize` maps widths.
- Evidence: `FramePreset`, `frameSizeOf`, `framePresetPatch`, `carryItemSize`.
- Workspace adaptation: map to desktop/tablet/mobile viewport switch plus frame size normalization; keep responsive blocks.

### 3.7 Interactive preview/navigation
- Parts can have `action` with transition enum; screens can swipe; preview plays transitions and back stack.
- Evidence: `Action`, `Transition`, `SLIDE_SPEC`, `SWIPE_DIRS`, `BACK_TARGET`, `LINK_TARGET`.
- Workspace adaptation: existing action-based page navigation + FlowMap; add richer transitions perhaps CSS transitions in Preview, without breaking routing.

### 3.8 Theme management
- Theme: palette (7 palettes/seed), light/dark, contrast, shape scale, font, motion scheme.
- Evidence: `Theme`, `Palette`, `ShapeScale`, `FontKey`, `MotionScheme`; `ThemePanel` tabs.
- Workspace adaptation: style tokens/seeds in `DEFAULT_THEME`; current ThemePanel could be upgraded with derived token approach and dark mode.

### 3.9 Undo/redo/clipboard
- Undo via snapshot of groups/frames and optional metadata; redo; copy/paste across screens; duplicate.
- Evidence: `HISTORY_MAX=100`, `pastRef`/`futureRef`, `snapshot`, `restore`, `current`.
- Workspace adaptation: Zustand past/future already snapshots pages; could store metadata (selected IDs, viewport, current page) and coalescing timings as M3E `snapshotFor`.

### 3.10 Persistence/import/export/share
- LocalStorage autosave, import JSON, share hash, before-design backup, cross-tab lock.
- Evidence: `DOC_KEY`, `BEFORE_KEY`, `DOC_LOCK`, UI key usage; `readProject`, `saveProject`, `hasShareHash/readShareHash`.
- Workspace adaptation: could use similar share-link hash and before-design backup; localStore already supports workspaces.

### 3.11 AI assistance
- BYOK settings, draftDesign, proposeDescription, proposeBehavior, undo via `before` doc.
- Evidence: imports from `lib/ai.ts`; README features.
- Workspace adaptation: Workspace68 already has `aiWebsite.js` + AiBuilder. Could adopt per-field AI rewrite buttons/undo stacking.

### 3.12 Prompt serialization
- Prompt builder derives detailed brief, rows/overlaps/grid, accepts platform prompt options.
- Evidence: `lib/prompt.ts`, `lib/prompt.test.ts`, PromptPanel.
- Workspace adaptation: current `promptExport.js` is simpler structural style listing. Could be enriched with layout relationships (grid columns etc.) but keep Tailwind/React target.

### 3.13 Export/image
- `toPng` export for screens; static export.
- Workspace adaptation: optional PNG export screen; not needed initially (html-to-image dependency could add bundle cost).

### 3.14 Accessibility/mobile
- Keyboard shortcuts, mobile single-screen, reduced motion (`useReducedMotion`), focus handling.
- Workspace adaptation: keyboard shortcuts and Preview exit already partly exist; test accessibility.

## 4. Workspace68 architecture findings

- Build/tooling: Vite 6, React 18, Tailwind 3, Zustand 5, @dnd-kit 6, router 7. (Verified `package.json`, `src/main.jsx`, store)
- Routing/pages: Landing/Dashboard/EditorPage/PublicSite/Settings/auth (`src/App.jsx` via page components).
- Editor state: Zustand store with project pages, selectedId(s), viewport zoom, previewMode, past/future snapshots (`src/store/editorStore.js`).
- Canvas: `src/components/editor/Canvas.jsx` uses @dnd-kit sortable + droppable, custom collision detection (`src/lib/dnd.js`), free-position normal/absolute flow, resize handles custom pointers, editable inline text.
- Component block schema: `src/data/components.js` + tree helpers (`src/lib/tree.js`), BLOCK definitions and props/styles.
- Design prompt: `src/lib/promptExport.js` converts pages/blocks/styles/actions into markdown.
- Code export: `src/lib/generateProject.js` and workspace file/export local store; regression script `scripts/.verify-export.mjs`.
- AI: `src/lib/aiWebsite.js`, `src/components/editor/AiBuilder.jsx`; API keys volatile.
- Theming: Default theme + panel.
- Persistence: `src/lib/localStore.js`, `src/lib/projects.js`, Supabase optional (`src/lib/supabase.js`).
- Existing shortcuts: `src/components/editor/Shortcuts.jsx`.
- Flow map: `src/components/editor/FlowMap.jsx`.
- Testing/validation: regression scripts no unit tests except maybe M3E uses Vitest; Workspace68 has `.verify.mjs`, `.verify-export.mjs`.

## 5. Feature comparison matrix

| M3E Canvas feature | Workspace68 existing | Gap | Proposed adaptation | Priority | Complexity |
|---|---|---|---|---|---|
| Structured versioned design doc | flexible project tree | partial | Add schema versioning, migration path | P0 | M |
| Canvas coord system pan/zoom | canvas render | unknown depth | Preserve; add optional transitions | P1/P2 | S |
| Multi-select / snapping guides | basic multi-select; no guides | gap | Add guides and grid in Canvas | P1 | M |
| Lock/grouped free transform | root tree + absolute positioning | partial | group locks, collision guard | P1 | L |
| Phone/desktop frames | viewport switch + responsive | partial | frame normalization/carry sizes | P1 | M |
| Screen flow preview transitions | actions + FlowMap | partial | richer Preview transitions | P2 | L |
| Theme tokens | DEFAULT_THEME + ThemePanel | gap | tokenized palette/typography/motion | P1 | M |
| Undo/redo metadata/coalescing | past pages | gap | add Snapshot metadata & timing | P1 | M |
| Clipboard across screens | duplicate likely | check | cross-screen paste | P2 | S |
| Local import/export/share | localStore/export/import | partial | share-hash, before-design backup | P2 | M |
| AI rewrite/undo | AiBuilder | partial | per-field rewrite undo | P2 | M |
| Prompt serialization | promptExport.js | partial | enhance condensed layout language | P1 | M |
| Image export | none | gap | optional PNG export | P3 | S |
| Mobile editor | responsive canvas, no full mobile editor | gap | mobile-specific editor only if needed | P3 | L |
| TS type safety | JS only | major | add JSDoc/types gradually or TS migration | P3 | XL |

## 6. Recommended integration architecture

Extend existing modules:
- `src/store/editorStore.js`: add `designDocVersion`, richer snapshot metadata, coalescing keys, clipboard target, before-design snapshot for AI.
- `src/components/editor/Canvas.jsx`: add snap guides, keyboard modifiers, grid toggle, transformation commit helpers; preserve @dnd-kit.
- `src/components/editor/PropertiesPanel.jsx`: add layer/group lock controls and component grouping actions.
- `src/components/editor/ThemePanel.jsx`: convert current fields to design tokens and optional dark mode.
- `src/components/editor/Preview.jsx`: add transition playback while preserving routes.
- `src/lib/promptExport.js`: enhance layout descriptions.
- `src/lib/exportProject.js` / `generateProject.js`: no broad changes initially; ensure any schema additions retained.

New modules justified:
- `src/lib/designDoc.js` – validation/versioning/toJSON migration.
- `src/lib/canvasSnap.js` – guide/grid helpers pure functions (testable).
- `src/lib/componentGroups.js` – group/ungroup/reorder helpers.
- Optional `src/lib/screenFlow.js` – transition/playback helpers.

Avoid duplicate state: keep Zustand as single editor owner. Do not import M3E Next/Tailwind.

## 7. Licensing and attribution
- M3E Canvas is MIT © 2026 lnkiai (verified `LICENSE`).
- M3E Canvas NOTICE documents Apache-2.0 inherited pieces from Material Components Android and Aler1x loading indicator, plus Google Material SVG shape paths (verified `NOTICE`).
- `html-to-image`, Motion are external MIT packages if added.
- Interaction patterns/coordinate/guide logic are reimplementable independently.
- Reusing exact M3E code requires retaining MIT license and NOTICE attributions for Apache portions.
- Workspace68 already has its own MIT license.
- No code should be copied verbatim without license headers and compatibility checks.

## 8. Roadmap
1. Foundation: design doc versioning, pure helpers, tests. Dependency: none. Risk: migration.
2. Canvas affordances: snapping/guides/multi-select transforms. Dependency: foundation. Risk: DnD regressions.
3. Theme tokens and responsive frame consistency. Dependency: foundation. Risk: export mismatch.
4. Preview transitions and screen flow. Dependency: data model. Risk: routing complexity.
5. Prompt serialization enrichment and optional PNG export. Dependency: data model. Risk: too-large prompt.
6. Mobile polish and accessibility. Dependency: core editor. Risk: exceeds scope.

## 9. Ready-to-paste implementation prompt

```text
You are Claude Code. Inspect /e/project/workspace before editing. Preserve existing functionality and behavior. Implement Workspace68 editor improvements incrementally following /research findings in M3E_CANVAS_WORKSPACE68_ANALYSIS.md, but re-verify files first.

Tech stack: React 18, Vite 6, Tailwind 3, Zustand 5, @dnd-kit. No TS migration in scope unless needed. JS conventions.

Scope for first implementation:
1. Add design document versioning (`version`) in project model and migration in store/project load.
2. Create src/lib/designDoc.js with validators + isPlainObject etc.
3. Add src/lib/canvasSnap.js pure helpers for 8px grid snap and guide candidates.
4. Integrate snap toggles lightly into Canvas without removing @dnd-kit.
5. Add coalescing snapshot helper to store similar to snapshotFor.
6. Add layer lock flag to elements: style/meta? Add `locked` boolean in element objects and prevent interactions when locked in Canvas.
7. Enrich promptExport.js with grouping/grid info if data fields exist.

Preserve:
- all existing routes, preview/export/auth/store behavior
- run scripts/.verify.mjs and .verify-export.mjs
- npm run build

Acceptance:
- npm run build passes
- existing regression scripts pass if possible
- changed files list, test results, limitations
```

## 10. Risks, assumptions, unresolved questions

- M3E verification based on cloned repo in scratchpad; no runtime execution performed (social requirement: no tests run for M3E).
- Workspace68 actual tests are script-based; exact full test matrix not executed in this planning phase except git status.
- Assumption: existing store methods (updateStyle etc.) remain stable.
- Unresolved: whether grouping should be added or only free absolute blocks; likely depends on user priorities.
```

This is acceptable. But perhaps the task asks "Do not invent repository details." We verified.