import { isFlexish } from '../lib/style'

const flex = (el) => isFlexish(el.style)
const texty = (el) => ['heading', 'text', 'button'].includes(el.type)

export const TEXT_TYPES = ['heading', 'text', 'button']

export const STYLE_GROUPS = [
  {
    title: 'Layout',
    when: (el) => ['section', 'container', 'row', 'column'].includes(el.type),
    controls: [
      {
        key: 'display', label: 'Display', type: 'select',
        options: ['block', 'flex', 'inline-block', 'inline-flex', 'grid', 'none'],
      },
      {
        key: 'flexDirection', label: 'Direction', type: 'select',
        options: ['row', 'row-reverse', 'column', 'column-reverse'], when: flex,
      },
      {
        key: 'justifyContent', label: 'Justify', type: 'select',
        options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'], when: flex,
      },
      {
        key: 'alignItems', label: 'Align', type: 'select',
        options: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'], when: flex,
      },
      { key: 'gap', label: 'Gap', type: 'text', when: flex },
      { key: 'flexWrap', label: 'Wrap', type: 'select', options: ['nowrap', 'wrap'], when: flex },
    ],
  },
  {
    title: 'Size',
    controls: [
      { key: 'width', label: 'Width', type: 'text', placeholder: 'auto' },
      { key: 'maxWidth', label: 'Max width', type: 'text', placeholder: 'none' },
      { key: 'height', label: 'Height', type: 'text', placeholder: 'auto' },
      { key: 'minHeight', label: 'Min height', type: 'text', placeholder: 'auto' },
    ],
  },
  {
    title: 'Spacing',
    controls: [
      { key: 'padding', label: 'Padding', type: 'box' },
      { key: 'margin', label: 'Margin', type: 'box' },
    ],
  },
  {
    title: 'Typography',
    when: texty,
    controls: [
      { key: 'fontSize', label: 'Size', type: 'text', placeholder: '16px' },
      { key: 'fontWeight', label: 'Weight', type: 'select', options: ['300', '400', '500', '600', '700', '800', '900'] },
      { key: 'lineHeight', label: 'Line height', type: 'text', placeholder: '1.5' },
      { key: 'letterSpacing', label: 'Letter spacing', type: 'text', placeholder: '0em' },
      { key: 'textAlign', label: 'Align', type: 'select', options: ['left', 'center', 'right', 'justify'] },
    ],
  },
  {
    title: 'Colors',
    controls: [
      { key: 'backgroundColor', label: 'Background', type: 'color' },
      { key: 'color', label: 'Text / fill', type: 'color' },
    ],
  },
  {
    title: 'Border & Radius',
    controls: [
      { key: 'borderWidth', label: 'Width', type: 'text', placeholder: '1px' },
      { key: 'borderStyle', label: 'Style', type: 'select', options: ['none', 'solid', 'dashed', 'dotted'] },
      { key: 'borderColor', label: 'Color', type: 'color' },
      { key: 'borderRadius', label: 'Radius', type: 'text', placeholder: '0px' },
    ],
  },
  {
    title: 'Effects',
    controls: [
      { key: 'boxShadow', label: 'Shadow', type: 'shadow' },
      { key: 'opacity', label: 'Opacity', type: 'slider', min: 0, max: 1, step: 0.05 },
    ],
  },
]

export const ANIMATION_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'fade-up', label: 'Fade up' },
  { value: 'fade-down', label: 'Fade down' },
  { value: 'fade-left', label: 'Fade left' },
  { value: 'fade-right', label: 'Fade right' },
  { value: 'zoom-in', label: 'Zoom in' },
  { value: 'zoom-out', label: 'Zoom out' },
]

export const EASING_OPTIONS = [
  { value: 'ease-out', label: 'Ease out' },
  { value: 'ease-in', label: 'Ease in' },
  { value: 'ease-in-out', label: 'Ease in-out' },
  { value: 'linear', label: 'Linear' },
]

export const ACTION_TYPES = [
  { value: 'none', label: 'No action' },
  { value: 'url', label: 'Open URL / link' },
  { value: 'page', label: 'Go to page' },
  { value: 'scroll', label: 'Scroll to element' },
]

export function defaultStyle(style) {
  return style || {}
}