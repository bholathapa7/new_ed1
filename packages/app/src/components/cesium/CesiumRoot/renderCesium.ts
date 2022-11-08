import cesiumNavigation from '@angelsw/cesium-navigation-es6';
import {
  Camera,
  CameraEventType,
  CesiumTerrainProvider,
  Color,
  Fog,
  KeyboardEventModifier,
  ScreenSpaceEventType,
  Viewer,
} from 'cesium';
import { RefObject } from 'react';
import { Observable, fromEvent, merge } from 'rxjs';
import { take } from 'rxjs/operators';

import { AuthHeader, makeS3URL } from '^/store/duck/API';
import * as T from '^/types';

import { twoDToThreeDToggleButtonId } from '^/components/atoms/DisplayToggleButton';

import { cesiumConstants as CC } from '^/constants/map-display';
import palette from '^/constants/palette';

import { CesiumContextProps } from '^/components/cesium/CesiumContext';
import {
  ElevationValueObservable,
  LonLatAlt,
  convertCesiumAltToOlZoom,
  getCesiumColor,
  getCesiumMapCenter,
  requestElevationInfoOnCoordinate,
} from '^/components/cesium/cesium-util';

import { contentsListDsmItemClassName, contentsListMapItemClassName } from '^/components/molecules/ContentsListMapAndDSMItem';
import { UpdateMapCenter, changeCoordinateSystemForDesignDXF, emptyCreditContainer } from '../CesiumHooks';

export const setBackgroundColorGrey: (viewer: Viewer) => void = (viewer) => {
  const fog: Fog = new Fog();
  const { scene }: Viewer = viewer;
  const grayCesiumColor: Color = getCesiumColor(palette.mapBackgroundColorGrey);

  fog.enabled = false;
  scene.fog = fog;
  scene.backgroundColor = grayCesiumColor;
  scene.globe.baseColor = grayCesiumColor;
};

export interface UpdateMapCenterFromCesiumParams {
  viewer: Viewer;
  updateMapCenter?: UpdateMapCenter;
  authHeader?: AuthHeader;
  isFirstLoad: boolean;
  lastDSMId?: number;
  handleGetLonLatOn2D3DToggle(): void;
  handleFinishGetLonLatOn2D3DToggle(error?: T.HTTPError): void;
}

export const updateMapCenterFromCesium: ({
  viewer,
  updateMapCenter,
  authHeader,
  lastDSMId,
  isFirstLoad,
  handleGetLonLatOn2D3DToggle,
  handleFinishGetLonLatOn2D3DToggle,
}: UpdateMapCenterFromCesiumParams) => boolean = ({
  viewer, updateMapCenter, authHeader,
  lastDSMId, isFirstLoad, handleGetLonLatOn2D3DToggle, handleFinishGetLonLatOn2D3DToggle,
}) => {
  if (viewer.isDestroyed()) {
    return false;
  }
  if (!viewer.scene.globe.tilesLoaded && isFirstLoad) {
    return false;
  }
  const cesiumMapCenter: LonLatAlt | undefined = getCesiumMapCenter(viewer);
  if (!cesiumMapCenter) {
    return false;
  }
  const { lon, lat, alt }: LonLatAlt = cesiumMapCenter;
  const { heading: rotation }: Camera = viewer.camera;

  const defaultMapCenter: T.MapCenter = {
    lon,
    lat,
    alt: convertCesiumAltToOlZoom(alt),
    rotation: -rotation,
  };

  const requestElevationInfoOnCoordinate$: ElevationValueObservable =
    requestElevationInfoOnCoordinate({
      lon,
      lat,
      lastDSMId,
      authHeader,
    });

  updateMapCenter?.(defaultMapCenter);

  handleGetLonLatOn2D3DToggle();
  requestElevationInfoOnCoordinate$.subscribe({
    next: (additionalAlt: T.ElevationInfo['value']) => {
      updateMapCenter?.({
        ...defaultMapCenter,
        alt: convertCesiumAltToOlZoom(alt - additionalAlt),
      });
      handleFinishGetLonLatOn2D3DToggle();
    },
    error: handleFinishGetLonLatOn2D3DToggle,
  });

  return true;
};

