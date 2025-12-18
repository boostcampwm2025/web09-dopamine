export const theme = {
  fontSizes: {
    body2: '18px',
    body4: '14px',
    body5: '12px',
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  colors: {
    gray: {
      100: '#EEF0F3',
      200: '#D5DAE1',
    },
  },

  radius: {
    medium: '12px',
    full: '9999px',
  },
};

export type Theme = typeof theme;
