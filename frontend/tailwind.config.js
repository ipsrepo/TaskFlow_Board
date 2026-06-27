/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E9F2FF',
          100: '#CCE0FF',
          200: '#85B8FF',
          300: '#579DFF',
          400: '#388BFF',
          500: '#1D7AFC',
          600: '#0052CC',
          700: '#0047B3',
          800: '#003884',
          900: '#172B4D',
          DEFAULT: '#0052CC',
          hover: '#0047B3',
          active: '#003884',
          soft: '#E9F2FF',
          subtle: '#CCE0FF',
        },

        secondary: {
          DEFAULT: '#172B4D',
          900: '#091E42',
          800: '#172B4D',
          700: '#253858',
          600: '#344563',
          500: '#42526E',
          400: '#5E6C84',
          300: '#6B778C',
          200: '#7A869A',
          100: '#97A0AF',
          50: '#B3BAC5',
        },

        canvas: '#F7F8FA',
        surface: '#FFFFFF',
        surfaceSubtle: '#F4F5F7',
        surfaceHover: '#EBECF0',
        line: '#DFE1E6',
        lineStrong: '#C1C7D0',
        muted: '#5E6C84',
        mutedLight: '#7A869A',

        success: {
          DEFAULT: '#00875A',
          hover: '#006644',
          soft: '#E3FCEF',
          subtle: '#ABF5D1',
          text: '#006644',
        },

        warning: {
          DEFAULT: '#FF8B00',
          hover: '#FF991F',
          soft: '#FFFAE6',
          subtle: '#FFF0B3',
          text: '#974F00',
        },

        danger: {
          DEFAULT: '#DE350B',
          hover: '#BF2600',
          soft: '#FFEBE6',
          subtle: '#FFBDAD',
          text: '#BF2600',
        },

        info: {
          DEFAULT: '#0052CC',
          hover: '#0047B3',
          soft: '#E9F2FF',
          subtle: '#B3D4FF',
          text: '#0052CC',
        },

        discovery: {
          DEFAULT: '#6554C0',
          hover: '#5243AA',
          soft: '#EAE6FF',
          subtle: '#C0B6F2',
          text: '#403294',
        },
      },

      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      boxShadow: {
        card: '0 1px 2px rgba(9, 30, 66, 0.08), 0 0 1px rgba(9, 30, 66, 0.31)',
        'card-hover':
            '0 8px 16px rgba(9, 30, 66, 0.12), 0 1px 4px rgba(9, 30, 66, 0.12)',
        modal:
            '0 18px 40px rgba(9, 30, 66, 0.25), 0 2px 8px rgba(9, 30, 66, 0.16)',
        topbar: '0 1px 0 rgba(9, 30, 66, 0.12)',
        button: '0 1px 2px rgba(9, 30, 66, 0.14)',
        focus: '0 0 0 3px rgba(38, 132, 255, 0.35)',
      },

      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
        '2xl': '14px',
        '3xl': '18px',
      },

      backgroundImage: {
        'brand-soft':
            'linear-gradient(135deg, #E9F2FF 0%, #F7F8FA 55%, #FFFFFF 100%)',
        'sidebar-active':
            'linear-gradient(90deg, #DEEBFF 0%, #E9F2FF 100%)',
      },

      animation: {
        'fade-in': 'fadeIn 180ms ease-out',
        'slide-up': 'slideUp 220ms ease-out',
        'scale-in': 'scaleIn 160ms ease-out',
        'soft-pulse': 'softPulse 1.8s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: {
            opacity: 0,
            transform: 'translateY(10px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        scaleIn: {
          from: {
            opacity: 0,
            transform: 'scale(0.98)',
          },
          to: {
            opacity: 1,
            transform: 'scale(1)',
          },
        },
        softPulse: {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.72,
          },
        },
      },
    },
  },

  plugins: [],
};