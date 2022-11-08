import React, {
  FC, FormEvent, ReactNode, useCallback, useEffect, useState,
} from 'react';
import { Link, LinkProps } from 'react-router-dom';
import styled, { CSSObject } from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { Dispatch } from 'redux';

import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import routes from '^/constants/routes';

import { ChangeAutomaticSignIn, SignIn } from '^/store/duck/Auth';
import { useL10n, UseL10n, UseState } from '^/hooks';

import * as T from '^/types';

import { NonAuthConfirmButton } from '^/components/atoms/Buttons';
import { CustomColorCheckbox } from '^/components/atoms/CustomColorCheckbox';
import LoadingIcon from '^/components/atoms/LoadingIcon';
import SignInField from '^/components/molecules/SignInField';

import Text from './text';


const signUpLinkCommonStyle: CSSObject = {
  color: dsPalette.typeTertiary.toString(),
  textDecorationLine: 'none',
};

const loadingDivCustomStyle: CSSObject = {
  border: `3px solid ${dsPalette.grey40.toString()}`,
  borderTop: `3px solid ${palette.white.toString()}`,
};


const Root = styled.form({
  boxSizing: 'border-box',
  width: '100%',

  textAlign: 'left',

  backgroundColor: palette.white.toString(),
});

const LoginToolsWrapper = styled.div({
  display: 'flex',
  margin: '14px 0',

  alignItems: 'center',
  justifyContent: 'space-between',
});

const FindingPasswordLink = styled(Link).attrs<LinkProps>({
  className: 'no-select',
})({
  color: dsPalette.typeTertiary.toString(),
  fontSize: '12px',
  textDecoration: 'none',
});

const ErrorMessage = styled.p({
  display: 'block',
  marginBottom: '10px',

  fontSize: '13px',
  lineHeight: '1.3',
  color: palette.error.toString(),
});

const InteractionsWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  button: {
    marginTop: '0',
    marginBottom: '30px',
  },
});

const SignUpLink = styled(Link).attrs({
  className: 'no-select',
})<LinkProps>({
  fontSize: '12px',
  ...signUpLinkCommonStyle,

  ':link': signUpLinkCommonStyle,
  ':visited': signUpLinkCommonStyle,
  ':active': signUpLinkCommonStyle,
});

const LinkContainer = styled.ul({
  'li:not(:first-of-type)': {
    marginTop: '15px',
  },
});

const PENDING_USER: number = 401;

/**
 * This component is similar to the SignInForm component,
 * except some parts where it uses different styles. This is done because
 * when user logs in without a plan, it doesn't have any customization,
 * and it should follow the existing design. The new login with a plan
 * follows the new design. It's rather duplicated, but it's the flow for now.
 * I've tried combining it into one, but it has too many if-elses on one component,
 * making it hard to understand.
 */
const CustomSignInForm: FC = () => {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();

  const [email, setEmail]: UseState<string> = useState('');
  const [password, setPassword]: UseState<string> = useState('');

  const autoSignIn: boolean = useSelector((state: T.State) => state.Auth.automaticSignIn);
  const inProgress: boolean = useSelector((state: T.State) => state.Auth.signInStatus === T.APIStatus.PROGRESS);
  const error: T.HTTPError | undefined = useSelector((state: T.State) => state.Auth.signInError);
  const errorCode: number | undefined = useSelector((state: T.State) => state.Auth.signInErrorCode);
  const primaryColor: string | undefined = useSelector((state: T.State) => state.PlanConfig.config?.primaryColor);

  const handleSubmit: (event: FormEvent) => void = useCallback((event) => {
    event.preventDefault();
    dispatch(SignIn({ user: { email, password } }));
  }, [email, password]);

  const onEmailChange: (value: string) => void = useCallback((value) => {
    setEmail(value);
  }, []);

  const onPasswordChange: (value: string) => void = useCallback((value) => {
    setPassword(value);
  }, []);

  const onAutoSignInChange: () => void = useCallback(() => {
    dispatch(ChangeAutomaticSignIn({ automaticSignIn: !autoSignIn }));
  }, [autoSignIn]);

  const goToPendingRequestPage: () => void = useCallback(() => {
    dispatch(push(routes.signup.processing));
  }, []);

  useEffect(() => {
    if (error !== undefined && errorCode === PENDING_USER) {
      goToPendingRequestPage();
    }
  }, [error]);

  const errorMessage: ReactNode = (() => {
    if (error === undefined) return null;

    switch (error) {
      case T.HTTPError.CLIENT_ERROR:
      case T.HTTPError.CLIENT_AUTH_ERROR:
      case T.HTTPError.CLIENT_NOT_FOUND_ERROR:
      case T.HTTPError.CLIENT_NOT_ACCEPTED_ERROR: {
        return (
          <ErrorMessage data-testid='signin-error-message'>
            {l10n(Text.error.invalid)}
          </ErrorMessage>
        );
      }
      default: {
        return (
          <ErrorMessage data-testid='signin-error-message'>
            {l10n(Text.error[error])}
          </ErrorMessage>
        );
      }
    }
  })();

  const loadingIcon: ReactNode =
    <LoadingIcon loadingDivCustomStyle={loadingDivCustomStyle} />;

  return (
    <Root onSubmit={handleSubmit}>
      <LinkContainer>
        <SignInField
          kind='email'
          value={email}
          hideLabel={true}
          onChange={onEmailChange}
        />
        <SignInField
          kind='password'
          value={password}
          hideLabel={true}
          onChange={onPasswordChange}
        />
      </LinkContainer>
      <LoginToolsWrapper>
        <CustomColorCheckbox
          checked={autoSignIn}
          color={primaryColor}
          onChange={onAutoSignInChange}
        >
          {l10n(Text.autoLogin)}
        </CustomColorCheckbox>
        <FindingPasswordLink to={routes.password.main}>
          {l10n(Text.findPassword)}
        </FindingPasswordLink>
      </LoginToolsWrapper>
      {errorMessage}
      <InteractionsWrapper>
        <NonAuthConfirmButton customColor={primaryColor} disabled={inProgress}>
          {inProgress ? loadingIcon : l10n(Text.login)}
        </NonAuthConfirmButton>
        <SignUpLink to={routes.signup.main}>
          {l10n(Text.signup)}
        </SignUpLink>
      </InteractionsWrapper>
    </Root>
  );
};

export default CustomSignInForm;
