import { autobind } from 'core-decorators';
import _ from 'lodash-es';
import React, { Component, ReactNode, Suspense, lazy } from 'react';
import styled from 'styled-components';

import InvalidPageDisplay from '^/components/atoms/InvalidPageDisplay';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import { RootBehavior } from '^/components/cesium/CesiumBehaviors/root';
import { CesiumContextProps, withCesiumViewer } from '^/components/cesium/CesiumContext';
import { CesiumRoot } from '^/components/cesium/CesiumRoot';
import LoadingScreen from '^/components/molecules/LoadingScreen';
import MapHorizontalTab from '^/components/molecules/MapHorizontalTab';
import { MapTopBar } from '^/components/molecules/MapTopBar';
import PhotoList from '^/components/molecules/PhotoList';
import { PhotoTopBar } from '^/components/molecules/PhotoTopBar';
import PhotoViewer from '^/components/molecules/PhotoViewer';
import ContentsEventLogTable from '^/components/organisms/ContentsEventLogTable';
import ContentSidebar, { getSidebarWidth } from '^/components/organisms/ContentsSidebar';
import MapOverlay from '^/components/organisms/MapOverlay';
import { TwoDDisplay } from '^/components/organisms/TwoDDisplay';
import palette from '^/constants/palette';
import { MediaQuery, responsiveStyle } from '^/constants/styles';
import RawBlueprintTopbar from '^/containers/molecules/BlueprintTopbar';
import CreatingVolumeClickEventHandler from '^/containers/molecules/CreatingVolumeClickEventHandler';
import PointEditTutorialPanel from '^/containers/molecules/PointEditTutorialPanel';
import RawPrintTopbar from '^/containers/molecules/PrintTopbar';
import { AuthHeader } from '^/store/duck/API';
import * as T from '^/types';
import { isMobile } from '^/utilities/device';
import { l10n } from '^/utilities/l10n';
import minDelayPromise from '^/utilities/min-delay-promise';
import selectPopup from './selectPopup';

import Text from './text';

const minDelayForThreeDDisplay: number = 1500;


const ThreeDDisplay = lazy(async () =>
  /* webpackChunkName: "ThreeDDisplay" */
  minDelayPromise(import('^/containers/organisms/ThreeDDisplay'), minDelayForThreeDDisplay)
);


const MapOverlayRoot = styled.div<{ isSidebarOpened: boolean }>(({ isSidebarOpened }) => ({
  position: 'absolute',
  right: 0,
  left: isSidebarOpened ? responsiveStyle.sideBar[T.Device.DESKTOP]?.width : '0px',
  width: isSidebarOpened ? `calc(100% - ${responsiveStyle.sideBar[T.Device.DESKTOP]?.width})` : '100%',
  height: '100%',
  [MediaQuery[T.Device.MOBILE_L]]: {
    display: isSidebarOpened ? 'none' : '',
  },
}));

interface SideBarProps {
  sidebarTab: T.ContentPageTabType;
  isSidebarOpened: boolean;
}

const Root = styled.div<SideBarProps>(({ sidebarTab, isSidebarOpened }) => ({
  width: '100%',
  height: '100%',

  overflow: 'hidden',

  display: 'grid',
  gridTemplateColumns: `${getSidebarWidth(sidebarTab, !isSidebarOpened)} calc(100% - ${getSidebarWidth(sidebarTab, !isSidebarOpened)})`,
}));

const BlueprintTopbar = styled(RawBlueprintTopbar)({
  position: 'absolute',
  left: 0,
  top: 0,
  zIndex: 300,
});

const PrintTopbar = styled(RawPrintTopbar)({
  position: 'absolute',
  right: 0,
  top: 0,
  zIndex: 300,
});

const DisplayWrapper = styled.div<{
  sidebarTab: T.ContentPageTabType;
  isSidebarOpened: boolean;
  isTopbarOpened: boolean;
}>(({ isTopbarOpened }) => ({
  position: 'absolute',
  top: isTopbarOpened ? responsiveStyle.topBar[T.Device.DESKTOP]?.height : '0px',
  height: isTopbarOpened ? `calc(100% - ${responsiveStyle.topBar[T.Device.DESKTOP]?.height})` : '100%',
}), ({ sidebarTab, isSidebarOpened }) => ({
  left: getSidebarWidth(sidebarTab, !isSidebarOpened),
  width: `calc(100% - ${getSidebarWidth(sidebarTab, !isSidebarOpened)})`,
  [MediaQuery[T.Device.MOBILE_L]]: {
    left: 0,
    width: '100%',
  },
}));

