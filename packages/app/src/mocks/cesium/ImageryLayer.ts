/* eslint-disable @typescript-eslint/no-namespace */
import {
  ImageryLayer as CesiumImageryLayer,
  ImageryProvider,
  Rectangle,
} from 'cesium';

namespace MockImageryLayer {
  export type ValueFunc = (
    frameState: any, layer: ImageryLayer, x: number, y: number, level: number,
  ) => number;
}

export class ImageryLayer implements Partial<CesiumImageryLayer> {
  public static DEFAULT_BRIGHTNESS: number = 0;
  public static DEFAULT_CONTRAST: number = 0;
  public static DEFAULT_HUE: number = 0;
  public static DEFAULT_SATURATION: number = 0;
  public static DEFAULT_GAMMA: number = 0;

  public alpha: number = 0;
  public brightness: number = 0;
  public contrast: number = 0;
  public hue: number = 0;
  public saturation: number = 0;
  public gamma: number = 0;
  public show: boolean = true;
  public imageryProvider: any;
  public rectangle: Rectangle = new Rectangle();

  public constructor(_imageryProvider: ImageryProvider, _options?: {
    rectangle?: any;
    alpha?: number | MockImageryLayer.ValueFunc;
    brightness?: number | MockImageryLayer.ValueFunc;
    contrast?: number | MockImageryLayer.ValueFunc;
    hue?: number | MockImageryLayer.ValueFunc;
    saturation?: number | MockImageryLayer.ValueFunc;
    gamma?: number | MockImageryLayer.ValueFunc;
    show?: boolean;
    maximumAnisotropy?: number;
    minimumTerrainLevel?: number;
    maximumTerrainLevel?: number;
  }) {}
  public isBaseLayer(): boolean {
    return true;
  }
  public isDestroyed(): boolean {
    return true;
  }
  public destroy(): void {}
}
