import React, { FC } from 'react';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';
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
Root.displayName = 'PlanDropdown';

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

export interface Props {
    value?: string;
    options?: Array<DropdownOption>;
    dropdownButtonStyle?: CSSObject;
    onSelect(planId: string): void;
}

const PlanDropdown: FC<Props & L10nProps> = (
  { value, options, onSelect, language, dropdownButtonStyle },
) => {
  const handleDropdownClick: (option: DropdownOption) => void = (
    option: DropdownOption,
  ) => onSelect(option.value as string);

  const mainButtonStyle: CSSObject = {
    ...dropdownMainButtonStyle,
    ...dropdownButtonStyle,
  };

  const dropdownOptions: Array<DropdownOption> = options ?? [];

  return (
    <Root>
      <Dropdown
        mainButtonStyle={mainButtonStyle}
        value={value}
        placeHolder={l10n(Text.placeholder, language)}
        options={dropdownOptions}
        zIndex={1}
        isSearchEnable={false}
        onClick={handleDropdownClick}
      />
    </Root>
  );
};

export default withL10n(PlanDropdown);
