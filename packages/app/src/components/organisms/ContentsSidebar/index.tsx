import React, { FC, ReactNode, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled, { CSSObject } from 'styled-components';

import ArrowSvg from '^/assets/icons/contents-list/arrow.svg';
import ContentsSidebarHeader from '^/components/molecules/ContentsSidebarHeader';
import { CANCELLABLE_CLASS_NAME } from '^/components/molecules/CreatingVolumeClickEventHandler';
import MapContentsList from '^/components/organisms/MapContentsList';
import SourcePhotoUpload from '^/components/organisms/SourcePhotoUpload';
import palette from '^/constants/palette';
import { MediaQuery, responsiveStyle } from '^/constants/styles';
import ContentsTabbar from '^/containers/molecules/ContentsTabbar';
import { ErrorText, UseToast, defaultToastErrorOption, useToast } from '^/hooks';
import { ChangeSidebarStatus } from '^/store/duck/Pages';
import { ChangeIsGroupAlreadyDeleted, ChangeIsCreatingContentOnDeletedGroup } from '^/store/duck/Groups';
import * as T from '^/types';
import { getUserAgent } from '^/utilities/userAgent';
import ESSContentsList from '../ESSContentsList';
import MeasurementContentsList from '../MeasurementContentsList';
import OverlayContentsList from '../OverlayContentsList';
import Text from './text';

export const SMALL_SIDEBAR_WIDTH: string = '60px';


export const getSidebarWidth: (sidebarTab: T.ContentPageTabType, isSidebarOpened: boolean) => CSSObject['width'] = (
  sidebarTab, isSidebarOpened,
) => {
  if (isSidebarOpened) {
    return '0px';
  }

  return sidebarTab === T.ContentPageTabType.PHOTO ? SMALL_SIDEBAR_WIDTH : responsiveStyle.sideBar[T.Device.DESKTOP]?.width;
};
interface SidebarProps {
  sidebarTab: T.ContentPageTabType;
  isSidebarOpened: boolean;
}

const Root = styled.div<SidebarProps>(({ sidebarTab, isSidebarOpened }) => ({
  position: 'relative',
  top: 0,
  bottom: 0,
  left: `-${getSidebarWidth(sidebarTab, isSidebarOpened)}`,
  zIndex: 250, // Set zIndex of the sidebar > 200 (ContentPage), but <= 300 (the Popup backdrop)

  display: 'flex',
  flexDirection: 'column',

  width: sidebarTab === T.ContentPageTabType.PHOTO ? SMALL_SIDEBAR_WIDTH : responsiveStyle.sideBar[T.Device.DESKTOP]?.width,
  height: '100%',
  [MediaQuery[T.Device.MOBILE_L]]: {
    width: sidebarTab === T.ContentPageTabType.PHOTO ? SMALL_SIDEBAR_WIDTH : responsiveStyle.sideBar[T.Device.MOBILE_L]?.width,
    left: isSidebarOpened ? '0' : `-${responsiveStyle.sideBar[T.Device.MOBILE_L]?.width}`,
  },
  [MediaQuery[T.Device.MOBILE_S]]: {
    width: sidebarTab === T.ContentPageTabType.PHOTO ? SMALL_SIDEBAR_WIDTH : responsiveStyle.sideBar[T.Device.MOBILE_S]?.width,
    left: isSidebarOpened ? '0' : `-${responsiveStyle.sideBar[T.Device.MOBILE_S]?.width}`,
  },

  backgroundColor: palette.SideBar.ContentslistBackground.toString(),
}));
Root.displayName = 'SidebarRoot';

const SidebarBody = styled.div<{isSidebarOpened: boolean}>(({ isSidebarOpened }) => ({
  display: isSidebarOpened ? 'flex' : 'none',
  flexGrow: 1,
  width: '100%',
}));

const TabbarWrapper = styled.div({
  flexShrink: 0,
  width: responsiveStyle.tabBar[T.Device.DESKTOP]?.width,
});

const TabBody = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  overflowX: 'hidden',
});

const ContentsListWrapper = styled.div<{ isCrossBrowserSolution?: boolean }>(({ isCrossBrowserSolution }) => ({
  display: 'flex',
  flexGrow: 1,
  flexShrink: 0,
  flexBasis: 0,
  overflowY: isCrossBrowserSolution ? undefined : 'hidden',
}));

const ContentListWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  width: responsiveStyle.contentList[T.Device.DESKTOP]?.width,
  [MediaQuery[T.Device.MOBILE_L]]: {
    width: responsiveStyle.contentList[T.Device.MOBILE_L]?.width,
  },
  [MediaQuery[T.Device.MOBILE_S]]: {
    width: responsiveStyle.contentList[T.Device.MOBILE_S]?.width,
  },
});

interface ToggleButtonProps {
  isSidebarOpened: boolean;
  isVisible: boolean;
}

