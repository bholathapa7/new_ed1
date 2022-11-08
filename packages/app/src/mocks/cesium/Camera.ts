import {
  Camera as CesiumCamera,
  Cartesian2,
  Cartesian3,
  Matrix4,
  Ray,
  Rectangle,
  Scene,
} from 'cesium';

export class Camera implements Partial<CesiumCamera> {
  /**
   * @param _scene Change Partial<Scene> to Scene when the mock is complete
   */
  // eslint-disable-next-line no-magic-numbers
  public heading: number = 1.2;
  public constructor(_scene: Partial<Scene>) {}
  public zoomIn(_amount?: number): void {}
  public zoomOut(_amount?: number): void {}
  public setView(_options: {
    destination?: Cartesian3 | Rectangle;
    orientation?: {
      direction: Cartesian3;
      up: Cartesian3;
    } | {
      heading: number;
      pitch: number;
      roll: number;
    };
    endTransform?: Matrix4;
    convert?: boolean;
  }): void {}
  public flyTo(..._args: any): void {}
  public getPickRay(_windowPosition: Cartesian2, _result?: Ray): Ray {
    return new Ray();
  }
}

