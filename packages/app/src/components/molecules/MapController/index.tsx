import { Cartesian3 } from 'cesium';
import { Coordinate } from 'ol/coordinate';
import { fromLonLat } from 'ol/proj';
import React, { Dispatch as LocalDispatch, ReactNode, memo, useContext, useEffect, useMemo, useState, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled, { CSSObject } from 'styled-components';

import MapCenterSvg from '^/assets/icons/map-controller/map-center.svg';
import ShowHiddenTerrainActiveSvg from '^/assets/icons/map-controller/show-hidden-terrain-active.svg';
import ShowHiddenTerrainSvg from '^/assets/icons/map-controller/show-hidden-terrain.svg';
import ShowWorkRadiusActiveSvg from '^/assets/icons/map-controller/show-work-radius-active.svg';
import ShowWorkRadiusSvg from '^/assets/icons/map-controller/show-work-radius.svg';
import GeolocationButton from '^/components/atoms/GeolocationButton';
import { OlViewProps, withOlView } from '^/components/atoms/OlViewProvider';
import WrapperHoverable, { Props as WrapperHoverableProps } from '^/components/atoms/WrapperHoverable';
import { CesiumContext, CesiumContextProps } from '^/components/cesium/CesiumContext';
import {
  convertOlZoomToCesiumAlt, getRadiusForCesium, requestElevationInfoOnCoordinate,
  setThreeDTilesetCenter,
} from '^/components/cesium/cesium-util';
import MapZoom from '^/components/molecules/MapZoom';
import ProjectLogo from '^/components/molecules/ProjectLogo';
import { Actions } from '^/components/ol/OlMapEventListeners/store/Actions';
import { defaultMapZoom } from '^/constants/defaultContent';
import { cesiumConstants as CC } from '^/constants/map-display';
import palette from '^/constants/palette';
import route from '^/constants/routes';
import { MediaQuery } from '^/constants/styles';
import { MapController as MapControllerZIndex } from '^/constants/zindex';
import { FindContentById, UseL10n, UseState, useContentFoundById, useL10n, useRouteIsMatching } from '^/hooks';
import { RootAction } from '^/store/duck';
import { AuthHeader, makeAuthHeader } from '^/store/duck/API';
import { ChangeIsOnWorkRadius, ChangeTwoDDisplayZoom } from '^/store/duck/Pages';
import * as T from '^/types';
import { getCenterBoundary } from '^/utilities/map-util';
import { getSingleContentId } from '^/utilities/state-util';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import CameraButton from '../CameraButton';
import { Fallback } from './fallback';
import Text from './text';

interface StatusProps {
  isInCesium: boolean;
  isOnSharePage?: boolean;
  isOnPrintPage?: boolean;
}


export const Root = styled.div<StatusProps>(({ isInCesium, isOnSharePage, isOnPrintPage }) => ({
  position: 'absolute',
  top: (() => {
    if (isInCesium) return '35px';
    if (isOnSharePage) return '85px';
    if (isOnPrintPage) return '225px';

    return '175px';
  })(),
  right: '34px',
  width: '32px',
  zIndex: MapControllerZIndex.DEFAULT,

  [MediaQuery.MOBILE_L]: {
    top: isOnSharePage ? '85px' : '35px',
  },
}));

const ProjectLogoWrapper = styled.div({
  position: 'fixed',
  bottom: '35px',
  right: '35px',
});

export const MapCenterWrapper = styled.div<StatusProps>(({ isInCesium }) => ({
  height: '30px',
  cursor: 'pointer',
  boxShadow: palette.insideMap.shadow,
  backdropFilter: 'blur(10px)',
  marginBottom: isInCesium ? '72px' : '0',
  '> div': {
    borderRadius: '3px',
  },

  backgroundColor: palette.insideMap.gray.toString(),
  borderRadius: '3px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '&:hover': {
    backgroundColor: palette.insideMap.hoverGray.toString(),
  },
}));

const DepthTestButtonWrapper = styled.div<{ isClicked: boolean }>(({ isClicked }) => ({
  height: '30px',
  cursor: 'pointer',
  boxShadow: palette.insideMap.shadow,
  backdropFilter: 'blur(10px)',

  marginBottom: '6px',

  borderRadius: '3px',
  backgroundColor: (isClicked ? palette.white : palette.insideMap.gray).toString(),

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '&:hover': {
    backgroundColor: palette.insideMap.hoverGray.toString(),
  },
  marginTop: '6px',
}));

const MapCenterSvgWrapper = styled.div({
  width: '32px',
  height: '32px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const GeolocationWrapper = styled.div({
  marginTop: '6px',
});


const TooltipBalloonStyle: CSSObject = {
  left: 'auto',
  right: '33px',
  bottom: '3px',
};

const TooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipTargetStyle: {
    width: '100%',
    height: '100%',
  },
  tooltipBalloonStyle: TooltipBalloonStyle,
};

const WorkRadiusTooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  ...TooltipCustomStyle,
  tooltipWrapperStyle: {
    height: '28px',
  },
};

