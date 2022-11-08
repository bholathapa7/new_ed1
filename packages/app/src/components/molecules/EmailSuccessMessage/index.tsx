import React, { FC } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';
import routes from '^/constants/routes';

import * as T from '^/types';

import { l10n } from '^/utilities/l10n';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import Text from './text';

const loginLinkStyle: CSSObject = {
  color: palette.textBlack.toString(),
  textDecorationLine: 'underline',
};


const Root =
  styled.div({
    boxSizing: 'border-box',
    backgroundColor: palette.white.toString(),
  });

const UserEmail =
  styled.h1({
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    color: palette.textGray.toString(),
  });

const Description =
  styled.p({
    marginTop: '24px',
    marginBottom: '30px',

    lineHeight: 1.6,
    fontSize: '15px',
    color: palette.textGray.toString(),
  });

const SupportEmail =
  styled.a({
    color: 'var(--color-theme-primary-lightest)',
  });

const LoginLink =
  styled(Link)<LinkProps>({
    display: 'block',

    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    ...loginLinkStyle,

    ':link': loginLinkStyle,
    ':visited': loginLinkStyle,
    ':active': loginLinkStyle,
  });


export interface Props {
  readonly formValues: T.PasswordFormValues;
}

/**
 * @author Junyoung Clare Jang <clare.angelswing@gmail.com>
 * @desc message for successfully sending password reset email
 */
const EmailSuccessMessage: FC<Props & L10nProps> = (
  { formValues: { email }, language },
) => (
  <Root>
    <UserEmail>{email}</UserEmail>
    <Description>
      {l10n(Text.description, language)}
      <br />
      <SupportEmail>support@angelswing.io</SupportEmail>
    </Description>
    <LoginLink to={routes.login.main}>
      {l10n(Text.login, language)}
    </LoginLink>
  </Root>
);
export default withL10n(EmailSuccessMessage);
