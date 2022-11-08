import * as Sentry from '@sentry/browser';
import { isSameDay } from 'date-fns';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import CloseButton from '^/assets/icons/close-new.svg';
import olWrap, { OlProps } from '^/components/atoms/OlWrap';
import { DateScreenInput } from '^/components/molecules/DateScreenInput';
import palette from '^/constants/palette';
import { OutsideMap } from '^/constants/zindex';
import {
  QueryContentWithTypeAndScreenId, UseL10n, UseLastSelectedScreen,
  UseState, typeGuardDSM, useGetContentOf, useL10n, useLastSelectedScreen, useSortedAvailbleDsmScreens,
} from '^/hooks';
import {
  ChangeCreatingVolume,
  ChangeCurrentContentTypeFromAnnotationPicker,
  CloseContentPageMapPopup,
} from '^/store/duck/Pages';
import * as T from '^/types';
import { isMobile } from '^/utilities/device';
import Text from './text';


const Popup =
  styled.div({
    position: 'absolute',

    top: '45px',
    left: '100px',
    padding: '20px',
    borderRadius: '5px',
    // eslint-disable-next-line no-magic-numbers
    backgroundColor: palette.white.alpha(0.76).toString(),
    // eslint-disable-next-line no-magic-numbers
    boxShadow: `0 0 18px 0 ${palette.black.alpha(0.5)}`,
    backdropFilter: 'blur(6px)',
    zIndex: OutsideMap.SBVC_DBVC_POPUP,

    cursor: 'default',
  });

const Close =
  styled.div({
    display: 'flex',
    justifyContent: 'flex-end',
    height: 0,
    transform: 'translate(10px, -10px)',

    cursor: 'pointer',
    '> svg': {
      transform: 'scale(1.5)',
      '> path': {
        fill: palette.black.toString(),
      },
    },
  });

const Title =
  styled.div({
    fontSize: '13px',
    fontWeight: 'bold',

    color: palette.ContentsList.title.toString(),
  });

const DateInputWrapper =
  styled.div({
    marginTop: '10px',
  });


export interface Props {
  zIndex: number;
}