const ToggleButton = styled.button<ToggleButtonProps>(({
  isVisible,
  isSidebarOpened,
}) => ({
  display: isVisible ? 'block' : 'none',
  position: 'absolute',
  top: '50%',
  left: '100%',
  transform: 'translateY(-50%)',
  overflow: 'hidden',

  width: '25px',
  height: '38px',

  borderTopRightRadius: '8px',
  borderBottomRightRadius: '8px',
  // eslint-disable-next-line no-magic-numbers
  backgroundColor: 'var(--color-theme-primary-lighter)',
  backdropFilter: 'blur(4px)',

  fontSize: '13px',
  lineHeight: '75px',
  textAlign: 'center',
  color: palette.textLight.toString(),

  cursor: 'pointer',

  '> svg': {
    transform: `rotate(${isSidebarOpened ? '90' : '-90'}deg) translate(${isSidebarOpened ? '-19px, 1px' : '19px, -1px' })`,
    ' > path': {
      fill: palette.white.toString(),
    },
  },
}));
ToggleButton.displayName = 'SidebarToggleButton';

/**
 * Component for sidebar of contents page
 */
const ContentsSidebar: FC = () => {
  const dispatch: Dispatch = useDispatch();
  const toastify: UseToast = useToast();

  const userAgent: T.UserAgent = getUserAgent();

  const sidebarTab: T.ContentPageTabType = useSelector((state: T.State) => state.Pages.Contents.sidebarTab);
  const isSidebarOpened: boolean = useSelector((state: T.State) => state.Pages.Contents.showSidebar);
  const isInSourcePhotoUpload: boolean = useSelector((state: T.State) => state.Pages.Contents.isInSourcePhotoUpload);
  const isToggleButtonVisible: boolean = useMemo(() => (
    sidebarTab !== T.ContentPageTabType.PHOTO && !isInSourcePhotoUpload
  ), [sidebarTab, isInSourcePhotoUpload]);
  const isGroupAlreadyDeleted: boolean = useSelector((state: T.State) => Boolean(state.Groups.isGroupAlreadyDeleted));
  const isCreatingContentOnDeletedGroup: boolean = useSelector((state: T.State) => Boolean(state.Groups.isCreatingContentOnDeletedGroup));

  useEffect(() => {
    if (isCreatingContentOnDeletedGroup) {
      toastify({
        type: T.Toast.ERROR,
        content: {
          title: Text.MissingContentDetected.title,
          description: Text.MissingContentDetected.description,
        },
        option: defaultToastErrorOption,
      });
      dispatch(ChangeIsCreatingContentOnDeletedGroup({ isCreatingContentOnDeletedGroup: false }));
    }
  }, [isCreatingContentOnDeletedGroup]);

  useEffect(() => {
    if (isGroupAlreadyDeleted) {
      toastify({
        type: T.Toast.ERROR,
        content: {
          title: ErrorText.retryDeleteGroup.title,
          description: ErrorText.retryDeleteGroup.description,
        },
        option: defaultToastErrorOption,
      });
      dispatch(ChangeIsGroupAlreadyDeleted({ isGroupAlreadyDeleted: false }));
    }
  }, [isGroupAlreadyDeleted]);

  const contentsList: ReactNode = useMemo(() => {
    switch (sidebarTab) {
      case T.ContentPageTabType.MEASUREMENT:
        return (<MeasurementContentsList />);
      case T.ContentPageTabType.OVERLAY:
        return (<OverlayContentsList />);
      case T.ContentPageTabType.MAP:
        return (<MapContentsList />);
      case T.ContentPageTabType.ESS:
        return (<ESSContentsList />);
      case T.ContentPageTabType.PHOTO:
        return null;
      default:
        return (<MapContentsList />);
    }
  }, [sidebarTab]);

  const tabBar: ReactNode = useMemo(() => (
    <TabbarWrapper>
      <ContentsTabbar />
    </TabbarWrapper>
  ), []);

  const contentsListWithHeader: ReactNode = useMemo(() => (
    <ContentListWrapper>
      <ContentsSidebarHeader />
      <TabBody>
        <ContentsListWrapper isCrossBrowserSolution={userAgent === T.UserAgent.SAFARI}>
          {contentsList}
        </ContentsListWrapper>
      </TabBody>
    </ContentListWrapper>
  ), [contentsList, userAgent]);

  const sidebarWrapper: ReactNode = useMemo(() => {
    if (isInSourcePhotoUpload) {
      return (
        <ContentsListWrapper>
          <SourcePhotoUpload />
        </ContentsListWrapper>
      );
    }

    if (sidebarTab === T.ContentPageTabType.PHOTO) {
      return <>{tabBar}</>;
    }

    return (
      <>
        {tabBar}
        {contentsListWithHeader}
      </>
    );
  }, [contentsListWithHeader, sidebarTab, isInSourcePhotoUpload, tabBar]);

  const handleToggleClick: () => void = () => dispatch(ChangeSidebarStatus({ open: !isSidebarOpened }));

  return (
    <Root data-testid='sidebar-wrapper' sidebarTab={sidebarTab} isSidebarOpened={isSidebarOpened}>
      <SidebarBody isSidebarOpened={isSidebarOpened}>
        {sidebarWrapper}
      </SidebarBody>
      <ToggleButton
        data-testid='sidebar-toggle-button'
        className={CANCELLABLE_CLASS_NAME}
        isSidebarOpened={isSidebarOpened}
        onClick={handleToggleClick}
        isVisible={isToggleButtonVisible}
      >
        <ArrowSvg />
      </ToggleButton>
    </Root>
  );
};

export default ContentsSidebar;
