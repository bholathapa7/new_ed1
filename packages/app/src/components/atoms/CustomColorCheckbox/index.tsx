import React, { FC, MouseEvent, memo, useCallback } from 'react';
import styled, { CSSObject } from 'styled-components';

import { GrayBlueCheckbox as Checkbox } from '^/components/atoms/GrayBlueCheckbox';

import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';


const Root = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
});

const CheckboxLabel = styled.span({
  fontSize: '12px',
  minHeight: '28px',
  height: '100%',
  fontWeight: 500,
  color: dsPalette.typePrimary.toString(),
  cursor: 'pointer',
  userSelect: 'none',
  lineHeight: '25px',
});

const CheckboxSvgWrapper = styled.div<{ checked: boolean; color?: string }>(({ checked, color }) => {
  const baseStyle: CSSObject = {
    marginRight: '5px',
    minHeight: '28px',
    height: '100%',
    svg: {
      marginTop: '6px',
    },
  };

  if (!checked || !color) {
    return baseStyle;
  }

  return {
    ...baseStyle,
    ' svg path:first-of-type': {
      fill: color,
    },
    ' svg path:last-of-type': {
      fill: palette.white.toString(),
    },
  };
});


export interface Props {
  readonly checked: boolean;
  readonly color?: string;
  onChange?(checked: boolean): void;
}

export const CustomColorCheckbox: FC<Props> = memo(({
  checked, color, onChange, children,
}) => {
  const toggleCheckbox: () => void = useCallback(() => {
    if (onChange) onChange(!checked);
  }, [checked]);

  // There might be links in the label.
  // Do not toggle them when clicking the link
  // since it's not what user is intending to do anyway.
  const toggleLabel: (e: MouseEvent) => void = useCallback((e) => {
    if (onChange && e.target === e.currentTarget) onChange(!checked);
  }, [checked]);

  return (
    <Root>
      <CheckboxSvgWrapper
        checked={checked}
        color={color}
      >
        <Checkbox
          isChecked={checked}
          onClick={toggleCheckbox}
        />
      </CheckboxSvgWrapper>
      <CheckboxLabel onClick={toggleLabel}>
        {children}
      </CheckboxLabel>
    </Root>
  );
});