const WorkRadiusButtonWrapper = styled.div<{ isClicked: boolean }>(({ isClicked }) => ({
  height: '32px',
  cursor: 'pointer',
  boxShadow: palette.insideMap.shadow,
  backdropFilter: 'blur(10px)',

  marginTop: '6px',
  marginBottom: '6px',

  borderRadius: '3px',
  backgroundColor: (isClicked ? palette.white : palette.insideMap.gray).toString(),

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '&:hover': {
    backgroundColor: palette.insideMap.hoverGray.toString(),
  },
}));

interface Props {
  readonly localDispatch?: LocalDispatch<Actions>;
}

const MapController: FC<CesiumContextProps & OlViewProps & Props> = ({ view: olView , localDispatch }) => {
  const dispatch: Dispatch<RootAction> = useDispatch();
  const {
    Pages, Pages: {
      Contents: {
        twoDDisplayZoom, in3D, in3DPointCloud,
        printingContentId, sidebarTab, isInSourcePhotoUpload, twoDDisplayMode,
        currentPointCloudEngine,
      },
    },
    ProjectConfigPerUser,
    Contents, Contents: { contents: { byId: contents } },
    Auth,
    PlanConfig,
    Photos: { photoTab },
  }: T.State = useSelector((state: T.State) => state);
  const { viewer: cesiumViewer }: CesiumContextProps = useContext(CesiumContext);
  const [l10n]: UseL10n = useL10n();
  const [additionalAltAboveGround, setAdditionalAltAboveGround]:
    UseState<number> = useState<number>(0);
  const [depthTestAgainstTerrain, setDepthTestAgainstTerrain]: UseState<boolean> = useState(false);
  const isOnSharePage: boolean = useRouteIsMatching(route.share.main);
  const isOnPrintPage: boolean = printingContentId !== undefined;
  const isDisabled: boolean = isOnPrintPage || sidebarTab === T.ContentPageTabType.PHOTO;
  const threeDTilesetBounds = useSelector((s: T.State) => s.Pages.Contents.threeDTilesetBounds);
  const isOnWorkRadius: boolean = useSelector((s: T.State) => s.Pages.Contents.isOnWorkRadius);

  const findContentById: FindContentById = useContentFoundById();

  const changeZoom: (zoom: number) => void = (zoom) =>
    dispatch(ChangeTwoDDisplayZoom({ twoDDisplayZoom: zoom }));

  const lastThreeDOrthoId: T.ThreeDOrthoContent['id'] | undefined
    = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.THREE_D_ORTHO);

  const lastThreeDOrthoDSMId: T.DSMContent['id'] | undefined = lastThreeDOrthoId === undefined ?
    undefined : findContentById<T.ThreeDOrthoContent>(lastThreeDOrthoId)?.info.dsm;

  const lastMapId: T.Content['id'] | undefined = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.MAP);

  const { initialCameraPosition }: { initialCameraPosition: Coordinate } =
    useSelector(({ SharedContents }: T.State) => ({ initialCameraPosition: SharedContents.initialCameraPosition }));

  let twoDDisplayCenter: T.GeoPoint | undefined;

  const tms: T.MapContent['info']['tms'] =
    lastMapId !== undefined && twoDDisplayZoom ? (contents[lastMapId] as T.MapContent).info.tms : undefined;
  if (isOnSharePage) {
    twoDDisplayCenter = initialCameraPosition;
  } else if (tms) {
    twoDDisplayCenter = getCenterBoundary(tms.boundaries[defaultMapZoom]);
  }

  const authHeader: AuthHeader | undefined = makeAuthHeader(Auth, PlanConfig.config?.slug);

  const isInPointCloudCesium = in3DPointCloud && currentPointCloudEngine === T.PointCloudEngine.CESIUM;
  const isInCesium: boolean = (!in3DPointCloud || isInPointCloudCesium) && in3D;

  useEffect(() => {
    if (!isInCesium || lastThreeDOrthoDSMId === undefined || twoDDisplayCenter === undefined) {
      return;
    }
    requestElevationInfoOnCoordinate({
      authHeader, lastDSMId: lastThreeDOrthoDSMId,
      lon: twoDDisplayCenter[0], lat: twoDDisplayCenter[1],
    }).subscribe((alt: number) => {
      setAdditionalAltAboveGround(alt);
    });
  }, []);

  useEffect(() => {
    if (cesiumViewer === undefined || cesiumViewer.isDestroyed()) return;
    cesiumViewer.scene.globe.depthTestAgainstTerrain = depthTestAgainstTerrain;
    cesiumViewer.scene.requestRender();
  }, [Boolean(cesiumViewer), depthTestAgainstTerrain]);

  const handleMapCenterInCesium: () => void = () => {
    if (!cesiumViewer || cesiumViewer.isDestroyed()) return;

    if (threeDTilesetBounds !== undefined) {
      setThreeDTilesetCenter({
        viewer: cesiumViewer,
        minBounds: threeDTilesetBounds.min,
        maxBounds: threeDTilesetBounds.max,
      });
    } else if (twoDDisplayCenter !== undefined) {
      const [lon, lat]: T.GeoPoint = twoDDisplayCenter;
      const radiusIn4326: number =
        getRadiusForCesium(CC.zoom.defaultLevel)(-CC.defaultCameraOrientation.pitch);

      cesiumViewer.camera.setView({
        destination: Cartesian3.fromDegrees(
          lon, lat - radiusIn4326,
          convertOlZoomToCesiumAlt(CC.zoom.defaultLevel) + additionalAltAboveGround,
        ),
        orientation: CC.defaultCameraOrientation,
      });
    }
  };

  const handleMapCenterClick: () => void = () => {
    if (isInCesium) {
      handleMapCenterInCesium();

      return;
    }

    if (!twoDDisplayCenter) return;
    olView.setRotation(0);
    olView.setCenter(fromLonLat(twoDDisplayCenter));
    olView.setZoom(defaultMapZoom);
  };


  const cameraButton: ReactNode = useMemo(() => (!isOnSharePage ? (
    <CameraButton
      isCesium={isInCesium}
      isDisabled={isDisabled}
    />
  ) : undefined), [isOnSharePage, isInCesium, isDisabled]);

  const handleDepthTestClick: () => void = () => {
    setDepthTestAgainstTerrain((prev) => !prev);
  };

  const handleWorkRadiusClick: () => void = () => {
    dispatch(ChangeIsOnWorkRadius({ isOnWorkRadius: !isOnWorkRadius }));
  };

  const workRadiusButton: ReactNode = (
    <WorkRadiusButtonWrapper
      data-ddm-track-action='map-controls'
      data-ddm-track-label={`btn-toggle-work-radius-${isOnWorkRadius ? 'off' : 'on'}`}
      isClicked={isOnWorkRadius}
      onClick={handleWorkRadiusClick}
    >
      <WrapperHoverable
        allowForceCheckMouseout={true}
        allowForceCheckTouchend={true}
        title={l10n(Text.workRadius)}
        customStyle={WorkRadiusTooltipCustomStyle}
      >
        {isOnWorkRadius ? <ShowWorkRadiusActiveSvg /> : <ShowWorkRadiusSvg />}
      </WrapperHoverable>
    </WorkRadiusButtonWrapper>
  );

  const depthTestButton: ReactNode = isInCesium ? (
    <DepthTestButtonWrapper
      data-ddm-track-action='map-controls'
      data-ddm-track-label={`btn-toggle-3d-terrain-${depthTestAgainstTerrain ? 'off' : 'on'}`}
      isClicked={depthTestAgainstTerrain}
      onClick={handleDepthTestClick}
    >
      <WrapperHoverable
        allowForceCheckMouseout={true}
        allowForceCheckTouchend={true}
        title={l10n(Text.depthTestAgainstTerrain)}
        customStyle={TooltipCustomStyle}
      >
        {depthTestAgainstTerrain ? <ShowHiddenTerrainActiveSvg /> : <ShowHiddenTerrainSvg />}
      </WrapperHoverable>
    </DepthTestButtonWrapper>
  ) : null;

  const geolocation: ReactNode = useMemo(() => (in3D || twoDDisplayMode !== T.TwoDDisplayMode.NORMAL) ? null :
    <GeolocationWrapper>
      <WrapperHoverable
        title={l10n(Text.geolocation)}
        customStyle={TooltipCustomStyle}
      >
        <GeolocationButton dispatch={localDispatch} />
      </WrapperHoverable>
    </GeolocationWrapper>, [in3D, twoDDisplayMode]);

  return (() => {
    if (in3DPointCloud && currentPointCloudEngine === T.PointCloudEngine.POTREE) return null;
    if (sidebarTab === T.ContentPageTabType.PHOTO && photoTab === T.PhotoTabType.TIME) return null;
    if (isInSourcePhotoUpload) return null;

    return (<>
      <Root isInCesium={isInCesium} isOnSharePage={isOnSharePage} isOnPrintPage={isOnPrintPage} data-html2canvas-ignore='true'>
        <ProjectLogoWrapper>
          <ProjectLogo />
        </ProjectLogoWrapper>
        {cameraButton}
        <MapCenterWrapper
          data-ddm-track-action='map-controls'
          data-ddm-track-label={`btn-center-${isInCesium ? '3d' : '2d'}`}
          isInCesium={isInCesium}
          onClick={handleMapCenterClick}
          data-testid='map-center-btn'
        >
          <WrapperHoverable
            title={l10n(Text.mapCenter)}
            customStyle={TooltipCustomStyle}
          >
            <MapCenterSvgWrapper>
              <MapCenterSvg />
            </MapCenterSvgWrapper>
          </WrapperHoverable>
        </MapCenterWrapper>
        <MapZoom
          isInCesium={isInCesium}
          tooltipCustomStyle={TooltipCustomStyle}
          twoDDisplayZoom={twoDDisplayZoom}
          changeZoom={changeZoom}
        />
        {geolocation}
        {depthTestButton}
        {workRadiusButton}
      </Root>
    </>);
  })();
};

export default withErrorBoundary((memo(withOlView(MapController))))(Fallback);
