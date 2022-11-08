import { MapBrowserEvent, MapBrowserPointerEvent, View } from 'ol';
import OlMap from 'ol/Map';
import { DragRotate } from 'ol/interaction';
import { Pixel } from 'ol/pixel';
import { disable } from 'ol/rotationconstraint';
import { Size } from 'ol/size';

export enum MouseButton {
  LEFT = 1,
  RIGHT,
  LEFT_RIGHT,
  WHEEL,
  LEFT_WHEEL,
  RIGHT_WHEEL,
  LEFT_RIGHT_WHEEL,
}

export class RightDragRotate extends DragRotate {
  private lastAngle: number | undefined;
  // eslint-disable-next-line no-magic-numbers
  private readonly duration: number = 250;

  public constructor() {
    super();
  }


  public handleDownEvent(e: MapBrowserEvent): boolean {
    e.map.getView().beginInteraction();
    this.lastAngle = undefined;

    return true;
  }

  public handleDragEvent(e: MapBrowserPointerEvent): void {
    const mouseButton: number = (e.originalEvent as PointerEvent).buttons;
    if (mouseButton !== MouseButton.RIGHT) return;

    const map: OlMap = e.map;
    const view: View = map.getView();
    if (view.getConstraints().rotation === disable) return;
    const size: Size = map.getSize();
    const offset: Pixel = e.pixel;
    const theta: number = Math.atan2(size[1] / 2 - offset[1], offset[0] - size[0] / 2);
    if (this.lastAngle !== undefined) {
      const delta: number = theta - this.lastAngle;
      view.adjustRotationInternal(-delta);
    }
    this.lastAngle = theta;
  }

  public handleUpEvent(e: MapBrowserEvent): boolean {
    e.map.getView().endInteraction(this.duration);

    return false;
  }
}
