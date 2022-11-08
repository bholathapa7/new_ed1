import {
  Cartesian3, Ray as CesiumRay,
} from 'cesium';

export class Ray implements CesiumRay {
  public static getPoint(_t: number, _result?: Cartesian3): Cartesian3 {
    return new Cartesian3(0, 0, 0);
  }
  public origin: Cartesian3 = new Cartesian3(0, 0, 0);
  public direction: Cartesian3 = new Cartesian3(0, 0, 0);
  public constructor(_origin?: Cartesian3, _direction?: Cartesian3) {}
}

