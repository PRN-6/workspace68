// Inner-content renderers for every non-container block type.
//
// Contract with the rest of the app:
//   * The CALLER renders the wrapper element (div / a / h1) and applies
//     `element.style` to it. The wrapper owns layout, colours, padding,
//     border and radius.
//   * `renderBlockContent(element)` returns only what goes INSIDE that
//     wrapper.
//   * These functions are pure: no hooks, no store access, no side
//     effects, no browser-only APIs. They run in the editor canvas, in
//     the live preview and in exported React code.
//
// This file is also shipped verbatim into exported React projects (see
// src/lib/generateProject.js), so it may only import from `react`.
import { useEffect, useRef, useState } from 'react'

const ACCENT = '#e11d33'
const GOLD = '#f59e0b'

const INLINE_TEXT_TYPES = new Set(['heading', 'text', 'button', 'link'])

const TAGS = {
  section: 'section',
  container: 'div',
  row: 'div',
  column: 'div',
  grid: 'div',
  spacer: 'div',
  divider: 'hr',
  heading: 'h1',
  text: 'p',
  button: 'a',
  link: 'a',
  image: 'div',
  quote: 'blockquote',
  navbar: 'nav',
  footer: 'footer',
}

// Types whose inner content the caller renders on its own.
const CALLER_RENDERED = new Set([
  'section',
  'container',
  'row',
  'column',
  'grid',
  'spacer',
  'divider',
  'heading',
  'text',
  'button',
  'link',
  'image',
])

/** HTML tag the caller should use for the wrapper of a given block type.
 *  `props` is optional and only used by headings, whose level decides the
 *  tag (h1..h6). */
export function blockTag(type, props) {
  if (type === 'heading') {
    const level = Number(props?.level) || 1
    return `h${Math.min(6, Math.max(1, level))}`
  }
  return TAGS[type] || 'div'
}

/** True only for the four blocks whose text is edited inline. */
export function isInlineTextType(type) {
  return INLINE_TEXT_TYPES.has(type)
}

/** The editable plain-text of an inline text block, or null for everything else. */
export function blockContentText(element) {
  if (!element || !isInlineTextType(element.type)) return null
  const text = element.props && element.props.text
  return text == null ? '' : String(text)
}

function toArray(value) {
  return Array.isArray(value) ? value : []
}

function initialsOf(text) {
  const words = String(text == null ? '' : text)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!words.length) return '•'
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function isSquareWrapper(style) {
  if (!style) return false
  const toNumber = (value) => {
    const n = Number.parseFloat(String(value))
    return Number.isFinite(n) ? n : null
  }
  const w = toNumber(style.width)
  const h = toNumber(style.height)
  if (w == null || h == null) return false
  return w === h
}

// ---- shared inner styles ----------------------------------------------

const MUTED = { color: 'inherit', opacity: 0.65 }
const HEADING = { margin: '0px', fontWeight: '700', lineHeight: 1.25, color: 'inherit' }
const PARAGRAPH = { margin: '0px', lineHeight: 1.6, color: 'inherit' }

const FIELD_LABEL = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  width: '100%',
  fontSize: '13px',
  fontWeight: '600',
  color: 'inherit',
}

const FIELD_CONTROL = {
  width: '100%',
  padding: '12px 14px',
  fontSize: '15px',
  fontWeight: '400',
  fontFamily: 'inherit',
  color: 'inherit',
  backgroundColor: '#ffffff',
  border: '1px solid rgba(15,23,42,0.16)',
  borderRadius: '10px',
  outline: 'none',
  boxSizing: 'border-box',
}

const BUTTON_BASE = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '13px 26px',
  borderRadius: '10px',
  fontSize: '16px',
  fontWeight: '600',
  fontFamily: 'inherit',
  textDecoration: 'none',
  cursor: 'pointer',
  border: 'none',
}

// ---- per type renderers ------------------------------------------------

function renderCard(props) {
  return (
    <>
      {props.title ? (
        <h3 style={{ ...HEADING, fontSize: '20px' }}>{props.title}</h3>
      ) : null}
      {props.text ? (
        <p style={{ ...PARAGRAPH, ...MUTED, fontSize: '15px' }}>{props.text}</p>
      ) : null}
    </>
  )
}

function renderLead(props) {
  return (
    <p style={{ ...PARAGRAPH, fontSize: '20px', opacity: 0.85 }}>
      {props.text || ''}
    </p>
  )
}

