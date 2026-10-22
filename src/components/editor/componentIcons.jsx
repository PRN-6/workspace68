import {
  LayoutPanelTop,
  Square,
  Rows3,
  Columns3,
  Grid3X3,
  Type,
  AlignLeft,
  MousePointerClick,
  Circle,
  Plus,
  Link,
  Image as ImageIcon,
  User,
  Sparkles,
  Video,
  Images,
  List,
  Table,
  Percent,
  Star,
  Gauge,
  ListTree,
  Menu,
  TextCursorInput,
  FileText,
  ChevronDown,
  CheckSquare,
  ToggleLeft,
  SlidersHorizontal,
  PenTool,
  Navigation,
  LayoutTemplate,
  Award,
  CreditCard,
  MessageSquare,
  Megaphone,
  PanelTop,
  MoveVertical,
  Minus,
} from 'lucide-react'

/**
 * Lucide icons for the block palette. Kept out of `data/components.js` so
 * that data stays serialisable and free of JSX/React imports.
 */
export const COMPONENT_ICONS = {
  // Layout
  section: LayoutPanelTop,
  container: Square,
  row: Rows3,
  column: Columns3,
  grid: Grid3X3,
  card: Square,
  divider: Minus,
  spacer: MoveVertical,

  // Typography
  heading: Type,
  text: AlignLeft,
  lead: AlignLeft,
  quote: MessageSquare,
  code: FileText,

  // Actions
  button: MousePointerClick,
  iconButton: Circle,
  fab: Plus,
  chip: Circle,
  badge: Award,
  link: Link,

  // Media
  image: ImageIcon,
  avatar: User,
  icon: Sparkles,
  video: Video,
  gallery: Images,

  // Data
  list: List,
  table: Table,
  stat: Percent,
  rating: Star,
  progress: Gauge,
  accordion: ListTree,
  tabs: Menu,

  // Forms
  input: TextCursorInput,
  textarea: FileText,
  select: ChevronDown,
  checkbox: CheckSquare,
  switch: ToggleLeft,
  slider: SlidersHorizontal,
  form: PenTool,

  // Sections
  navbar: Navigation,
  hero: LayoutTemplate,
  featureCard: Sparkles,
  pricingCard: CreditCard,
  testimonial: MessageSquare,
  ctaBanner: Megaphone,
  footer: PanelTop,
}

/** The icon for a block type, falling back to a neutral glyph. */
export function iconFor(type) {
  return COMPONENT_ICONS[type] || Square
}
