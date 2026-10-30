# workspace68

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Live Demo](https://img.shields.io/badge/Demo-workspace68.onrender.com-brightgreen)](https://workspace68.onrender.com)

**workspace68** is a modern, browser-based visual website builder. Design responsive pages effortlessly with drag-and-drop components, full styling controls, animations, interactive actions, and AI-assisted generation from reference screenshots—then export production-ready React source code.

It is **local-first**: open the editor and start designing immediately. No account, no server, no setup. Everything autosaves to your browser, and signing in is only needed if you want cloud sync and publishing.

---

## 🚀 Live Demo

- **Vercel:** [https://workspace68.vercel.app/](https://workspace68.vercel.app/)

---

## ✨ Features

### Local-first, no account required

- **Zero-setup editor:** Open the editor and design immediately. Projects are written to `localStorage` first, so the app never blocks on a server or a login.
- **Optional cloud sync:** Sign in with Supabase any time to mirror projects to your library, publish a public URL, and work across devices. Signing in is never required to design or export.
- **Portable projects:** Export and import `.json` project files to move a design between machines.

### Design

- **45-block palette:** Layout, typography, media, data, forms, and marketing sections — searchable and grouped, insertable by drag or by a single click.
- **Visual Drag & Drop Builder:** Easily arrange sections, cards, grids, buttons, typography, media, and interactive blocks using `@dnd-kit`.
- **In-Canvas Resizing & Positioning:** Manipulate layout and sizing directly on the canvas or fine-tune exact styles in the properties sidebar.
- **Screen flow map:** The **Flow** tab draws the graph of screens and the tap that opens each one, so multi-step flows stay legible.
- **One-place theme panel:** Seed colour, radius, typography, and light/dark scheme live in a single **Theme** tab and apply to every screen at once.
- **Responsive Viewport Previews:** Seamlessly switch between Desktop, Tablet, and Mobile canvas modes, plus an interactive full-screen Preview mode.
- **AI-Powered Website Generation:** Generate full page layouts and components directly from reference screenshots and prompts using any OpenAI-compatible vision model.
- **Dark & Light Themes:** Native dark and light mode support for both the editor UI and canvas preview.

### Export

- **Copy design prompt:** Turn the design into a precise brief — theme, screen flow, every block, style and action — that Claude Code, Codex, Gemini CLI or Cursor can build from directly.
- **Production React Export:** One-click download of your visual layout as a clean, modular React + Tailwind CSS project in a `.zip` archive. The shared block renderers ship with the export, so the built project matches the design pixel for pixel.

### Keyboard-first

| Shortcut | Action |
| -------- | ------ |
| `P` | Toggle full-screen preview |
| `Ctrl/Cmd + Z` / `Ctrl/Cmd + Shift + Z` | Undo / redo |
| `Ctrl/Cmd + C` / `Ctrl/Cmd + V` | Copy / paste selection |
| `Ctrl/Cmd + D` | Duplicate selection |
| `Ctrl/Cmd + G` / `Ctrl/Cmd + Shift + G` | Group / ungroup |
| `Ctrl/Cmd + S` | Save (autosaves anyway) |
| `Delete` / `Backspace` | Remove selection |
| Arrow keys | Nudge selection 1px (`Shift` for 8px) |
| `+` / `-` / `0` | Zoom in / out / fit |
| `Esc` | Leave preview, inline edit, or selection |

---

## 🛠️ Tech Stack

| Technology | Purpose |
| ---------- | ------- |
| **React 18** | UI component architecture and state-driven rendering |
| **Vite 6** | Lightning-fast development tooling and optimized production bundling |
| **Tailwind CSS** | Utility-first styling with comprehensive responsive design support |
| **Zustand** | Centralized, reactive editor state management |
| **@dnd-kit** | Accessible, performant drag-and-drop toolkit |
| **JSZip** | Client-side ZIP compilation for instant React project downloads |

---

## 💻 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `yarn`

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/PRN-6/workspace68.git
cd workspace68
npm install
```

### Development Server

Start the local development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Your first design

1. **New design** on the landing page — a project is created in your browser, no account needed.
2. **Add a screen** from the **Screens** tab. Each screen is a page with its own route.
3. **Drag blocks** from the **Blocks** tab onto the canvas, or hover a block and press `+` to append it.
4. **Select a block** to edit its style, actions and animations in the right-hand panel.
5. **Link screens** by setting a block's action to *Go to screen*; the **Flow** tab shows the resulting graph.
6. **Set the look** in the **Theme** tab — it applies to every screen.
7. **Ship it** from **Export**: copy the design prompt for an AI coding tool, download a React project, or publish a live URL.

### Production Build

Create an optimized build and test it locally:

```bash
npm run build
npm run preview
```

---

## 🧪 Regression Checks

Two headless‑Chrome scripts exercise the parts of the app that are easy to
break silently:

```bash
node scripts/.verify.mjs          # editor UI: tabs, block insert, prompt + export output
node scripts/.verify-export.mjs   # generates a project with every block type, builds it, and renders it
```

`scripts/.verify.mjs` now starts Chrome with the `--disable-web-security`
flag, which allows the script to write to `localStorage` in headless mode.
No additional setup is required.

`.verify.mjs` drives a running dev server (pass a different base URL as the
first argument). `.verify-export.mjs` is self‑contained: it generates a React
project containing every block type, builds it with Vite, serves the result and
asserts the rendered DOM has no nested anchors and no console errors.

---

## 🤖 AI Website Generator Setup

1. Open the editor and select **AI Builder** from the top toolbar.
2. Provide your preferred LLM provider details:
   - **Base URL:** (e.g. `https://api.openai.com/v1` or an OpenAI-compatible endpoint)
   - **Model Name:** (e.g. `gpt-4o`, `gpt-4-vision-preview`, or compatible vision models)
   - **API Key:** Your provider API key
3. Upload a reference screenshot or mock-up and provide prompt instructions.
4. The builder will generate an interactive page structure that you can inspect, edit, and refine.

   **Note:** If you don’t have an LLM provider or API key, you can simply skip the AI Builder step – the editor works entirely offline and all other features (drag‑and‑drop, theming, export) are fully functional without any external service.

> **Security Note:** API keys are stored only in volatile browser memory during your active session and are never included in project files or exported packages.

---

## 🚀 Deployment

### Deploying to Render

This project includes a production preview runner ([scripts/serve.js](scripts/serve.js)) configured for Render web services:

1. Create a new **Web Service** on Render and link this repository.
2. Configure settings:
   - **Environment:** `Node`
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm start`
3. Render binds the server automatically to the allocated `$PORT`.

### Deploying to Vercel

1. Import the repository in [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.

---

## 🔒 Security

For vulnerability disclosures and reporting guidelines, please review our [Security Policy](SECURITY.md).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

Please check out our [Contributing Guide](CONTRIBUTING.md) to get started with local development, architecture overview, and pull request guidelines. You can also explore open issues labeled [`good first issue`](https://github.com/PRN-6/workspace68/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).

Copyright (c) 2026 [Prinson R N](https://github.com/PRN-6).
