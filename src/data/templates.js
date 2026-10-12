import { buildElement } from './components'

function element(type, options = {}) {
  const result = buildElement(type)
  result.style = { ...result.style, ...options.style }
  result.props = { ...result.props, ...options.props }
  result.name = options.name || result.name
  result.action = { ...result.action, ...options.action }
  result.animation = { ...result.animation, ...options.animation }
  if (options.children) result.children = options.children
  return result
}

export function createPortfolioPage() {
  const projectsId = buildElement('section').id

  const hero = element('section', {
    name: 'Hero',
    style: {
      minHeight: '640px',
      padding: '72px 9%',
      gap: '56px',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      backgroundColor: '#090909',
      color: '#f5f5f5',
    },
    children: [
      element('column', {
        style: { flex: '1 1 320px', gap: '22px' },
        children: [
          element('text', {
            name: 'Eyebrow',
            props: { text: 'DESIGNER  ·  DEVELOPER  ·  CREATIVE THINKER' },
            style: { color: '#ff3347', fontSize: '12px', fontWeight: '700', letterSpacing: '0.12em' },
          }),
          element('heading', {
            name: 'Introduction',
            props: { text: 'Ideas into digital experiences.', level: 1 },
            style: { color: '#f5f5f5', fontSize: '64px', lineHeight: '1.05', letterSpacing: '-0.04em' },
            animation: { type: 'fade-up', trigger: 'scroll', duration: 0.7, delay: 0 },
          }),
          element('text', {
            props: { text: 'Hey, I’m Alex — an independent designer building thoughtful brands and beautiful websites for people with big ideas.' },
            style: { color: '#b0b0b0', fontSize: '17px', maxWidth: '460px' },
          }),
          element('button', {
            props: { text: 'Explore my work ↘' },
            style: {
              backgroundColor: '#e11d2e',
              color: '#ffffff',
              borderRadius: '999px',
              boxShadow: '0 4px 18px rgba(225,29,46,0.28)',
            },
            action: { type: 'scroll', value: projectsId },
          }),
        ],
      }),
      element('image', {
        name: 'Portrait',
        props: {
          src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85',
          alt: 'Portrait of a creative professional',
        },
        style: {
          width: '100%',
          maxWidth: '360px',
          flex: '1 1 260px',
          height: '430px',
          borderRadius: '180px 180px 24px 24px',
          objectFit: 'cover',
          boxShadow: '0 24px 70px rgba(0,0,0,0.32)',
        },
        animation: { type: 'zoom-in', trigger: 'scroll', duration: 0.8, delay: 0.1 },
      }),
    ],
  })

  const projects = element('section', {
    name: 'Selected work',
    style: {
      minHeight: '620px',
      padding: '88px 9%',
      gap: '28px',
      backgroundColor: '#111111',
      color: '#f5f5f5',
    },
    children: [
      element('text', {
        props: { text: 'A FEW RECENT FAVORITES' },
        style: { color: '#ff3347', fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em' },
      }),
      element('heading', {
        props: { text: 'Selected work', level: 2 },
        style: { fontSize: '42px', color: '#f5f5f5', letterSpacing: '-0.03em' },
      }),
      element('row', {
        style: { gap: '20px', alignItems: 'stretch' },
        children: [
          projectCard('01', 'Lumina', 'A calmer way to manage your money.', 'photo-1558655146-d09347e92766'),
          projectCard('02', 'Fieldwork', 'A fresh identity for a local favorite.', 'photo-1490481651871-ab68de25d43d'),
          projectCard('03', 'Form & Function', 'Digital storefront, made to feel human.', 'photo-1494438639946-1ebd1d20bf85'),
        ],
      }),
    ],
  })
  projects.id = projectsId

  const footer = element('section', {
    name: 'Contact',
    style: {
      padding: '36px 9%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#090909',
      color: '#f5f5f5',
    },
    children: [
      element('text', { props: { text: '© 2025 Alex Morgan · Made with intention.' }, style: { color: '#b0b0b0', fontSize: '13px' } }),
      element('button', {
        props: { text: 'Say hello ↗' },
        style: { backgroundColor: 'transparent', color: '#ff6b73', padding: '8px 0', boxShadow: 'none' },
        action: { type: 'url', value: 'mailto:hello@example.com', newTab: false },
      }),
    ],
  })

  return { id: `page_${Date.now().toString(36)}`, name: 'Home', path: '/', root: [hero, projects, footer] }
}

function projectCard(number, title, description, photoId) {
  return element('column', {
    name: `${number} · ${title}`,
    style: {
      gap: '14px',
      padding: '14px',
      borderRadius: '16px',
      backgroundColor: '#1b1b1b',
      boxShadow: '0 8px 28px rgba(0,0,0,0.28)',
    },
    children: [
      element('image', {
        props: {
          src: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&q=80`,
          alt: `${title} project preview`,
        },
        style: { width: '100%', height: '190px', borderRadius: '10px', objectFit: 'cover' },
      }),
      element('text', {
        props: { text: `${number}  /  SELECTED PROJECT` },
        style: { color: '#ff3347', fontSize: '10px', fontWeight: '700', letterSpacing: '0.08em' },
      }),
      element('heading', {
        props: { text: title, level: 3 },
        style: { fontSize: '21px', fontWeight: '650', color: '#f5f5f5', margin: '0' },
      }),
      element('text', {
        props: { text: description },
        style: { fontSize: '13px', color: '#b0b0b0', lineHeight: '1.5' },
      }),
    ],
  })
}
