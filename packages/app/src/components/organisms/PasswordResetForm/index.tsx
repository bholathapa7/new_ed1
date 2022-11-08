import React, { FC, FormEvent, ReactNode, useState } from 'react';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';
import dsPalette from '^/constants/ds-palette';

import * as T from '^/types';

import { l10n } from '^/utilities/l10n';
import * as V from '^/utilities/validators';

import { NonAuthConfirmButton } from '^/components/atoms/Buttons';
import DDMInput from '^/components/atoms/DDMInput/1';
import LoadingIcon from '^/components/atoms/LoadingIcon';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import Text from './text';

const RootForm =
  styled.form({
    width: '100%',
    backgroundColor: palette.white.toString(),
  });

const Description =
  styled.p({
    marginBottom: '20px',

    fontSize: '15px',
    color: palette.textGray.toString(),
  });

const PasswordInput: typeof DDMInput =
  styled(DDMInput)({
    marginTop: '10px',
  });

const PasswordErrorMessage =
  styled.span({
    display: 'block',

    marginTop: '10px',

    fontSize: '14px',
    lineHeight: 1,
    fontWeight: 'normal',
    color: palette.error.toString(),
  });

/**
 * @author Junyoung Clare Jang <clare.angelswing@gmail.com>
 * @desc This input is required because of autofill behavior of browsers.
 */
const HiddenInput = styled.input({
  display: 'none',
});


const loadingDivCustomStyle: CSSObject = {
  border: `3px solid ${dsPalette.grey40.toString()}`,
  borderTop: `3px solid ${palette.white.toString()}`,
};

type ValidationResults = Readonly<Record<T.NewPasswordFormKeys, V.ValidationResult>>;
const validateForm: (formValues: T.NewPasswordFormValues) => ValidationResults = ({
  password, passwordConfirmation,
}) => {
  const maxLengthOfPassword: number = 22;
  const minLengthOfPassword: number = 6;

  return {
    password: V.compose(
      V.required(),
      V.maxLength(maxLengthOfPassword),
      V.minLength(minLengthOfPassword),
      V.pattern(/^[\x21-\x7E]*$/, 'validCharacter'),
      V.pattern(/^.*[A-Z].*$/),
      V.pattern(/^.*[a-z].*$/),
      V.pattern(/^.*[0-9].*$/),
    )(password),
    passwordConfirmation: V.compose(
      V.required(),
      V.condition(() => password === passwordConfirmation, 'equalPassword'),
    )(passwordConfirmation),
  };
};

const validationErrorToMessage: Readonly<Record<T.NewPasswordFormKeys, Readonly<{
  [key: string]: (language: T.Language) => string;
}>>> = {
  password: {
    required: (language) => l10n(Text.error.password.required, language),
    minLength: (language) => l10n(Text.error.password.minLength, language),
    maxLength: (language) => l10n(Text.error.password.maxLength, language),
    pattern: (language) => l10n(Text.error.password.pattern, language),
    validCharacter: (language) => l10n(Text.error.password.validCharacter, language),
  },
  passwordConfirmation: {
    required: (language) => l10n(Text.error.passwordConfirmation.required, language),
    equalPassword: (language) => l10n(Text.error.passwordConfirmation.equalPassword, language),
  },
};


export interface Props {
  readonly formValues: T.NewPasswordFormValues;
  readonly passwordToken?: string;
  readonly primaryColor?: T.PlanConfig['primaryColor'];
  patchPasswordStatus: T.APIStatus;
  onChange(formValues: T.NewPasswordFormValues): void;
  onSubmit(formValues: T.NewPasswordFormValues, passwordToken: string): void;
}

interface State {
  password: string | undefined;
  passwordConfirmation: string | undefined;
}

/**
 * @author Junyoung Clare Jang <clare.angelswing@gmail.com>
 * @desc form for resetting password
 */

const PasswordResetForm: FC<Props & L10nProps> = ({
  passwordToken, formValues, language, patchPasswordStatus, primaryColor, onSubmit, onChange,
}) => {
  const [error, setError] = useState<State>({
    password: undefined,
    passwordConfirmation: undefined,
  });

  const handleSubmit: (event: FormEvent<HTMLFormElement>) => void = (event) => {
    event.preventDefault();
    if (passwordToken !== undefined &&
      formValues.password === formValues.passwordConfirmation) {
      onSubmit(formValues, passwordToken);
    }
  };

  const handleChange: (event: FormEvent<HTMLInputElement>) => void = (event) => {
    const name: keyof T.NewPasswordFormValues =
      event.currentTarget.name as keyof T.NewPasswordFormValues;
    const value: string = event.currentTarget.value;
    const newFormValues: T.NewPasswordFormValues = {
      ...formValues,
      [name]: value,
    };

    const validationResult: ValidationResults = validateForm(newFormValues);
    const passwordError: string | undefined = (
      !validationResult.password.valid &&
      validationResult.password.errors.length > 0
    ) ?
      validationResult.password.errors[0] :
      undefined;
    const confirmError: string | undefined = (
      !validationResult.passwordConfirmation.valid &&
      validationResult.passwordConfirmation.errors.length > 0
    ) ?
      validationResult.passwordConfirmation.errors[0] :
      undefined;
    setError({
      password: passwordError !== undefined ?
        validationErrorToMessage.password[passwordError](language) :
        undefined,
      passwordConfirmation: confirmError !== undefined ?
        validationErrorToMessage.passwordConfirmation[confirmError](language) :
        undefined,
    });

    if (formValues[name] !== value) {
      onChange(formValues);
    }
  };

  const {
    password, passwordConfirmation,
  }: T.NewPasswordFormValues = formValues;
  const passwordName: keyof T.NewPasswordFormValues =
    'password';
  const passwordConformationName: keyof T.NewPasswordFormValues =
    'passwordConfirmation';
  const passwordButtonContent: ReactNode =
    patchPasswordStatus !== T.APIStatus.PROGRESS ?
      l10n(Text.submit, language) :
      <LoadingIcon loadingDivCustomStyle={loadingDivCustomStyle} />;
  const passwordError: string = error.password !== undefined ?
    error.password : (
      error.passwordConfirmation !== undefined ?
        error.passwordConfirmation :
        ''
    );

  return (
    <RootForm onSubmit={handleSubmit}>
      <Description>{l10n(Text.title, language)}</Description>
      <HiddenInput
        type='password'
      />
      <PasswordInput
        error={error.password !== undefined}
        name={passwordName}
        type='password'
        value={password}
        placeholder={l10n(Text.passwordPlaceholder, language)}
        autoComplete='off'
        onChange={handleChange}
      />
      <PasswordInput
        error={error.passwordConfirmation !== undefined}
        name={passwordConformationName}
        type='password'
        value={passwordConfirmation}
        placeholder={l10n(Text.passwordConfirmPlaceholder, language)}
        autoComplete='off'
        onChange={handleChange}
      />
      <PasswordErrorMessage>{passwordError}</PasswordErrorMessage>
      <NonAuthConfirmButton customColor={primaryColor}>{passwordButtonContent}</NonAuthConfirmButton>
    </RootForm>
  );
};
export default withL10n(PasswordResetForm);
