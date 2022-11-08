import React, { FC, memo, useCallback, useEffect, useMemo } from 'react';
import styled, { CSSObject } from 'styled-components';

import RawDropdown, {
  Option as DropdownOption,
  Props as DropdownProps,
} from '^/components/atoms/Dropdown';
import { DEFAULT_COORDINATE_TITLE_TEXT } from '^/constants/coordinate';
import palette from '^/constants/palette';
import { UseL10n, useL10n } from '^/hooks';
import * as T from '^/types';
import { COORDINATE_TITLE_MAP, getCoordinateTitles } from '^/utilities/coordinate-util';

interface DropdownStyleProps {
  dropdownStyle?: CSSObject;
}
const Dropdown = styled(RawDropdown)<DropdownProps & DropdownStyleProps>({
  display: 'inline-block',

  width: '100%',

  background: palette.transparent.toString(),
}, ({ dropdownStyle }) => ({
  ...dropdownStyle,
}));
Dropdown.displayName = 'Dropdown';

const dropdownMainButtonStyle: CSSObject = {
  color: palette.textBlack.toString(),
  fontWeight: 500,

  border: 'none',
  backgroundColor: 'transparent',

  padding: '2px',
};

const dropdownItemStyle: CSSObject = {
  paddingLeft: '9px',
  paddingRight: '9px',

  fontSize: '13px',
  color: palette.textBlack.toString(),

  ':hover': {
    color: 'var(--color-theme-primary-lightest)',
  },
};

function isCoordinateTitle(title: string): title is T.CoordinateTitle {
  return Object.values(T.CoordinateTitle).includes(title as T.CoordinateTitle);
}

export interface Props {
  readonly coordinateSystem: T.CoordinateSystem;
  readonly value?: string;
  readonly isDisabled?: boolean;
  onSelect(coordinate: string): void;
}

const CoordinateTitleDropdown: FC<Props> = ({
  isDisabled = false,
  coordinateSystem, value, onSelect,
}) => {
  const [l10n]: UseL10n = useL10n();

  const options: DropdownOption[] = useMemo(() => getCoordinateTitles(coordinateSystem).map((title) => ({
    leftText: l10n(DEFAULT_COORDINATE_TITLE_TEXT[title]),
    value: title,
  })), [coordinateSystem, l10n]);

  useEffect(() => {
    if (value !== undefined && isCoordinateTitle(value)) {
      if (options.every((option) => option.value !== value)) {
        onSelect(COORDINATE_TITLE_MAP[value]);
      }
    }
  }, [options]);

  const handleDropdownClick: (option: DropdownOption) => void = useCallback((option) => onSelect(String(option.value)), [onSelect]);

  return (
    <Dropdown
      fontSize={'13px'}
      mainButtonStyle={dropdownMainButtonStyle}
      itemStyle={dropdownItemStyle}
      value={value}
      placeHolder={'-'}
      options={options}
      zIndex={1}
      isDisabled={isDisabled}
      onClick={handleDropdownClick}
    />
  );
};

export default memo(CoordinateTitleDropdown);
