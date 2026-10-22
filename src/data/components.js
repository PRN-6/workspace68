import { uid } from '../lib/id'

export const PALETTE_GROUPS = [
  {
    name: 'Layout',
    types: ['section', 'container', 'row', 'column', 'grid', 'card', 'divider', 'spacer'],
  },
  {
    name: 'Typography',
    types: ['heading', 'text', 'lead', 'quote', 'code'],
  },
  {
    name: 'Actions',
    types: ['button', 'iconButton', 'fab', 'chip', 'badge', 'link'],
  },
  {
    name: 'Media',
    types: ['image', 'avatar', 'icon', 'video', 'gallery'],
  },
  {
    name: 'Data',
    types: ['list', 'table', 'stat', 'rating', 'progress', 'accordion', 'tabs'],
  },
  {
    name: 'Forms',
    types: ['input', 'textarea', 'select', 'checkbox', 'switch', 'slider', 'form'],
  },
  {
    name: 'Sections',
    types: ['navbar', 'hero', 'featureCard', 'pricingCard', 'testimonial', 'ctaBanner', 'footer'],
  },
]

// Every block is a plain data record: a `style` object that styles the
// wrapper element, and a `props` object the block renderer reads to draw
// its inside. Keeping this file free of JSX means the whole library stays
// serialisable and exportable.

