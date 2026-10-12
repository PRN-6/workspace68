import { uid } from '../lib/id'

export const PALETTE_GROUPS = [
  {
    name: 'Layout',
    types: ['section', 'container', 'row', 'column'],
  },
  {
    name: 'Content',
    types: ['heading', 'text', 'button', 'image'],
  },
  {
    name: 'Decor',
    types: ['spacer', 'divider'],
  },
]

export const COMPONENTS = {
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
  button: {
    label: 'Button',
    icon: '◉',
    description: 'Clickable button. Configure its action.',
    canHaveChildren: false,
    defaults: {
      style: {
        display: 'inline-block',
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
      },
      props: { text: 'Get started' },
    },
  },
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
}

export function buildElement(type) {
  const def = COMPONENTS[type]
  if (!def) throw new Error(`Unknown component type: ${type}`)
  const base = {
    id: uid(),
    type,
    name: def.label,
    style: { ...def.defaults.style },
    props: { ...def.defaults.props },
    animation: { type: 'none', trigger: 'scroll', duration: 0.6, delay: 0, easing: 'ease-out' },
    action: { type: 'none', value: '', newTab: true },
  }
  if (def.canHaveChildren) base.children = []
  return base
}