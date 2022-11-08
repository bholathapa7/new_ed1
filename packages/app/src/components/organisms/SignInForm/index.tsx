import React, {
  FC, FormEvent, ReactNode, useCallback, useEffect, useState,
} from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';
import dsPalette from '^/constants/ds-palette';
import routes from '^/constants/routes';

import { ChangeAutomaticSignIn, SignIn } from '^/store/duck/Auth';
import { useL10n, UseL10n, UseState } from '^/hooks';
import { ConfirmButton } from '^/components/atoms/Buttons';
import { CustomColorCheckbox as Checkbox } from '^/components/atoms/CustomColorCheckbox';
import SignInField from '^/components/molecules/SignInField';
import LoadingIcon from '^/components/atoms/LoadingIcon';

import * as T from '^/types';
import * as V from '^/utilities/validators';
import Text from './text';

const Root = styled.form({
  boxSizing: 'border-box',
  width: '360px',

  textAlign: 'left',

  backgroundColor: palette.white.toString(),
});

const LoginToolsWrapper = styled.div({
  display: 'flex',
  margin: '10px 0',

  alignItems: 'center',
  justifyContent: 'space-between',
});

const FindingPasswordLink = styled(Link).attrs<LinkProps>({
  className: 'no-select',
})({
  color: palette.textLight.toString(),
  fontSize: '12px',
  textDecoration: 'none',

  ':hover': {
    textDecorationLine: 'underline',
  },
});

const ErrorMessage = styled.p({
  fontSize: '13px',
  lineHeight: 1.3,
  margin: '10px 0',
  color: palette.error.toString(),
});

const LoginButton = styled(ConfirmButton)({
  width: '100%',
  height: '50px',
  margin: 'auto',
  fontSize: '15px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const InteractionsWrapper = styled.div({
  display: 'flex',

  flexDirection: 'column',
  alignItems: 'center',
});

const signUpLinkCommonStyle: CSSObject = {
  color: palette.textBlack.toString(),
  textDecorationLine: 'none',
};

const SignUpLink = styled(Link).attrs({
  className: 'no-select',
})<LinkProps>({
  marginTop: '20px',
  fontSize: '14px',
  fontWeight: 'bold',
  ...signUpLinkCommonStyle,

  ':link': signUpLinkCommonStyle,
  ':visited': signUpLinkCommonStyle,
  ':active': signUpLinkCommonStyle,

  ':hover': {
    textDecorationLine: 'underline',
  },
});

const CheckboxWrapper = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
});

const CheckboxLabel = styled.span({
  color: palette.textLight.toString(),
  fontSize: '12px',
  minHeight: '16px',
  height: '100%',
  cursor: 'pointer',
  userSelect: 'none',
  lineHeight: '28px',
});

const loadingDivCustomStyle: CSSObject = {
  border: `3px solid ${dsPalette.grey40.toString()}`,
  borderTop: `3px solid ${palette.white.toString()}`,
};

const PENDING_USER: number = 401;

type ValidationResults = Readonly<Record<T.SignInFormKeys, V.ValidationResult>>;

type TextDictionary = Record<T.Language, string>;

type RequiredSignInFormKeys = Record<T.SignInFormKeys, string>;

type SignInFormErrors = Record<T.SignInFormKeys, string | undefined>;

export const validationErrorToMessage: Readonly<Record<T.SignInFormKeys, Readonly<{
  [key: string]: TextDictionary;
}>>> = {
  email: {
    required: Text.error.email.required,
    pattern: Text.error.email.pattern,
    existed: Text.error.email.existed,
  },
  password: {
    required: Text.error.password.required,
    minLength: Text.error.password.minLength,
    maxLength: Text.error.password.maxLength,
    pattern: Text.error.password.pattern,
    validCharacter: Text.error.password.validCharacter,
  },
};

const validateForm: (formValues: RequiredSignInFormKeys) => ValidationResults = ({
  email,
  password,
}) => {
  const maxLengthOfPassword: number = 22;
  const minLengthOfPassword: number = 6;

  return {
    email: V.compose(
      V.required(),
      V.emailValidator,
    )(email),
    password: V.compose(
      V.required(),
      V.maxLength(maxLengthOfPassword),
      V.minLength(minLengthOfPassword),
      V.pattern(/^[\x21-\x7E]*$/, 'validCharacter'),
      V.pattern(/^.*[A-Z].*$/),
      V.pattern(/^.*[a-z].*$/),
      V.pattern(/^.*[0-9].*$/),
    )(password),
  };
};

const SignInForm: FC = () => {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();

  const [email, setEmail]: UseState<string> = useState('');
  const [password, setPassword]: UseState<string> = useState('');
  const [invalidCodes, setInvalidCodes]: UseState<SignInFormErrors> = useState({
    email: undefined,
    password: undefined,
  });

  const autoSignIn: boolean = useSelector((state: T.State) => state.Auth.automaticSignIn);
  const inProgress: boolean = useSelector((state: T.State) => state.Auth.signInStatus === T.APIStatus.PROGRESS);
  const error: T.HTTPError | undefined = useSelector((state: T.State) => state.Auth.signInError);
  const errorCode: number | undefined = useSelector((state: T.State) => state.Auth.signInErrorCode);

  const handleSubmit: (event: FormEvent) => void = useCallback((event) => {
    event.preventDefault();

    const validationResults: ValidationResults = validateForm({ email, password });

    setInvalidCodes({
      email: validationResults.email.errors[0],
      password: validationResults.password.errors[0],
    });

    if (!validationResults.email.valid || !validationResults.password.valid) return;

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
      <ul>
        <SignInField
          kind='email'
          value={email}
          onChange={onEmailChange}
          error={invalidCodes.email ? l10n(validationErrorToMessage.email[invalidCodes.email]) : undefined}
        />
        <SignInField
          kind='password'
          value={password}
          onChange={onPasswordChange}
          error={invalidCodes.password ? l10n(validationErrorToMessage.password[invalidCodes.password]) : undefined}
        />
      </ul>
      <LoginToolsWrapper>
        <CheckboxWrapper>
          <Checkbox
            checked={autoSignIn}
            onChange={onAutoSignInChange}
          />
          <CheckboxLabel onClick={onAutoSignInChange}>
            {l10n(Text.autoLogin)}
          </CheckboxLabel>
        </CheckboxWrapper>
        <FindingPasswordLink to={routes.password.main}>
          {l10n(Text.findPassword)}
        </FindingPasswordLink>
      </LoginToolsWrapper>
      {errorMessage}
      <InteractionsWrapper>
        <LoginButton disabled={inProgress}>
          {inProgress ? loadingIcon : l10n(Text.login)}
        </LoginButton>
        <SignUpLink to={routes.signup.main}>
          {l10n(Text.signup)}
        </SignUpLink>
      </InteractionsWrapper>
    </Root>
  );
};

export default SignInForm;
