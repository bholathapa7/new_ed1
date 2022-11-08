import React, { FC, ReactNode, useEffect, useRef, useState, MutableRefObject } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import ScreenChangeSVG from '^/assets/icons/content-sidebar-header/date-change.svg';
import ScreenDeleteSVG from '^/assets/icons/delete.svg';
import { ScreenPickerTab } from '^/components/atoms/ScreenPickerTab';
import WrapperHoverable from '^/components/atoms/WrapperHoverable';
import { CANCELLABLE_CLASS_NAME } from '^/components/molecules/CreatingVolumeClickEventHandler';
import { NewScreen, ScreenPicker } from '^/components/organisms/ScreenPicker';
import palette from '^/constants/palette';
import { MediaQuery, wrapperHoverableDefaultStyle } from '^/constants/styles';
import {
  QueryScreensWithDate, UseIsDefaultScreenTitle, UseL10n,
  UseLastSelectedScreen, UseState, useClickOutside, useGetAllScreensOf,
  useIsDefaultScreenTitle, useL10n, useLastSelectedScreen, usePrevProps, useRole,
} from '^/hooks';
import { OpenContentPagePopup } from '^/store/duck/Pages';
import { PatchProjectConfig } from '^/store/duck/ProjectConfig';
import { PatchScreen } from '^/store/duck/Screens';
import * as T from '^/types';
import { isMobile } from '^/utilities/device';
import { isAllowScreenTitleChange } from '^/utilities/role-permission-check';
import Text, { Tool } from './text';


const Root = styled.div({
  display: 'flex',
  width: '100%',
  backgroundColor: palette.white.toString(),
  '> div:first-of-type': {
    width: '120px !important',
  },
});

const ScreenTools = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  width: 'calc(100% - 120px)',
  borderBottom: `thin solid ${palette.Calendar.disabled.toString()}`,

  '> div:last-of-type': {
    marginLeft: '3px',
    marginRight: '20px',
  },
});

interface SvgWrapperProps {
  isSelected?: boolean;
  isDisabled?: boolean;
}

const SvgWrapper = styled.button.attrs({
  className: CANCELLABLE_CLASS_NAME,
})<SvgWrapperProps>(({ isSelected, isDisabled }) => {
  const fill =
    isDisabled ? palette.gray :
      isSelected ? 'var(--color-theme-primary)' : palette.font;

  return {
    position: 'relative',

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    width: '26px',
    height: '26px',

    cursor: 'pointer',
    borderRadius: '4px',
    backgroundColor: palette.white.toString(),
    ':hover': {
      backgroundColor: palette.CalendarScreen.hover.toString(),
      cursor: isDisabled ? 'not-allowed' : undefined,
    },
    '> svg': {
      '> g, > path': {
        fill: fill.toString(),
      },
    },
  };
});

const ChangeIconWrapper = styled.div({
  position: 'relative',
});

const ScreenPickerWrapper = styled.div({
  position: 'absolute',
  top: '-7.5px',
  left: '100%',

  zIndex: 1,

  [MediaQuery[T.Device.MOBILE_L]]: {
    left: '-179px',
    top: 26,
  },
});


export interface Props {
  viewMode: T.CalendarScreenTab;
  onTabClick(tab: T.CalendarScreenTab): void;
}

