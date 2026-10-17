# Contributing to workspace68 (WebSmith Studio)

First off, thank you for considering contributing to **workspace68**! 🎉

Whether you are fixing a bug, adding new visual builder components, improving AI generation workflows, or enhancing documentation, your contributions help make this project better for everyone.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [First-Time Contributors & Good First Issues](#first-time-contributors--good-first-issues)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Project Architecture & Structure](#project-architecture--structure)
- [Style Guide & Conventions](#style-guide--conventions)
- [Community & Questions](#community--questions)

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for all contributors. Please be respectful, constructive, and helpful when interacting with fellow community members.

---

## How Can I Contribute?

### Reporting Bugs

If you find a bug:
1. **Search existing issues** to see if it has already been reported.
2. If not, open a new issue using our **Bug Report** template.
3. Include:
   - Clear description and steps to reproduce.
   - Expected vs. actual behavior.
   - Browser and OS version.
   - Console errors and screenshots if applicable.

### Suggesting Enhancements

Have an idea for a new component block, AI prompt tweak, or editor capability?
1. Open an issue using the **Feature Request** template.
2. Clearly describe the problem it solves and what the proposed solution looks like.
3. Provide mockups or examples if possible.

### First-Time Contributors & Good First Issues

Look for issues tagged with:
- `good first issue` - Beginner-friendly tasks with clear scope.
- `help wanted` - Features or bug fixes where community input is actively welcomed.
- `documentation` - Improvements to README, guides, and component docs.

---

## Development Setup

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or 20.x recommended)
- `npm` (or `yarn` / `pnpm`)
- Git

### 2. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork:
git clone https://github.com/<your-username>/workspace68.git
cd workspace68
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to test the visual editor locally.

### 5. Build & Verification

Before submitting changes, make sure your code builds cleanly without errors:

```bash
npm run build
npm run preview
```

---

## Project Architecture & Structure

```
workspace68/
├── src/
│   ├── components/
│   │   ├── editor/         # Visual builder core (Canvas, Toolbar, Sidebar, AI Builder, etc.)
│   │   └── m3/             # Material 3 styled UI components
│   ├── store/              # Zustand state management (editorStore, etc.)
│   ├── lib/                # Code generation, ZIP export (JSZip), and helpers
│   ├── data/               # Component palettes, presets, default layouts
│   ├── App.jsx             # Root layout and mode router
│   └── main.jsx            # Entry point
├── scripts/
│   └── serve.js            # Node static runner for deployment
├── public/                 # Static assets
└── package.json            # Dependencies and scripts
```

Key Concepts:
- **Editor State:** All layout elements, selection state, viewport modes (desktop/tablet/mobile), undo/redo stacks, and theme modes are managed in `src/store/editorStore.js`.
- **Drag-and-Drop:** Canvas blocks interact via `@dnd-kit` primitives.
- **Exporting Code:** The export system bundles components into React source code using `JSZip`.

---

## Pull Request Guidelines

1. **Branch Naming:** Create a focused branch from `main`:
   - `feat/feature-name`
   - `fix/bug-description`
   - `docs/doc-update`
2. **Commit Messages:** Use clear, conventional commit messages:
   - `feat: add accordion and tabs components to palette`
   - `fix: resolve canvas overflow on mobile viewport`
   - `docs: update contribution guide`
3. **Keep Changes Focused:** Avoid mixing unrelated refactors into a single PR.
4. **Test Thoroughly:** Test on multiple canvas modes (Desktop, Tablet, Mobile) and ensure project export works properly.
5. **Open PR:** Submit your PR against the `main` branch with a clear description of changes and link relevant issue numbers (e.g., `Closes #12`).

---

## Style Guide & Conventions

- **JavaScript / React:** Clean functional components with hooks.
- **Styling:** Tailwind CSS utility classes; keep styling responsive and consistent with existing dark/light theme support.
- **State Modifications:** Use action creators in `editorStore.js` to ensure undo/redo history is maintained.

---

## Questions?

Feel free to open a discussion or issue on GitHub. Happy building and coding! 🚀
