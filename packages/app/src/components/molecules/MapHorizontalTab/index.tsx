import React, { FC, ReactNode, memo, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import ESSContentIcon from '^/assets/icons/contents-list/ess-model.svg';
import LengthSVG from '^/assets/icons/elevation-profile/length-tool.svg';
import ElevationProfile, { Props as ElevationProfileProps } from '^/components/atoms/ElevationProfile';
import HorizontalTabToggle from '^/components/atoms/HorizontalTabToggle';
import ESSModelsList from '^/components/molecules/ESSModelsList';
import { getSidebarWidth } from '^/components/organisms/ContentsSidebar';
import palette from '^/constants/palette';
import { UseL10n, typeGuardLength, useL10n, useRole } from '^/hooks';
import { ChangeMapHorizontalTabStatus } from '^/store/duck/Pages';
import * as T from '^/types';
import { isRoleViewer } from '^/utilities/role-permission-check';

import Text from './text';

const ELEVATION_TAB_HEIGHT: number = 371.7;
const ESS_TAB_HEIGHT: number = 160;

interface HorizontalContentProps {
  sidebarTab: T.ContentPageTabType;
  isSidebarOpened?: boolean;
  isOpened?: boolean;
  fixedHeight?: number;
}

const ContentRoot = styled.div<HorizontalContentProps>({
  display: 'flex',
  justifyContent: 'flex-start',
  position: 'absolute',

  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 240, // Set zIndex of the toolbar > 200 (ContentPage), but <= 300 (the Popup backdrop)
  // eslint-disable-next-line no-magic-numbers
  backgroundColor: palette.white.alpha(0.86).toString(),
  backdropFilter: 'blur(7px)',

}, ({ sidebarTab, isSidebarOpened, isOpened, fixedHeight }) => ({
  left: getSidebarWidth(sidebarTab, !isSidebarOpened),
  width: `calc(100% - ${getSidebarWidth(sidebarTab, !isSidebarOpened)})`,
  height: isOpened ? fixedHeight ? `${fixedHeight}px` : 'auto' : 0,
}));

const HeaderContainer = styled.div({
  display: 'flex',
  position: 'absolute',
  bottom: '100%',
});

const MapHorizontalTab: FC<ElevationProfileProps> = ({ handleUpdateLengthHoverPoint }) => {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();
  const role: T.PermissionRole = useRole();

  const sidebarTab: T.ContentsPageState['sidebarTab'] = useSelector((s: T.State) => s.Pages.Contents.sidebarTab);

  const isSidebarOpened: T.ContentsPageState['showSidebar'] = useSelector((s: T.State) => s.Pages.Contents.showSidebar);

  const editingLength: T.LengthContent | undefined = useSelector((s: T.State) => {
    if (!s.Pages.Contents.editingContentId) return;

    return typeGuardLength(s.Contents.contents.byId[s.Pages.Contents.editingContentId]);
  });

  const status: T.ContentsPageState['mapHorizontalTabStatus'] = useSelector((s: T.State) => s.Pages.Contents.mapHorizontalTabStatus);

  const onClick: (newStatus: T.ContentsPageState['mapHorizontalTabStatus']) => () => void = useCallback((newStatus) => () => {
    dispatch(
      ChangeMapHorizontalTabStatus({
        status: newStatus === status ? T.MapHorizontalTabStatus.HIDDEN : newStatus,
      }),
    );
  }, [status]);

  const shouldShowElevationProfileTab: boolean = editingLength !== undefined && editingLength.config?.isElevationToggled === true;
  const shouldShowESSModelsTab: boolean = !isRoleViewer(role) && sidebarTab === T.ContentPageTabType.ESS;

  const elevationProfileHeader: ReactNode = useMemo(() => {
    if (!shouldShowElevationProfileTab) return null;

    return (
      <HorizontalTabToggle
        title={editingLength?.title ?? ''}
        icon={<LengthSVG />}
        isOpened={status === T.MapHorizontalTabStatus.ELEVATION_PROFILE}
        onClick={onClick(T.MapHorizontalTabStatus.ELEVATION_PROFILE)}
      />
    );
  }, [shouldShowElevationProfileTab, onClick]);

  const elevationProfileContent: ReactNode = useMemo(() => {
    if (!shouldShowElevationProfileTab || status !== T.MapHorizontalTabStatus.ELEVATION_PROFILE) {
      return null;
    }

    return (
      <ElevationProfile handleUpdateLengthHoverPoint={handleUpdateLengthHoverPoint} />
    );
  }, [shouldShowElevationProfileTab, status]);

  const ESSModelsHeader: ReactNode = useMemo(() => {
    if (!shouldShowESSModelsTab) return null;

    return (
      <HorizontalTabToggle
        title={l10n(Text.ESSHeader)}
        icon={<ESSContentIcon />}
        isOpened={status === T.MapHorizontalTabStatus.ESS}
        onClick={onClick(T.MapHorizontalTabStatus.ESS)}
      />
    );
  }, [shouldShowESSModelsTab, onClick]);

  const ESSContent: ReactNode = useMemo(() => {
    if (!shouldShowESSModelsTab || status !== T.MapHorizontalTabStatus.ESS) {
      return null;
    }

    return (
      <ESSModelsList />
    );
  }, [shouldShowESSModelsTab, status]);

  const fixedHeight: number = useMemo(() => {
    switch (status) {
      case T.MapHorizontalTabStatus.ELEVATION_PROFILE: {
        return ELEVATION_TAB_HEIGHT;
      }
      case T.MapHorizontalTabStatus.ESS: {
        return ESS_TAB_HEIGHT;
      }
      default: {
        return 0;
      }
    }
  }, [status]);

  if (!shouldShowElevationProfileTab && !shouldShowESSModelsTab) return null;

  return (
    <ContentRoot
      sidebarTab={sidebarTab}
      isSidebarOpened={isSidebarOpened}
      isOpened={status !== T.MapHorizontalTabStatus.HIDDEN}
      fixedHeight={fixedHeight}
    >
      <HeaderContainer>
        {ESSModelsHeader}
        {elevationProfileHeader}
      </HeaderContainer>
      {elevationProfileContent}
      {ESSContent}
    </ContentRoot>
  );
};

export default memo(MapHorizontalTab);
