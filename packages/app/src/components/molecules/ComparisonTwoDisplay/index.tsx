import React, { useEffect, useState, FC } from 'react';
import styled from 'styled-components';

import OlLayerGroup from '^/components/atoms/OlLayerGroup';
import { MapTargetComponent, OlMapProvider } from '^/components/atoms/OlMapProvider';
import { DateScreenInput } from '^/components/molecules/DateScreenInput';
import { DeviceWidth } from '^/constants/styles';
import OlDetailMapLayer from '^/containers/atoms/OlDetailMapLayer';
import {
  UseLastSelectedScreen, UseState, UseWindowSize, useLastSelectedScreen,
  useMapContentsOfScreens, useSortedAvailbleMapScreens, useWindowSize,
} from '^/hooks';
import * as T from '^/types';

export const DetailMapLayer: FC<{ content?: T.MapContent }> = ({ content }) => content ? (
  <OlLayerGroup>
    <OlDetailMapLayer
      content={content}
    />
  </OlLayerGroup>
) : null;

interface DateScreenInputWrapperProps {
  readonly isLeft: boolean;
}
const DateScreenInputWrapper = styled.div.attrs({
  'data-testid': 'comparisontwodisplay-screen-picker-wrapper',
})<DateScreenInputWrapperProps>({
  position: 'absolute',
  top: '35px',

  zIndex: 300,
}, ({ isLeft }) => isLeft ? ({
  right: '40px',
}) : ({
  left: '40px',
}));

export interface Props {
  readonly MapTarget: MapTargetComponent;
  readonly redraw?: number;
}

export const ComparisonTwoDisplay: FC<Props> = ({
  MapTarget,
  redraw,
  children,
}) => {
  const lastSelectedScreen: UseLastSelectedScreen = useLastSelectedScreen();
  const pickableScreens: T.Screen[] = useSortedAvailbleMapScreens();
  const [first, setFirst]: UseState<T.Screen | undefined> = useState();
  const [second, setSecond]: UseState<T.Screen | undefined> = useState();
  const [windowX]: UseWindowSize = useWindowSize();

  useEffect(() => {
    const pickableScreenIds: T.Screen['id'][] = pickableScreens.map((screen) => screen.id);
    if (lastSelectedScreen?.id !== undefined && pickableScreenIds.includes(lastSelectedScreen?.id)) {
      setFirst(lastSelectedScreen);
    }
  }, [lastSelectedScreen?.id]);

  const [firstScreenMap, secondScreenMap]: (T.MapContent | undefined)[] =
    useMapContentsOfScreens(first, second);

  const onFirstScreenChange: (screen: T.Screen) => void = (screen) => {
    setFirst(() => screen);
  };
  const onSecondScreenChange: (screen: T.Screen) => void = (screen) => {
    setSecond(() => screen);
  };

  const getScreenPickerPosition: (defaultPosition: T.ModalPlacement) => T.ModalPlacement
    = (defaultPosition) => windowX <= DeviceWidth.TABLET ? T.ModalPlacement.BOTTOM : defaultPosition;

  return (
    <>
      <OlMapProvider
        MapTarget={MapTarget}
        redraw={redraw}
      >
        <DateScreenInputWrapper isLeft={true}>
          <DateScreenInput
            buttonType={T.DateScreenButton.SPLIT_VIEW}
            screen={first}
            placement={getScreenPickerPosition(T.ModalPlacement.BOTTOM_LEFT)}
            onScreenChange={onFirstScreenChange}
            pickableScreens={pickableScreens}
          />
        </DateScreenInputWrapper>
        {children}
        <DetailMapLayer content={firstScreenMap} />
      </OlMapProvider>
      <OlMapProvider
        MapTarget={MapTarget}
        redraw={redraw}
      >
        <DateScreenInputWrapper isLeft={false}>
          <DateScreenInput
            buttonType={T.DateScreenButton.SPLIT_VIEW}
            screen={second}
            placement={getScreenPickerPosition(T.ModalPlacement.BOTTOM_RIGHT)}
            onScreenChange={onSecondScreenChange}
            pickableScreens={pickableScreens}
          />
        </DateScreenInputWrapper>
        {children}
        <DetailMapLayer content={secondScreenMap} />
      </OlMapProvider>
    </>
  );
};
