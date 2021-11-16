import {
  accent,
  blue,
  darkGrey,
  green,
  monochrome,
  background,
  primary,
  red,
  secondary,
  text,
  transparent,
} from './colors'

const theme = {
  borderRadius: 8,
  breakpoints: {
    mobile: 576,
    tablet: 767,
    fhd: 992,
    uhd: 2160,
  },
  color: {
    monochrome,
    red,
    green,
    blue,
    background,
    primary,
    secondary,
    text,
    transparent,
    accent,
    darkGrey,
  },
  fontSize: {
    xs: '.75rem',
    sm: '.875rem',
    default: '1rem',
    md: '1.15rem',
    large: '1.25rem',
    xl: '1.5rem',
    xxl: '2rem',
  },
  fontWeight: {
    thin: 100,
    regular: 300,
    medium: 500,
    strong: 700,
  },
  siteWidth: 1200,
  spacing: {
    1: 4,
    2: 8,
    3: 16,
    4: 24,
    5: 32,
    6: 48,
    7: 64,
  },
  boxShadow: {
    default:
      '2px 2px 3px 0 rgba(255, 255, 255, 0.3) inset, -1px -1px 2px 0 rgba(0, 0, 0, .25) inset',
    hover:
      '-1px -1px 2px 0 rgba(0, 0, 0, .25), 2px 2px 3px 0 rgba(255, 255, 255, 0.3)',
  },
  border: {
    default:
      '1px solid #efeae7',
  },
  buttonGradient: {
    a: 'linear-gradient(225deg, #efeae7, #efeae7) padding-box, linear-gradient(135deg, #ce6509, #ff9440) border-box',
    hover:
      'linear-gradient(225deg, #242436, #1b1b29) padding-box, linear-gradient(157.5deg, #5455c9, #53c7e4) border-box',
  },
  heroGradient:
    'linear-gradient(to left, #6b9aef 0%, #65c48c 33%, #1fa6e0 66%, #6b9aef 100%)',
  topBarSize: 72,
}

export default theme
