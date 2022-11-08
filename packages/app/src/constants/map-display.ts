/* eslint-disable no-magic-numbers */
import { Math as CesiumMath, Rectangle } from 'cesium';
import { FontFamily } from './styles';

export const GOOGLE_MAPS_MAX_ZOOM: number = 21;

export interface Zoom {
  defaultDiff: number;
  defaultLevel: number;
}
export interface CesiumCameraOrientation {
  heading: number;
  pitch: number;
  roll: number;
}

const cesiumDefaultCameraOrientation: CesiumCameraOrientation = {
  heading : CesiumMath.toRadians(360),
  pitch : CesiumMath.toRadians(-70),
  roll : CesiumMath.toRadians(360),
};

type CesiumZoom = Zoom;

const cesiumZoom: CesiumZoom = {
  defaultDiff: 100,
  defaultLevel: 16,
};

const cesiumNavigationDefaultResetView: Rectangle = Rectangle.fromDegrees(71, 3, 90, 14);

const cesiumDefaultCameraDuration: number = 2.5;

/**
 * Order for putting imagery layers in Cesium.
 * Bigger number means shown on the top of previous numbers.
 */
export enum CesiumImageryLayersOrder {
  WORLD_IMAGERY = 0,
  S3_TILES_MAP,
}

export enum CesiumPrimitivesIndex {
  THREE_D_MESH = 0,
}

export interface CesiumConstants {
  defaultCameraDuration: number;
  defaultCameraOrientation: CesiumCameraOrientation;
  zoom: CesiumZoom;
  navigationDefaultResetView: Rectangle;
}

const cesiumConstants: CesiumConstants = {
  defaultCameraDuration: cesiumDefaultCameraDuration,
  navigationDefaultResetView: cesiumNavigationDefaultResetView,
  defaultCameraOrientation: cesiumDefaultCameraOrientation,
  zoom: cesiumZoom,
};

export type OlZoom = Omit<Zoom, 'defaultLevel'>;

const olZoom: OlZoom = {
  defaultDiff: 0.2,
};

export interface OlConstants {
  zoom: OlZoom;
  blueprintDxfMinMaxZoom: Record<string, number>;
}

const blueprintDxfMinMaxZoom: Record<string, number> = {
  minZoom: 14,
  maxZoom: 21,
};

const olConstants: OlConstants = {
  zoom: olZoom,
  blueprintDxfMinMaxZoom,
};

const commonConstants: {
  markerIconScale: number;
  selectCircle: number;
  plusCircle: number;
  labelFontStyle: string;
  designDXFOpacity: number;
} = {
  markerIconScale: 0.461538,
  selectCircle: 1,
  plusCircle: 0.5,
  labelFontStyle: `bold 11px ${FontFamily.ROBOTO}`,
  designDXFOpacity: 0.7,
};

export {
  cesiumConstants,
  olConstants,
  commonConstants,
};
