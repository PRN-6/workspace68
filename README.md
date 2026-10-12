# workspace68

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Live Demo](https://img.shields.io/badge/Demo-workspace68.onrender.com-brightgreen)](https://workspace68.onrender.com)

**workspace68** is a modern, browser-based visual website builder. Design responsive pages effortlessly with drag-and-drop components, full styling controls, animations, interactive actions, and AI-assisted generation from reference screenshots—then export production-ready React source code.

---

## 🚀 Live Demo

- **Render:** [https://workspace68.onrender.com](https://workspace68.onrender.com)
- **Vercel:** [https://workspace68.vercel.app/](https://workspace68.vercel.app/)

---

## ✨ Features

- **Visual Drag & Drop Builder:** Easily arrange sections, cards, grids, buttons, typography, media, and interactive blocks using `@dnd-kit`.
- **In-Canvas Resizing & Positioning:** Manipulate layout and sizing directly on the canvas or fine-tune exact styles in the properties sidebar.
- **Responsive Viewport Previews:** Seamlessly switch between Desktop, Tablet, and Mobile canvas modes, plus an interactive full-screen Preview mode.
- **AI-Powered Website Generation:** Generate full page layouts and components directly from reference screenshots and prompts using any OpenAI-compatible vision model.
- **Production React Export:** One-click download of your visual layout as a clean, modular React + Tailwind CSS project in a `.zip` archive.
- **Workspace Autosave & Portability:** Browser-local autosave with support for exporting and importing `.json` project files across devices.
- **Dark & Light Themes:** Native dark and light mode support for both the editor UI and canvas preview.

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

### Production Build

Create an optimized build and test it locally:

```bash
npm run build
npm run preview
```

---

## 🤖 AI Website Generator Setup

1. Open the editor and select **AI Builder** from the top toolbar.
2. Provide your preferred LLM provider details:
   - **Base URL:** (e.g. `https://api.openai.com/v1` or an OpenAI-compatible endpoint)
   - **Model Name:** (e.g. `gpt-4o`, `gpt-4-vision-preview`, or compatible vision models)
   - **API Key:** Your provider API key
3. Upload a reference screenshot or mock-up and provide prompt instructions.
4. The builder will generate an interactive page structure that you can inspect, edit, and refine.

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

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).

Copyright (c) 2026 [Prinson R N](https://github.com/PRN-6).
