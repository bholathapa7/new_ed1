import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

import { MapTargetComponent, OlMapProvider } from '^/components/atoms/OlMapProvider';
import { DetailMapLayer } from '^/components/molecules/ComparisonTwoDisplay';
import { DateScreenInput } from '^/components/molecules/DateScreenInput';
import { DeviceWidth } from '^/constants/styles';
import {
  UseLastSelectedScreen, UseState, UseWindowSize, useLastSelectedScreen,
  useMapContentsOfScreens, useSortedAvailbleMapScreens, useWindowSize,
} from '^/hooks';
import * as T from '^/types';

interface DateScreenInputWrapperProps {
  readonly isLeft: boolean;
  readonly isTop: boolean;
  readonly zIndex: number;
}


const DateScreenInputWrapper =
  styled.div.attrs({
    'data-testid': 'comparisonfourdisplay-screen-picker-wrapper',
  })<DateScreenInputWrapperProps>({
    position: 'absolute',
  }, ({ isLeft, isTop, zIndex }) => ({
    ...isLeft ? {
      right: '20px',
    } : {
      left: '20px',
    },
    ...isTop ? {
      bottom: '30px',
    } : {
      top: '30px',
    },
    zIndex,
  }));


export interface Props {
  readonly MapTarget: MapTargetComponent;
  readonly redraw?: number;
}

export const ComparisonFourDisplay: FC<Props> = ({
  MapTarget,
  redraw,
  children,
}) => {
  const lastSelectedScreen: UseLastSelectedScreen = useLastSelectedScreen();
  const pickableScreens: T.Screen[] = useSortedAvailbleMapScreens();
  const [windowX]: UseWindowSize = useWindowSize();

  const [first, setFirst]: UseState<T.Screen | undefined> = useState();
  const [second, setSecond]: UseState<T.Screen | undefined> = useState();
  const [third, setThird]: UseState<T.Screen | undefined> = useState();
  const [fourth, setFourth]: UseState<T.Screen | undefined> = useState();

  const [firstScreenMap, secondScreenMap, thirdScreenMap, fourthScreenMap]: (T.MapContent | undefined)[] =
    useMapContentsOfScreens(first, second, third, fourth);

  useEffect(() => {
    const pickableScreenIds: T.Screen['id'][] = pickableScreens.map((screen) => screen.id);
    if (lastSelectedScreen?.id !== undefined && pickableScreenIds.includes(lastSelectedScreen?.id)) {
      setFirst(lastSelectedScreen);
    }
  }, []);

  const onFirstScreenChange: (screen: T.Screen) => void = (screen) => {
    setFirst(() => screen);
  };
  const onSecondScreenChange: (screen: T.Screen) => void = (screen) => {
    setSecond(() => screen);
  };
  const onThirdScreenChange: (screen: T.Screen) => void = (screen) => {
    setThird(() => screen);
  };
  const onFourthScreenChange: (screen: T.Screen) => void = (screen) => {
    setFourth(() => screen);
  };

  const getScreenPickerPosition: (defaultPosition: T.ModalPlacement) => T.ModalPlacement = (defaultPosition) => {
    switch (defaultPosition) {
      case T.ModalPlacement.TOP_LEFT:
      case T.ModalPlacement.TOP_RIGHT:
        return windowX <= DeviceWidth.TABLET ? T.ModalPlacement.TOP : defaultPosition;
      case T.ModalPlacement.BOTTOM_LEFT:
      case T.ModalPlacement.BOTTOM_RIGHT:
        return windowX <= DeviceWidth.TABLET ? T.ModalPlacement.BOTTOM : defaultPosition;
      default:
        return defaultPosition;
    }
  };

  const topZIndex: number = 200; // The top-dropdown may overlay the bottom-dropdown
  const bottomZIndex: number = 100;

  return (
    <>
      <OlMapProvider
        MapTarget={MapTarget}
        redraw={redraw}
      >
        <DateScreenInputWrapper zIndex={topZIndex} isLeft={true} isTop={true}>
          <DateScreenInput
            buttonType={T.DateScreenButton.SPLIT_VIEW}
            screen={first}
            placement={getScreenPickerPosition(T.ModalPlacement.TOP_LEFT)}
            pickableScreens={pickableScreens}
            onScreenChange={onFirstScreenChange}
          />
        </DateScreenInputWrapper>
        {children}
        <DetailMapLayer content={firstScreenMap} />
      </OlMapProvider>
      <OlMapProvider
        MapTarget={MapTarget}
        redraw={redraw}
      >
        <DateScreenInputWrapper zIndex={topZIndex} isLeft={false} isTop={true}>
          <DateScreenInput
            buttonType={T.DateScreenButton.SPLIT_VIEW}
            screen={second}
            placement={getScreenPickerPosition(T.ModalPlacement.TOP_RIGHT)}
            pickableScreens={pickableScreens}
            onScreenChange={onSecondScreenChange}
          />
        </DateScreenInputWrapper>
        {children}
        <DetailMapLayer content={secondScreenMap} />
      </OlMapProvider>
      <OlMapProvider
        MapTarget={MapTarget}
        redraw={redraw}
      >
        <DateScreenInputWrapper zIndex={bottomZIndex} isLeft={true} isTop={false}>
          <DateScreenInput
            buttonType={T.DateScreenButton.SPLIT_VIEW}
            screen={third}
            placement={getScreenPickerPosition(T.ModalPlacement.BOTTOM_LEFT)}
            pickableScreens={pickableScreens}
            onScreenChange={onThirdScreenChange}
          />
        </DateScreenInputWrapper>
        {children}
        <DetailMapLayer content={thirdScreenMap} />
      </OlMapProvider>
      <OlMapProvider
        MapTarget={MapTarget}
        redraw={redraw}
      >
        <DateScreenInputWrapper zIndex={bottomZIndex} isLeft={false} isTop={false}>
          <DateScreenInput
            buttonType={T.DateScreenButton.SPLIT_VIEW}
            screen={fourth}
            placement={getScreenPickerPosition(T.ModalPlacement.BOTTOM_RIGHT)}
            onScreenChange={onFourthScreenChange}
            pickableScreens={pickableScreens}
          />
        </DateScreenInputWrapper>
        {children}
        <DetailMapLayer content={fourthScreenMap} />
      </OlMapProvider>
    </>
  );
};
