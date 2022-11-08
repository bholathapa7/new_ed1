import React, { FC, useMemo, useState, memo } from 'react';
import { useSelector } from 'react-redux';
import styled, { CSSObject } from 'styled-components';

import Dropdown, {
  Option as DropdownOption,
  StyleProps as DropdownStyleProps,
} from '^/components/atoms/Dropdown';
import palette from '^/constants/palette';
import { UseL10n, UseState, useL10n } from '^/hooks';
import { contentsSelector } from '^/store/duck/Contents';
import * as T from '^/types';
import { isBoundaryViolated } from '^/utilities/math';
import { arePropsEqual } from '^/utilities/react-util';
import Text from './text';

const Root = styled.div({
  display: 'block',
});

const dropdownMainButtonStyle: CSSObject = {
  color: palette.textGray.toString(),

  borderColor: palette.textGray.toString(),
};

const initCurrentValue: (
  defaultValue?: number, content?: T.VolumeContent,
) => T.VolumeContent['id'] | undefined = (defaultValue, content) => {
  if (defaultValue) return defaultValue;
  if (!content || content.info.calculatedVolume.calculation.type !== T.VolumeCalcMethod.DESIGN) return;

  return content.info.calculatedVolume.calculation.designDxfId;
};

export interface Props {
  readonly content?: T.VolumeContent;
  readonly defaultValue?: number;
  readonly dropdownStyle?: DropdownStyleProps;
  readonly isSearchEnabled?: boolean;
  readonly isDisabled?: boolean;
  readonly isViolationCheckNeeded?: boolean;
  onSelect(option: DropdownOption): void;
  onDropdownItemMouseEnter?(option: DropdownOption, index: number): void;
  onDropdownMouseLeave?(): void;
}

export const DesignDXFDropdown: FC<Props> = memo(({
  onDropdownMouseLeave,
  onDropdownItemMouseEnter, onSelect,
  isSearchEnabled, content: volumeContent, dropdownStyle, defaultValue, isDisabled,
  isViolationCheckNeeded,
}) => {
  const {
    Contents: { contents: { byId, allIds } },
  }: T.State = useSelector((state: T.State) => state);
  const [l10n]: UseL10n = useL10n();
  const options: Array<DropdownOption> = useMemo(initOptions, [volumeContent, allIds.length]);
  const [currentValue, setCurrentValue]: UseState<number | undefined> = useState(initCurrentValue(defaultValue, volumeContent));

  function initOptions(): Array<DropdownOption> {
    return allIds
      .sort((a, b) => b - a)
      .map((id) => byId[id])
      .filter((content) => content.type === T.ContentType.DESIGN_DXF && !contentsSelector.isProcessingOrFailedByContent(content))
      .map((content: T.DesignDXFContent) => ({
        leftText: content.title,
        rightText:
            isViolationCheckNeeded && volumeContent !== undefined && isBoundaryViolated(volumeContent.info.locations, content) ?
              l10n(Text.violatedBoundary) : undefined,
        value: content.id,
      }));
  }

  const handleDropdownItemClick: (option: DropdownOption, index: number) => void = (option) => {
    const value: number = option.value as number;
    setCurrentValue(value);
    onSelect(option);
  };

  return (
    <Root>
      <Dropdown
        isSearchEnabled={isSearchEnabled}
        mainButtonStyle={dropdownMainButtonStyle}
        value={currentValue}
        placeHolder={l10n(Text.placeholder)}
        options={options}
        zIndex={1}
        onClick={handleDropdownItemClick}
        height={'112px'}
        menuItemHeight={'34px'}
        onDropdownItemMouseEnter={onDropdownItemMouseEnter}
        onDropdownMouseLeave={onDropdownMouseLeave}
        isDisabled={isDisabled}
        {...dropdownStyle}
      />
    </Root>
  );
}, arePropsEqual);
