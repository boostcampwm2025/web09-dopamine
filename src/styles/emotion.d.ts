import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    colors: {
      red: ColorScale;
      yellow: ColorScale;
      green: ColorScale;
      blue: ColorScale;
      gray: ColorScale;
      black: string;
      white: string;
    };
    radius: {
      half: string;
      large: string;
      medium: string;
      small: string;
    };
    font: {
      size: {
        large: string;
        medium: string;
        small: string;
      };
    };
  }
}

type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};
