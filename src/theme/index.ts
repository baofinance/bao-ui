import * as DarkColors from './darkColors'
import * as LightColors from './lightColors'
import lightOverlay from 'assets/img/background_overlay_light.png'
import darkOverlay from 'assets/img/background_overlay_dark.png'

const theme = (dark = false) => ({
  borderRadius: 8,
  breakpoints: {
    sm: 575.98,
    md: 767.98,
    lg: 991.98,
    xl: 1199.98,
    xxl: 1399.98,
  },
  color: dark ? DarkColors : LightColors,
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
  boxShadow: dark
    ? {
        default: '0px 4px 28px rgba(0, 0, 0, 0.15)',
        invert: '0px 4px 28px rgba(0, 0, 0, 0.15)',
      }
    : {
        default: '0px 4px 28px rgba(0, 0, 0, 0.15)',
        invert: '0px 4px 28px rgba(0, 0, 0, 0.15)',
      },
  border: dark
    ? {
        default: '1px solid #562424',
      }
    : {
        default: '1px solid #ded4ce',
      },
  buttonGradient: {
    a: 'linear-gradient(225deg, #efeae7, #efeae7) padding-box, linear-gradient(135deg, #ce6509, #ff9440) border-box',
    hover:
      'linear-gradient(225deg, #242436, #1b1b29) padding-box, linear-gradient(157.5deg, #5455c9, #53c7e4) border-box',
  },
  heroGradient:
    'linear-gradient(to left, #6b9aef 0%, #65c48c 33%, #1fa6e0 66%, #6b9aef 100%)',
  topBarSize: 72,
  backgroundGradient: dark
    ? {
        default:
          'radial-gradient(circle at center, #210e0e, #210e0e 50%) fixed',
      }
    : {
        default:
          'radial-gradient(circle at center, #fff8ee, #fff8ee 50%) fixed',
      },
  backgroundOverlay: dark
    ? {
        default: `url(${darkOverlay})`,
      }
    : {
        default: `url(${lightOverlay})`,
      },
})

export default theme
