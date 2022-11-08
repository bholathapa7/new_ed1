import React, { FC, ReactNode, memo } from 'react';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';
import Color from 'color';

import { arePropsEqual } from '^/utilities/react-util';

const Root = styled.div({
  display: 'inline-flex',

  backgroundColor: palette.transparent.toString(),
  alignItems: 'center',
});

interface CheckedProps {
  readonly checked: boolean;
  readonly isVerticalAlign?: boolean;
  readonly customColor?: Color;
}

const CheckSquare = styled.i.attrs(({ checked }: CheckedProps) => checked ? {
  className: 'fa fa-check-square-o',
} : {
  className: 'fa fa-square-o',
})<CheckedProps>(({ checked, customColor, isVerticalAlign }) => ({
  width: '26px',
  height: '16px',

  lineHeight: '16px',
  textAlign: 'left',
  fontSize: '20px',

  cursor: 'pointer',

  color: (() => {
    if (customColor) return customColor;

    return checked ? 'var(--color-theme-primary-lightest)' : palette.icon;
  })().toString(),
  '::before': {
    verticalAlign: isVerticalAlign ? 'middle' : '',
  },
}));

const Label = styled.label.attrs({
  className: 'no-select',
})({
  display: 'inline-block',

  fontSize: '14px',
  color: palette.textLight.toString(),
});

const StyledLabel = styled(Label)(({ labelStyle }: { labelStyle?: CSSObject }) => ({
  ...labelStyle,
  width: '100%',
}));

export interface Props extends CheckedProps {
  readonly label: string | ReactNode;
  readonly className?: string;
  readonly labelStyle?: CSSObject;
  readonly isVerticalAlign?: boolean;
  readonly color?: Color;
  onChange(checked: boolean): void;
}

export const DDMCheckBox: FC<Props> = ({
  onChange, checked, className, color, isVerticalAlign, label, labelStyle,
}) => {
  const handleClick: () => void = () => onChange(!checked);

  return (
    <Root
      className={className}
      onClick={handleClick}
      data-testid='ddmcheckbox-root'
    >
      <CheckSquare customColor={color} checked={checked} isVerticalAlign={isVerticalAlign} />
      <StyledLabel labelStyle={labelStyle}>{label}</StyledLabel>
    </Root>
  );
};

export default memo(DDMCheckBox, arePropsEqual);
