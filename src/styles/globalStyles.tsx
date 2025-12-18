'use client';

import { Global } from '@emotion/react';
import { global } from './global';
import { reset } from './reset';

const GlobalStyle = () => <Global styles={[reset, global]} />;

export default GlobalStyle;
