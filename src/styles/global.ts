import { css } from '@emotion/react';

export const global = css`
  * {
    box-sizing: border-box;
    font-family: inherit;
  }

  body {
    font-family:
      'Pretendard',
      -apple-system,
      BlinkMacSystemFont,
      'Apple SD Gothic Neo',
      'Noto Sans KR',
      system-ui,
      sans-serif;
  }

  html {
    scroll-behavior: smooth;
  }

  textarea {
    resize: none;

    &:focus {
      outline: none;
    }
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    box-shadow: none;
    border-radius: 0;

    &:disabled {
      cursor: default;
    }
  }
`;
