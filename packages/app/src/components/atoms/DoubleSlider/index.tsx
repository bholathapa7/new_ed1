import React, { FC } from 'react';
import RawReactSlider, { ReactSliderProps } from 'react-slider';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';

export type DoubleSliderValues = [number, number];
export enum DoubleSliderIndex {
  FIRST_SLIDER = 0,
  SECOND_SLIDER,
}
enum TrackIndex {
  FIRST_UNFILLED = 0,
  SECOND_FILLED,
  THIRD_UNFILLED,
}

const DEFAULT_GAP: number = 0.5;


interface CustomStylesProps {
  customStyles?: Props['customStyles'];
}

const ReactSlider = styled(RawReactSlider)<ReactSliderProps & { customStyles?: Props['customStyles'] }>(({ customStyles }) => ({
  width: '100%',
  height: '5px',

  borderRadius: '4.5px',

  ...customStyles?.rootStyle,
}));

const Thumb = styled.div<CustomStylesProps>(({ customStyles }) => ({
  top: '50%',
  transform: 'translateY(-50%)',

  height: '5px',
  width: '5px',

  borderRadius: '50%',
  border: 'solid 4px var(--color-theme-primary)',

  backgroundColor: palette.white.toString(),
  cursor: 'grab',

  ...customStyles?.thumbStyle,
}));

const Track = styled.div<{ index: TrackIndex } & CustomStylesProps>(({ index, customStyles }) => ({
  top: 0,
  bottom: 0,

  height: '100%',

  borderRadius: '4.5px',
  background: (index === TrackIndex.SECOND_FILLED ? 'var(--color-theme-primary)' : palette.slider.unfilledColor).toString(),
  cursor: 'pointer',

  ...(index === TrackIndex.FIRST_UNFILLED || index === TrackIndex.THIRD_UNFILLED ? customStyles?.unfilledBarStyle : undefined),
  ...(index === TrackIndex.SECOND_FILLED ? customStyles?.filledBarStyle : undefined),
}));


interface CustomStyles {
  rootStyle?: CSSObject;
  unfilledBarStyle?: CSSObject;
  filledBarStyle?: CSSObject;
  thumbStyle?: CSSObject;
}

export interface Props {
  values: DoubleSliderValues;
  min: number;
  max: number;
  gap?: number;
  customStyles?: CustomStyles;
  onChange(values: DoubleSliderValues): void;
  onAfterChange?(values: DoubleSliderValues): void;
}

export const DoubleSlider: FC<Props> = ({
  values, min, max, gap = DEFAULT_GAP, customStyles,
  onChange, onAfterChange,
}) => {
  const renderThumb: ReactSliderProps['renderThumb'] = (props) => (
    <Thumb customStyles={customStyles} {...props} />
  );
  const renderTrack: ReactSliderProps['renderTrack'] = (props, state) => (
    <Track index={state.index} customStyles={customStyles} {...props} />
  );

  return (
    <ReactSlider
      className='horizontal-slider'
      value={values}
      defaultValue={values}
      min={min}
      max={max}
      minDistance={gap}
      step={gap}
      customStyles={customStyles}
      renderThumb={renderThumb}
      renderTrack={renderTrack}
      onChange={onChange}
      onAfterChange={onAfterChange}
    />
  );
};
