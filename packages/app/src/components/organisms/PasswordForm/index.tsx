import React, { FC, FormEvent, ReactNode, useState } from 'react';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';
import dsPalette from '^/constants/ds-palette';

import * as T from '^/types';

import { l10n } from '^/utilities/l10n';

import { NonAuthConfirmButton } from '^/components/atoms/Buttons';
import DDMInput from '^/components/atoms/DDMInput/1';
import LoadingIcon from '^/components/atoms/LoadingIcon';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import { PostPasswordResetBody } from '^/store/duck/Users';
import * as V from '^/utilities/validators';
import Text from './text';

const loadingDivCustomStyle: CSSObject = {
  border: `3px solid ${dsPalette.grey40.toString()}`,
  borderTop: `3px solid ${palette.white.toString()}`,
};

const RootForm =
  styled.form({
    boxSizing: 'border-box',
    width: '100%',

    backgroundColor: palette.white.toString(),
  });

const Description =
  styled.p({
    marginBottom: '20px',

    lineHeight: 1.6,
    fontSize: '15px',
    color: palette.textGray.toString(),
  });

const ErrorMessage = styled.p({
  fontSize: '13px',
  lineHeight: 1.3,
  margin: '10px 0',
  color: palette.error.toString(),
});

export interface Props {
  readonly formValues: T.PasswordFormValues;
  readonly resetPasswordStatus: T.APIStatus;
  readonly resetPasswordError?: T.HTTPError;
  readonly primaryColor?: T.PlanConfig['primaryColor'];
  onChange(formValues: T.PasswordFormValues): void;
  onSubmit(formValues: PostPasswordResetBody): void;
}

type ValidationResults = Readonly<Record<T.PasswordFormKeys, V.ValidationResult>>;
type TextDictionary = Record<T.Language, string>;
type RequiredPasswordFormKeys = Record<T.PasswordFormKeys, string>;

export const validationErrorToMessage: Readonly<Record<T.PasswordFormKeys, Readonly<{
  [key: string]: TextDictionary;
}>>> = {
  email: {
    required: Text.error.email.required,
    pattern: Text.error.email.pattern,
    existed: Text.error.email.existed,
  },
};

const validateForm: (formValues: RequiredPasswordFormKeys) => ValidationResults = ({ email }) => ({
  email: V.compose(
    V.required(),
    V.emailValidator,
  )(email),
});

const PasswordForm: FC<Props & L10nProps> = ({
  formValues, language, primaryColor, resetPasswordStatus, onSubmit, onChange,
}) => {
  const [emailInvalidError, setEmailInvalidError] = useState<string | undefined>();
  const handleSubmit: (event: FormEvent<HTMLFormElement>) => void = (event) => {
    event.preventDefault();

    const validationResults: ValidationResults = validateForm(formValues);
    setEmailInvalidError(validationResults.email.errors[0]);
    if (!validationResults.email.valid) return;

    onSubmit({
      ...formValues,
      language,
    });
  };

  const handleChange: (event: FormEvent<HTMLInputElement>) => void = (event) => {
    const newValue: string = event.currentTarget.value;
    if (formValues.email !== newValue) {
      onChange({
        email: event.currentTarget.value,
      });
    }
  };

  const passwordButtonContent: ReactNode = resetPasswordStatus !== T.APIStatus.PROGRESS
    ? l10n(Text.submit, language)
    : <LoadingIcon loadingDivCustomStyle={loadingDivCustomStyle} />;
  const withError: boolean = emailInvalidError !== undefined;
  const errorMessage: ReactNode =
    emailInvalidError ? (
      <ErrorMessage data-testid='password-input-field-error'>
        * {l10n(validationErrorToMessage.email[emailInvalidError], language)}
      </ErrorMessage>
    ) : undefined;

  return (
    <RootForm onSubmit={handleSubmit}>
      <Description>
        {l10n(Text.description, language)}
      </Description>
      <DDMInput
        error={withError}
        type='email'
        placeholder={l10n(Text.emailPlaceholder, language)}
        onChange={handleChange}
      />
      {errorMessage}
      <NonAuthConfirmButton customColor={primaryColor}>
        {passwordButtonContent}
      </NonAuthConfirmButton>
    </RootForm>
  );
};

export default withL10n(PasswordForm);
