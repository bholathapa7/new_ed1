import React, { FC } from 'react';
import styled, { CSSObject } from 'styled-components';

import LogoPNG from '^/components/atoms/LogoPNG';
import palette from '^/constants/palette';
import route from '^/constants/routes';

interface Props {
  customStyle?: CSSObject;
}


const PoweredByContainer = styled.a<Props>({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  textDecoration: 'none',
  span: {
    marginRight: '5px',
  },
  img: {
    width: '120px',
  },
  color: palette.textBlack.toString(),
  fontSize: '11px',
}, ({ customStyle }) => customStyle ?? {});

export const PoweredBy: FC<Props> = ({ customStyle }) => (
  <PoweredByContainer
    href={route.externalLink.homepage}
    target='_blank'
    rel='noreferrer noopener'
    customStyle={customStyle}
  >
    <span>Powered by </span>
    <LogoPNG size={'small'} />
  </PoweredByContainer>
);
