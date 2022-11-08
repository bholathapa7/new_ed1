import { uniqBy as _uniqBy } from 'lodash-es';
import React, { FC, ReactNode, memo, useEffect, useState } from 'react';
import isDeepEqual from 'react-fast-compare';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import BoldArrowSVG from '^/assets/icons/annotation/arrow.svg';
import ArrowSVG from '^/assets/icons/content-sidebar-header/arrow.svg';
import CalendarSVG from '^/assets/icons/content-sidebar-header/calendar.svg';
import { ScreenPicker } from '^/components/organisms/ScreenPicker';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { MediaQuery, responsiveStyle } from '^/constants/styles';
import { UseL10n, UseLastSelectedScreen, UseState, useL10n, useLastSelectedScreen, usePrevProps } from '^/hooks';
import { PatchContent, SetOutdatedVolumes } from '^/store/duck/Contents';
import { ChangeCurrentContentTypeFromAnnotationPicker, ChangeEditingContent, SetPreventAutoSelect } from '^/store/duck/Pages/Content';
import { PatchProjectConfig } from '^/store/duck/ProjectConfig';
import * as T from '^/types';
import { isPinnable, isContentPinned } from '^/utilities/content-util';
import { ApplyOptionIfKorean, GetCommonFormat, formatWithOffset } from '^/utilities/date-format';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import { Fallback } from './fallback';

export const twoDToThreeDToggleButtonId: string = '2d-3d-toggle-button';

export interface Props {
  readonly projectTitle: string;
  onLogoClick(): void;
}

export const Root = styled.div<{ isVisible: boolean }>(({ isVisible }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1,
  width: '100%',
  height: isVisible ? '' : responsiveStyle.topBar[T.Device.DESKTOP]?.height,
  borderBottom: `1px solid ${palette.MapTopBar.divider.toString()}`,
  backgroundColor: palette.white.string(),
  color: dsPalette.title.toString(),
}));
Root.displayName = 'ContentsSidebarHeaderRoot';

const DISABLED_ARROW_ALPHA: number = 0.2;

export const ArrowWrapper = styled.div<{ isRight?: boolean; isDisabled: boolean }>(({ isDisabled, isRight }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  marginLeft: '14px',
  marginRight: '17px',
  opacity: isDisabled ? DISABLED_ARROW_ALPHA : undefined,
  ':hover': isDisabled ? undefined : {
    cursor: 'pointer',
    borderRadius: '4px',
    backgroundColor: palette.ContentsList.itemBackgroundGray.toString(),
  },
  '> svg': isRight ? {
    transform: 'rotate(180deg)',
  } : undefined,
}));

export const DateTitleWrapper = styled.div<{ isVisible: boolean }>(({ isVisible }) => ({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  width: '170px',
  height: '32px',
  cursor: 'pointer',
  '> span': {
    display: 'flex',
    paddingLeft: '10px',
    paddingRight: '3.5px',
    fontSize: '15px',
    [MediaQuery[T.Device.MOBILE_L]]: {
      fontSize: '15px',
    },
    [MediaQuery[T.Device.MOBILE_S]]: {
      fontSize: '14px',
    },
    whiteSpace: 'nowrap',
    fontWeight: 700,
    letterSpacing: '-0.3x/8px',
  },
  '> svg': {
    '> g': {
      fill: isVisible ? 'var(--color-theme-primary)' : '',
    },
    position: 'absolute',
    right: 0,
    paddingLeft: '3.5px',
    paddingRight: '10px',
  },
  ':hover': {
    borderRadius: '3px',
    backgroundColor: palette.ContentsList.itemBackgroundGray.toString(),
  },
}));

export const CalendarTextSection = styled.div({
  display: 'flex',
  height: '50px',

  alignItems: 'center',
  justifyContent: 'space-between',
});
CalendarTextSection.displayName = 'CalendarTextSection';

const CalendarSection = styled.div<{ isVisible: boolean; isExtraHeightNeeded: boolean }>({
  display: 'none',
}, ({ isVisible, isExtraHeightNeeded }) => isVisible ? {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: isExtraHeightNeeded ? '600px' : '450px',
} : {});
CalendarSection.displayName = 'CalendarSection';

const CalendarWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
});
CalendarWrapper.displayName = 'CalendarWrapper';

const HideCalendarButton = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '40px',
  height: '19px',
  margin: '19px 0px',
  borderRadius: '4px',
  backgroundColor: palette.ContentsList.itemBackgroundGray.toString(),
  ':hover': {
    cursor: 'pointer',
    backgroundColor: palette.ContentsList.hoverGray.toString(),
  },
  '> svg': {
    transform: 'scale(2)',
  },
});


const EXTRA_HEIGHT_ROW_COUNT: number = 12;

const getIsExtraHeightNeeded: (screenType: T.CalendarScreenTab, screenCount: number) => boolean
  = (screenType, screenCount) => screenType === T.CalendarScreenTab.LIST ? screenCount > EXTRA_HEIGHT_ROW_COUNT : false;

const ContentsSidebarHeader: FC = () => {
  const dispatch: Dispatch = useDispatch();
  const {
    Contents,
    Contents: { contents, outdatedVolumeIds },
    Pages: {
      Contents: { projectId, editingContentId, isPreventAutoSelect },
    },
  }: T.State = useSelector((state: T.State) => state);
  const screenIds: T.Screen['id'][] = useSelector((s: T.State) => s.Screens.screens.map(({ id }) => id), isDeepEqual);
  const enabledDatesLength: number =
    useSelector((s: T.State) => {
      const uniqueAppearAts: string[] = [...new Set(...s.Screens.screens.map(({ appearAt }) => appearAt.toString()))];

      return uniqueAppearAts.length;
    });
  const [, lang]: UseL10n = useL10n();

  const lastSelectedScreen: UseLastSelectedScreen = useLastSelectedScreen();
  const prevLastSelectedScreenDate: T.Screen['appearAt'] | undefined = usePrevProps(lastSelectedScreen?.appearAt);

  const screenListByDateLength: number = screenIds.length + enabledDatesLength;

  const [isCalendarVisible, setIsCalendarVisible]: UseState<boolean> = useState(false);
  const [isExtraHeightNeeded, setIsExtraHeightNeeded]: UseState<boolean> = useState(
    getIsExtraHeightNeeded(T.CalendarScreenTab.LIST, screenListByDateLength),
  );
  const [currentScreenIdx, setCurrentScreenIdx]: UseState<number> = useState(screenIds.findIndex((id) => id === lastSelectedScreen?.id));

  const pinnedVolumeIdsOnCurrentDate: Array<T.VolumeContent['id']> = getPinnedVolumeIdsOnCurrentDate();

  useEffect(() => {
    if (isProjectEnterOrLeave()) return;
    setCurrentScreenIdx(screenIds.findIndex((id) => id === lastSelectedScreen?.id));
    if (isPinnedContentsOpened()) {
      closePinnedContents();
      turnOffVolumeVisualization();
    }
    if (shouldOutdatedVolumesBeSet()) dispatch(SetOutdatedVolumes({ outdatedVolumeIds: pinnedVolumeIdsOnCurrentDate }));
  }, [lastSelectedScreen?.id]);

  if (projectId === undefined || !lastSelectedScreen) return null;

  function shouldOutdatedVolumesBeSet(): boolean {
    return !isDeepEqual(pinnedVolumeIdsOnCurrentDate, outdatedVolumeIds);
  }

  function getPinnedVolumeIdsOnCurrentDate(): Array<T.VolumeContent['id']> {
    return Contents.contents.allIds
      .map((id) => Contents.contents.byId[id])
      .filter((content) => content.type === T.ContentType.VOLUME && content.appearAt === undefined)
      .map((v) => v.id);
  }

  function isProjectEnterOrLeave(): boolean {
    const isProjectEnter: boolean = prevLastSelectedScreenDate === undefined && lastSelectedScreen?.appearAt !== undefined;
    const isProjectLeave: boolean = lastSelectedScreen?.appearAt === undefined;

    return isProjectEnter || isProjectLeave;
  }

  function isPinnedContentsOpened(): boolean {
    return editingContentId !== undefined
      && isContentPinned(contents.byId[editingContentId])
      && isPinnable(contents.byId[editingContentId]?.category);
  }

  function closePinnedContents(): void {
    dispatch(ChangeEditingContent({}));
  }

  function turnOffVolumeVisualization(): void {
    for (const volume of pinnedVolumeIdsOnCurrentDate.map((id) => contents.byId[id]) as Array<T.VolumeContent>) {
      if (!volume.config?.dsm?.isOn) return;
      dispatch(PatchContent({
        content: {
          id: volume.id,
          config: {
            dsm: {
              ...volume.config.dsm,
              isOn: false,
            },
          },
        },
      }));
    }
  }

  const handleCalendarClick: () => void = () => setIsCalendarVisible(!isCalendarVisible);

  const setLastSelectedScreenId: (screenId: T.Screen['id']) => void = (screenId) => {
    dispatch(PatchProjectConfig({
      projectId,
      config: {
        lastSelectedScreenId: screenId,
      },
    }));
  };

  const handleCurrentScreenChange: (screen: T.Screen) => void = (screen) => {
    setLastSelectedScreenId(screen.id);
  };

  const handleViewmodeChange: (viewMode: T.CalendarScreenTab) => void = (viewMode) => {
    setIsExtraHeightNeeded(getIsExtraHeightNeeded(viewMode, screenListByDateLength));
  };

  const commonFuncOnDateChange: () => void = () => {
    if (isPreventAutoSelect) dispatch(SetPreventAutoSelect({ value: false }));
    dispatch(ChangeCurrentContentTypeFromAnnotationPicker({}));
  };

  const handleNextScreenClick: () => void = () => {
    commonFuncOnDateChange();
    const nextScreenId: T.Screen['id'] | undefined = screenIds[currentScreenIdx - 1];
    if (nextScreenId === undefined) return;

    setCurrentScreenIdx((prev) => prev + 1);
    setLastSelectedScreenId(nextScreenId);
  };
  const handlePrevScreenClick: () => void = () => {
    commonFuncOnDateChange();
    const prevScreenId: T.Screen['id'] | undefined = screenIds[currentScreenIdx + 1];
    if (prevScreenId === undefined) return;

    setCurrentScreenIdx((prev) => prev - 1);
    setLastSelectedScreenId(prevScreenId);
  };
  const YYYYMMDD: string = formatWithOffset(
    0,
    lastSelectedScreen.appearAt,
    GetCommonFormat({ lang, hasDay: true }),
    ApplyOptionIfKorean(lang),
  );

  const isLeftDisabled: boolean = screenIds[currentScreenIdx + 1] === undefined;
  const isRightDisabled: boolean = screenIds[currentScreenIdx - 1] === undefined;

  const [leftArrow, rightArrow]: Array<ReactNode> = Array(2).fill(undefined).map((_, index) => {
    const isRight: boolean = index === 1;

    return (
      <ArrowWrapper
        key={index}
        className={CANCELLABLE_CLASS_NAME}
        isDisabled={isRight ? isRightDisabled : isLeftDisabled}
        isRight={isRight}
        onClick={isRight ? handleNextScreenClick : handlePrevScreenClick}
      >
        <ArrowSVG />
      </ArrowWrapper>
    );
  });

  return (
    <Root isVisible={isCalendarVisible}>
      <CalendarTextSection>
        {leftArrow}
        <DateTitleWrapper isVisible={isCalendarVisible} onClick={handleCalendarClick}>
          <span>
            {YYYYMMDD}
          </span>
          <CalendarSVG />
        </DateTitleWrapper>
        {rightArrow}
      </CalendarTextSection>
      <CalendarSection isVisible={isCalendarVisible} isExtraHeightNeeded={isExtraHeightNeeded}>
        <ScreenPicker
          size={T.CalendarScreenSize.L}
          defaultViewMode={T.CalendarScreenTab.LIST}
          currentScreenId={lastSelectedScreen.id}
          onChange={handleCurrentScreenChange}
          onViewmodeChange={handleViewmodeChange}
        />
        <HideCalendarButton onClick={handleCalendarClick}>
          <BoldArrowSVG />
        </HideCalendarButton>
      </CalendarSection>
    </Root>
  );
};
export default memo(withErrorBoundary(ContentsSidebarHeader)(Fallback));
