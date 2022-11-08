import {
  Event as CesiumEvent,
} from 'cesium';


type removeCallback = () => void;

export class Event implements Partial<CesiumEvent> {
  public numberOfListeners: number = 1;
  public addEventListener<T extends Array<T>>(
    listener: () => void, _scope?: any,
  ): removeCallback {
    // Execute immediately, for testing purpose
    listener();

    return () => {};
  }
  public removeEventListener<T extends Array<T>>(
    _listener: (..._args: T) => void, _scope?: any,
  ): boolean {
    return true;
  }
  public raiseEvent<T extends Array<T>>(..._args: T): void {}
}