export const SidebarHeaderTab: FC<Props> = ({ viewMode, onTabClick }) => {
  const dispatch: Dispatch = useDispatch();
  const {
    Screens,
    Pages: { Contents: { projectId } },
  }: T.State = useSelector((state: T.State) => state);

  const isDefaultScreenTitle: UseIsDefaultScreenTitle = useIsDefaultScreenTitle();
  const getScreensByDate: QueryScreensWithDate = useGetAllScreensOf(T.ScreensQueryParam.DATE);

  const lastSelectedScreen: UseLastSelectedScreen = useLastSelectedScreen();

  const DEFAULT_NEW_SCREEN: NewScreen = ({
    appearAt: new Date(),
    title: lastSelectedScreen?.title !== undefined && !isDefaultScreenTitle(lastSelectedScreen.title) ?
      lastSelectedScreen.title : undefined,
  });

  const [l10n]: UseL10n = useL10n();
  const role: T.PermissionRole = useRole();
  const [currentFocusTool, setCurrentFocusTool]: UseState<Tool | undefined> = useState<Tool | undefined>(undefined);
  const prevTool: Tool | undefined = usePrevProps(currentFocusTool);
  const [newScreen, setNewScreen]: UseState<Readonly<NewScreen | undefined>> = useState<Readonly<NewScreen | undefined>>(DEFAULT_NEW_SCREEN);
  const screenPickerWrapperRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  const isOnlyOneScreenLeft: boolean = Screens.screens.length === 1;
  const disabledScreens: T.Screen[] | undefined
    = lastSelectedScreen?.appearAt !== undefined ? getScreensByDate(lastSelectedScreen.appearAt) : undefined;

  useEffect(() => {
    if (prevTool !== undefined && currentFocusTool === undefined) {
      setNewScreen(undefined);
    } else if (prevTool === undefined && currentFocusTool === Tool.SCREEN_CHANGE) {
      setNewScreen(DEFAULT_NEW_SCREEN);
    }
  }, [currentFocusTool]);

  useClickOutside({
    ref: screenPickerWrapperRef,
    callback: () => {
      if (currentFocusTool === Tool.SCREEN_CHANGE) {
        setCurrentFocusTool(undefined);
      }
    },
  });

  const handleScreenDeleteClick: () => void = () => {
    if (!isAllowScreenTitleChange(role)) {
      dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));

      return;
    }

    setCurrentFocusTool(() => undefined);

    dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.DELETE_SCREEN }));
  };

  const handleScreenChangeClick: () => void = () => {
    if (!isAllowScreenTitleChange(role)) {
      dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));

      return;
    }

    setCurrentFocusTool((prevState) => prevState === Tool.SCREEN_CHANGE ? undefined : Tool.SCREEN_CHANGE);
  };

  const handleNewScreenChange: (newScreen: NewScreen) => void = (screen) => {
    setNewScreen(screen);
  };

  const handlePickerSubmit: () => void = () => {
    if (lastSelectedScreen?.id === undefined || projectId === undefined) {
      return;
    }

    if (newScreen?.title === undefined) {
      return;
    }

    dispatch(PatchScreen({ screenId: lastSelectedScreen?.id, appearAt: newScreen.appearAt, title: newScreen.title }));
    dispatch(PatchProjectConfig({
      projectId,
      config: { lastSelectedScreenId: lastSelectedScreen.id },
    }));

    setCurrentFocusTool(undefined);
  };

  const handlePickerDismiss: () => void = () => {
    setCurrentFocusTool(undefined);
  };

  const screenPicker: ReactNode = currentFocusTool === Tool.SCREEN_CHANGE ? (
    <ScreenPickerWrapper>
      <ScreenPicker
        size={T.CalendarScreenSize.S}
        newScreen={newScreen}
        defaultViewMode={T.CalendarScreenTab.CALENDAR}
        calendarType={T.CalendarType.FROM_2010_UNTIL_TODAY}
        isEditable={true}
        isDefaultDateShown={false}
        disabledScreens={disabledScreens}
        onNewScreenChange={handleNewScreenChange}
        onSubmit={handlePickerSubmit}
        onDismiss={handlePickerDismiss}
      />
    </ScreenPickerWrapper>
  ) : undefined;

  const deleteScreenButton: ReactNode = (
    <WrapperHoverable
      title={l10n(Text.tooltip[isOnlyOneScreenLeft ? Tool.DISABLED : Tool.SCREEN_DELETE])}
      customStyle={wrapperHoverableDefaultStyle}
    >
      <SvgWrapper isDisabled={isOnlyOneScreenLeft} onClick={isOnlyOneScreenLeft ? undefined : handleScreenDeleteClick}>
        <ScreenDeleteSVG />
      </SvgWrapper>
    </WrapperHoverable>
  );

  const screenChangeButton: ReactNode = (
    <SvgWrapper onClick={handleScreenChangeClick} isSelected={currentFocusTool === Tool.SCREEN_CHANGE}>
      <ScreenChangeSVG />
    </SvgWrapper>
  );

  const screenChangeWrapper: ReactNode = isMobile() ? screenChangeButton : (
    <WrapperHoverable
      title={l10n(Text.tooltip[Tool.SCREEN_CHANGE])}
      customStyle={wrapperHoverableDefaultStyle}
    >
      {screenChangeButton}
    </WrapperHoverable>
  );

  return (
    <Root>
      <ScreenPickerTab
        isSidebarHeader={true}
        size={T.CalendarScreenSize.L}
        viewMode={viewMode}
        onTabClick={onTabClick}
      />
      <ScreenTools>
        <ChangeIconWrapper ref={screenPickerWrapperRef}>
          {screenChangeWrapper}
          {screenPicker}
        </ChangeIconWrapper>
        {deleteScreenButton}
      </ScreenTools>
    </Root>
  );
};
