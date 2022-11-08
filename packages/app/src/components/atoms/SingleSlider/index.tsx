import _ from 'lodash-es';
import React, {
  ChangeEvent,
  FC,
  MutableRefObject,
  useEffect,
  useRef,
} from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

const DARK_BLUE: string = 'var(--color-theme-primary)';
const UNFILLED_COLOR: string = palette.slider.unfilledColor.toString();

const SCALE_FACTOR: number = 100;

const DISABLED_SLIDER_OPACITY: number = 0.3;


const SliderRoot = styled.div({
  width: '100%',
});

const SliderInput = styled.input<{ isDisabled: boolean }>(({ isDisabled }) => ({
  '-webkit-appearance': 'none',
  appearance: 'none',
  width: '100%',
  background: palette.slider.unfilledColor.toString(),
  outline: 'none',

  borderRadius: '4.5px',
  backgroundColor: palette.slider.unfilledColor.toString(),
  height: '5px',
  opacity: isDisabled ? DISABLED_SLIDER_OPACITY : 1,

  '::-webkit-slider-thumb': {
    '-webkit-appearance': 'none',
    appearance: 'none',

    border: 'solid 4px var(--color-theme-primary)',
    background: palette.white.toString(),
    width: '13px',
    height: '13px',
    borderRadius: '50%',
    cursor: isDisabled ? 'default' : 'pointer',
  },

  '::-webkit-slider-runnable-track': {
    cursor: isDisabled ? 'default' : 'pointer',
  },
}));


function changeFilledInputSectionStyle(inputElement: HTMLInputElement, changedValue: string | number): void {
  inputElement.style.background =
    `linear-gradient(to right, ${DARK_BLUE} 0%, ${DARK_BLUE} ${changedValue}%, ${UNFILLED_COLOR} ${changedValue}%, ${UNFILLED_COLOR} 100%)`;
}

export interface Props {
  readonly className?: string;
  readonly value: number;
  readonly minValue: number;
  readonly maxValue: number;
  readonly step?: number;
  readonly isDisabled?: boolean;
  onMouseUp?(): void;
  onChange(value: number): void;
}

const SingleSlider: FC<Props> = ({
  className,
  value,
  minValue,
  maxValue,
  step,
  isDisabled = false,
  onMouseUp,
  onChange,
}) => {
  const inputRef: MutableRefObject<null | HTMLInputElement> = useRef(null);

  useEffect(() => {
    if (inputRef.current) changeFilledInputSectionStyle(inputRef.current, calcPercentage(value));
  }, [value]);

  const handleChange: (evt: ChangeEvent<HTMLInputElement>) => void = ({ target: { value: changedValue } }: ChangeEvent<HTMLInputElement>) => {
    if (inputRef.current) changeFilledInputSectionStyle(inputRef.current, calcPercentage(parseFloat(changedValue)));
    onChange(Number(changedValue));
  };

  function calcPercentage(input: number): number {
    return (input - minValue) / (maxValue - minValue) * SCALE_FACTOR;
  }

  return (
    <SliderRoot>
      <SliderInput
        ref={inputRef}
        onChange={handleChange}
        onMouseUp={onMouseUp}
        isDisabled={Boolean(isDisabled)}
        disabled={Boolean(isDisabled)}
        type='range'
        min={minValue}
        max={maxValue}
        value={value}
        className={className}
        step={step}
      />
    </SliderRoot>
  );
};

export default SingleSlider;
