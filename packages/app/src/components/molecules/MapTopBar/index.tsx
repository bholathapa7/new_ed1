import React, { Dispatch, FC, memo, ReactNode, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { CSSObject } from 'styled-components';

import ShareSvg from '^/assets/icons/top-bar/share.svg';
import HistorySvg from '^/assets/icons/top-bar/history.svg';
import DownloadSvg from '^/assets/icons/top-bar/download.svg';
import PrintSvg from '^/assets/icons/top-bar/print.svg';
import ExternalShareSvg from '^/assets/icons/top-bar/external-share.svg';
import ReportSvg from '^/assets/icons/top-bar/report.svg';
import WrapperHoverable, { Props as WrapperHoverableProps } from '^/components/atoms/WrapperHoverable';
import { TopBarScreenTitle } from '^/components/molecules/TopBarScreenTitle';
import { Notification } from '^/components/organisms/Notification';
import palette from '^/constants/palette';
import { responsiveStyle } from '^/constants/styles';
import { UseL10n, useL10n, useRole } from '^/hooks';
import { lastDSMOrMapContentSelector } from '^/hooks/useLastContent';
import { RootAction } from '^/store/duck';
import {
  ChangeIsInContentsHistoryLogTable,
  ChangeTwoDDisplayMode,
  OpenContentPagePopup,
  SetUpdateTwoDDisplayCenter,
  SetUpdateTwoDDisplayZoom,
  TogglePrintView,
} from '^/store/duck/Pages';
import * as T from '^/types';
import { isPhone } from '^/utilities/device';
import {
  isAllowAcessEventLogs,
  isAllowDownloadPopup,
  isAllowProjectShare,
  isAllowSharePopup,
} from '^/utilities/role-permission-check';
import { HasFeature, useHasFeature } from '^/utilities/withFeatureToggle';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import Text from './text';
import dsPalette from '^/constants/ds-palette';

const Root = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  width: 100%;
  height: ${responsiveStyle.topBar[T.Device.DESKTOP]?.height};

  background-color: ${palette.MapTopBar.background.toString()};
  z-index: 240;

  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const TopBarButtonWrapper = styled.div({
  display: 'flex',

  marginRight: '31px',
  marginLeft: 'auto',
});

const TooltipWrapperStyle: CSSObject = {
  width: '100%',
  height: '100%',

  position: 'relative',

};
const TooltipTargetStyle: CSSObject = {
  width: '100%',
  height: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};
const TooltipBalloonStyle: CSSObject = {
  left: '50%',
  transform: 'translate(-50%, 0)',
  bottom: '-23px',
};

const TooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: TooltipWrapperStyle,
  tooltipTargetStyle: TooltipTargetStyle,
  tooltipBalloonStyle: TooltipBalloonStyle,
};

const Divider = styled.span({
  display: 'inline-block',
  marginLeft: '11px',
  marginRight: '11px',

  marginTop: '6px',

  width: '1px',
  minWidth: '1px',
  height: '17.5px',

  backgroundColor: dsPalette.line.toString(),
});

const LeftDivider = styled.div({
  height: '100%',
  minWidth: '1px',
  width: '1px',

  position: 'absolute',
  left: 0,

  backgroundColor: palette.dropdown.dividerColor.toString(),
});

export const TopBarButton = styled.button<{ isDisabled?: boolean }>({
  position: 'relative',
  width: '30px',
  height: '30px',
  background: 'transparent',
  '& svg': {
    fill: 'var(--color-theme-primary)',
  },

  marginLeft: '4px',
  marginRight: '4px',

  borderRadius: '3px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}, ({ isDisabled }) => ({
  cursor: isDisabled ? 'default': 'pointer',
  '& svg': {
    fill: isDisabled ? palette.MapTopBar.buttonIconDisabled.toString() : dsPalette.grey130.toString(),
  },

  '&:hover': {
    background: isDisabled ? 'transparent' : dsPalette.iconHover.toString(),
  },

  '&:active': {
    '& svg': {
      fill: 'rgb(245,245,245)',
    },
    background: dsPalette.iconClick.toString(),
  },
}));