function renderQuote(props) {
  return (
    <>
      <p style={{ ...PARAGRAPH, fontStyle: 'italic' }}>{props.text || ''}</p>
      {props.author ? (
        <span
          style={{
            display: 'block',
            marginTop: '10px',
            fontSize: '14px',
            fontStyle: 'normal',
            ...MUTED,
          }}
        >
          {props.author}
        </span>
      ) : null}
    </>
  )
}

function renderCode(props) {
  return (
    <pre
      style={{
        margin: '0px',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        lineHeight: 'inherit',
        color: 'inherit',
        whiteSpace: 'pre',
        overflowX: 'auto',
      }}
    >
      <code style={{ fontFamily: 'inherit' }}>{props.text || ''}</code>
    </pre>
  )
}

function renderIconButton(props) {
  const label = props.label || 'Button'
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'inherit',
        lineHeight: 1,
        color: 'inherit',
      }}
    >
      {props.icon || '＋'}
    </span>
  )
}

function renderFab(props, style) {
  const label = props.label || ''
  const showLabel = !!label && !isSquareWrapper(style)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontSize: 'inherit',
        lineHeight: 1,
        color: 'inherit',
      }}
    >
      <span aria-hidden="true">{props.icon || '＋'}</span>
      {showLabel ? (
        <span style={{ fontSize: '15px', fontWeight: '600', lineHeight: 1.2 }}>{label}</span>
      ) : null}
    </span>
  )
}

function renderChip(props) {
  const selected = !!props.selected
  return (
    <span
      style={
        selected
          ? {
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px 12px',
              borderRadius: '999px',
              backgroundColor: ACCENT,
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              lineHeight: 1.4,
            }
          : {
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: 'inherit',
              fontWeight: 'inherit',
              color: 'inherit',
            }
      }
    >
      {props.text || ''}
    </span>
  )
}

function renderBadge(props) {
  return (
    <span style={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 1.4, color: 'inherit' }}>
      {props.text || ''}
    </span>
  )
}

function renderAvatar(props) {
  if (props.src) {
    return (
      <img
        src={props.src}
        alt={props.initials || ''}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 'inherit',
        }}
      />
    )
  }
  return (
    <span style={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 1, color: 'inherit' }}>
      {props.initials || ''}
    </span>
  )
}

function renderIcon(props) {
  return (
    <span style={{ fontSize: 'inherit', lineHeight: 1, color: 'inherit' }}>{props.glyph || ''}</span>
  )
}

function renderVideo(props) {
  return (
    <iframe
      src={props.url || ''}
      title={props.title || 'Video'}
      allowFullScreen
      frameBorder="0"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: 'inherit',
      }}
    />
  )
}

function renderGallery(props) {
  // The wrapper is already a grid, so the images are returned as direct
  // children and fall into its columns.
  return (
    <>
      {toArray(props.images).map((src, index) => (
        <img
          key={index}
          src={typeof src === 'string' ? src : (src && src.src) || ''}
          alt=""
          draggable={false}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            aspectRatio: '1 / 1',
            objectFit: 'cover',
            borderRadius: '12px',
          }}
        />
      ))}
    </>
  )
}

