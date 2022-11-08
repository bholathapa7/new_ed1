import React, { FC } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';
import routes from '^/constants/routes';

import { l10n } from '^/utilities/l10n';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import Text from './text';

const Root = styled.div({
  boxSizing: 'border-box',
  width: '300px',

  padding: '50px 0px',
  textAlign: 'center',
  backgroundColor: palette.white.toString(),
});

const Description = styled.p({
  marginBottom: '30px',

  fontSize: '15px',
  lineHeight: 1.6,
  color: palette.textGray.toString(),
});

const loginLinkStyle: CSSObject = {
  color: palette.textBlack.toString(),
  textDecorationLine: 'underline',
};
const LoginLink = styled(Link)<LinkProps>({
  display: 'block',

  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '14px',
  ...loginLinkStyle,

  ':link': loginLinkStyle,
  ':visited': loginLinkStyle,
  ':active': loginLinkStyle,
});

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Props {
}
/**
 * @author Junyoung Clare Jang <clare.angelswing@gmail.com>
 * @desc component for display message for successful resetting of password
 */
const PasswordResetSuccessMessage: FC<Props & L10nProps> = ({ language }) => (
  <Root>
    <Description>
      {l10n(Text.description, language)}
    </Description>
    <LoginLink to={routes.login.main}>{l10n(Text.login, language)}</LoginLink>
  </Root>
);
export default withL10n(PasswordResetSuccessMessage);