/**
  * @desc Custom mouse action for Cesium
  * @info https://cesium.com/docs/cesiumjs-ref-doc/ScreenSpaceCameraController.html
  */
export const registerCustomMouseControls: (viewer: Viewer) => void = (viewer) => {
  const { scene }: Viewer = viewer;
  scene.screenSpaceCameraController.tiltEventTypes = [
    CameraEventType.RIGHT_DRAG, CameraEventType.PINCH,
    {
      eventType : CameraEventType.LEFT_DRAG,
      modifier : KeyboardEventModifier.CTRL,
    },
    {
      eventType : CameraEventType.RIGHT_DRAG,
      modifier : KeyboardEventModifier.CTRL,
    },
  ];
  scene.screenSpaceCameraController.zoomEventTypes = [
    CameraEventType.WHEEL,
    CameraEventType.PINCH,
  ];
};

export const viewerDefaultOptions: any = {
  animation: false,
  baseLayerPicker: false,
  fullscreenButton: false,
  geocoder: false,
  homeButton: false,
  infoBox: false,
  sceneModePicker: false,
  selectionIndicator: false,
  timeline: false,
  navigationHelpButton: false,
  navigationInstructionsInitiallyVisible: false,
  shadows: false,
  automaticallyTrackDataSourceClocks: false,
  imageryProvider: false,
  requestRenderMode: true,
  maximumRenderTimeChange: Infinity,
};

export interface RenderCesiumParams extends CesiumContextProps {
  dsmId?: number;
  is3DOrthoSelected: boolean;
  authHeader?: AuthHeader;
  cesiumContainer: RefObject<HTMLDivElement | null>;
  updateMapCenter: UpdateMapCenter;
  isFirstLoad: boolean;
  handleGetLonLatOn2D3DToggle(): void;
  handleFinishGetLonLatOn2D3DToggle(error?: T.HTTPError): void;
}

export const renderCesium: (params: RenderCesiumParams) => void = async ({
  dsmId,
  is3DOrthoSelected,
  cesiumContainer,
  viewer,
  setViewer,
  updateMapCenter,
  handleGetLonLatOn2D3DToggle,
  handleFinishGetLonLatOn2D3DToggle,
  authHeader,
  isFirstLoad,
}) => {
  if (cesiumContainer?.current !== null) {
    let terrainProvider: CesiumTerrainProvider | undefined;

    if (dsmId !== undefined) {
      terrainProvider = is3DOrthoSelected ? new CesiumTerrainProvider({
        url: makeS3URL(dsmId, 'terrain-reduced'),
      }) : undefined;
    }

    if (!viewer) {
      setViewer?.(new Viewer(cesiumContainer.current, {
        terrainProvider,
        creditContainer: emptyCreditContainer,
        skyAtmosphere: false,
        skyBox: false,
        ...viewerDefaultOptions,
      }));
    }

    if (viewer === undefined || viewer.isDestroyed()) return;
    const toggleTo2DTriggerElements: Array<HTMLElement> =
        [
          document.getElementById(twoDToThreeDToggleButtonId),
          document.getElementsByClassName(contentsListDsmItemClassName)?.[0],
          document.getElementsByClassName(contentsListMapItemClassName)?.[0],
        ].filter(Boolean) as Array<HTMLElement>;

    const toggleTo2DObservable: Observable<Event> = merge(
      ...toggleTo2DTriggerElements.map((elem) => fromEvent(elem, 'click')),
    );

    toggleTo2DObservable.pipe(
      take(1),
    ).subscribe(() => {
      updateMapCenterFromCesium({
        viewer,
        updateMapCenter,
        authHeader,
        isFirstLoad,
        handleGetLonLatOn2D3DToggle,
        handleFinishGetLonLatOn2D3DToggle,
        lastDSMId: dsmId,
      });
    });

    viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    setBackgroundColorGrey(viewer);
    registerCustomMouseControls(viewer);
    cesiumNavigation(viewer, {
      defaultResetView: CC.navigationDefaultResetView,
      enableCompass: true,
      enableZoomControls: false,
      enableDistanceLegend: false,
      enableCompassOuterRing: true,
    });
    changeCoordinateSystemForDesignDXF();
  }
};
