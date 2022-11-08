import React, { FC } from 'react';
import styled from 'styled-components';

import RawLogoSmallPNG from '^/assets/logo-small.png';
import RawLogoPNG from '^/assets/logo.png';


const LogoImage =
  styled.img({
    display: 'inline-block',
    width: '100%',
    height: 'auto',
    cursor: 'pointer',
  });

interface Props {
  readonly size?: 'default' | 'small';
}

const LogoPNG: FC<Props> = ({ size = 'default' }) => (
  <LogoImage src={size === 'small' ? RawLogoSmallPNG : RawLogoPNG} />
);
export default LogoPNG;
