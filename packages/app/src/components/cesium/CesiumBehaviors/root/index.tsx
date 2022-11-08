import { Viewer } from 'cesium';
import { Dispatch, RefObject, SetStateAction } from 'react';

import * as T from '^/types';
import * as cesiumHooks from '../../CesiumHooks';

/* eslint-disable max-len */
export interface IRootBehavior {
  hover(container: RefObject<HTMLDivElement> | null | undefined): void;
  initCesiumWith(renderCesiumFunc: (isFirstLoad: boolean) => void): void;
  toggleTerrain(threeDOrthoContentId?: T.ThreeDOrthoContent['id']): void;
  addGoogleMap(isMapShown: T.ProjectConfig['isMapShown'] | undefined, prevViewer: Viewer | undefined, renderCesiumFunc: (isFirstLoad: boolean) => void, calibrateMapCenterForCesiumFunc: () => void): void;
  toggleGoogleMap(isMapShown: T.ProjectConfig['isMapShown'] | undefined): void;
  updateOnDateChange(last3DOrthoDSMId: T.DSMContent['id'] | undefined, cesiumContainer: RefObject<HTMLDivElement> | null | undefined): void;
  updateLocationOverlay(): void;
  listenTileLoading(numTilesLoaded: number, setNumTilesLoaded: Dispatch<SetStateAction<number>>, isFirstLoading: boolean): void;
  turnOffFirstLoading(isFirstLoading: boolean, numTilesLoaded: number, setFirstLoading: Dispatch<SetStateAction<boolean>>): void;
  centerOnContent(): void;
  showCompassAfterLoading(shouldShowLoading: boolean): void;
  calculateLoadingPercent(numTilesLoaded: number): number;
  measurementCursor(container: RefObject<HTMLDivElement> | null | undefined): void;
  drawInteractibleEntity(): void;
  updateEntityPosition(): void;
  selectEntity(container: RefObject<HTMLDivElement> | null | undefined): void;
  elevationProfileHoverPoint(location: T.GeoPoint | undefined): void;
  toggleDesignDXFBorder(): void;
}

export const RootBehavior: IRootBehavior = {
  hover: cesiumHooks.useHover,
  updateLocationOverlay: cesiumHooks.useUpdateLocationOverlay,
  initCesiumWith: cesiumHooks.useInitCesiumWith,
  updateOnDateChange: cesiumHooks.useUpdateOnDateChange,
  toggleTerrain: cesiumHooks.useToggleTerrain,
  addGoogleMap: cesiumHooks.useAddGoogleMap,
  toggleGoogleMap: cesiumHooks.useToggleGoogleMap,
  listenTileLoading: cesiumHooks.useListenTileLoading,
  turnOffFirstLoading: cesiumHooks.useTurnOffFirstLoading,
  centerOnContent: cesiumHooks.useCenterOnContent,
  showCompassAfterLoading: cesiumHooks.useShowCompassAfterLoading,
  calculateLoadingPercent: cesiumHooks.useCalculateLoadingPercent,
  measurementCursor: cesiumHooks.useMeasurementCursor,
  drawInteractibleEntity: cesiumHooks.useDrawInteractibleEntity,
  updateEntityPosition: cesiumHooks.useUpdateEntityPosition,
  selectEntity: cesiumHooks.useSelectEntity,
  elevationProfileHoverPoint: cesiumHooks.useElevationProfileHoverPoint,
  toggleDesignDXFBorder: cesiumHooks.useToggleDesignDXFBorder,
};
