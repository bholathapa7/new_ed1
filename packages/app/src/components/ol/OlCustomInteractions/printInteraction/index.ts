import * as T from '^/types';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { vec2 } from 'gl-matrix';
import { Collection, MapBrowserEvent, MapBrowserPointerEvent, View } from 'ol';
import Feature, { FeatureLike } from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import { Point as PointGeom, Polygon as PolygonGeom } from 'ol/geom';
import { Pointer as PointerInteraction } from 'ol/interaction';
import { OlCustomPropertyNames, hitTolerance10px } from '../../constants';
import {
  getMaxAllowedRect,
  getRelativeAngle,
  getRotatePoint,
  getScaleRatio,
  getScaledRect,
  getSortedRect,
  toCoordinate,
  toVec2,
} from './utils';
import { olStyleFunctions } from '^/components/ol/styles';
import RotateOnHoverPNG from '^/assets/icons/rotate-on-hover.png';
import RotatingInProgressPNG from '^/assets/icons/rotating-in-progress.png';

const HALF: number = 0.5;

enum Actions {
  IDLE,
  ROTATE,
  SCALE,
  TRANSLATE,
}

interface Options {
  features: Collection<Feature<PolygonGeom | PointGeom>>;
  onDone(coordinates: NonNullable<T.ContentsPageState['printingSquare']>, angle: NonNullable<T.ContentsPageState['printingAngle']>): void;
}

export class PrintInteraction extends PointerInteraction {
  // Boundaries are now public because
  // it may change after initialization.
  public boundaries: Coordinate[] = [];
  private action: Actions = Actions.IDLE;
  private topmostFeature: FeatureLike | undefined;
  private angle: number = 0;
  private translateX: number = 0;
  private translateY: number = 0;
  private scaleAnchor: vec2 | undefined;
  private startWidth: number = 0;
  private startHeight: number = 0;
  private startCenter: vec2 = vec2.create();
  private startCoordinate: vec2 = vec2.create();
  private startCoordinates: vec2[] = [];
  private rect: Feature<PolygonGeom> | undefined;
  private rotatePoint: Feature<PointGeom> | undefined;
  private readonly features: Options['features'];
  private readonly onDone: Options['onDone'];
  private readonly scalePoints: Feature<PointGeom>[] = [];

  public constructor({ features, onDone }: Options) {
    super();

    this.features = features;
    this.onDone = onDone;

    // Set reference to the features,
    // so that there's no need to retrieve it from the array later on.
    this.features.forEach((feature) => {
      const id: string = feature.get('id');

      if (id === OlCustomPropertyNames.PRINT_RECT) {
        this.rect = feature as Feature<PolygonGeom>;
      } else if (id === OlCustomPropertyNames.PRINT_ROTATE_POINT) {
        this.rotatePoint = feature as Feature<PointGeom>;
      } else if (id.startsWith(OlCustomPropertyNames.PRINT_POINT)) {
        this.scalePoints.push(feature as Feature<PointGeom>);
      } else {
        exhaustiveCheck(feature as never);
      }
    });
  }

  /**
   * When user starts the interaction and mouse is clicked,
   * store the necessary temporary information to calculate
   * the values needed to perform actions.
   *
   * Returns true if the event is indeed a valid interaction that
   * needs to be handled, otherwise returns false and the other event propagates.
   *
   * @param e - the map browser event.
   */
  public handleDownEvent(e: MapBrowserEvent): boolean {
    // The action set from handleMoveEvent can't be simply used
    // because user might not move their mouse at all after performing an action
    // and then mousedown again to do the same action, which leads to a bug.
    this.action = this.getCurrentAction(e);
    const elem: HTMLElement = e.map.getTargetElement();

    if (this.action === Actions.IDLE) return false;

    if (this.rect) {
      const geom: PolygonGeom = this.rect.getGeometry();
      this.startCoordinates = geom.getCoordinates()[0].map(toVec2);
      const [nw, ne, se]: vec2[] = this.startCoordinates;

      this.startWidth = vec2.dist(nw, ne);
      this.startHeight = vec2.dist(ne, se);
      this.startCenter = vec2.lerp(vec2.create(), nw, se, HALF);

      switch (this.action) {
        case Actions.TRANSLATE: {
          this.startCoordinate = toVec2(e.coordinate);
          break;
        }
        case Actions.ROTATE: {
          const point: PointGeom = this.topmostFeature?.getGeometry() as PointGeom;
          this.startCoordinate = toVec2(point.getCoordinates());
          this.rotatePoint?.setStyle(olStyleFunctions.emptyCircle);
          elem.style.cursor = `url(${RotatingInProgressPNG}), auto`;
          break;
        }
        case Actions.SCALE: {
          const point: PointGeom = this.topmostFeature?.getGeometry() as PointGeom;
          this.startCoordinate = toVec2(point.getCoordinates());
          this.scaleAnchor = vec2.rotate(vec2.create(), this.startCoordinate, this.startCenter, Math.PI);
          break;
        }
        default: {
          exhaustiveCheck(this.action);
        }
      }
    }

    return true;
  }

