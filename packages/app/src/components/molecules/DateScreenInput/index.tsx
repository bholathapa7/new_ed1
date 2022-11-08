import React, { useMemo, useRef, useState, FC, MutableRefObject, ReactNode } from 'react';
import styled, { CSSObject } from 'styled-components';

import BreakLineText from '^/components/atoms/BreakLineText';
import { DateScreenButton, getRootStyleByType } from '^/components/atoms/DateScreenButton';
import { NewScreen, ScreenPicker } from '^/components/organisms/ScreenPicker';
import palette from '^/constants/palette';
import { UseL10n, UseState, useClickOutside, useL10n } from '^/hooks';
import * as T from '^/types';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { TEMP_SCREEN_ID } from '^/utilities/screen-util';
import Text from './text';

const calendarPositionMap: {
  [positionKey in T.ModalPlacement]: Partial<{
    [key in 'left' | 'right' | 'bottom' | 'top']: string | number;
  }>
} = {
  [T.ModalPlacement.TOP_LEFT]: {
    right: 'calc(100% + 7px)',
    bottom: 0,
  },
  [T.ModalPlacement.TOP_RIGHT]: {
    left: 'calc(100% + 7px)',
    bottom: 0,
  },
  [T.ModalPlacement.MIDDLE_RIGHT]: {
    left: 'calc(100% + 7px)',
    top: '-76px',
  },
  [T.ModalPlacement.BOTTOM_LEFT]: {
    right: 'calc(100% + 7px)',
    top: 0,
  },
  [T.ModalPlacement.BOTTOM_RIGHT]: {
    left: 'calc(100% + 7px)',
    top: 0,
  },
  [T.ModalPlacement.TOP]: {
    left: '0px',
    bottom: 'calc(100% + 7px)',
  },
  [T.ModalPlacement.BOTTOM]: {
    left: '0px',
    top: 'calc(100% + 7px)',
  },
};

const getScreenPickerSize: (buttonType: T.DateScreenButton) => T.CalendarScreenSize = (buttonType) => {
  switch (buttonType) {
    case T.DateScreenButton.DOWNLOAD:
    case T.DateScreenButton.MAP_CONTENTS_UPLOAD:
      return T.CalendarScreenSize.M;
    case T.DateScreenButton.SPLIT_VIEW:
    case T.DateScreenButton.SBVC:
    case T.DateScreenButton.SBVC_POPUP:
      return T.CalendarScreenSize.S;
    default:
      exhaustiveCheck(buttonType);
  }
};


type StyleElementKey = 'ScreenPickerWrapper';
type StyleBySize = { [K in T.CalendarScreenSize]: CSSObject };
type StylesBySize = { [K in StyleElementKey]: StyleBySize };

const stylesBySize: StylesBySize = {
  ScreenPickerWrapper: {
    [T.CalendarScreenSize.S]: {
      width: '200px',
    },
    [T.CalendarScreenSize.M]: {
      width: '254px',
    },
    [T.CalendarScreenSize.L]: {
      width: '254px',
    },
  },
};

const Root = styled.div<{ hasError: boolean; buttonType: T.DateScreenButton }>(({ buttonType, hasError }) => ({
  position: 'relative',
  width: getRootStyleByType(buttonType, hasError).width,
  display: 'flex',
}));

const Wrapper = styled.div<{ placement?: T.ModalPlacement }>({
  position: 'absolute',
  zIndex: 20,
}, ({ placement }) => placement !== undefined ? {
  ...calendarPositionMap[placement],
} : {
  left: '190px',
  right: undefined,
  top: 0,
  bottom: undefined,
});

const ScreenPickerWrapper = styled.div<{ size: T.CalendarScreenSize }>(({ size }) => ({
  ...stylesBySize.ScreenPickerWrapper[size],
}));

const Error = styled.p({
  marginTop: 7,

  fontSize: '12px',
  color: palette.UploadPopup.error.toString(),
  lineHeight: 1.35,
});


export interface Props {
  readonly buttonType: T.DateScreenButton;
  readonly screen?: T.Screen;
  readonly placement?: T.ModalPlacement;
  readonly pickableScreens?: T.Screen[];
  readonly hasError?: boolean;
  onScreenChange?(screen: T.Screen): void;
  onError?(hasError: boolean): void;
}

export const DateScreenInput: FC<Props> = ({
  buttonType, screen, placement, pickableScreens,
  onScreenChange, onError,

  hasError = false,
}) => {
  const wrapperRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  const [l10n]: UseL10n = useL10n();

  const [isScreenPickerOpened, setIsScreenPickerOpened]: UseState<boolean> = useState(false);
  const [newScreen, setNewScreen]: UseState<Readonly<NewScreen | undefined>> = useState();

  const size: T.CalendarScreenSize = getScreenPickerSize(buttonType);

  useClickOutside({
    ref: wrapperRef,
    callback: () => {
      if (!hasError) {
        setIsScreenPickerOpened(false);
      }
    },
  });
  const handleButtonClick: () => void = () => {
    setIsScreenPickerOpened((prevState) => !prevState);
  };

  const handleScreenChange: (selectedScreen: T.Screen) => void = (selectedScreen) => {
    onScreenChange?.(selectedScreen);
    setNewScreen(undefined);
  };

  const handleNewScreenChange: (newScreen: NewScreen) => void = (selectedNewScreen) => {
    setNewScreen(selectedNewScreen);

    if (selectedNewScreen?.title !== undefined) {
      onScreenChange?.({
        id: TEMP_SCREEN_ID,
        appearAt: selectedNewScreen.appearAt,
        contentIds: [],
        title: selectedNewScreen.title,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  };

  const handlePickerClose: () => void = () => {
    setIsScreenPickerOpened(false);
  };

  const screenPicker: ReactNode = isScreenPickerOpened ? (
    <Wrapper placement={placement}>
      <ScreenPickerWrapper size={size}>
        <ScreenPicker
          isEditable={buttonType === T.DateScreenButton.MAP_CONTENTS_UPLOAD}
          pickableScreens={pickableScreens}
          defaultViewMode={buttonType === T.DateScreenButton.MAP_CONTENTS_UPLOAD ? T.CalendarScreenTab.CALENDAR : T.CalendarScreenTab.LIST}
          calendarType={buttonType === T.DateScreenButton.MAP_CONTENTS_UPLOAD ? T.CalendarType.FROM_2016_UNTIL_PLUS_4 : T.CalendarType.SELECTED_DATE}
          currentScreenId={screen?.id}
          newScreen={newScreen}
          size={size}
          onChange={handleScreenChange}
          onNewScreenChange={handleNewScreenChange}
          onClose={handlePickerClose}
          onError={onError}
        />
      </ScreenPickerWrapper>
    </Wrapper>
  ) : undefined;

  const errorText: ReactNode = useMemo(() => hasError ? (
    <Error>
      <BreakLineText>{l10n(Text.error)}</BreakLineText>
    </Error>
  ) : undefined, [hasError, l10n]);

  return (
    <>
      <Root ref={wrapperRef} hasError={hasError} buttonType={buttonType}>
        <DateScreenButton
          hasError={hasError}
          type={buttonType}
          screen={screen}
          isClicked={isScreenPickerOpened}
          onClick={handleButtonClick}
        />
        {screenPicker}
      </Root>
      {errorText}
    </>
  );
};
