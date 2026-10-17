/**
 * Helper script to publish curated issues to GitHub automatically.
 *
 * Usage:
 *   1. Create a GitHub Personal Access Token (classic or fine-grained) with 'repo' or 'issues:write' scope:
 *      https://github.com/settings/tokens
 *   2. Run:
 *      $env:GITHUB_TOKEN="your_token_here"; node scripts/create-issues.js
 */

const REPO_OWNER = 'PRN-6';
const REPO_NAME = 'workspace68';

const ISSUES = [
  {
    title: '[FEAT] Add Keyboard Shortcuts Modal & Cheat Sheet',
    labels: ['good first issue', 'enhancement'],
    body: `### Description
The visual editor supports keyboard actions like Ctrl+Z (Undo), Ctrl+Y (Redo), Delete/Backspace (Remove selected block), and Escape (Deselect). However, users currently lack a discovery guide or modal.

### Proposed Solution
1. Add a keyboard icon button in \`src/components/editor/Toolbar.jsx\`.
2. Clicking it or pressing \`?\` opens a clean Material 3 modal listing all shortcuts.
3. Include undo/redo, delete block, deselect, and viewport switcher shortcuts.

### Files
- \`src/components/editor/Toolbar.jsx\`
- \`src/components/editor/KeyboardShortcutsModal.jsx\` (new)`
  },
  {
    title: '[FEAT] Add Accordion, Tabs, and Pricing Card components to component palette',
    labels: ['good first issue', 'enhancement'],
    body: `### Description
Expand the drag-and-drop component palette with common website building blocks.

### Components to Add
- **Accordion / FAQ Item:** Collapsible question and answer block.
- **Tabs Container:** Interactive tabbed content switcher.
- **Pricing Tier Card:** Pre-styled pricing card with tier title, price tag, feature list with checkmarks, and CTA button.

### Acceptance Criteria
- Renders cleanly on canvas in Desktop, Tablet, and Mobile modes.
- Properties editable via PropertiesPanel.
- React code generator exports clean Tailwind JSX.`
  },
  {
    title: '[FEAT] Add Canvas Zoom Controls (Zoom In, Zoom Out, Reset 100%)',
    labels: ['enhancement', 'help wanted'],
    body: `### Description
When designing large landing pages, users need the ability to zoom in/out of the canvas workspace.

### Proposed Solution
- Add \`zoomLevel\` state to \`src/store/editorStore.js\`.
- Add Zoom controls to \`src/components/editor/Toolbar.jsx\` (\`-\`, \`100%\`, \`+\`, \`Fit\`).
- Apply transform scale to canvas container in \`src/components/editor/Canvas.jsx\`.`
  },
  {
    title: '[FEAT] Add Single-file HTML + Tailwind Export Option',
    labels: ['enhancement', 'help wanted'],
    body: `### Description
Allow users to export a single standalone \`index.html\` file with Tailwind CSS CDN for instant static hosting without Node.js tooling.

### Proposed Solution
- Add "Export Standalone HTML" in the export menu.
- Bundle the rendered canvas DOM, typography Google Fonts link, and Tailwind CDN into one \`.html\` file.`
  },
  {
    title: '[FEAT] Custom Project Color Palette & Theme Tokens Manager',
    labels: ['enhancement'],
    body: `### Description
Enable users to define global project colors (Primary, Accent, Background) that components can reference rather than customizing colors one by one.

### Proposed Solution
- Add a Theme tab in \`src/components/editor/LeftSidebar.jsx\`.
- Inject theme CSS variables during canvas rendering and code export.`
  },
  {
    title: '[CHORE] Add Playwright end-to-end tests for canvas builder & export',
    labels: ['testing', 'good first issue'],
    body: `### Description
Add basic automated E2E tests using Playwright to test:
1. Canvas loads successfully.
2. Dragging a component from sidebar to canvas works.
3. Switching viewports (Desktop/Tablet/Mobile).
4. Export trigger functions without runtime errors.`
  }
];

async function createIssues() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    console.error('Error: GITHUB_TOKEN environment variable is required.');
    console.error('Set it with: $env:GITHUB_TOKEN="ghp_yourTokenHere"; node scripts/create-issues.js');
    process.exit(1);
  }

  console.log(`Creating ${ISSUES.length} issues in ${REPO_OWNER}/${REPO_NAME}...\\n`);

  for (const issue of ISSUES) {
    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'workspace68-issue-bot'
        },
        body: JSON.stringify(issue)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to create "${issue.title}": ${response.status} - ${errorText}`);
      } else {
        const data = await response.json();
        console.log(`Created #${data.number}: ${data.title} -> ${data.html_url}`);
      }
    } catch (err) {
      console.error(`Network error on "${issue.title}":`, err.message);
    }
  }

  console.log('\\nDone!');
}

createIssues();