  /**
   * When user moves the mouse, set the allowed action
   * depending on which feature is currently below the mouse.
   *
   * @param e - the map browser event.
   */
  public handleMoveEvent(e: MapBrowserPointerEvent): void {
    this.action = this.getCurrentAction(e);
    const elem: HTMLElement = e.map.getTargetElement();

    switch (this.action) {
      case Actions.TRANSLATE: {
        elem.style.cursor = 'move';
        break;
      }
      case Actions.ROTATE: {
        elem.style.cursor = `url(${RotateOnHoverPNG}), auto`;
        break;
      }
      case Actions.SCALE: {
        elem.style.cursor = 'pointer';
        break;
      }
      case Actions.IDLE: {
        this.resetState();
        elem.style.cursor = 'default';
        break;
      }
      default: {
        exhaustiveCheck(this.action);
      }
    }
  }

  /**
   * When user drags the mouse (preceded by mousedown),
   * perform the action for every event.
   *
   * @param e - the map browser pointer event.
   */
  public handleDragEvent(e: MapBrowserPointerEvent): void {
    switch (this.action) {
      case Actions.TRANSLATE: {
        const deltaX: number = e.coordinate[0] - this.startCoordinate[0];
        const deltaY: number = e.coordinate[1] - this.startCoordinate[1];

        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        this.features?.forEach((feature) => {
          feature.getGeometry().translate(
            deltaX - this.translateX,
            deltaY - this.translateY,
          );
        });

        // Store the currently translated values
        // so that the next drag event uses it as a reference.
        this.translateX = deltaX;
        this.translateY = deltaY;
        break;
      }
      case Actions.ROTATE: {
        // Find the angle of the current dragging position against the starting point.
        const angle: number = getRelativeAngle(toVec2(e.coordinate), this.startCenter);

        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        this.features?.forEach((feature) => {
          // Since the features are being rotated every time the mouse moves,
          // the next rotation isn't rotating the full angle, only the delta of it.
          feature.getGeometry().rotate(this.angle - angle, toCoordinate(this.startCenter));
        });

        this.angle = angle;
        break;
      }
      case Actions.SCALE: {
        if (!this.scaleAnchor) {
          break;
        }

        const point: vec2 = toVec2(e.coordinate);

        const [scaleX, scaleY]: [number, number] = getScaleRatio({
          point,
          start: this.startCoordinate,
          center: this.startCenter,
          angle: this.angle,
          width: this.startWidth,
          height: this.startHeight,
        });

        const scaledVecs: vec2[] = getScaledRect({
          anchor: this.scaleAnchor,
          scaleX, scaleY,
          coords: this.startCoordinates,
          angle: this.angle,
        });

        this.updateRect(scaledVecs.map(toCoordinate));
        break;
      }
      case Actions.IDLE:
      default: {
        exhaustiveCheck(this.action as never);
      }
    }
  }

  /**
   * When user releases the mouse click, see if the coordinates
   * is within the allowed bounds, otherwise shape it as such.
   * Run the callback with the updated coordinates.
   *
   */
  public handleUpEvent(): boolean {
    if (this.rect) {
      let finalCoordinates: Coordinate[] | undefined;

      const currentRect: vec2[] = this.rect.getGeometry().getCoordinates()[0].map(toVec2);
      const allowedRect: vec2[] | null = getMaxAllowedRect(
        currentRect,
        this.boundaries.map(toVec2),

        // Compared to translating and rotating,
        // scaling changes the size of the rect and
        // when it's scaling outside of the bounds,
        // the actual anchor might not be accurate,
        // therefore providing the anchor.
        this.scaleAnchor,
      );

      if (allowedRect === null) {
        // When there is no allowed rect to be made,
        // it means it has to swap back to the original coordinates.
        // This means resetting the angle as well based on the original.
        const [nw, ne, se]: vec2[] = this.startCoordinates;
        this.angle = getRelativeAngle(
          vec2.lerp(vec2.create(), nw, ne, HALF),
          vec2.lerp(vec2.create(), nw, se, HALF),
        );

        finalCoordinates = this.startCoordinates.map(toCoordinate);
      } else {
        // The rect needs to be sorted because most of the references
        // (resize direction, rotate point position) relies on which side the rectangle is,
        // which is defined by its corner positions.
        finalCoordinates = getSortedRect(allowedRect, currentRect).map(toCoordinate);
      }

      this.updateRect(finalCoordinates);
      this.onDone(finalCoordinates, this.angle);
    }

    // State needs to be reset because the next action will use
    // all the reference values from the initial values.
    this.resetState();

    return false;
  }

