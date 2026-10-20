import {
  LayoutPanelTop,
  Square,
  Rows3,
  Columns3,
  Type,
  AlignLeft,
  MousePointerClick,
  Image as ImageIcon,
  MoveVertical,
  Minus,
} from 'lucide-react'

/**
 * Lucide icons for the block palette. Kept out of `data/components.js` so
 * that data stays serialisable and free of JSX/React imports.
 */
export const COMPONENT_ICONS = {
  section: LayoutPanelTop,
  container: Square,
  row: Rows3,
  column: Columns3,
  heading: Type,
  text: AlignLeft,
  button: MousePointerClick,
  image: ImageIcon,
  spacer: MoveVertical,
  divider: Minus,
}

/** The icon for a block type, falling back to a neutral glyph. */
export function iconFor(type) {
  return COMPONENT_ICONS[type] || Square
}