export const MapTopBar: FC = memo(() => {
  const dispatch: Dispatch<RootAction> = useDispatch();
  const hasFeature: HasFeature = useHasFeature();

  const showSidebar: boolean = useSelector((s: T.State) => s.Pages.Contents.showSidebar);
  const isTopbarShown: boolean = useSelector(
    (s: T.State) => s.Pages.Contents.isTopbarShown && s.Pages.Contents.sidebarTab !== T.ContentPageTabType.PHOTO,
  );
  const twoDDisplayMode: T.TwoDDisplayMode = useSelector((s: T.State) => s.Pages.Contents.twoDDisplayMode);
  const isInContentsEventLogTable: boolean = useSelector((s: T.State) => s.Pages.Contents.isInContentsEventLogTable);
  const isInPointCloud: boolean = useSelector((s: T.State) => s.Pages.Contents.in3DPointCloud && s.Pages.Contents.in3D);
  const isIn3D: boolean = useSelector((s: T.State) => s.Pages.Contents.in3D);

  const lastMapId: T.Content['id'] | undefined = useSelector((s: T.State) => lastDSMOrMapContentSelector(s, T.ContentType.MAP)?.id);
  const role: T.PermissionRole = useRole();
  const [l10n]: UseL10n = useL10n();

  useEffect(() => {
    if (isInContentsEventLogTable && twoDDisplayMode !== T.TwoDDisplayMode.NORMAL) {
      dispatch(ChangeTwoDDisplayMode({ twoDDisplayMode: T.TwoDDisplayMode.NORMAL }));
    }
  }, [isInContentsEventLogTable]);

  const HandleShareClick = useCallback(() => dispatch(OpenContentPagePopup({
    popup: isAllowProjectShare(role) ?
      T.ContentPagePopupType.SHARE :
      T.ContentPagePopupType.NO_PERMISSION,
  })), [role]);

  /* eslint-disable @typescript-eslint/no-confusing-void-expression */
  const handleExternalShareClick: () => void = async () => {
    if (isIn3D) return;

    await Promise.all([
      dispatch(SetUpdateTwoDDisplayCenter({ shouldUpdateTwoDDisplayCenter: true })),
      dispatch(SetUpdateTwoDDisplayZoom({ shouldUpdateTwoDDisplayZoom: true })),
    ]);
    dispatch(OpenContentPagePopup({
      popup: isAllowSharePopup(role) ?
        T.ContentPagePopupType.EXTERNAL_SHARE : T.ContentPagePopupType.NO_PERMISSION,
    }));
  };
  /* eslint-enable @typescript-eslint/no-confusing-void-expression */

  const handleDownloadClick: () => void = () => dispatch(OpenContentPagePopup({
    popup: isAllowDownloadPopup(role) ?
      T.ContentPagePopupType.DOWNLOAD :
      T.ContentPagePopupType.NO_PERMISSION,
  }));

  const handlePrintClick: () => void = () => dispatch(TogglePrintView({ contentId: lastMapId }));

  const handleHistoryClick: () => void = () => {
    if (!isAllowAcessEventLogs(role)) {
      dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));

      return;
    }

    dispatch(ChangeIsInContentsHistoryLogTable({ isInContentsEventLogTable: true }));
  };

  const HandleReportClick = useCallback(() => {
    if (isInPointCloud) return;

    dispatch(OpenContentPagePopup({
      popup: T.ContentPagePopupType.REPORT_DOWNLOAD,
    }));
  }, [isInPointCloud]);

  const share: ReactNode = (
    <WrapperHoverable
      title={l10n(Text.share)}
      customStyle={TooltipCustomStyle}
    >
      <TopBarButton
        data-ddm-track-action='map-tools'
        data-ddm-track-label='btn-invite'
        onClick={HandleShareClick}
      >
        <ShareSvg />
      </TopBarButton>
    </WrapperHoverable>
  );

  const download: ReactNode = isPhone() || !hasFeature(T.Feature.DDM) ? undefined : (
    <WrapperHoverable
      title={l10n(Text.download)}
      customStyle={TooltipCustomStyle}
    >
      <TopBarButton
        data-ddm-track-action='map-output'
        data-ddm-track-label='btn-download'
        onClick={handleDownloadClick}
      >
        <DownloadSvg />
      </TopBarButton>
    </WrapperHoverable>
  );

  const report: ReactNode = isPhone() || !hasFeature(T.Feature.DDM) ? undefined : (
    <WrapperHoverable
      title={l10n(Text.report)}
      customStyle={TooltipCustomStyle}
    >
      <TopBarButton
        data-ddm-track-action='map-output'
        data-ddm-track-label='btn-report'
        className={CANCELLABLE_CLASS_NAME}
        onClick={HandleReportClick}
        isDisabled={isInPointCloud}
      >
        <ReportSvg />
      </TopBarButton>
    </WrapperHoverable>
  );

  const print: ReactNode = isPhone() || !hasFeature(T.Feature.DDM) ? undefined : (
    <WrapperHoverable
      title={l10n(Text.print)}
      customStyle={TooltipCustomStyle}
    >
      <TopBarButton
        data-ddm-track-action='map-output'
        data-ddm-track-label='btn-print'
        className={CANCELLABLE_CLASS_NAME}
        onClick={handlePrintClick}
      >
        <PrintSvg />
      </TopBarButton>
    </WrapperHoverable>
  );

  const history: ReactNode = isPhone() ? undefined : (
    <WrapperHoverable
      title={l10n(Text.contentsHistory)}
      customStyle={TooltipCustomStyle}
    >
      <TopBarButton
        data-ddm-track-action='map-tools'
        data-ddm-track-label='btn-history'
        className={CANCELLABLE_CLASS_NAME}
        onClick={handleHistoryClick}
      >
        <HistorySvg />
      </TopBarButton>
    </WrapperHoverable>
  );

  return isTopbarShown ? (
    <Root>
      {showSidebar ? <LeftDivider /> : undefined}
      <TopBarScreenTitle />
      <TopBarButtonWrapper>
        {download}
        {print}
        {report}
        <WrapperHoverable
          title={l10n(Text.externalShare)}
          customStyle={TooltipCustomStyle}
        >
          <TopBarButton
            data-ddm-track-action='map-output'
            data-ddm-track-label='btn-share'
            className={CANCELLABLE_CLASS_NAME}
            onClick={handleExternalShareClick}
            isDisabled={isIn3D}
          >
            <ExternalShareSvg />
          </TopBarButton>
        </WrapperHoverable>
        {share}
        <Divider />
        {history}
        <Notification />
      </TopBarButtonWrapper>
    </Root>
  ) : null;
});
