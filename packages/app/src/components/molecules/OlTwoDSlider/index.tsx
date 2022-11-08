import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

import SliderSvg from '^/assets/icons/slider.svg';
import OlLayerGroup from '^/components/atoms/OlLayerGroup';
import { OlSliderMapLayer } from '^/components/atoms/OlSliderMapLayer';
import olWrap from '^/components/atoms/OlWrap';
import { DateScreenInput } from '^/components/molecules/DateScreenInput';
import { DeviceWidth } from '^/constants/styles';
import {
  UseLastSelectedScreen, UseState, UseWindowSize, useLastSelectedScreen,
  useMapContentsOfScreens, useSortedAvailbleMapScreens, useWindowSize } from '^/hooks';
import * as T from '^/types';

const dropdownWidth: number = 240;
const buttonHeight: number = 35;
const sliderSvgWrapperHeight: number = 56;


const Root =
  styled.div({
    width: '100%',
    height: '100%',
  });

const SliderWrapper =
  styled.div({
    position: 'relative',

    width: '100%',
    height: '100%',
  });

interface SliderProps {
  readonly sliderPosition: T.GeoPoint;
}
const SliderBar =
  styled.div.attrs<SliderProps>(({ sliderPosition }) => ({
    'data-testid': 'OlTwoDSlider-SliderBar',
    style: {
      left: `${sliderPosition[0]}%`,
      backgroundColor: palette.white.toString(),
    },
  }))<SliderProps>({
    position: 'absolute',
    top: '0',
    bottom: '0',
    transform: 'translateX(-50%)',
    width: '1px',
    pointerEvents: 'auto',
  });

interface DateScreenInputWrapperProps {
  readonly isLeft: boolean;
}
const DateScreenInputWrapper =
  styled.div<DateScreenInputWrapperProps>({
    position: 'absolute',
    top: '35px',

    zIndex: 300,
  }, ({ isLeft }) => isLeft ? ({
    right: '40px',
  }) : ({
    left: '40px',
  }));

const SliderSvgWrapper =
  styled.div.attrs<SliderProps>(
    ({ sliderPosition }) => ({
      'data-testid': 'OlTwoDSlider-SliderSvgWrapper',
      style: {
        top: `calc(${sliderPosition[1]}% - ${sliderSvgWrapperHeight}px)`,
      },
    }),
  )<SliderProps>({
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    cursor: 'pointer',
    touchAction: 'none',
  });


export interface Props extends SliderProps {
  readonly zIndex?: number;
  changeSliderPosition(position: SliderProps['sliderPosition']): void;
}

