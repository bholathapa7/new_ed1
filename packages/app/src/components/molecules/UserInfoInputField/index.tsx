import React, { FC, FormEvent, ReactNode } from 'react';
import styled, { CSSObject } from 'styled-components';

import * as T from '^/types';

import palette from '^/constants/palette';

import { l10n } from '^/utilities/l10n';

import DDMInput from '^/components/atoms/DDMInput/1';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import Text from './text';

interface CustomStyleProps {
  readonly customStyle?: CSSObject;
}
const Root = styled.li<CustomStyleProps>(({ customStyle }) => ({
  ...customStyle,
}));

const Wrapper = styled.div({
  position: 'relative',
});

const Label = styled.label<CustomStyleProps>({
  display: 'block',
  marginBottom: '10px',

  fontWeight: 500,
  color: palette.darkBlack.toString(),
}, ({ customStyle }) => ({
  ...customStyle,
}));

const Message = styled.p({
  display: 'block',
  marginTop: '10px',

  lineHeight: 1.3,
  fontSize: '14px',
});

const ErrorMessage = styled(Message)({
  color: palette.error.toString(),
});

const AdditionalInfoMessage = styled(Message)({
  color: 'var(--color-theme-primary-lightest)',
});

export type UserInfoInputFieldKind =
  | 'email'
  | 'password' | 'passwordConfirmation'
  | 'firstName' | 'lastName'
  | 'contactNumber'
  | 'organization'
  ;

const kindToType: Record<UserInfoInputFieldKind, string> = {
  email: 'text',
  password: 'password',
  passwordConfirmation: 'password',
  firstName: 'text',
  lastName: 'text',
  contactNumber: 'text',
  organization: 'text',
};

const kindToLabel: Record<UserInfoInputFieldKind, (language: T.Language) => string> = {
  email: (language) => l10n(Text.emailLabel, language),
  password: (language) => l10n(Text.passwordLabel, language),
  passwordConfirmation: (language) => l10n(Text.passwordConfirmationLabel, language),
  firstName: (language) => l10n(Text.firstNameLabel, language),
  lastName: (language) => l10n(Text.lastNameLabel, language),
  contactNumber: (language) => l10n(Text.contactNumberLabel, language),
  organization: (language) => l10n(Text.organizationLabel, language),
};

type LangToStr = (language: T.Language) => string;
/**
 * @todo many duplicated functions, we could reduce these functions with lodash
 */
const kindToPlaceholder: Record<UserInfoInputFieldKind, LangToStr> = {
  email: (language) => l10n(Text.emailPlaceholder, language),
  password: (language) => l10n(Text.passwordPlaceholder, language),
  passwordConfirmation: (language) => l10n(Text.passwordConfirmationPlaceholder, language),
  firstName: (language) => l10n(Text.firstNamePlaceholder, language),
  lastName: (language) => l10n(Text.lastNamePlaceholder, language),
  contactNumber: (language) => l10n(Text.contactNumberPlaceholder, language),
  organization: (language) => l10n(Text.organizationPlaceholder, language),
};
const kindToAdditionalInfo: Partial<Record<UserInfoInputFieldKind, LangToStr>> = {
  email: (language) => l10n(Text.emailAdditionalInfo, language),
};

export interface Props {
  readonly kind: UserInfoInputFieldKind;
  readonly value: string;
  readonly error?: string;
  readonly rootStyle?: CSSObject;
  readonly labelStyle?: CSSObject;
  readonly companyName?: T.PlanConfig['companyName'];
  onChange(kind: UserInfoInputFieldKind, value: string): void;
  onBlur?(kind: UserInfoInputFieldKind, value: string): void;
}

/**
 * @author Junyoung Clare Jang <clare.angelswing@gmail.com>
 * @desc field for user information
 */
const UserInfoInputField: FC<Props & L10nProps> = ({
  kind, value, error, rootStyle, labelStyle, companyName, language, onChange, onBlur,
}) => {
  const handleInputChange: (event: FormEvent<HTMLInputElement>) => void = (event) => {
    onChange(kind, event.currentTarget.value);
  };

  const handleInputBlur: (event: FormEvent<HTMLInputElement>) => void = (event) => {
    if (onBlur) {
      onBlur(kind, event.currentTarget.value);
    }
  };

  const withError: boolean = error !== undefined;
  const errorMessage: ReactNode =
    withError ? (
      <ErrorMessage data-testid='sign-up-input-field-error'>
        {`* ${error}`}
      </ErrorMessage>
    ) : undefined;
  const additionalInfo: string | undefined = (() => {
    const additionalInfoFn: ((language: T.Language) => string) | undefined = kindToAdditionalInfo[kind];
    if (!additionalInfoFn) {
      return undefined;
    }

    const text: string = additionalInfoFn(language);

    // Write the actual company name on the info instead of angelswing,
    // to give a better context on who's signing up.
    if (companyName) {
      return text.replace(l10n(Text.angelswing, language), companyName);
    }

    return text;
  })();

  const additionalMessage: ReactNode =
    additionalInfo !== undefined ? (
      <AdditionalInfoMessage data-testid='sign-up-input-field-additional-info'>
        {`* ${additionalInfo}`}
      </AdditionalInfoMessage>
    ) : undefined;

  return (
    <Root customStyle={rootStyle}>
      <Wrapper>
        <Label customStyle={labelStyle}>
          {kindToLabel[kind](language)}
        </Label>
        <DDMInput
          autoComplete={kindToType[kind] === 'password' ? 'new-password' : 'on'}
          type={kindToType[kind]}
          placeholder={kindToPlaceholder[kind](language)}
          error={withError}
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
        />
        {additionalMessage}
        {errorMessage}
      </Wrapper>
    </Root>
  );
};
export default withL10n(UserInfoInputField);