function renderList(props) {
  const items = toArray(props.items)
  if (props.variant === 'simple') {
    return (
      <ul
        style={{
          width: '100%',
          margin: '0px',
          paddingLeft: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: 'inherit',
          color: 'inherit',
        }}
      >
        {items.map((item, index) => (
          <li key={index} style={{ margin: '0px', lineHeight: 1.5 }}>
            {item && item.title ? item.title : ''}
          </li>
        ))}
      </ul>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {items.map((item, index) => {
        const title = item && item.title ? item.title : ''
        const subtitle = item && item.subtitle ? item.subtitle : ''
        return (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 0px',
              borderBottom:
                index < items.length - 1 ? '1px solid rgba(15,23,42,0.09)' : 'none',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                flexShrink: 0,
                borderRadius: '9px',
                backgroundColor: 'rgba(225,29,51,0.12)',
                color: ACCENT,
                fontSize: '13px',
                fontWeight: '700',
              }}
            >
              {initialsOf(title)}
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
              <span style={{ fontSize: '15px', fontWeight: '600', color: 'inherit' }}>{title}</span>
              {subtitle ? (
                <span style={{ fontSize: '13px', ...MUTED }}>{subtitle}</span>
              ) : null}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function renderTable(props) {
  const columns = toArray(props.columns)
  const rows = toArray(props.rows)
  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 'inherit',
        color: 'inherit',
      }}
    >
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th
              key={index}
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'inherit',
                opacity: 0.6,
                borderBottom: '1px solid rgba(15,23,42,0.16)',
              }}
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {toArray(row).map((cell, cellIndex) => (
              <td
                key={cellIndex}
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: '1px solid rgba(15,23,42,0.08)',
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function renderStat(props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
      <span style={{ fontSize: '32px', fontWeight: '700', lineHeight: 1.1, color: 'inherit' }}>
        {props.value || ''}
      </span>
      <span style={{ fontSize: '14px', ...MUTED }}>{props.label || ''}</span>
      {props.trend ? (
        <span style={{ fontSize: '13px', fontWeight: '600', color: ACCENT }}>{props.trend}</span>
      ) : null}
    </div>
  )
}

function renderRating(props) {
  const max = Math.max(0, Number(props.max) || 0)
  const value = Math.max(0, Math.min(max, Number(props.value) || 0))
  const stars = []
  for (let i = 0; i < max; i += 1) {
    stars.push(i < value ? '★' : '☆')
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'inherit' }}>
      <span
        role="img"
        aria-label={`${value} out of ${max}`}
        style={{ display: 'inline-flex', gap: '2px', color: GOLD, fontSize: 'inherit', lineHeight: 1 }}
      >
        {stars}
      </span>
      {props.caption ? (
        <span style={{ fontSize: '13px', fontWeight: '400', color: 'inherit', opacity: 0.7 }}>
          {props.caption}
        </span>
      ) : null}
    </span>
  )
}

function renderProgress(props) {
  const value = Math.max(0, Math.min(100, Number(props.value) || 0))
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={props.label || 'Progress'}
      style={{
        width: `${value}%`,
        height: '100%',
        backgroundColor: '#e11d33',
        borderRadius: '999px',
      }}
    />
  )
}

function renderAccordion(props) {
  const items = toArray(props.items)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            padding: '16px 0px',
            borderBottom: index < items.length - 1 ? '1px solid rgba(15,23,42,0.09)' : 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '15px',
              fontWeight: '600',
              color: 'inherit',
            }}
          >
            <span>{item && item.title ? item.title : ''}</span>
            <span aria-hidden="true" style={{ fontSize: '16px', lineHeight: 1, opacity: 0.55 }}>
              ⌄
            </span>
          </div>
          {item && item.body ? (
            <p style={{ ...PARAGRAPH, ...MUTED, marginTop: '8px', fontSize: '14px' }}>
              {item.body}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  )
}

function renderTabs(props) {
  const items = toArray(props.items)
  const active = Number(props.active) || 0
  return (
    <div
      role="tablist"
      style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', overflowX: 'auto' }}
    >
      {items.map((label, index) => {
        const isActive = index === active
        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={isActive}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 18px',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '14px',
              backgroundColor: isActive ? '#ffffff' : 'transparent',
              color: isActive ? '#0f172a' : 'inherit',
              opacity: isActive ? 1 : 0.7,
              fontWeight: isActive ? '600' : '500',
              boxShadow: isActive ? '0 1px 2px rgba(15,23,42,0.12)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function renderInput(props) {
  return (
    <label style={FIELD_LABEL}>
      <span>{props.label || ''}</span>
      <input
        type={props.type || 'text'}
        placeholder={props.placeholder || ''}
        style={FIELD_CONTROL}
      />
    </label>
  )
}

function renderTextarea(props) {
  return (
    <label style={FIELD_LABEL}>
      <span>{props.label || ''}</span>
      <textarea
        placeholder={props.placeholder || ''}
        rows={4}
        style={{ ...FIELD_CONTROL, resize: 'vertical', minHeight: '96px' }}
      />
    </label>
  )
}

function renderSelect(props) {
  const options = toArray(props.options)
  return (
    <label style={FIELD_LABEL}>
      <span>{props.label || ''}</span>
      <select defaultValue={options[0] || ''} style={FIELD_CONTROL}>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function renderCheckbox(props) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: 'inherit',
        color: 'inherit',
        cursor: 'pointer',
      }}
    >
      <input
        type="checkbox"
        checked={!!props.checked}
        readOnly
        style={{ width: '16px', height: '16px', margin: '0px', accentColor: ACCENT, cursor: 'pointer' }}
      />
      <span>{props.label || ''}</span>
    </label>
  )
}

function renderSwitch(props) {
  const checked = !!props.checked
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: 'inherit',
        color: 'inherit',
      }}
    >
      <span
        role="switch"
        aria-checked={checked}
        aria-label={props.label || 'Toggle'}
        style={{
          position: 'relative',
          display: 'inline-block',
          width: '40px',
          height: '22px',
          flexShrink: 0,
          borderRadius: '999px',
          backgroundColor: checked ? ACCENT : 'rgba(15,23,42,0.2)',
          transition: 'background-color 0.2s ease',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '3px',
            left: checked ? '21px' : '3px',
            width: '16px',
            height: '16px',
            borderRadius: '999px',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 2px rgba(15,23,42,0.3)',
            transition: 'left 0.2s ease',
          }}
        />
      </span>
      <span>{props.label || ''}</span>
    </span>
  )
}