const PointcloudMobileMessageViewer = styled.div({
  background: palette.textBlack.toString(),
  height: '100%',
  width: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

});
const PointcloudMobileMessage = styled.p({
  color: palette.sliderBar.toString(),
  padding: 30,
  fontSize: '15px',
  textAlign: 'center',
});

const million: number = 1000000;
const pointInMillion: (pointNumber: number) => number =
  (pointNumber) => pointNumber * million;

export interface Props {
  readonly in3D: boolean;
  readonly in3DPointCloud: boolean;
  readonly currentPointCloudEngine: T.PointCloudEngine;
  readonly popup?: T.ContentPagePopupType;
  readonly isBlueprintAligning: boolean;
  readonly isSidebarOpened: boolean;
  readonly isTopbarOpened: boolean;
  readonly isInContentsEventLogTable: boolean;
  readonly twoDDisplayMode: T.TwoDDisplayMode;
  readonly getInitialContentsStatus: T.APIStatus;
  readonly getScreensStatus: T.APIStatus;
  readonly getLonLatOn2D3DToggleStatus: T.APIStatus;
  readonly authHeader?: AuthHeader;
  readonly isLengthContent?: boolean;
  readonly pointCloudNumberOfPointsInMil: number;
  readonly pointCloudSizeOfPoint: number;
  readonly printingContentId?: T.MapContent['id'];
  readonly contentsInCurrentTab: Array<T.Content>;
  readonly currentScreen?: T.Screen;
  readonly currentProject?: T.Project;
  readonly lang: T.Language;
  readonly sidebarTab: T.ContentPageTabType;
  readonly isTopbarShown: boolean;
  readonly getProjectStatus: T.APIStatus;
  readonly getProjectError?: T.HTTPError;
  getNotice(): void;
}

export interface State {
  readonly mapRedraw: number;
  readonly isScreenBeingCaptured: boolean;
  readonly isCesium: boolean;
  readonly areMapCenterCoordinatesReadyFor2D: boolean;
  readonly is3dOptionDisplay: boolean;
  readonly hoverLengthLocation: T.GeoPoint | undefined;
  readonly clickPointCloud: boolean;
  readonly additionalAltAboveGround: number;
}
/**
 * Content page
 */
class ContentPage extends Component<Props & L10nProps & CesiumContextProps, State> {
  public constructor(props: Props & L10nProps) {
    super(props);

    this.state = {
      mapRedraw: 0,
      is3dOptionDisplay: false,
      isScreenBeingCaptured: false,
      isCesium: false,
      areMapCenterCoordinatesReadyFor2D: false,
      hoverLengthLocation: undefined,
      clickPointCloud: false,
      additionalAltAboveGround: 0,
    };
  }

  public componentDidMount(): void {
    this.props.getNotice();
    this.setState(({ mapRedraw: prevMapRedraw }) => ({
      mapRedraw: prevMapRedraw + 1,
    }));

    // When the content page is fully loaded,
    // let Hotjar know it needs to start recording heatmaps.
    if (typeof hj !== 'undefined') {
      hj('trigger', 'ddm_contents');
    }
  }

  public componentDidUpdate(prevProps: Props & L10nProps): void {
    const {
      isBlueprintAligning,
      isSidebarOpened,
      sidebarTab,
      twoDDisplayMode,
      in3DPointCloud,
      in3D,
      isTopbarShown,
    }: Props & L10nProps = this.props;

    const sidebarIsUpdated: boolean =
      prevProps.isSidebarOpened !== isSidebarOpened;
    const twoDModeIsUpdated: boolean =
      prevProps.twoDDisplayMode !== twoDDisplayMode;

    const shouldRedrawMap: boolean =
      sidebarIsUpdated ||
      twoDModeIsUpdated ||
      (prevProps.sidebarTab !== sidebarTab && sidebarTab === T.ContentPageTabType.PHOTO) ||
      isBlueprintAligning !== prevProps.isBlueprintAligning ||
      prevProps.isTopbarShown !== isTopbarShown;

    const has3DChange: boolean = [
      [prevProps.in3DPointCloud, in3DPointCloud], [prevProps.in3D, in3D],
    ].some(([prev, crnt]) => prev !== crnt);

    if (shouldRedrawMap) {
      this.setState(({ mapRedraw: prevMapRedraw }) => ({
        mapRedraw: prevMapRedraw + 1,
      }));
    }

    if (has3DChange) {
      this.setState((prevState) => ({
        ...prevState,
        isCesium: !this.props.in3DPointCloud && this.props.in3D,
      }));
    }
  }

