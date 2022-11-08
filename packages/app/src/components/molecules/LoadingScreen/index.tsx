import Color from 'color';
import React, { FC } from 'react';
import styled, { createGlobalStyle, CSSObject } from 'styled-components';

import LoadingIcon from '^/components/atoms/LoadingIcon';
import palette from '^/constants/palette';
import dsPalette from '^/constants/ds-palette';
import { UseL10n, useL10n } from '^/hooks';
import Text from './text';

interface ColorProps {
  readonly customColor: Color;
  readonly backgroundCustomStyle?: CSSObject;
}

const Background = styled.div<ColorProps>({
  width: '100%',
  height: '100%',
}, ({ customColor, backgroundCustomStyle }) => ({
  backgroundColor: customColor.toString(),
  ...backgroundCustomStyle,
}));

const Wrapper = styled.div({
  position: 'relative',

  width: '100%',
  height: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const LoadingIconWrapper = styled.div({
  position: 'absolute',

  textAlign: 'center',
  color: palette.textLight.toString(),

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const LoadingText = styled.div({
  marginTop: '10px',
  fontSize: 14,
  color: palette.textGray.toString(),
});

const loadingDivCustomStyle: CSSObject = {
  border: `5px solid ${dsPalette.grey40.toString()}`,
  borderTop: '5px solid var(--color-theme-primary)',
  width: 32,
  height: 32,
};

const GlobalStyle = createGlobalStyle({
  '.ch-desk-messenger': {
    display: 'none',
  },
});

export interface Props {
  readonly backgroundColor: Color;
  readonly backgroundCustomStyle?: CSSObject;
  readonly textColor: Color;
}

/**
 * @author Junyoung Clare Jang
 * @desc Thu Feb  7 20:46:41 2019 UTC
 */
const LoadingScreen: FC<Props> = (
  { backgroundColor, backgroundCustomStyle },
) => {
  const [l10n]: UseL10n = useL10n();

  return (
    <Background customColor={backgroundColor} backgroundCustomStyle={backgroundCustomStyle}>
      <GlobalStyle />
      <Wrapper>
        <LoadingIconWrapper>
          <LoadingIcon loadingDivCustomStyle={loadingDivCustomStyle} />
          <LoadingText>{l10n(Text.loading)}</LoadingText>
        </LoadingIconWrapper>
      </Wrapper>
    </Background>
  );
};
export default LoadingScreen;
