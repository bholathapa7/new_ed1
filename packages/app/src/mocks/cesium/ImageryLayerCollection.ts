import {
  Event,
  ImageryLayer,
  ImageryLayerCollection as CesiumImageryLayerCollection,
  ImageryLayerFeatureInfo,
  ImageryProvider,
  Ray,
  Scene,
} from 'cesium';

import {
  Event as MockEvent,
  ImageryLayer as MockImageryLayer,
} from '.';

export class ImageryLayerCollection implements Partial<CesiumImageryLayerCollection> {
  public layerAdded: Event = new MockEvent() as Event;
  public layerRemoved: Event = new MockEvent() as Event;
  public layerMoved: Event = new MockEvent() as Event;
  public layerShownOrHidden: Event = new MockEvent() as Event;
  public length: number = 0;
  public add(_layer: MockImageryLayer, _index?: number): void {}
  public addImageryProvider(_imageryProvider: ImageryProvider, _index?: number): ImageryLayer {
    return new MockImageryLayer(0 as any) as ImageryLayer;
  }
  public remove(_layer: ImageryLayer, _destroy?: boolean): boolean {
    return true;
  }
  public removeAll(_destroy?: boolean): void {}
  public contains(_layer: ImageryLayer): boolean {
    return true;
  }
  public indexOf(_layer: ImageryLayer): number {
    return 0;
  }
  public get(_index: number): ImageryLayer {
    return new MockImageryLayer(0 as any) as ImageryLayer;
  }
  public raise(_layer: ImageryLayer): void {}
  public lower(_layer: ImageryLayer): void {}
  public raiseToTop(_layer: ImageryLayer): void {}
  public lowerToBottom(_layer: ImageryLayer): void {}
  public pickImageryLayerFeatures(
    _ray: Ray, _scene: Scene,
  ): Promise<Array<ImageryLayerFeatureInfo>> | undefined {
    return undefined;
  }
  public isDestroyed(): boolean {
    return true;
  }
  public destroy(): void {}
}
