import {
  Color as CesiumColor,
  Globe,
  MapProjection,
  Scene as CesiumScene,
} from 'cesium';
import Color from 'color';

import { getCesiumColor } from '^/components/cesium/cesium-util';

import {
  Event as MockEvent,
  Fog as MockFog,
  Globe as MockGlobe,
} from '.';

export class Scene implements Partial<CesiumScene> {
  public fog: MockFog = new MockFog();
  public backgroundColor: CesiumColor = getCesiumColor(new Color('#ffffff'));
  public globe: Globe = new MockGlobe() as Globe;
  public canvas: HTMLCanvasElement = document.createElement('canvas');
  public readonly postRender: MockEvent = new MockEvent();
  public readonly mapProjection: MapProjection = {
    ellipsoid: { cartesianToCartographic: (..._args: any) => {} },
  } as any;
  public constructor() {}
  public destroy(): void {}
}
