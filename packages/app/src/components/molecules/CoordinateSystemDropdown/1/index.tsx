import React, { FC, ReactNode } from 'react';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';
import { CoordinateSystem, Language } from '^/types';
import { l10n } from '^/utilities/l10n';

import RawDropdown, {
  Option as DropdownOption,
  Props as DropdownProps,
} from '^/components/atoms/Dropdown/1';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import Text from './text';

const Root = styled.div({
  fontSize: '13px',
  fontWeight: 500,
  color: palette.textBlack.toString(),
});
Root.displayName = 'CoordinateSystemDropdown';

interface DropdownStyleProps {
  dropdownStyle?: CSSObject;
}
const Dropdown = styled(RawDropdown)<DropdownProps & DropdownStyleProps>({
  display: 'inline-block',

  width: '100%',
}, ({ dropdownStyle }) => dropdownStyle ? dropdownStyle : {});
Dropdown.displayName = 'Dropdown';

const dropdownMainButtonStyle: CSSObject = {
  color: palette.textGray.toString(),

  borderColor: palette.textGray.toString(),
};

const NotificationWrapper = styled.div({
  marginTop: '10px',

  fontSize: '13px',
  lineHeight: 1,
  fontWeight: 'normal',
  color: palette.error.toString(),
});

export const getCoordinateOptions: (language: Language) => Array<DropdownOption> = (language) =>
  Object.keys(Text.options).map((c: string) => ({
    text: l10n((Text.options as any)[c], language),
    value: c,
  }));

export interface Props {
  value?: string;
  isError?: boolean;
  options?: Array<DropdownOption>;
  dropdownButtonStyle?: CSSObject;
  onSelect(coordinateSystem: CoordinateSystem): void;
}

const CoordinateSystemDropdown: FC<Props & L10nProps> = (
  { value, isError, options, onSelect, language, dropdownButtonStyle },
) => {
  const handleDropdownClick: (option: DropdownOption) => void = (
    option: DropdownOption,
  ) => onSelect(option.value as CoordinateSystem);

  const selectRequiredNotification: ReactNode = isError ? (
    <NotificationWrapper>
      {l10n(Text.errorMessage, language)}
    </NotificationWrapper>
  ) : undefined;

  const mainButtonStyle: CSSObject = {
    ...dropdownMainButtonStyle,
    ...dropdownButtonStyle,
  };

  const dropdownOptions: Array<DropdownOption> = options ? options : getCoordinateOptions(language);

  return (
    <Root>
      <Dropdown
        mainButtonStyle={mainButtonStyle}
        value={value}
        placeHolder={l10n(Text.placeholder, language)}
        options={dropdownOptions}
        zIndex={1}
        isSearchEnable={true}
        onClick={handleDropdownClick}
      />
      {selectRequiredNotification}
    </Root>
  );
};

export default withL10n(CoordinateSystemDropdown);
