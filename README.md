# workspace68

workspace68 is a browser-based visual website builder. Create and edit responsive pages with drag-and-drop blocks, style controls, animations, and configurable element actions, then export the result as a React project.

## Features

- Drag-and-drop page builder with editable sections, containers, text, buttons, images, and other blocks.
- Move and resize elements directly on the canvas, or edit their properties in the side panel.
- Desktop, tablet, and mobile canvas viewports, plus a preview mode.
- Multiple workspaces with browser autosave and portable project-file import/export.
- AI website generation from a reference image and a text prompt, with chat-based refinement.
- Export generated websites as downloadable React source-code ZIP files.
- Dark and light editor themes.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

## Deploy on Render

Create a **Web Service** for this repository and configure:

- **Build command:** `npm ci && npm run build`
- **Start command:** `npm start`

The production server binds to Render's `PORT` environment variable.

## AI website builder

Select **AI builder** in the editor toolbar. Enter an API base URL, model name, and API key for a provider that supports OpenAI-compatible chat completions with image input. Add a reference image and describe the website you want.

AI support depends on the selected model's vision capabilities and the provider's browser CORS configuration. The browser sends the API key, prompt, and reference image directly to the configured provider endpoint. The API key is kept in memory and is not saved with the workspace. Do not use this client-side setup to distribute a private API key to untrusted users; a production, multi-user deployment should proxy requests through a protected server.

## Workspace storage

Workspaces autosave in the current browser's local storage. Use the workspace controls to save a portable project file if you want to keep a backup or move the project to another browser or device.

## Tech stack

- React 18
- Vite
- Zustand
- Tailwind CSS
- dnd-kit
- JSZip