function renderSlider(props) {
  return (
    <label style={FIELD_LABEL}>
      <span>{props.label || ''}</span>
      <input
        type="range"
        min={Number(props.min) || 0}
        max={Number(props.max) || 100}
        value={Number(props.value) || 0}
        readOnly
        style={{ width: '100%', margin: '0px', accentColor: ACCENT, cursor: 'pointer' }}
      />
    </label>
  )
}

function renderForm(props) {
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}
    >
      {props.title ? (
        <h3 style={{ ...HEADING, fontSize: '20px' }}>{props.title}</h3>
      ) : null}
      <label style={FIELD_LABEL}>
        <span>Email</span>
        <input type="email" placeholder="you@example.com" style={FIELD_CONTROL} />
      </label>
      <label style={FIELD_LABEL}>
        <span>Name</span>
        <input type="text" placeholder="Your name" style={FIELD_CONTROL} />
      </label>
      <button
        type="submit"
        onClick={(event) => event.preventDefault()}
        style={{ ...BUTTON_BASE, alignSelf: 'flex-start', backgroundColor: ACCENT, color: '#ffffff' }}
      >
        {props.buttonText || 'Submit'}
      </button>
    </form>
  )
}

function renderNavbar(props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        width: '100%',
      }}
    >
      <span style={{ fontSize: '18px', fontWeight: '700', color: 'inherit' }}>
        {props.brand || ''}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
        {toArray(props.links).map((link, index) => (
          <a
            key={index}
            href="#"
            onClick={(event) => event.preventDefault()}
            style={{
              fontSize: '15px',
              color: 'inherit',
              opacity: 0.8,
              textDecoration: 'none',
            }}
          >
            {link}
          </a>
        ))}
      </span>
    </div>
  )
}

function renderHero(props) {
  return (
    <>
      {props.eyebrow ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 12px',
            borderRadius: '999px',
            backgroundColor: 'rgba(225,29,51,0.12)',
            color: ACCENT,
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '0.02em',
          }}
        >
          {props.eyebrow}
        </span>
      ) : null}
      {props.title ? (
        <h2
          style={{
            ...HEADING,
            fontSize: '44px',
            fontWeight: '800',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {props.title}
        </h2>
      ) : null}
      {props.subtitle ? (
        <p style={{ ...PARAGRAPH, fontSize: '19px', opacity: 0.75, maxWidth: '620px' }}>
          {props.subtitle}
        </p>
      ) : null}
      {props.cta ? (
        <span style={{ ...BUTTON_BASE, backgroundColor: ACCENT, color: '#ffffff' }}>{props.cta}</span>
      ) : null}
    </>
  )
}

function renderFeatureCard(props) {
  return (
    <>
      {props.icon ? (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: 'rgba(225,29,51,0.12)',
            color: ACCENT,
            fontSize: '22px',
            lineHeight: 1,
          }}
        >
          {props.icon}
        </span>
      ) : null}
      {props.title ? (
        <h3 style={{ ...HEADING, fontSize: '19px' }}>{props.title}</h3>
      ) : null}
      {props.text ? (
        <p style={{ ...PARAGRAPH, ...MUTED, fontSize: '15px' }}>{props.text}</p>
      ) : null}
    </>
  )
}