  @autobind
  private handleUpdateLengthHoverPoint(hoverLengthLocation?: T.GeoPoint): void {
    this.setState({ hoverLengthLocation });
  }

  public render(): ReactNode {
    const {
      isBlueprintAligning,
      in3D, in3DPointCloud, isSidebarOpened, isTopbarOpened, isInContentsEventLogTable,
      currentPointCloudEngine,
      printingContentId,
      getInitialContentsStatus,
      getLonLatOn2D3DToggleStatus,
      sidebarTab,
      getProjectStatus, getProjectError,
    }: Props & L10nProps = this.props;

    const blueprintTopbar: ReactNode =
      isBlueprintAligning ? (
        <BlueprintTopbar />
      ) : undefined;

    const printingTopbar: ReactNode =
      printingContentId ? (
        <PrintTopbar />
      ) : undefined;

    const contentsEventLogTable: ReactNode =
        isInContentsEventLogTable ? (
          <ContentsEventLogTable />
        ) : null;

    const threeDDisplay: ReactNode = in3DPointCloud && currentPointCloudEngine === T.PointCloudEngine.POTREE ?
      (
        isMobile() ?
          <PointcloudMobileMessageViewer>
            <PointcloudMobileMessage>
              {l10n(Text.pointcloudPreparationOnMobile, this.props.language)}
            </PointcloudMobileMessage>
          </PointcloudMobileMessageViewer>
          :
          <ThreeDDisplay
            viewerRedraw={this.state.mapRedraw}
            pointNumber={pointInMillion(this.props.pointCloudNumberOfPointsInMil)}
            pointSize={this.props.pointCloudSizeOfPoint}
          />
      ) : <CesiumRoot behavior={RootBehavior} hoverLengthLocation={this.state.hoverLengthLocation} />;

    const twoDDisplay: ReactNode =
      getLonLatOn2D3DToggleStatus === T.APIStatus.PROGRESS ?
        <LoadingScreen backgroundColor={palette.white} textColor={palette.textGray} /> :
        (<TwoDDisplay
          mapRedraw={this.state.mapRedraw}
          hoverLengthLocation={this.state.hoverLengthLocation}
        />);

    const main: ReactNode = (() => {
      if (in3D) {
        return (
          <Suspense fallback={<LoadingScreen backgroundColor={palette.white} textColor={palette.textGray} />}>
            {threeDDisplay}
          </Suspense>
        );
      }

      return (<>
        <PointEditTutorialPanel />
        {twoDDisplay}
      </>);
    })();

    const isReadyShowContents: boolean = getInitialContentsStatus === T.APIStatus.SUCCESS;
    const isOnPhotoTab: boolean = sidebarTab === T.ContentPageTabType.PHOTO;

    const photoListAndViewer: ReactNode = (() => {
      if (!isOnPhotoTab) return null;

      return (<>
        <PhotoList />
        <PhotoViewer />
      </>);
    })();

    if (getProjectStatus === T.APIStatus.ERROR) {
      return (
        <InvalidPageDisplay httpErrorStatus={getProjectError} />
      );
    }

    return isReadyShowContents ? (
      <Root isSidebarOpened={isSidebarOpened} sidebarTab={sidebarTab}>
        {blueprintTopbar}
        {printingTopbar}
        {contentsEventLogTable}
        <ContentSidebar />
        <MapTopBar />
        <PhotoTopBar />
        <MapOverlayRoot isSidebarOpened={isSidebarOpened}>
          <MapOverlay />
        </MapOverlayRoot>
        <MapHorizontalTab handleUpdateLengthHoverPoint={this.handleUpdateLengthHoverPoint} />
        <DisplayWrapper sidebarTab={sidebarTab} isSidebarOpened={isSidebarOpened} isTopbarOpened={isTopbarOpened}>
          {main}
        </DisplayWrapper>
        {photoListAndViewer}
        {selectPopup(this.props.popup)}
        <CreatingVolumeClickEventHandler />
      </Root>
    ) : <LoadingScreen backgroundColor={palette.white} textColor={palette.textGray} />;
  }
}
export default withCesiumViewer<Props>(withL10n(ContentPage));
