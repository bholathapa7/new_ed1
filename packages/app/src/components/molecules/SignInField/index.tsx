import React, { ReactNode, FC, SyntheticEvent, useCallback } from 'react';
import styled from 'styled-components';

import * as T from '^/types';
import palette from '^/constants/palette';
import { l10n } from '^/utilities/l10n';
import { useL10n, UseL10n } from '^/hooks';
import Text from './text';
import DDMInput from '^/components/atoms/DDMInput/1';

const Root = styled.li({
  display: 'block',

  ':not(:first-of-type)': {
    marginTop: '20px',
  },
});

const Label = styled.label({
  display: 'block',
  marginBottom: '10px',

  fontSize: '13px',
  fontWeight: 500,
  color: palette.darkBlack.toString(),
});

const ErrorMessage = styled.p({
  fontSize: '13px',
  lineHeight: 1.3,
  margin: '10px 0',
  color: palette.error.toString(),
});

type SignInFieldKind = 'email' | 'password';
const languagePlaceholderMap: Readonly<Record<SignInFieldKind, (language: T.Language) => string>> = {
  email: (language) => l10n(Text.emailPlaceholder, language),
  password: (language) => l10n(Text.passwordPlaceholder, language),
};
const languageLabelMap: Readonly<Record<SignInFieldKind, (language: T.Language) => string>> = {
  email: (language) => l10n(Text.email, language),
  password: (language) => l10n(Text.password, language),
};

/**
 * @desc This kind should be unique in a document of moment.
 */
export interface Props {
  readonly kind: SignInFieldKind;
  readonly value: string;
  readonly hideLabel?: boolean;
  readonly error?: string;
  onChange(value: string): void;
}

const SignInField: FC<Props> = ({
  kind, value, hideLabel, error, onChange,
}) => {
  const [, language]: UseL10n = useL10n();
  const withError: boolean = error !== undefined;
  const errorMessage: ReactNode =
    withError ? (
      <ErrorMessage data-testid='sign-up-input-field-error'>
        * {error}
      </ErrorMessage>
    ) : undefined;

  const handleChange: (event: SyntheticEvent<HTMLInputElement>) => void = useCallback((event) => {
    onChange(event.currentTarget.value);
  }, []);

  const id: string = `sign-in-field-${kind}`;

  const label: ReactNode = hideLabel
    ? null
    : <Label htmlFor={id}>{languageLabelMap[kind](language)}</Label>;

  const placeholder: string = hideLabel
    ? languageLabelMap[kind](language)
    : languagePlaceholderMap[kind](language);

  return (
    <Root>
      {label}
      <DDMInput
        id={id}
        value={value}
        name={kind}
        type={kind}
        error={withError}
        placeholder={placeholder}
        onChange={handleChange}
      />
      {errorMessage}
    </Root>
  );
};

export default SignInField;