export const OlTwoDSlider: FC<Props> = olWrap(({ zIndex, sliderPosition, map, changeSliderPosition }) => {
  const lastSelectedScreen: UseLastSelectedScreen = useLastSelectedScreen();
  const pickableScreens: T.Screen[] = useSortedAvailbleMapScreens();
  const [windowX]: UseWindowSize = useWindowSize();

  const [leftScreen, setLeftScreen]: UseState<T.Screen | undefined> = useState();
  const [rightScreen, setRightScreen]: UseState<T.Screen | undefined> = useState();

  const [leftScreenMap, rightScreenMap]: (T.MapContent | undefined)[] = useMapContentsOfScreens(leftScreen, rightScreen);

  useEffect(() => {
    const pickableScreenIds: T.Screen['id'][] = pickableScreens.map((screen) => screen.id);
    if (lastSelectedScreen?.id !== undefined && pickableScreenIds.includes(lastSelectedScreen.id)) {
      setLeftScreen(lastSelectedScreen);
    }
  }, [lastSelectedScreen?.id]);

  const onLeftScreenChange: (selectedScreen: T.Screen) => void = (selectedScreen) => {
    setLeftScreen(() => selectedScreen);
  };

  const onRightScreenChange: (selectedScreen: T.Screen) => void = (selectedScreen) => {
    setRightScreen(() => selectedScreen);
  };

  const handleSliderPointerMoveOnMap: (event: MouseEvent | TouchEvent) => void = (event) => {
    let clientX: number | undefined;
    let clientY: number | undefined;

    event.preventDefault();

    switch (event.type) {
      case 'touchmove':
        clientX = (event as TouchEvent).targetTouches[0].clientX;
        clientY = (event as TouchEvent).targetTouches[0].clientY;
        break;
      case 'mousemove':
        clientX = (event as MouseEvent).clientX;
        clientY = (event as MouseEvent).clientY;
        break;
      default:
        return;
    }

    const leftMargin: number = map
      .getTargetElement()
      .getBoundingClientRect().left;
    const mapSize: T.GeoPoint = map.getSize();
    const xyCoords: T.GeoPoint = [clientX - leftMargin, clientY];
    const perCent: number = 100;

    if (mapSize[0] <= xyCoords[0]) {
      xyCoords[0] = mapSize[0] - dropdownWidth;
    }

    // eslint-disable-next-line no-magic-numbers
    const halfHeight: number = buttonHeight / 2;
    if (xyCoords[1] <= halfHeight) {
      xyCoords[1] = halfHeight;
    } else if (mapSize[1] - xyCoords[1] <= halfHeight) {
      xyCoords[1] = mapSize[1] - halfHeight;
    }

    changeSliderPosition(xyCoords.map((coord, index) => (coord / mapSize[index]) * perCent));
  };

  const handleSliderPointerDown: () => void = () => {
    document.addEventListener('mouseup', handleSliderPointerUp);
    document.addEventListener('mousemove', handleSliderPointerMoveOnMap);
    document.addEventListener('touchstart', handleSliderPointerUp);
    document.addEventListener('touchmove', handleSliderPointerMoveOnMap);
  };

  const handleSliderPointerUp: () => void = () => {
    document.removeEventListener('mouseup', handleSliderPointerUp);
    document.removeEventListener('mousemove', handleSliderPointerMoveOnMap);
    document.removeEventListener('touchstart', handleSliderPointerUp);
    document.removeEventListener('touchmove', handleSliderPointerMoveOnMap);
  };

  const getScreenPickerPosition: (defaultPosition: T.ModalPlacement) => T.ModalPlacement
    = (defaultPosition) => windowX <= DeviceWidth.TABLET ? T.ModalPlacement.BOTTOM : defaultPosition;

  return (
    <Root>
      <SliderWrapper>
        <SliderBar
          sliderPosition={sliderPosition}

        >
          <DateScreenInputWrapper isLeft={true}>
            <DateScreenInput
              buttonType={T.DateScreenButton.SPLIT_VIEW}
              screen={leftScreen}
              placement={getScreenPickerPosition(T.ModalPlacement.BOTTOM_LEFT)}
              onScreenChange={onLeftScreenChange}
              pickableScreens={pickableScreens}
            />
          </DateScreenInputWrapper>
          <DateScreenInputWrapper isLeft={false}>
            <DateScreenInput
              buttonType={T.DateScreenButton.SPLIT_VIEW}
              screen={rightScreen}
              placement={getScreenPickerPosition(T.ModalPlacement.BOTTOM_RIGHT)}
              onScreenChange={onRightScreenChange}
              pickableScreens={pickableScreens}
            />
          </DateScreenInputWrapper>
          <SliderSvgWrapper
            sliderPosition={sliderPosition}
            onMouseDown={handleSliderPointerDown}
            onMouseUp={handleSliderPointerUp}
            onTouchStart={handleSliderPointerDown}
            onTouchEnd={handleSliderPointerUp}
          >
            <SliderSvg />
          </SliderSvgWrapper>
        </SliderBar>
      </SliderWrapper>
      <OlLayerGroup>
        <OlSliderMapLayer
          zIndex={zIndex}
          mapContent={leftScreenMap}
          isLeft={true}
          sliderPosition={sliderPosition[0]}
        />
        <OlSliderMapLayer
          zIndex={zIndex}
          mapContent={rightScreenMap}
          isLeft={false}
          sliderPosition={sliderPosition[0]}
        />
      </OlLayerGroup>
    </Root>
  );
});
