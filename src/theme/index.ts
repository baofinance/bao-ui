import * as LightColors from './lightColors'
import * as DarkColors from './darkColors'

const theme = (dark = false) => ({
  borderRadius: 8,
  breakpoints: {
    mobile: 575.98,
    tablet: 767.98,
    fhd: 991.98,
    uhd: 1199.98,
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
        default: '#625f65 1px 1px 0px inset',
        invert: '#625f65 1px 1px 0px',
      }
    : {
        default: '#f7f4f2 1px 1px 0px inset',
        invert: '#f7f4f2 1px 1px 0px',
      },
  border: dark
    ? {
        default: '1px solid #4b484f',
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
})

export default theme