function renderPricingCard(props) {
  const featured = !!props.featured
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {featured ? (
        <span
          style={{
            position: 'absolute',
            top: '-12px',
            right: '18px',
            padding: '4px 12px',
            borderRadius: '999px',
            backgroundColor: ACCENT,
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.02em',
          }}
        >
          Most popular
        </span>
      ) : null}
      <div>
        <div style={{ fontSize: '14px', fontWeight: '600', ...MUTED }}>{props.plan || ''}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
          <span style={{ fontSize: '40px', fontWeight: '800', lineHeight: 1, color: 'inherit' }}>
            {props.price || ''}
          </span>
          {props.period ? (
            <span style={{ fontSize: '14px', ...MUTED }}>{props.period}</span>
          ) : null}
        </div>
      </div>
      <ul
        style={{
          listStyle: 'none',
          margin: '0px',
          padding: '0px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {toArray(props.features).map((feature, index) => (
          <li
            key={index}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '14px',
              lineHeight: 1.5,
              color: 'inherit',
            }}
          >
            <span aria-hidden="true" style={{ color: ACCENT, fontWeight: '700' }}>
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {props.cta ? (
        <span
          style={{
            ...BUTTON_BASE,
            backgroundColor: featured ? ACCENT : 'transparent',
            color: featured ? '#ffffff' : 'inherit',
            border: featured ? `1px solid ${ACCENT}` : '1px solid currentColor',
          }}
        >
          {props.cta}
        </span>
      ) : null}
    </div>
  )
}

function renderTestimonial(props) {
  return (
    <>
      {props.quote ? (
        <p style={{ ...PARAGRAPH, fontSize: '22px', fontWeight: '500', lineHeight: 1.5 }}>
          {props.quote}
        </p>
      ) : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            flexShrink: 0,
            borderRadius: '999px',
            backgroundColor: ACCENT,
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: '700',
          }}
        >
          {props.initials || initialsOf(props.author)}
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
          <span style={{ fontSize: '15px', fontWeight: '600', color: 'inherit' }}>
            {props.author || ''}
          </span>
          {props.role ? (
            <span style={{ fontSize: '13px', ...MUTED }}>{props.role}</span>
          ) : null}
        </span>
      </div>
    </>
  )
}

function renderCtaBanner(props) {
  return (
    <>
      {props.title ? (
        <h2 style={{ ...HEADING, fontSize: '32px', fontWeight: '800' }}>{props.title}</h2>
      ) : null}
      {props.text ? (
        <p style={{ ...PARAGRAPH, fontSize: '17px', opacity: 0.8 }}>{props.text}</p>
      ) : null}
      {props.button ? (
        <span style={{ ...BUTTON_BASE, backgroundColor: '#ffffff', color: '#0f172a' }}>
          {props.button}
        </span>
      ) : null}
    </>
  )
}

function renderFooter(props) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          width: '100%',
        }}
      >
        <span style={{ fontSize: '18px', fontWeight: '700', color: 'inherit' }}>
          {props.brand || ''}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {toArray(props.links).map((link, index) => (
            <a
              key={index}
              href="#"
              onClick={(event) => event.preventDefault()}
              style={{ fontSize: '14px', color: 'inherit', opacity: 0.75, textDecoration: 'none' }}
            >
              {link}
            </a>
          ))}
        </span>
      </div>
      {props.copyright ? (
        <span style={{ fontSize: '13px', ...MUTED }}>{props.copyright}</span>
      ) : null}
    </>
  )
}

/**
 * A self-contained reveal-on-scroll hook.
 *
 * The editor renders blocks through the canvas and the preview, which use
 * their own `useReveal`. The EXPORTED project renders them through
 * `Block`, and that file is shipped verbatim — so the animation logic has
 * to live here too, without importing anything.
 */
