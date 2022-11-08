import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';
import * as T from '^/types';

import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import ErrorSVG from '^/assets/icons/permission-popup/error.svg';

const Root = styled.div({
  display: 'flex',
  flexDirection: 'column',
  letterSpacing: '-0.5px',
  '> div': {
    padding: '0 8px',
    ':first-of-type': {
      paddingTop: '8px',
    },
    ':last-of-type': {
      paddingBottom: '8px',
    },
  },
});

interface StyleProps {
  type?: T.Toast;
}

const Title = styled.div<StyleProps>({
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  lineHeight: 1.43,
  fontWeight: 900,
  fontStretch: 'normal',
  letterSpacing: 'normal',
  wordBreak: 'keep-all',
}, (props) => ({
  color: props.type === T.Toast.INFO ? 'var(--color-theme-primary)' : palette.UploadPopup.error.toString(),
}));

const SVGWrapper = styled.div({
  display: 'flex',
  justfiyContent: 'center',
  alignItems: 'center',

  marginRight: '5px',

  '> svg': {
    width: '17px',
    height: '17px',
  },
});

const Description = styled.div<StyleProps>({
  marginTop: '6px',
  fontSize: '13px',
  color: dsPalette.title.toString(),
  fontStretch: 'normal',
  letterSpacing: 'normal',
  wordBreak: 'keep-all',
}, (props) => ({
  lineHeight: props.type === T.Toast.INFO ? '1.54' : '1.46',
}));


export interface Props {
  type?: T.Toast;
  title?: string;
  description?: string;
}

export const ToastifyContent: FC<Props> = ({ type: rawType, title: rawTitle, description: rawDescription }) => {
  const icon: ReactNode = (() => {
    if (!rawTitle) {
      return undefined;
    }
    switch (rawType) {
      case T.Toast.INFO:
        return undefined;
      default:
        return (
          <SVGWrapper>
            <ErrorSVG />
          </SVGWrapper>
        );
    }
  })();
  const title: ReactNode = rawTitle ? (
    <Title type={rawType}>
      {icon}
      {rawTitle}
    </Title>
  ) : undefined;

  const description: ReactNode = rawDescription ? (
    <Description>
      {rawDescription}
    </Description>
  ) : undefined;

  return (
    <Root>
      {title}
      {description}
    </Root>
  );
};