export const COMPONENTS = {
  // ---- Layout ----------------------------------------------------------
  section: {
    label: 'Section',
    icon: '▭',
    description: 'Full-width band. Drop blocks inside.',
    canHaveChildren: true,
    defaults: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '80px 32px',
        width: '100%',
        backgroundColor: '#ffffff',
      },
      props: {},
    },
  },
  container: {
    label: 'Container',
    icon: '▣',
    description: 'Max-width wrapper for content.',
    canHaveChildren: true,
    defaults: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        maxWidth: '1120px',
        margin: '0 auto',
        width: '100%',
      },
      props: {},
    },
  },
  row: {
    label: 'Row',
    icon: '▤',
    description: 'Horizontal flex row. Put columns inside.',
    canHaveChildren: true,
    defaults: {
      style: {
        display: 'flex',
        flexDirection: 'row',
        gap: '24px',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        width: '100%',
        flexWrap: 'wrap',
      },
      props: {},
    },
  },
  column: {
    label: 'Column',
    icon: '▥',
    description: 'Vertical flex column.',
    canHaveChildren: true,
    defaults: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        flex: '1 1 0%',
        minWidth: '0px',
      },
      props: {},
    },
  },
  grid: {
    label: 'Grid',
    icon: '▦',
    description: 'Even columns that wrap on small screens.',
    canHaveChildren: true,
    defaults: {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        width: '100%',
      },
      props: { columns: 3 },
    },
  },
  card: {
    label: 'Card',
    icon: '▢',
    description: 'Surface with a border, radius and shadow.',
    canHaveChildren: true,
    defaults: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '24px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e5ea',
        borderRadius: '16px',
        boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
        width: '100%',
      },
      props: { title: 'Card title', text: 'A short supporting line about this card.' },
    },
  },
  divider: {
    label: 'Divider',
    icon: '─',
    description: 'Horizontal separator line.',
    canHaveChildren: false,
    defaults: {
      style: { width: '100%', borderTop: '1px solid #e2e8f0' },
      props: {},
    },
  },
  spacer: {
    label: 'Spacer',
    icon: '␣',
    description: 'Vertical breathing room.',
    canHaveChildren: false,
    defaults: {
      style: { height: '32px', width: '100%' },
      props: {},
    },
  },

  // ---- Typography ------------------------------------------------------
  heading: {
    label: 'Heading',
    icon: 'Aa',
    description: 'Big headline text.',
    canHaveChildren: false,
    defaults: {
      style: {
        fontSize: '48px',
        fontWeight: '700',
        color: '#0f172a',
        textAlign: 'left',
        lineHeight: '1.15',
        margin: '0px',
        letterSpacing: '-0.02em',
      },
      props: { text: 'Build something amazing', level: 1 },
    },
  },
  text: {
    label: 'Text',
    icon: '¶',
    description: 'Paragraph of body text.',
    canHaveChildren: false,
    defaults: {
      style: {
        fontSize: '18px',
        color: '#475569',
        lineHeight: '1.7',
        margin: '0px',
      },
      props: { text: 'Write something compelling here. Double-click this text to edit it, and use the property panel on the right to style it.' },
    },
  },
  lead: {
    label: 'Lead text',
    icon: '¶',
    description: 'Larger intro paragraph.',
    canHaveChildren: false,
    defaults: {
      style: {
        fontSize: '22px',
        color: '#334155',
        lineHeight: '1.6',
        margin: '0px',
        maxWidth: '640px',
      },
      props: { text: 'A short sentence that sets the scene for everything below it.' },
    },
  },
  quote: {
    label: 'Quote',
    icon: '❝',
    description: 'Pull quote with an author.',
    canHaveChildren: false,
    defaults: {
      style: {
        fontSize: '24px',
        fontStyle: 'italic',
        color: '#0f172a',
        lineHeight: '1.5',
        margin: '0px',
        borderLeft: '3px solid #e11d33',
        paddingLeft: '20px',
      },
      props: { text: 'Design is how it works.', author: 'Steve Jobs' },
    },
  },
  code: {
    label: 'Code',
    icon: '</>',
    description: 'Monospace snippet.',
    canHaveChildren: false,
    defaults: {
      style: {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '14px',
        color: '#e2e8f0',
        backgroundColor: '#0f172a',
        padding: '20px',
        borderRadius: '12px',
        margin: '0px',
        lineHeight: '1.6',
        whiteSpace: 'pre',
        overflowX: 'auto',
      },
      props: { text: 'const hello = "world"\nconsole.log(hello)' },
    },
  },

  // ---- Actions ---------------------------------------------------------
  button: {
    label: 'Button',
    icon: '◉',
    description: 'Clickable button. Configure its action.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 28px',
        backgroundColor: '#dc2626',
        color: '#ffffff',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '600',
        textDecoration: 'none',
        textAlign: 'center',
        cursor: 'pointer',
        alignSelf: 'flex-start',
        boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
        border: 'none',
      },
      props: { text: 'Get started', variant: 'filled', size: 'md', icon: '' },
    },
  },
  iconButton: {
    label: 'Icon button',
    icon: '⊕',
    description: 'Square button with a single icon.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '44px',
        height: '44px',
        borderRadius: '999px',
        backgroundColor: 'transparent',
        color: '#0f172a',
        border: 'none',
        cursor: 'pointer',
        fontSize: '20px',
      },
      props: { icon: '＋', label: 'Add' },
    },
  },
  fab: {
    label: 'FAB',
    icon: '✚',
    description: 'Floating action button.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '56px',
        height: '56px',
        borderRadius: '18px',
        backgroundColor: '#e11d33',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        fontSize: '24px',
        boxShadow: '0 6px 20px rgba(225,29,51,0.35)',
        alignSelf: 'flex-start',
      },
      props: { icon: '＋', label: 'Create', variant: 'primary' },
    },
  },
  chip: {
    label: 'Chip',
    icon: '◑',
    description: 'Compact filter or tag.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '999px',
        backgroundColor: '#f1f5f9',
        color: '#0f172a',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
        fontWeight: '500',
        alignSelf: 'flex-start',
        cursor: 'pointer',
      },
      props: { text: 'Filter', selected: false },
    },
  },
  badge: {
    label: 'Badge',
    icon: '◍',
    description: 'Small status label.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '999px',
        backgroundColor: '#e11d33',
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: '600',
        letterSpacing: '0.02em',
        alignSelf: 'flex-start',
      },
      props: { text: 'New' },
    },
  },
  link: {
    label: 'Link',
    icon: '↗',
    description: 'Inline text link.',
    canHaveChildren: false,
    defaults: {
      style: {
        color: '#e11d33',
        fontSize: '16px',
        fontWeight: '500',
        textDecoration: 'underline',
        margin: '0px',
        alignSelf: 'flex-start',
        cursor: 'pointer',
      },
      props: { text: 'Read more', href: '#' },
    },
  },

  // ---- Media -----------------------------------------------------------
  image: {
    label: 'Image',
    icon: '🖼',
    description: 'Picture from a URL.',
    canHaveChildren: false,
    defaults: {
      style: {
        width: '100%',
        height: 'auto',
        borderRadius: '12px',
        objectFit: 'cover',
      },
      props: {
        src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80',
        alt: 'Image',
      },
    },
  },
  avatar: {
    label: 'Avatar',
    icon: '☺',
    description: 'Round user image or initials.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48px',
        height: '48px',
        borderRadius: '999px',
        backgroundColor: '#e11d33',
        color: '#ffffff',
        fontSize: '18px',
        fontWeight: '600',
        overflow: 'hidden',
        flexShrink: 0,
      },
      props: { initials: 'AR', src: '' },
    },
  },
  icon: {
    label: 'Icon',
    icon: '★',
    description: 'Single symbol or glyph.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        color: '#e11d33',
        lineHeight: '1',
      },
      props: { glyph: '★' },
    },
  },
  video: {
    label: 'Video',
    icon: '▶',
    description: 'Embedded video from a URL.',
    canHaveChildren: false,
    defaults: {
      style: {
        width: '100%',
        aspectRatio: '16 / 9',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#0f172a',
      },
      props: { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Video' },
    },
  },
  gallery: {
    label: 'Gallery',
    icon: '⊞',
    description: 'Grid of images.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        width: '100%',
      },
      props: {
        images: [
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
        ],
      },
    },
  },

  // ---- Data ------------------------------------------------------------
  list: {
    label: 'List',
    icon: '☰',
    description: 'Rows of items with titles and notes.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: '0px',
        margin: '0px',
      },
      props: {
        variant: 'detailed',
        items: [
          { title: 'First item', subtitle: 'Supporting detail for the first item.' },
          { title: 'Second item', subtitle: 'Supporting detail for the second item.' },
          { title: 'Third item', subtitle: 'Supporting detail for the third item.' },
        ],
      },
    },
  },
  table: {
    label: 'Table',
    icon: '▦',
    description: 'Simple data table.',
    canHaveChildren: false,
    defaults: {
      style: {
        width: '100%',
        fontSize: '14px',
        color: '#0f172a',
        borderCollapse: 'collapse',
      },
      props: {
        columns: ['Name', 'Role', 'Status'],
        rows: [
          ['Ada Lovelace', 'Engineer', 'Active'],
          ['Alan Turing', 'Researcher', 'Active'],
          ['Grace Hopper', 'Architect', 'Away'],
        ],
      },
    },
  },
  stat: {
    label: 'Stat',
    icon: '#',
    description: 'One big number with a label.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '20px',
        backgroundColor: '#f8fafc',
        borderRadius: '16px',
        minWidth: '180px',
      },
      props: { value: '12.4k', label: 'Monthly active users', trend: '+18%' },
    },
  },
  rating: {
    label: 'Rating',
    icon: '★★★★',
    description: 'Star rating.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: '#f59e0b',
        fontSize: '20px',
        alignSelf: 'flex-start',
      },
      props: { value: 4, max: 5, caption: '128 reviews' },
    },
  },
  progress: {
    label: 'Progress',
    icon: '▰',
    description: 'Progress bar.',
    canHaveChildren: false,
    defaults: {
      style: {
        width: '100%',
        height: '8px',
        borderRadius: '999px',
        backgroundColor: '#e2e8f0',
        overflow: 'hidden',
      },
      props: { value: 64, label: 'Upload progress' },
    },
  },
  accordion: {
    label: 'Accordion',
    icon: '⌄',
    description: 'Expandable rows.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        overflow: 'hidden',
      },
      props: {
        items: [
          { title: 'What is included?', body: 'Everything in the free plan, plus the extras.' },
          { title: 'Can I cancel?', body: 'Any time, in one click, no questions asked.' },
        ],
      },
    },
  },
  tabs: {
    label: 'Tabs',
    icon: '▭▬',
    description: 'Tabbed navigation.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px',
        backgroundColor: '#f1f5f9',
        borderRadius: '999px',
        alignSelf: 'flex-start',
      },
      props: { items: ['Overview', 'Activity', 'Settings'], active: 0 },
    },
  },

  // ---- Forms -----------------------------------------------------------
  input: {
    label: 'Input',
    icon: '▭',
    description: 'Single-line text field.',
    canHaveChildren: false,
    defaults: {
      style: { width: '100%' },
      props: { label: 'Email', placeholder: 'you@example.com', type: 'text' },
    },
  },
  textarea: {
    label: 'Textarea',
    icon: '▤',
    description: 'Multi-line text field.',
    canHaveChildren: false,
    defaults: {
      style: { width: '100%' },
      props: { label: 'Message', placeholder: 'Tell us more…' },
    },
  },
  select: {
    label: 'Select',
    icon: '⌄',
    description: 'Dropdown field.',
    canHaveChildren: false,
    defaults: {
      style: { width: '100%' },
      props: { label: 'Plan', options: ['Starter', 'Pro', 'Team'] },
    },
  },
  checkbox: {
    label: 'Checkbox',
    icon: '☑',
    description: 'Checkbox with a label.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '15px',
        color: '#0f172a',
        alignSelf: 'flex-start',
      },
      props: { label: 'Remember me', checked: false },
    },
  },
  switch: {
    label: 'Switch',
    icon: '⇄',
    description: 'Toggle switch with a label.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '15px',
        color: '#0f172a',
        alignSelf: 'flex-start',
      },
      props: { label: 'Notifications', checked: true },
    },
  },
  slider: {
    label: 'Slider',
    icon: '─◉',
    description: 'Range slider.',
    canHaveChildren: false,
    defaults: {
      style: { width: '100%' },
      props: { label: 'Volume', value: 60, min: 0, max: 100 },
    },
  },
  form: {
    label: 'Form',
    icon: '✎',
    description: 'Grouped form with a submit button.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        backgroundColor: '#f8fafc',
        borderRadius: '16px',
        width: '100%',
      },
      props: { title: 'Sign up', buttonText: 'Create account' },
    },
  },

  // ---- Sections --------------------------------------------------------
  navbar: {
    label: 'Nav bar',
    icon: '≡',
    description: 'Top navigation with brand and links.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        padding: '16px 32px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
      },
      props: { brand: 'Acme', links: ['Product', 'Pricing', 'Docs'] },
    },
  },
  hero: {
    label: 'Hero',
    icon: '◈',
    description: 'Headline, supporting copy and a call to action.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '16px',
        padding: '96px 32px',
        width: '100%',
        backgroundColor: '#f8fafc',
      },
      props: {
        title: 'Ship it faster',
        subtitle: 'A visual builder that exports real React source code.',
        cta: 'Start building',
        eyebrow: 'New',
      },
    },
  },
  featureCard: {
    label: 'Feature card',
    icon: '✦',
    description: 'Icon, title and description.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '24px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        width: '100%',
      },
      props: { icon: '⚡', title: 'Fast by default', text: 'Every change renders instantly, with no build step in the way.' },
    },
  },
  pricingCard: {
    label: 'Pricing card',
    icon: '¤',
    description: 'Plan, price and included features.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '28px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '20px',
        width: '100%',
      },
      props: {
        plan: 'Pro',
        price: '$19',
        period: '/month',
        features: ['Unlimited projects', 'Export to React', 'Priority support'],
        cta: 'Choose Pro',
        featured: false,
      },
    },
  },
  testimonial: {
    label: 'Testimonial',
    icon: '❞',
    description: 'Customer quote with an author.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '28px',
        backgroundColor: '#f8fafc',
        borderRadius: '20px',
        width: '100%',
      },
      props: {
        quote: 'This replaced three tools for us and the team ships faster every week.',
        author: 'Priya Raman',
        role: 'Head of Product, Northwind',
        initials: 'PR',
      },
    },
  },
  ctaBanner: {
    label: 'CTA banner',
    icon: '◤',
    description: 'Full-width call to action.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '56px 32px',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        width: '100%',
        textAlign: 'center',
      },
      props: { title: 'Ready to start?', text: 'Create your first design in under a minute.', button: 'Get started' },
    },
  },
  footer: {
    label: 'Footer',
    icon: '▁',
    description: 'Footer with brand, links and legal line.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '48px 32px',
        backgroundColor: '#0f172a',
        color: '#cbd5e1',
        width: '100%',
      },
      props: { brand: 'Acme', links: ['Product', 'Pricing', 'Blog', 'Contact'], copyright: '© 2026 Acme Inc.' },
    },
  },
}

export function buildElement(type) {
  const def = COMPONENTS[type]
  if (!def) throw new Error(`Unknown component type: ${type}`)
  const base = {
    id: uid(),
    type,
    name: def.label,
    style: { ...def.defaults.style },
    props: structuredClone(def.defaults.props),
    animation: { type: 'none', trigger: 'scroll', duration: 0.6, delay: 0, easing: 'ease-out' },
    action: { type: 'none', value: '', newTab: true },
  }
  if (def.canHaveChildren) base.children = []
  return base
}