  /**
   * Update the current geometries with the given coordinates.
   * This includes the rectangle, all four resize points and the rotate point.
   *
   * @param coordinates
   */
  private updateRect(coordinates: Coordinate[]): void {
    if (!this.rect || !this.rotatePoint) {
      return;
    }

    // Polygon accepts an array of coordinates, hence the nested array.
    this.rect.getGeometry().setCoordinates([coordinates]);

    // To put the scale corner points back,
    // use the previously transformed rect coordinates as a reference.
    const [topLeft, topRight, bottomRight, bottomLeft]: Coordinate[] = coordinates;
    this.scalePoints.forEach((point) => {
      const id: string = point.get('id');

      switch (id) {
        case `${OlCustomPropertyNames.PRINT_POINT}0`: {
          point.getGeometry().setCoordinates(topLeft);
          break;
        }
        case `${OlCustomPropertyNames.PRINT_POINT}1`: {
          point.getGeometry().setCoordinates(topRight);
          break;
        }
        case `${OlCustomPropertyNames.PRINT_POINT}2`: {
          point.getGeometry().setCoordinates(bottomRight);
          break;
        }
        case `${OlCustomPropertyNames.PRINT_POINT}3`: {
          point.getGeometry().setCoordinates(bottomLeft);
          break;
        }
        default: {
          exhaustiveCheck(id as never);
        }
      }
    });

    // Rotate point coordinate needs to take the resolution into account,
    // in order to have a consistent length regardless of zoom level.
    const view: View = this.getMap().getView();
    const rotatePointCoordinate: vec2 = getRotatePoint(coordinates.map(toVec2), view.getResolution(), this.angle);
    this.rotatePoint.getGeometry().setCoordinates(toCoordinate(rotatePointCoordinate));
  }

  /**
   * Given the feature at current pixel, determine which action to perform.
   *
   * @param e - the map browser event.
   */
  private getCurrentAction(e: MapBrowserEvent): Actions {
    // No need to proceed when there is no features present.
    // This would return false on the function, i.e. preventDefaulted,
    // so it'll be dispatching the event to the other interaction (move map, zoom, etc).
    const featuresNearby: Array<FeatureLike> = this.getMap().getFeaturesAtPixel(e.pixel, hitTolerance10px);
    if (featuresNearby.length === 0) {
      return Actions.IDLE;
    }

    // The topmost feature from the list is usually the target.
    this.topmostFeature = featuresNearby[0];
    const topmostFeatureId: string = this.topmostFeature.get('id');

    // For features that are not part of the area,
    // they don't have ids, therefore do not proceed.
    if (!topmostFeatureId) {
      return Actions.IDLE;
    }

    if (topmostFeatureId === OlCustomPropertyNames.PRINT_RECT) {
      return Actions.TRANSLATE;
    }

    if (topmostFeatureId === OlCustomPropertyNames.PRINT_ROTATE_POINT) {
      return Actions.ROTATE;
    }

    if (topmostFeatureId.startsWith(OlCustomPropertyNames.PRINT_POINT)) {
      return Actions.SCALE;
    }

    return Actions.IDLE;
  }

  /**
   * Reset temporary values so that the next action
   * can be performed from the initial state of the transformed coordinates.
   *
   */
  private resetState(): void {
    switch (this.action) {
      case Actions.TRANSLATE: {
        this.translateX = 0;
        this.translateY = 0;
        break;
      }
      case Actions.ROTATE: {
        // Note: angle is preserved because
        // it is going to be used as reference for scaling,
        // otherwise the angle had to be calculated again.
        break;
      }
      case Actions.SCALE: {
        this.scaleAnchor = undefined;
        break;
      }
      case Actions.IDLE:
      default:
    }

    // Reset the overall temporary values.
    this.startWidth = 0;
    this.startHeight = 0;
    this.topmostFeature = undefined;
    this.startCoordinate = [0, 0];
    this.startCenter = [0, 0];
    this.startCoordinates = [];
    this.action = Actions.IDLE;
  }
}