function useBlockReveal(reveal) {
  const [shown, setShown] = useState(!reveal)
  const ref = useRef(null)

  useEffect(() => {
    if (!reveal) {
      setShown(true)
      return undefined
    }
    if (reveal.trigger === 'load') {
      const timer = setTimeout(() => setShown(true), 50)
      return () => clearTimeout(timer)
    }
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return undefined
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [reveal])

  if (!reveal) return { ref, style: {} }
  const hidden = REVEAL_STYLES[reveal.type]
  if (!hidden) return { ref, style: {} }
  const duration = Number(reveal.duration) || 0.6
  const delay = Number(reveal.delay) || 0
  const transition = `opacity ${duration}s ${reveal.easing || 'ease-out'} ${delay}s, transform ${duration}s ${reveal.easing || 'ease-out'} ${delay}s`
  return {
    ref,
    style: shown ? {} : { ...hidden, transition },
  }
}

const REVEAL_STYLES = {
  fade: { opacity: 0 },
  'fade-up': { opacity: 0, transform: 'translateY(28px)' },
  'fade-down': { opacity: 0, transform: 'translateY(-28px)' },
  'fade-left': { opacity: 0, transform: 'translateX(28px)' },
  'fade-right': { opacity: 0, transform: 'translateX(-28px)' },
  'zoom-in': { opacity: 0, transform: 'scale(0.92)' },
  'zoom-out': { opacity: 0, transform: 'scale(1.06)' },
}

/**
 * A complete block: the wrapper element carrying the block's own style, the
 * inner content, and any children.
 *
 * The exported React project renders blocks through this component, so a
 * design made in the editor produces the same markup outside it.
 */
export function Block({ element, children, navigate, reveal }) {
  const Tag = blockTag(element.type, element.props)
  const props = element.props || {}
  const { ref: revealRef, style: revealStyle } = useBlockReveal(reveal)
  const style = { ...(element.style || {}), ...revealStyle }

  // A block with a link action becomes clickable in the exported project.
  const action = element.action
  let onClick
  if (action && action.type === 'url' && action.value) {
    onClick = (event) => {
      event.preventDefault()
      window.open(action.value, action.newTab === false ? '_self' : '_blank')
    }
  } else if (action && action.type === 'page' && action.value && navigate) {
    onClick = (event) => {
      event.preventDefault()
      navigate(action.value)
    }
  }
  const actionProps = onClick ? { onClick, style: { ...style, cursor: 'pointer' } } : { style }

  if (element.type === 'image') {
    return (
      <Tag ref={revealRef} id={element.id} style={style}>
        <img
          src={props.src || ''}
          alt={props.alt || 'Image'}
          style={{ display: 'block', width: '100%', height: 'auto', objectFit: 'cover' }}
        />
      </Tag>
    )
  }

  if (element.type === 'divider') {
    return <Tag ref={revealRef} id={element.id} style={style} />
  }

  if (element.type === 'heading') {
    return (
      <Tag ref={revealRef} id={element.id} style={style}>
        {props.text || ''}
        {children}
      </Tag>
    )
  }

  if (element.type === 'text') {
    return (
      <Tag ref={revealRef} id={element.id} style={style}>
        {props.text || ''}
        {children}
      </Tag>
    )
  }

  if (element.type === 'button' || element.type === 'link') {
    return (
      <Tag ref={revealRef} id={element.id} style={style} href={props.href || '#'}>
        {props.text || ''}
        {children}
      </Tag>
    )
  }

  return (
    <Tag ref={revealRef} id={element.id} {...actionProps}>
      {renderBlockContent(element)}
      {children}
    </Tag>
  )
}

/**
 * The inner content of a block, as a React node.
 * Returns null for container types and for the blocks the caller renders itself.
 */
export function renderBlockContent(element) {
  if (!element || !element.type) return null
  if (CALLER_RENDERED.has(element.type)) return null

  const props = element.props || {}
  const style = element.style || {}

  switch (element.type) {
    case 'card':
      return renderCard(props)
    case 'lead':
      return renderLead(props)
    case 'quote':
      return renderQuote(props)
    case 'code':
      return renderCode(props)
    case 'iconButton':
      return renderIconButton(props)
    case 'fab':
      return renderFab(props, style)
    case 'chip':
      return renderChip(props)
    case 'badge':
      return renderBadge(props)
    case 'avatar':
      return renderAvatar(props)
    case 'icon':
      return renderIcon(props)
    case 'video':
      return renderVideo(props)
    case 'gallery':
      return renderGallery(props)
    case 'list':
      return renderList(props)
    case 'table':
      return renderTable(props)
    case 'stat':
      return renderStat(props)
    case 'rating':
      return renderRating(props)
    case 'progress':
      return renderProgress(props)
    case 'accordion':
      return renderAccordion(props)
    case 'tabs':
      return renderTabs(props)
    case 'input':
      return renderInput(props)
    case 'textarea':
      return renderTextarea(props)
    case 'select':
      return renderSelect(props)
    case 'checkbox':
      return renderCheckbox(props)
    case 'switch':
      return renderSwitch(props)
    case 'slider':
      return renderSlider(props)
    case 'form':
      return renderForm(props)
    case 'navbar':
      return renderNavbar(props)
    case 'hero':
      return renderHero(props)
    case 'featureCard':
      return renderFeatureCard(props)
    case 'pricingCard':
      return renderPricingCard(props)
    case 'testimonial':
      return renderTestimonial(props)
    case 'ctaBanner':
      return renderCtaBanner(props)
    case 'footer':
      return renderFooter(props)
    default:
      return null
  }
}
