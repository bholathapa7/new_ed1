import React, { FC, ReactNode } from 'react';
import styled, { CSSObject } from 'styled-components';

import * as T from '^/types';

import countries from '^/constants/countries';
import palette from '^/constants/palette';

import { l10n } from '^/utilities/l10n';

import RawDropdown, {
  Option as DropdownOption,
  Props as DropdownProps,
} from '^/components/atoms/Dropdown/1';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import Text from './text';

interface CustomStyleProps {
  readonly customStyle?: CSSObject;
}
const Root = styled.li<CustomStyleProps>({
  display: 'block',

  ':not(:first-of-type)': {
    marginTop: '20px',
  },
}, ({ customStyle }) => (
  customStyle ? { ...customStyle } : {}
));

const Wrapper = styled.div({
  position: 'relative',
});

const Label = styled.label<CustomStyleProps>({
  display: 'block',
  marginBottom: '10px',

  color: palette.darkBlack.toString(),
}, ({ customStyle }) => (
  customStyle ? { ...customStyle } : {}
));

const Message = styled.p({
  display: 'block',
  marginTop: '10px',

  lineHeight: 1.3,
  fontSize: '14px',
});

const ErrorMessage = styled(Message)({
  color: palette.error.toString(),
});

const Dropdown = styled(RawDropdown)<DropdownProps>({
  width: '100%',
});
Dropdown.displayName = 'Dropdown';

export type UserInfoDropdownFieldsKind =
  | 'country'
  | 'purpose'
  | 'language'
  ;

const languageTypeToLanguageText: Record<T.Language, string> = {
  [T.Language.EN_US]: 'English',
  [T.Language.KO_KR]: '한국어',
};

const kindToLabel: Record<UserInfoDropdownFieldsKind, (lang: T.Language) => string> = {
  country: (lang) => l10n(Text.countryLabel, lang),
  purpose: (lang) => l10n(Text.purposeLabel, lang),
  language: (lang) => l10n(Text.languageLabel, lang),
};

type Options = Array<DropdownOption>;
const kindToOptions: Record<UserInfoDropdownFieldsKind, (lang: T.Language) => Options> = ({
  country: (lang) => countries[lang]
    .map((text, index) => ({
      text,
      value: countries[T.Language.EN_US][index],
    })),
  purpose: (lang) => Object.keys(Text.purposeOptions)
    .filter((key) => key !== 'default')
    .map((key: keyof (typeof Text.purposeOptions)) => ({
      text: Text.purposeOptions[key][lang],
      value: key,
    })),
  language: () => Object.keys(languageTypeToLanguageText)
    .map((key) => ({
      text: languageTypeToLanguageText[key as T.Language],
      value: key,
    })),
});

const kindToPlaceHolder: Record<UserInfoDropdownFieldsKind, (lang: T.Language) => string> = ({
  country: (lang) => l10n(Text.countryOptions.default, lang),
  purpose: (lang) => l10n(Text.purposeOptions.default, lang),
  language: (lang) => l10n(Text.languageOptions.default, lang),
});

const kindToHeight: Record<UserInfoDropdownFieldsKind, (lang: T.Language) => string> = ({
  country: (): string => '178px',
  purpose: (): string => 'auto',
  language: (): string => 'auto',
});

export interface Props {
  readonly kind: UserInfoDropdownFieldsKind;
  readonly value?: string;
  readonly error?: string;
  readonly rootStyle?: CSSObject;
  readonly labelStyle?: CSSObject;
  onChange(kind: UserInfoDropdownFieldsKind, value: string): void;
}

/**
 * @author Junyoung Clare Jang
 * @desc Wed Oct 24 18:28:32 2018 UTC
 * @desc field for sign up
 */
const UserInfoDropdownFields: FC<Props & L10nProps> = ({
  error, kind, value, language, rootStyle, onChange,
}) => {
  const handleDropdownChange: ({ value: dropdownValue }: DropdownOption) => void = ({ value: dropdownValue }) => {
    onChange(kind, dropdownValue as string);
  };

  const withError: boolean = error !== undefined;
  const errorMessage: ReactNode =
    withError ?
      <ErrorMessage>{`* ${error}`}</ErrorMessage> :
      undefined;

  const labelText: string = kindToLabel[kind](language);

  const options: Options = kindToOptions[kind](language);
  const placeHolder: string = kindToPlaceHolder[kind](language);
  const height: string = kindToHeight[kind](language);

  return (
    <Root customStyle={rootStyle}>
      <Wrapper>
        <Label>{labelText}</Label>
        <Dropdown
          value={value}
          placeHolder={placeHolder}
          options={options}
          height={height}
          zIndex={1}
          onClick={handleDropdownChange}
          error={withError}
          isSearchEnable={kind === 'country'}
        />
        {errorMessage}
      </Wrapper>
    </Root>
  );
};
export default withL10n(UserInfoDropdownFields);
