import { getCesiumColor } from '^/components/cesium/cesium-util';
import {
  Cartesian3,
  Cartographic,
  Color as CesiumColor,
  Ellipsoid,
  Event,
  Globe as CesiumGlobe,
  ImageryLayerCollection,
  Ray,
  Scene,
} from 'cesium';
import Color from 'color';

import {
  Event as MockEvent,
  ImageryLayerCollection as MockImageryLayerCollection,
} from '.';

export class Globe implements Partial<CesiumGlobe> {
  public atmosphereBrightnessShift: number = 0;
  public atmosphereHueShift: number = 0;
  public atmosphereSaturationShift: number = 0;
  public baseColor: CesiumColor = getCesiumColor(new Color('#ffffff'));
  // public cartographicLimitRectangle: Rectangle;
  public depthTestAgainstTerrain: boolean = true;
  // public ellipsoid: Ellipsoid;
  public enableLighting: boolean = false;
  public fillHighlightColor: CesiumColor = getCesiumColor(new Color('#ffffff'));
  public imageryLayers: ImageryLayerCollection =
    new MockImageryLayerCollection() as ImageryLayerCollection;
  public readonly imageryLayersUpdatedEvent: Event = new MockEvent() as Event;
  public lightingFadeInDistance: number = 0;
  public lightingFadeOutDistance: number = 0;
  public loadingDescendantLimit: number = 0;
  // public material: Material;
  public maximumScreenSpaceError: number = 0;
  public nightFadeInDistance: number = 0;
  public nightFadeOutDistance: number = 0;
  // public northPoleColor: Cartesian3;
  public oceanNormalMapUrl: string = '';
  public preloadSiblings: boolean = true;
  public preloadAncestors: boolean = true;
  public show: boolean = true;
  public showWaterEffect: boolean = true;
  // public southPoleColor: Cartesian3;
  // public terrainProvider: TerrainProvider;
  // public readonly terrainProviderChanged: Event<[TerrainProvider]>;
  public tileCacheSize: number = 0;
  //public tileLoadProgressEvent: Event<[number]>;
  public tilesLoaded: boolean = false;
  public constructor(_ellipsoid?: Ellipsoid) {}
  public pick(_ray: Ray, _scene: Scene, _result?: Cartesian3): Cartesian3 {
    return new Cartesian3(0, 0, 0);
  }
  public getHeight(_cartographic: Cartographic): number {
    return 0;
  }
  public isDestroyed(): boolean {
    return true;
  }
  public destroy(): void {}
}
