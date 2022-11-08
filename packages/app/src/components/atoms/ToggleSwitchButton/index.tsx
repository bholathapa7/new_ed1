/* eslint-disable-next-line no-magic-numbers */
import React, { FC, memo } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

const DEFAULT_WIDTH: number = 50;
const DEFAULT_HEIGHT: number = 25;
const DEFAULT_MINUS: number = 5;

interface ValueProps {
  readonly width: number;
  readonly height: number;
}


const Root = styled.label<ValueProps>(({ width, height }) => ({
  position: 'relative',
  display: 'inline-block',
  width,
  height,
}));


const SwitchLabel = styled.div({
  display: 'relative',
  zIndex: 0,
  height: '100%',

  '& span': {
    position: 'absolute',
    display: 'flex',
    color: palette.white.toString(),
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    width: '50%',
    height: '100%',
  },
  'span:first-child': {
    left: 0,
  },
  'span:last-child': {
    right: 0,
  },
});

const CheckBoxWrapper = styled.div<Omit<ValueProps, 'isRight'>>(({ width, height }) => ({
  cursor: 'pointer',
  width,
  height,
  background: palette.white.toString(),
  position: 'relative',
}));

const CheckBoxLabel = styled.label<Omit<ValueProps, 'isRight'>>(({ width, height }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width,
  height,
  borderRadius: '15px',
  background: '#bebebe',
  cursor: 'pointer',

  '::after': {
    content: '\' \'',
    position: 'absolute',
    display: 'block',
    width: '35px',
    height: '35px',
    margin: '3px',
    left: 0,
    top: 0,
    backgroundColor: palette.white.toString(),
    borderRadius: '50%',
    boxShadow: '1px 3px 3px 1px rgba(0, 0, 0, 0.2)',
    transitionDuration: '200ms',
  },
}));

const CheckBox = styled.input<ValueProps>`
  opacity: 0;
  z-index: 1;
  border-radius: 15px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height - DEFAULT_MINUS}px;
  &:checked + ${CheckBoxLabel} {
    background: #4fbe79;
    &::after {
      content: "";
      display: block;
      border-radius: 50%;
      width: ${(props) => props.height - DEFAULT_MINUS}px;
      height: ${(props) => props.height - DEFAULT_MINUS}px;
      margin-left: ${(props) => props.width / 2}px;
      transition: 0.2s;
    }
  }
`;


export interface Props {
  readonly className?: string;
  readonly onChange?: ((isLeft: boolean) => void) | undefined;
  readonly width?: number;
  readonly height?: number;
  readonly leftText?: string;
  readonly rightText?: string;
  readonly value?: boolean;
  readonly dataId: number;
  // readonly zIndex: number;
}
export interface State {
  readonly checked: boolean;
}

/**
 * @author Reuben Thapa
 * @desc Fri Oct 17 05:58:34 2022 UTC
 * @todo
 */

const ToggleSwitchButton: FC<Props> = memo(({
  onChange,
  width,
  height,
  value,
  leftText,
  rightText,
  className,
  dataId,
}) => {
  const handleClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (onChange !== undefined) {
      onChange(event.target.checked);
    }
  };

  const rootWidth: number = width !== undefined ? width : DEFAULT_WIDTH;
  const rootHeight: number = height !== undefined ? height : DEFAULT_HEIGHT;

  return (
    <Root
      className={className}
      width={rootWidth}
      height={rootHeight}
    >
      <CheckBoxWrapper width={rootWidth} height={rootHeight}>
        <CheckBox checked={value} onChange={handleClick} width={rootWidth} height={rootHeight} id={`checkbox-${dataId}`} type='checkbox' />
        <CheckBoxLabel width={rootWidth} height={rootHeight} htmlFor={`checkbox-${dataId}`}>
          <SwitchLabel>
            <span>{leftText}</span>
            <span>{rightText}</span>
          </SwitchLabel>
        </CheckBoxLabel>
      </CheckBoxWrapper>
    </Root>
  );
});


export default ToggleSwitchButton;
