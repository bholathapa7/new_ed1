import React, { FC } from 'react';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';

import { l10n } from '^/utilities/l10n';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import Text from './text';

const Root = styled.div({
  boxSizing: 'border-box',
  width: '460px',

  padding: '50px',
  backgroundColor: palette.white.toString(),
});

const Description = styled.p({
  marginTop: '24px',
  marginBottom: '50px',

  lineHeight: 1.6,
  fontSize: '15px',
  color: palette.textGray.toString(),
});

const resetLinkStyle: CSSObject = {
  color: palette.textBlack.toString(),
  textDecorationLine: 'underline',
};
const ResetLink = styled.a({
  display: 'block',

  cursor: 'pointer',

  textAlign: 'center',
  fontSize: '14px',
  fontWeight: 'bold',
  ...resetLinkStyle,

  ':link': resetLinkStyle,
  ':visited': resetLinkStyle,
  ':active': resetLinkStyle,
});

export interface Props {
  resetSignUpAPI(): void;
}

/**
 * @author Junyoung Clare Jang <clare.angelswing@gmail.com>
 * @desc Message displayed after failed sign up
 */
const SignUpFailureMessage: FC<Props & L10nProps> = (
  { resetSignUpAPI, language },
) => (
  <Root>
    <Description>
      {l10n(Text.description, language)}
    </Description>
    <ResetLink onClick={resetSignUpAPI}>
      {l10n(Text.signup, language)}
    </ResetLink>
  </Root>
);
export default withL10n(SignUpFailureMessage);
