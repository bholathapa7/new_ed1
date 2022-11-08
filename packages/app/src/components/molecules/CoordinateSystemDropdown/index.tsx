import React, { FC, ReactNode, useCallback } from 'react';
import styled, { CSSObject } from 'styled-components';

import RawDropdown, {
  DEFAULT_DROPDOWN_ITEM_HEIGHT,
  Option as DropdownOption,
  Props as DropdownProps,
  StyleProps as DropdownStyleProps,
} from '^/components/atoms/Dropdown';
import palette from '^/constants/palette';
import { UseL10n, useL10n } from '^/hooks';
import { CoordinateSystem } from '^/types';
import Text from './text';

const Root = styled.div({
  fontSize: '13px',
  fontWeight: 500,
  color: palette.textBlack.toString(),
});
Root.displayName = 'CoordinateSystemDropdown';

const Dropdown = styled(RawDropdown)<DropdownProps & DropdownStyleProps>({
  display: 'inline-block',

  width: '100%',
});
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

export interface Props {
  readonly value?: string;
  readonly isError?: boolean;
  readonly isDisabled?: boolean;
  readonly options?: Array<DropdownOption>;
  readonly styles?: DropdownStyleProps;
  onSelect(coordinateSystem: CoordinateSystem): void;
}

const CoordinateSystemDropdown: FC<Props> = ({
  isError = false, isDisabled = false,
  value, options, styles,
  onSelect,
}) => {
  const [l10n]: UseL10n = useL10n();

  const handleDropdownClick: (option: DropdownOption) => void = (
    option: DropdownOption,
  ) => onSelect(option.value as CoordinateSystem);

  const getCoordinateOptions: () => Array<DropdownOption> = useCallback(() => Object.keys(Text.options).map((c: string) => ({
    leftText: l10n((Text.options as any)[c]),
    value: c,
  })), [l10n]);

  const selectRequiredNotification: ReactNode = isError ? (
    <NotificationWrapper>
      {l10n(Text.errorMessage)}
    </NotificationWrapper>
  ) : undefined;

  const stylesProps: DropdownStyleProps | undefined = styles ? {
    ...styles,
    mainButtonStyle: {
      ...dropdownMainButtonStyle,
      ...styles?.mainButtonStyle,
    },
  } : undefined;

  const dropdownOptions: Array<DropdownOption> = options ? options : getCoordinateOptions();

  return (
    <Root>
      <Dropdown
        {...stylesProps}
        value={value}
        placeHolder={l10n(Text.placeholder)}
        options={dropdownOptions}
        zIndex={1}
        isSearchEnabled={true}
        isDisabled={isDisabled}
        height={'200px'}
        menuItemHeight={`${DEFAULT_DROPDOWN_ITEM_HEIGHT}`}
        onClick={handleDropdownClick}
      />
      {selectRequiredNotification}
    </Root>
  );
};

export default CoordinateSystemDropdown;