export const SBVCPopup: FC<OlProps<Props>> = () => {
  const projectId: T.ContentsPageState['projectId'] = useSelector((state: T.State) => state.Pages.Contents.projectId);

  const [l10n]: UseL10n = useL10n();
  const dispatch: Dispatch = useDispatch();
  const [currentDSM, setCurrentDSM]: UseState<T.DSMContent | undefined> = useState();
  const [currentScreen, setCurrentScreen]: UseState<T.Screen | undefined> = useState();
  const getContentOf: QueryContentWithTypeAndScreenId = useGetContentOf(T.ContentsQueryParam.TYPE_AND_SCREENID);
  const pickableScreens: T.Screen[] = useSortedAvailbleDsmScreens();
  const lastSelectedScreen: UseLastSelectedScreen = useLastSelectedScreen();

  if (projectId === undefined || !lastSelectedScreen) return null;

  useEffect(() => {
    // Choose to compare automatically with the previous or the next dataset
    // based on the order of appearance of the screen.
    const previousDsmOfScreen: T.Screen | undefined = pickableScreens
      .filter((screen) =>
        screen.appearAt.getTime() < lastSelectedScreen.appearAt.getTime() &&
        !isSameDay(screen.appearAt, lastSelectedScreen.appearAt))
      .sort((a: T.Screen, b: T.Screen) => a.appearAt.getTime() - b.appearAt.getTime())
      .pop();

    if (previousDsmOfScreen !== undefined) {
      setCurrentDSM(typeGuardDSM(getContentOf(T.ContentType.DSM, previousDsmOfScreen.id)));
      setCurrentScreen(previousDsmOfScreen);

      return;
    }

    // There has to be at least one screen to compare to.
    // It could either be the previous or the next screen.
    const nextDsmOfScreen: T.Screen = (() => {
      // No need to find the next one if there's only one.
      if (pickableScreens.length === 1) {
        return pickableScreens[0];
      }

      const nextDsmByAppearAt: T.Screen | undefined = pickableScreens
        .filter((screen) =>
          screen.appearAt.getTime() > lastSelectedScreen.appearAt.getTime() &&
          !isSameDay(screen.appearAt, lastSelectedScreen.appearAt))
        .sort((a: T.Screen, b: T.Screen) => a.appearAt.getTime() - b.appearAt.getTime())
        .shift();

      if (nextDsmByAppearAt) {
        return nextDsmByAppearAt;
      }

      // Since sorting by date and pick the next one won't work,
      // this an edge case where all screens are on the same time and day.
      // In that case, just pick the next screen from the array based on the time.
      Sentry.captureMessage('Could not find the next DSM based on the sorted picked screen by date.');

      const lastScreenIndex: number = pickableScreens.findIndex((screen) => screen.appearAt.getTime() >= lastSelectedScreen.appearAt.getTime());
      if (lastScreenIndex >= 0) {
        const nextDSM: T.Screen = pickableScreens[lastScreenIndex];

        // It should not return the same DSM as the last selected screen,
        // therefore choosing the next DSM if it is the case.
        if (nextDSM.appearAt.getTime() !== lastSelectedScreen.appearAt.getTime()) {
          return nextDSM;
        }

        return pickableScreens[lastScreenIndex === pickableScreens.length - 1 ? 0 : lastScreenIndex + 1];
      }

      // All these fallback fails and it isn't clear why.
      // Send exceptions to Sentry, and return any DSM screen instead
      // so that it's still meaningful to users.
      const message: string = 'No DSM matches the last selected screen from the pickable DSM screen.';
      // eslint-disable-next-line no-console
      console.error(message);
      Sentry.setExtra('extra', {
        pickableScreens,
        lastSelectedScreen,
      });
      Sentry.captureMessage(message);

      return pickableScreens[0];
    })();

    setCurrentDSM(typeGuardDSM(getContentOf(T.ContentType.DSM, nextDsmOfScreen.id)));
    setCurrentScreen(nextDsmOfScreen);
  }, [lastSelectedScreen?.id]);

  useEffect(() => {
    if (currentDSM !== undefined) dispatch(ChangeCreatingVolume({ info: { previousDsmId: currentDSM.id } }));
  }, [currentDSM]);

  const commonExitFunc: () => void = () => {
    dispatch(ChangeCreatingVolume({}));
    dispatch(CloseContentPageMapPopup());
    dispatch(ChangeCurrentContentTypeFromAnnotationPicker({}));
  };

  const onScreenChange: (selectedScreen: T.Screen) => void = (selectedScreen) => {
    const selectedDSM: T.DSMContent | undefined = typeGuardDSM(getContentOf(T.ContentType.DSM, selectedScreen.id));
    if (selectedDSM === undefined) return;
    setCurrentDSM(selectedDSM);
    setCurrentScreen(selectedScreen);
  };

  const popup: ReactNode = (
    <Popup>
      <Close
        onClick={commonExitFunc}
      >
        <CloseButton />
      </Close>
      <Title>
        {l10n(Text.title)}
      </Title>
      <DateInputWrapper>
        <DateScreenInput
          screen={currentScreen}
          buttonType={T.DateScreenButton.SBVC_POPUP}
          placement={T.ModalPlacement.BOTTOM}
          pickableScreens={pickableScreens}
          onScreenChange={onScreenChange}
        />
      </DateInputWrapper>
    </Popup>
  );

  const draggablePopup: ReactNode = isMobile() ? (
    <>
      {popup}
    </>
  ) : (
    <Draggable>
      {popup}
    </Draggable>
  );

  return (
    <>
      {draggablePopup}
    </>
  );
};

export default olWrap(SBVCPopup);
