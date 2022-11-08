/* eslint-disable max-lines */
import {
  CallbackProperty, Cartesian2, Cartesian3,
  ColorMaterialProperty, ConstantPositionProperty, ConstantProperty, CustomDataSource,
  Entity, EntityCollection, Event as CesiumEvent,
  JulianDate,
  ScreenSpaceEventHandler, ScreenSpaceEventType,
  Viewer,
  defined,
  HeightReference,
  Ellipsoid,
  NearFarScalar,
  VerticalOrigin,
  Model,
  HeadingPitchRoll,
  Transforms,
  Math as CesiumMath,
  Matrix4,
  BoundingSphere,
} from 'cesium';
import { Geometry } from 'ol/geom';
import Color from 'color';
import { INVALID, OlCustomPropertyNames } from '^/components/ol/constants';
import { createGeometryFromLocations,
  getImperialMeasurementFromGeometry,
  getImperialMeasurementUnitFromGeometryType,
  getMeasurementFromGeometry,
  getMeasurementUnitFromGeometryType,
} from '^/components/ol/contentTypeSwitch';
import {
  ADD_POINT_PREFIX,
  CONFIRM_MEASUREMENT_ID,
  DRAGGING_LABEL_LAYER, DRAGGING_POINT_PREFIX,
  DRAWING_MEASUREMENT_ID,
  EDITING_LAYER_ID,
  ESS_INNER_CIRCLE_SIZE_MEDIUM,
  ESS_INNER_CIRCLE_SIZE_SMALL,
  ESS_INNER_CIRCLE_SIZE_THRESHOLD,
  ESS_INNER_CIRCLE_WIDTH,
  ESS_INNER_CIRCLE_WIDTH_LAST,
  ESS_MODEL_WORK_RADIUS_RADIUS,
  ESS_MODEL_EDITING_LAYER_ID,
  ESS_MODEL_RADIUS_ID,
  ESS_TEXT_EDITOR_ID,
  LENGTH_SEGMENTS_LAYER,
  MINIMUM_POINTS_FOR_POLYGON,
  MINIMUM_POINTS_FOR_POLYLINE,
  ESS_MODEL_WORK_RADIUS_LABEL,
  ESS_MODEL_HEADING_ARROW_BODY_ID,
  ESS_MODEL_HEADING_CONTROLS,
} from '^/constants/cesium';
import dsPalette from '^/constants/ds-palette';
import { commonConstants } from '^/constants/map-display';
import { FontFamily } from '^/constants/styles';
import { L10nFn } from '^/hooks';
import * as T from '^/types';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { isRoleViewer } from '^/utilities/role-permission-check';
import {
  createCustomLayer,
  deleteCustomLayer,
  getCesiumColor,
  getCustomLayer,
  getLonLatFromPosition,
  getLonLatAltFromPosition,
  getMeshOrTerrainPosition,
  getPositionOnTerrain,
  getTitlePosition,
  getRGBOfEntity,
  makeCesiumId,
  makeCesiumType,
  parseLastNumberFrom,
} from '../cesium-util';
import {
  createCesiumPlusIcon,
  createCesiumSelectPointOptions,
  createCesiumTextItemSelectPointOptions,
  getCesiumContentEditingOptions,
  getConfirmationPointOptions,
} from '../styles';

import Text from './text';
import { calcSlopeOfLength } from '^/utilities/math';
import { Coordinate } from 'ol/coordinate';
import { calculateDistance, determineUnitType } from '^/utilities/imperial-unit';

const enum Overlay {
  SEGMENT,
  DRAGGING,
  TEXT_EDITOR,
}

const enum Label {
  TOTAL_AREA,
  TOTAL_DISTANCE,
  LENGTH_SEGMENT,
  TEXT_EDITOR,
}

type OnDragRadius = (isDragging: boolean, id: number, angle: number, deltaAngle: number) => void;
export interface OnDragRadiusEvent extends CesiumEvent {
  raiseEvent: OnDragRadius;
  addEventListener(listener: OnDragRadius): CesiumEvent.RemoveCallback;
  removeEventListener(listener: OnDragRadius): boolean;
}

const ESS_MODEL_RADIUS_ALPHA: number = 0.3;
const ESS_MODEL_RADIUS_RADIUS: number = 5;
const SEGMENT_CLASSNAME: string = `${OlCustomPropertyNames.OL_REALTIME_MEASUREMENT_TOOLTIP_LENGTH_CLASSNAME}`
  + ` ${OlCustomPropertyNames.OL_LOADING_TOOLTIP_SMALL}`;
const DRAGGING_LABEL_CLASSNAME: string = OlCustomPropertyNames.OL_REALTIME_MEASUREMENT_TOOLTIP_CLASSNAME;

/* eslint-disable no-magic-numbers */
const LABEL_OFFSET: [number, number] = [16, 2];
const LABEL_OVERLAP_THRESHOLD: number = 20;
const LABEL_OVERLAP_OFFSET: [number, number] = [-12, -38];
const TEXT_EDITOR_OFFSET: [number, number] = [-16, -2];
const NEXT_FRAME_DELAY: number = 0;
const CONFIRMATION_SNAP_THRESHOLD_PX: number = 10;
/* eslint-enable no-magic-numbers */

// TODO: These are temporary styles,
// will use the actual style from OlMeasurementBox
// once it gets refactored to be able to use in 3D as well.
const titleStyle: Partial<CSSStyleDeclaration> = {
  padding: '8px',
  fontFamily: FontFamily.NOTOSANS,
  fontSize: '10px',
  fontWeight: 'bold',
  fontStretch: 'normal',
  fontStyle: 'normal',
  pointerEvents: 'auto',
  cursor: 'pointer',
};

/**
 * Gets the locations from the entity itself
 * depending on the entity type.
 */
const getLocationsFromEntity: (entity: Entity | undefined) => Cartesian3[] | undefined = (entity) => {
  if (!entity) return undefined;

  if (entity.polyline) {
    const selectedLocations: Cartesian3[] | undefined = entity.polyline?.positions?.getValue(new JulianDate(0));
    if (selectedLocations && selectedLocations.length > 0) {
      // Chances are the first and last position is the same.
      // This means it comes from a polygon-like entity with a polyline instance.
      // Remove the duplicate position.
      return selectedLocations[0].equals(selectedLocations[selectedLocations.length - 1])
        ? selectedLocations.slice(0, selectedLocations.length - 1)
        : selectedLocations;
    }
  } else {
    // For entities that don't have a polyline,
    // the current position itself is the locations.
    const selectedLocation: Cartesian3 | undefined = entity.position?.getValue(new JulianDate(0));
    if (selectedLocation) {
      return [selectedLocation];
    }
  }

  return [];
};

/**
 * Calculates the mid position in a list of locations.
 *
 * @param location The location itself.
 * @param index The index of the location in the list.
 * @param locations The locations itself.
 */
const getMidLocations: (location: Cartesian3, index: number, locations: Cartesian3[]) => Cartesian3 = (
  location, index, locations,
) => {
  // If it's the end of the list, compare with the first location
  // since it's supposed to be a loop.
  const nextLocation: Cartesian3 = index === locations.length - 1
    ? locations[0]
    : locations[index + 1];

  return Cartesian3.lerp(location, nextLocation, 1 / 2, new Cartesian3());
};

/**
 * Creates or retrieves the specified label element.
 */
const getOrCreateLabel: (
  params: { parent: HTMLElement; className?: string; identifier?: number | string; style?: Partial<CSSStyleDeclaration>; onClick?(): void },
) => HTMLElement = (
  { parent, className, identifier, style, onClick },
) => {
  const elemId: string = `${LENGTH_SEGMENTS_LAYER}-${identifier ?? 'default'}`;
  const elem: HTMLElement | null = document.getElementById(elemId);
  if (!elem) {
    const newElem: HTMLElement = document.createElement('div');
    newElem.id = elemId;
    newElem.style.position = 'absolute';
    newElem.style.pointerEvents = 'none';
    newElem.style.cursor = 'auto';

    if (className) newElem.className = className;
    if (style) {
      // TODO: There's an issue with Typescript iterating through setting native style.
      // It had to be done this way.
      // https://stackoverflow.com/a/50506154
      Object.keys(style).forEach((key) => {
        (newElem as any).style[key] = style[key as any];
      });
    }

    if (onClick) {
      newElem.addEventListener('click', onClick);
    }

    const valueElem: HTMLParagraphElement = document.createElement('p');
    newElem.appendChild(valueElem);
    parent.appendChild(newElem);

    return newElem;
  }

  return elem;
};

/**
 * Determines whether the entity allows interaction.
 *
 * @param entity.
 */
const isEntityInteractible: (entity: Entity | undefined) => boolean | undefined = (entity) => entity?.name?.includes(T.ContentType.MARKER) ||
    entity?.name?.includes(T.ContentType.LENGTH) ||
    entity?.name?.includes(T.ContentType.AREA) ||
    entity?.name?.includes(T.ContentType.VOLUME) ||
    entity?.name?.includes(T.ContentType.ESS_MODEL) ||
    entity?.name?.includes(T.ContentType.ESS_ARROW) ||
    entity?.name?.includes(T.ContentType.ESS_POLYGON) ||
    entity?.name?.includes(T.ContentType.ESS_POLYLINE) ||
    entity?.name?.includes(T.ContentType.ESS_TEXT);

const isEntityHoverable: (entity: Entity | undefined) => boolean | undefined
  = (entity) => isEntityInteractible(entity) || entity?.name === ESS_MODEL_HEADING_CONTROLS;

/**
 * Markers and ESS models don't need confirmation point,
 * unlike the rest of the drawing mode.
 *
 * @param mode Drawing mode.
 */
const requiresDrawingSetup: (mode: T.LocationBasedContentType | undefined) => boolean = (mode) => {
  switch (mode) {
    case T.ContentType.MARKER:
    case T.ContentType.ESS_MODEL:
    case T.ContentType.ESS_TEXT:
    case undefined: {
      return false;
    }
    default: {
      return true;
    }
  }
};

export default class CesiumInteraction {
  public readonly onClick: CesiumEvent;
  public readonly onSelect: CesiumEvent;
  public readonly onMouseMove: CesiumEvent;
  public readonly onHover: CesiumEvent;
  public readonly onDrag: CesiumEvent;
  public readonly onDragRadius: OnDragRadiusEvent;
  public readonly onEndDrawing: Record<T.LocationBasedContentType, CesiumEvent>;
  public readonly onCreateSegment: CesiumEvent;
  public readonly elevations: Map<number | string, Map<number, number>> = new Map();
  public readonly distances: Map<number | string, Map<number, number>> = new Map();
  public readonly destroy: () => void;
  public isCreating: boolean = false;
  public isDragging: boolean = false;
  public isDraggingRadius: boolean = false;
  public dragAngle: number = 0;
  public draggingOffset: Cartesian3 | undefined;
  private readonly handler: ScreenSpaceEventHandler;
  private readonly viewer: Viewer;
  private readonly editingLayer: CustomDataSource;
  private readonly ESSModelEditingLayer: CustomDataSource;
  private readonly segmentsLayer: HTMLElement;
  private readonly draggingLayer: HTMLElement;
  private readonly isRoleViewer: boolean;
  private readonly l10n: L10nFn;
  private readonly unitType: T.UnitType;
  private readonly lengthUnit: string;
  private readonly areaUnit: string;
  private _clicked: Cartesian3 | undefined;
  private _mousePosition: Cartesian3 | undefined;
  private _selectedEntity: Entity | undefined;
  private _hoveredEntity: Entity | undefined;
  private _draggingEntity: Entity | undefined;
  private _drawingMode: T.LocationBasedContentType | undefined;
  private editingIndex: number = NaN;
  private prevRenderedEntity: Entity | undefined;
  private isDraggingPlus: boolean = false;
  private isDraggingESSModel: boolean = false;
  private drawingEntity: Entity | undefined;
  private confirmationEntity: Entity | undefined;
  private selectedLocations: Cartesian3[] | undefined;
  private hoveredLocations: Cartesian3[] | undefined;
  private drawnLocations: Cartesian3[] = [];
  private isSnapping: boolean = false;
  private firstDrawnPoint: Cartesian3 | undefined;
  private initialDragAngle: number = NaN;
  private textEditorElem: HTMLElement | undefined;
  private segmentLayerCallback: undefined | (() => void);
  private draggingLayerCallback: undefined | (() => void);
  private textEditorLayerCallback: undefined | (() => void);

  public constructor(viewer: Viewer, role: T.PermissionRole, l10n: L10nFn, unit: T.ValidUnitType) {
    this.l10n = l10n;
    this.viewer = viewer;
    this.handler = new ScreenSpaceEventHandler(this.viewer.canvas);
    this.onClick = new CesiumEvent();
    this.onSelect = new CesiumEvent();
    this.onMouseMove = new CesiumEvent();
    this.onHover = new CesiumEvent();
    this.onDrag = new CesiumEvent();
    this.onDragRadius = new CesiumEvent();
    this.onEndDrawing = {
      [T.ContentType.MARKER]: new CesiumEvent(),
      [T.ContentType.LENGTH]: new CesiumEvent(),
      [T.ContentType.AREA]: new CesiumEvent(),
      [T.ContentType.VOLUME]: new CesiumEvent(),
      [T.ContentType.ESS_ARROW]: new CesiumEvent(),
      [T.ContentType.ESS_POLYGON]: new CesiumEvent(),
      [T.ContentType.ESS_POLYLINE]: new CesiumEvent(),
      [T.ContentType.ESS_MODEL]: new CesiumEvent(),
      [T.ContentType.ESS_TEXT]: new CesiumEvent(),
    };
    this.onCreateSegment = new CesiumEvent();
    this.isRoleViewer = isRoleViewer(role);
    this.unitType = unit;
    this.lengthUnit = (this.unitType === T.UnitType.IMPERIAL) ?
      getImperialMeasurementUnitFromGeometryType({ geometryType: T.ContentType.LENGTH }) :
      getMeasurementUnitFromGeometryType({ geometryType: T.ContentType.LENGTH });
    this.areaUnit = (this.unitType === T.UnitType.IMPERIAL) ?
      getImperialMeasurementUnitFromGeometryType({ geometryType: T.ContentType.AREA }) :
      getMeasurementUnitFromGeometryType({ geometryType: T.ContentType.AREA });

    // Pause the hover detection when camera is panning.
    let isPanning: boolean = false;
    const removeCameraMoveStartEvent: CesiumEvent.RemoveCallback = viewer.camera.moveStart.addEventListener(() => isPanning = true);
    const removeCameraMoveEndEvent: CesiumEvent.RemoveCallback = viewer.camera.moveEnd.addEventListener(() => isPanning = false);

    this.handler.setInputAction(({ position }: { position: Cartesian2 }) => {
      if (!defined(this.viewer) || this.viewer.isDestroyed() || this.isRoleViewer) return;

      // For every interaction, flush the render queue
      // because the interaction may/may not require re-rendering.
      this.viewer.scene.requestRender();

      this.clicked = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(position), this.viewer.scene);
      const pickedObject: { id?: Entity } | undefined = viewer.scene.pick(position);

      if (this.drawingMode !== undefined && this.clicked) {
        const isDrawingDone: boolean = pickedObject?.id?.id === CONFIRM_MEASUREMENT_ID || !requiresDrawingSetup(this.drawingMode);
        if (isDrawingDone) {
          // When no drawing setup, the only clicked position is the final locations.
          const locations: Cartesian3[] = requiresDrawingSetup(this.drawingMode) ? this.drawnLocations : [this.clicked];
          this.onEndDrawing[this.drawingMode].raiseEvent(locations);

          // When newly created content is made,
          // set to the selection mode immediately.
          const onEntityCreated: (collection: EntityCollection, added: Entity[]) => void = (_, added) => {
            if (!defined(this.viewer) || this.viewer.isDestroyed()) return;

            // This timeout is needed because when the new entity is added,
            // the rendering and this function may happen at the same time,
            // and the selection might not happen.
            // Moving the execution to the next frame solved the issue.
            setTimeout(() => {
              this.selectedEntity = added[0];
              this.isCreating = false;

              this.viewer.scene.requestRender();
            }, NEXT_FRAME_DELAY);

            // Remove the callback immediately since it's no longer neded.
            this.viewer.entities.collectionChanged.removeEventListener(onEntityCreated);
          };

          this.viewer.entities.collectionChanged.addEventListener(onEntityCreated);

          // Certain side effects need to be run
          // when an entity has just been created,
          // this flag allows that.
          this.isCreating = true;
        } else {
          // Store the first drawn location manually this way, because
          // Cesium for some reason changed the point values sometimes..
          if (this.drawnLocations.length === 0) {
            this.firstDrawnPoint = new Cartesian3(this.clicked.x, this.clicked.y, this.clicked.z);
          }

          this.drawnLocations.push(this.clicked);

          // Length segment requires slope calculation,
          // send an event to run the side effect.
          if (requiresDrawingSetup(this.drawingMode)) {
            this.onCreateSegment.raiseEvent(this.drawingMode, this.clicked, this.drawnLocations.length - 1);
          }
        }

        return;
      }

      // There's a chance that user clicks the dragging nodes while still selecting.
      // In that case, do not update the state since it does not change.
      if (pickedObject?.id?.name?.includes(DRAGGING_POINT_PREFIX)) {
        return;
      }

      // Not all entities can be selected.
      this.selectedEntity = isEntityInteractible(pickedObject?.id) ? pickedObject?.id : undefined;
    }, ScreenSpaceEventType.LEFT_CLICK);

    this.handler.setInputAction(({ position }: { position: Cartesian2 }) => {
      if (!defined(this.viewer) || this.viewer.isDestroyed() || this.isRoleViewer) return;

      // For every interaction, flush the render queue
      // because the interaction may/may not require re-rendering.
      this.viewer.scene.requestRender();

      const pickedObject: { id?: Entity } = viewer.scene.pick(position);

      this.isDraggingPlus = !!pickedObject?.id?.id?.includes(ADD_POINT_PREFIX);

      // Radius covers both the arrow and the radius,
      // although only the arrow moves when it's being dragged.
      this.isDraggingRadius = !!this.selectedEntity
        && (pickedObject?.id?.id === this.ESSModelRadiusId || !!pickedObject?.id?.id?.includes(this.ESSModelHeadingArrowId));

      // Avoid clicking another model and thinking that it's still dragging,
      // in fact it's just changing the selection.
      this.isDraggingESSModel = !!this.selectedEntity?.name?.includes(T.ContentType.ESS_MODEL)
        && this.selectedEntity?.id === pickedObject?.id?.id;

      this.isDragging = !!pickedObject?.id?.name?.includes(DRAGGING_POINT_PREFIX) || this.isDraggingESSModel || this.isDraggingRadius;

      if (this.isDragging) {
        this.draggingOffset = this.selectedLocations && this.mousePosition
          ? Cartesian3.subtract(this.selectedLocations[0], this.mousePosition, new Cartesian3(0, 0, 0))
          : undefined;
        // Disable panning and other controls so that
        // dragging keeps the camera in the same place.
        viewer.scene.screenSpaceCameraController.enableInputs = false;
        this.draggingEntity = pickedObject?.id;

        if (this.isDraggingRadius) {
          return;
        }

        this.editingIndex = this.selectedLocations?.length === 1 ? 0 : parseLastNumberFrom(pickedObject?.id?.id);
        this.showOverlay(Overlay.DRAGGING);

        if (this.selectedId) {
          if (this.isDraggingESSModel) {
            this.clearESSModelEditingNodes();
          }

          // Reset the elevation data until it is done dragging.
          // This is because when dragging, it does not have the most updated elevation,
          // so the live calculation is going to be misleading.
          // Once dragging is done, the new elevation data is requested and the value will be updated.
          const selectedElevations: Map<number, number> | undefined = this.elevations.get(this.selectedId);
          if (selectedElevations) {
            selectedElevations.delete(this.editingIndex);
          }

          // Whenever a plus sign is dragged/clicked,
          // The editing polygons need to have the new corner and the plus sign as well.
          if (this.isDraggingPlus) {
            const locations: Cartesian3[] | undefined = this.editingLocations;
            if (!locations) return;

            // Regardless of where the new node is added on a polygon/polyline,
            // it will still be sorted by the editing index, so the missing nodes
            // will always be at the end. Add them accordingly.
            const lastCornerIndex: number = locations.length - 1;
            const plusIndex: number = this.isSelectingPolygon
              ? lastCornerIndex
              : lastCornerIndex - 1;

            this.addCornerNode(this.selectedId, lastCornerIndex);
            this.addPlusNode(this.selectedId, plusIndex);
          }
        }
      }
    }, ScreenSpaceEventType.LEFT_DOWN);

    this.handler.setInputAction(() => {
      if (!defined(this.viewer) || this.viewer.isDestroyed() || this.isRoleViewer) return;

      // For every interaction, flush the render queue
      // because the interaction may/may not require re-rendering.
      this.viewer.scene.requestRender();

      if (this.isDragging) {
        this.hideOverlay(Overlay.DRAGGING);

        this.draggingEntity = undefined;
        this.selectedLocations = this.editingLocations;
        this.editingIndex = NaN;
        this.isDragging = false;
        this.isDraggingPlus = false;

        // Clear the selection after dragging the radius
        // to make the behavior consistent with the rest of the dragging interactions.
        if (this.isDraggingRadius) {
          this.clearESSModelEditingNodes();
          this.isDraggingRadius = false;
          this.selectedEntity = undefined;
        }

        // Update the actual title position after dragging,
        // because locations have changed and title position is based on the locations.
        if (this.renderedEntity && this.renderedEntity.position instanceof CallbackProperty) {
          this.renderedEntity.position = new ConstantPositionProperty(this.titlePosition);
        }

        viewer.scene.screenSpaceCameraController.enableInputs = true;
      }
    }, ScreenSpaceEventType.LEFT_UP);

    this.handler.setInputAction((movement: T.CesiumMovement) => {
      if (!defined(this.viewer) || this.viewer.isDestroyed()) return;

      // Pause all hover effects when panning for performance reason
      // user is focusing on the panning anyway.
      if (isPanning) return;

      // For every interaction, flush the render queue
      // because the interaction may/may not require re-rendering.
      this.viewer.scene.requestRender();

      // Picking the globe position instead of the ellipsoid because
      // it needs to take the globe curve and the terrain into the account.
      const position: Cartesian3 | undefined = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(movement.endPosition), this.viewer.scene);
      if (position) {
        this.mousePosition = position;

        // When the mouse position is nearby the first drawn point,
        // it is assumed that the user wants to complete the polygon.
        this.isSnapping = this.needsSnapping
          && this.firstDrawnPoint !== undefined
          && this.drawnLocations.length >= this.minimumPoints
          && this.isPointNearby(this.mousePosition, this.firstDrawnPoint);
      }

      // Also there is no need to run the hover effects when drawing.
      // The mouse position is still needed though.
      if (this.drawingMode !== undefined) return;

      const pickedObject: { id: Entity | undefined } | undefined = viewer.scene.pick(movement.endPosition);
      this.hoveredEntity = isEntityHoverable(pickedObject?.id) ? pickedObject?.id : undefined;

      // Only proceed with these hover actions if it's not selected,
      // because it involves showing length segments which is already shown
      // when selected.
      if (this.selectedId) {
        // When dragging the radius,
        // calculate the angle between the selected location
        // and the mouse position.
        if (this.isDraggingRadius) {
          const currentPosition: Cartesian3 | undefined = this.selectedLocations?.[0];
          if (position && currentPosition) {
            // To get the angle of the mouse position relative to the north,
            // get the direction of the mouse position by transforming the point
            // by the inverted matrix of the center in ENU, and get the angle from it.
            // https://gis.stackexchange.com/a/346037
            const localFrame = Transforms.eastNorthUpToFixedFrame(position);
            const inversedLocalFrame = Matrix4.inverse(localFrame, new Matrix4());
            const directionLocal = Matrix4.multiplyByPoint(inversedLocalFrame, currentPosition, new Cartesian3());
            this.dragAngle = Math.PI + Math.atan2(directionLocal.x, directionLocal.y);
          }
        }

        return;
      }

      if (this.hoveredEntity) {
        this.showOverlay(Overlay.SEGMENT);
      } else {
        this.hideOverlay(Overlay.SEGMENT);
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);

    this.draggingOffset = undefined;

    // Initializing the CustomDataSource layer for
    // the editing layer has to be done this way because
    // creating a data source is an async operation.
    // Not the best solution.
    createCustomLayer(this.viewer, EDITING_LAYER_ID);
    createCustomLayer(this.viewer, ESS_MODEL_EDITING_LAYER_ID);

    const layer: CustomDataSource | undefined = getCustomLayer(this.viewer, EDITING_LAYER_ID);
    if (!layer) {
      throw new Error(`Not found: ${EDITING_LAYER_ID}.`);
    }
    this.editingLayer = layer;

    const ESSModelEditingLayer: CustomDataSource | undefined = getCustomLayer(this.viewer, ESS_MODEL_EDITING_LAYER_ID);
    if (!ESSModelEditingLayer) {
      throw new Error(`Not found: ${ESS_MODEL_EDITING_LAYER_ID}.`);
    }
    this.ESSModelEditingLayer = ESSModelEditingLayer;

    const segmentsLayerDom: HTMLElement | null = document.getElementById(LENGTH_SEGMENTS_LAYER);
    if (!segmentsLayerDom) {
      throw new Error(`Not found: ${LENGTH_SEGMENTS_LAYER}.`);
    }
    this.segmentsLayer = segmentsLayerDom;

    const draggingLabelDom: HTMLElement | null = document.getElementById(DRAGGING_LABEL_LAYER);
    if (!draggingLabelDom) {
      throw new Error(`Not found: ${DRAGGING_LABEL_LAYER}.`);
    }
    this.draggingLayer = draggingLabelDom;

    // When an entity is removed, all the editing nodes should be cleared.
    // This has to be done automatically since the editing nodes are separated
    // from the component.
    const onEntityRemoved: (_: EntityCollection, __: Entity[], removed: Entity[]) => void = (_, __, removed) => {
      if (!defined(this.viewer) || this.viewer.isDestroyed()) return;

      if (this.selectedEntity?.id !== undefined && this.selectedEntity.id === removed[0]?.id) {
        // This timeout is needed because when an entity is removed,
        // the rendering and this function may happen at the same time,
        // and the deselection might not happen.
        // Moving the execution to the next frame solved the issue.
        setTimeout(() => {
          this.selectedEntity = undefined;
          viewer.scene.requestRender();
        }, NEXT_FRAME_DELAY);
      }
    };

    this.viewer.entities.collectionChanged.addEventListener(onEntityRemoved);

    this.destroy = () => {
      if (this.viewer.isDestroyed()) return;

      this.handler.destroy();
      this.elevations.clear();
      this.distances.clear();
      this.viewer.entities.collectionChanged.removeEventListener(onEntityRemoved);

      // In the event of destroying the instance
      // before these callbacks are cleared,
      // clear them manually.
      this.hideOverlay(Overlay.SEGMENT);
      this.hideOverlay(Overlay.DRAGGING);
      this.hideOverlay(Overlay.TEXT_EDITOR);

      removeCameraMoveStartEvent();
      removeCameraMoveEndEvent();
      deleteCustomLayer(this.viewer, EDITING_LAYER_ID);
      deleteCustomLayer(this.viewer, ESS_MODEL_EDITING_LAYER_ID);
    };
  }

  public get clicked(): Cartesian3 | undefined {
    return this._clicked;
  }

  public set clicked(position: Cartesian3 | undefined) {
    this._clicked = position;
    this.onClick.raiseEvent(position);
  }

  public get selectedEntity(): Entity | undefined {
    return this._selectedEntity;
  }

  public set selectedEntity(entity: Entity | undefined) {
    // Do not proceed with selection if it's the same entity.
    if (this._selectedEntity?.id === entity?.id) return;
    // If the type of previously selected entity is ESS_TEXT,
    // the default billboard icon with label of previously selected entity should be displayed
    // instead of text editor and billboard icon with draggable node
    if (this._selectedEntity?.name?.includes((T.ContentType.ESS_TEXT))) this._selectedEntity.show = true;

    // Get the selected locations
    // from the entity itself before anything else,
    // to get the current state of the entity positions.
    this.selectedLocations = getLocationsFromEntity(entity);

    this._selectedEntity = entity;
    this.onSelect.raiseEvent(this.selectedId, entity?.name ? entity.name.includes('ess') : false);

    // Clean up selection regardless of the state.
    this.editingLayer.entities.removeAll();
    this.clearESSModelEditingNodes();
    this.hideOverlay(Overlay.SEGMENT);
    this.hideOverlay(Overlay.TEXT_EDITOR);

    if (this.selectedId) {
      this.drawEditingNodes(this.selectedId);
      this.showOverlay(Overlay.SEGMENT);
    }
  }

  public get selectedId(): number | undefined {
    return this.selectedEntity?.id ? parseLastNumberFrom(this.selectedEntity.id) : undefined;
  }

  public get isSelectingPolygon(): boolean {
    switch (this.renderedEntity?.name) {
      case makeCesiumType(T.ContentType.AREA):
      case makeCesiumType(T.ContentType.ESS_POLYGON): {
        return true;
      }
      default: {
        return false;
      }
    }
  }

  public get mousePosition(): Cartesian3 | undefined {
    return this._mousePosition;
  }

  public set mousePosition(position: Cartesian3 | undefined) {
    this._mousePosition = position;
    this.onMouseMove.raiseEvent(position);
  }

  public get hoveredEntity(): Entity | undefined {
    return this._hoveredEntity;
  }

  public set hoveredEntity(entity: Entity | undefined) {
    // Do not proceed with hover if it's the same entity.
    if (this._hoveredEntity?.id === entity?.id) return;

    this.hoveredLocations = getLocationsFromEntity(entity);
    this._hoveredEntity = entity;
    this.onHover.raiseEvent(entity);
  }

  public get hoveredId(): number | undefined {
    return this.hoveredEntity?.id ? parseLastNumberFrom(this.hoveredEntity.id) : undefined;
  }

  public get draggingEntity(): Entity | undefined {
    return this._draggingEntity;
  }

  public set draggingEntity(entity: Entity | undefined) {
    const id: number = parseLastNumberFrom(this._draggingEntity?.id ?? entity?.id);
    this._draggingEntity = entity;

    if (entity) {
      this.initialDragAngle = this.dragAngle;
    }

    if (this.isDraggingRadius) {
      this.onDragRadius.raiseEvent(!!entity, id, this.dragAngle, this.dragAngle - this.initialDragAngle);
    } else {
      this.onDrag.raiseEvent(entity, this.mousePosition);
    }
  }

  public get drawingMode(): T.LocationBasedContentType | undefined {
    return this._drawingMode;
  }

  public set drawingMode(mode: T.LocationBasedContentType | undefined) {
    // Make it efficient by not reinitializing the same drawing mode.
    if (this._drawingMode === mode) return;

    this._drawingMode = mode;
    this.drawnLocations = [];
    this.selectedEntity = undefined;

    // Clean up the previous drawing mode regardless.
    if (this.drawingEntity && this.confirmationEntity) {
      this.viewer.entities.remove(this.drawingEntity);
      this.viewer.entities.remove(this.confirmationEntity);
      this.drawingEntity = undefined;
      this.confirmationEntity = undefined;

      this.hideOverlay(Overlay.SEGMENT);
      this.hideOverlay(Overlay.DRAGGING);

      if (this.shouldShow(Label.LENGTH_SEGMENT)) {
        this.elevations.delete(DRAWING_MEASUREMENT_ID);
        this.distances.delete(DRAWING_MEASUREMENT_ID);
      }
    }

    // Do not proceed with drawing when it's selecting.
    if (mode === undefined) return;

    // User starts the drawing mode.
    // However, not all mode requires the drawing mode...
    if (requiresDrawingSetup(mode)) {
      this.drawingEntity = this.viewer.entities.add(
        getCesiumContentEditingOptions({
          id: DRAWING_MEASUREMENT_ID,
          type: mode,
          callbackPosition: () => this.renderedDrawnLocations,
        }),
      );

      this.confirmationEntity = this.viewer.entities.add({
        id: CONFIRM_MEASUREMENT_ID,
        position: new CallbackProperty(() => {
          // The position of the confirmation entity depends on how many points
          // required to create a measurement.
          const count: number = this.drawnLocations.length;

          // When snapping happens, instead of the last point,
          // it is on the first point, since it has to complete the polygon.
          if (count >= this.minimumPoints) {
            const positionIndex: number = this.isSnapping ? 0 : count - 1;

            return this.drawnLocations[positionIndex];
          }

          return undefined;
        // TODO: Any is casted due to Cesium type error, position property
        // should have been able to accept CallbackProperty as well.
        }, false) as any,
        billboard: getConfirmationPointOptions(),
      });

      this.showOverlay(Overlay.SEGMENT);
      this.showOverlay(Overlay.DRAGGING);

      if (this.shouldShow(Label.LENGTH_SEGMENT)) {
        this.elevations.set(DRAWING_MEASUREMENT_ID, new Map());
        this.distances.set(DRAWING_MEASUREMENT_ID, new Map());
      }
    }

    // ESS models require a different setup,
    // so run them manually.
    this.drawESSModelEditingNodes();
  }

  /**
   * Gets the currently edited locations. This is specifically
   * the locations when user has selected an entity and edits/drags the location(s).
   */
  public get editingLocations(): Cartesian3[] | undefined {
    if (!this.selectedLocations || !this.mousePosition) {
      return undefined;
    }

    if (isNaN(this.editingIndex)) {
      return this.selectedLocations;
    }

    const editedLocation: Cartesian3 = this.mousePosition;

    // When plus is dragging, it's an extra location in the rendered locations.
    if (this.isDraggingPlus) {
      return this.selectedLocations.reduce<Cartesian3[]>((total, location, index) => {
        total.push(location);

        if (index === this.editingIndex) {
          total.push(editedLocation);
        }

        return total;
      }, []);
    }

    // Otherwise, just swap the currently edited location with the mouse position.
    return this.selectedLocations.map((location, index) => index === this.editingIndex ? editedLocation : location);
  }

  /**
   * Gets the currently rendered locations depending on the mode.
   * Drawing takes the most priority since user can't select or hover when drawing.
   * If they're not drawing, the next priority is selecting since they can't hover when selecting.
   * The last priority is hovering, or not rendering anything at all,
   * in which the entity itself is rendering the locations from the store.
   */
  private get renderedLocations(): Cartesian3[] {
    return this.renderedDrawnLocations
      ?? this.editingLocations
      ?? this.selectedLocations
      ?? this.hoveredLocations
      ?? [];
  }

  private get renderedGeoLocations(): T.GeoPoint[] {
    return this.renderedLocations.map((location) => Object.values(getLonLatAltFromPosition(location)));
  }

  /**
   * Gets the currently rendered entity.
   * It has similar precedence to the renderedLocations.
   */
  private get renderedEntity(): Entity | undefined {
    return this.drawingEntity ?? this.selectedEntity ?? this.hoveredEntity;
  }

  /**
   * Gets the currently drawn locations.
   * The last location is always the mouse position in this case.
   */
  private get renderedDrawnLocations(): Cartesian3[] | undefined {
    if (this.drawingMode === undefined || this.selectedId !== undefined || this.mousePosition === undefined) {
      return undefined;
    }

    const editedLocation: Cartesian3 = this.isSnapping
      ? this.drawnLocations[0]
      : this.mousePosition;

    return this.drawnLocations.concat(editedLocation);
  }

  private get draggingLabelText(): string {
    // The total length comes from the stored distance
    // when calculating distance from each segments.
    if (this.shouldShow(Label.TOTAL_DISTANCE)) {
      const distance: Map<number, number> | undefined = this.distances.get(this.renderedId);
      if (!distance) return '';

      let total: number = 0;
      for (const segmentDistance of distance.values()) {
        total += segmentDistance;
      }

      return `${this.l10n(Text.total)}: ${total.toFixed(2)}${this.lengthUnit}`;
    }

    if (this.shouldShow(Label.TOTAL_AREA)) {
      const geometry: Geometry = createGeometryFromLocations({
        locations: this.renderedGeoLocations,
        geometryType: T.ContentType.AREA,
      });
      const area: string = (this.unitType === T.UnitType.IMPERIAL) ?
        getImperialMeasurementFromGeometry({ geometry, geometryType: T.ContentType.AREA }):
        getMeasurementFromGeometry({ geometry, geometryType: T.ContentType.AREA });

      return `${area}${this.areaUnit}`;
    }

    return '';
  }

  /**
   * Gets the title position depending on the entity.
   * This is technically a business logic.
   */
  private get titlePosition(): Cartesian3 {
    switch (this.renderedEntity?.name) {
      case makeCesiumType(T.ContentType.LENGTH):
      case makeCesiumType(T.ContentType.AREA):
      case makeCesiumType(T.ContentType.VOLUME): {
        return getTitlePosition(this.renderedGeoLocations);
      }
      default: {
        return this.renderedLocations[0];
      }
    }
  }

  private get minimumPoints(): number {
    switch (this.drawingMode) {
      case T.ContentType.ESS_ARROW:
      case T.ContentType.ESS_POLYLINE:
      case T.ContentType.LENGTH: {
        return MINIMUM_POINTS_FOR_POLYLINE;
      }
      case T.ContentType.AREA:
      case T.ContentType.VOLUME:
      case T.ContentType.ESS_POLYGON: {
        return MINIMUM_POINTS_FOR_POLYGON;
      }
      default:
        return NaN;
    }
  }

  /**
   * Whether polygon creation needs to snap to the last point
   * when the mouse is nearby.
   */
  private get needsSnapping(): boolean {
    switch (this.drawingMode) {
      case T.ContentType.AREA:
      case T.ContentType.VOLUME:
      case T.ContentType.ESS_POLYGON: {
        return true;
      }
      default: {
        return false;
      }
    }
  }

  /**
   * Gets the currently rendered id.
   * It has the same precedence as renderedLocations.
   */
  private get renderedId(): number | string {
    return this.drawingMode !== undefined
      ? DRAWING_MEASUREMENT_ID
      : this.selectedId ?? this.hoveredId ?? NaN;
  }

  private get ESSModelRadiusId(): string {
    return `${ESS_MODEL_RADIUS_ID}-${this.selectedId ?? 'drawing'}`;
  }

  private get ESSModelHeadingArrowId(): string {
    return `${ESS_MODEL_HEADING_ARROW_BODY_ID}-${this.selectedId ?? 'drawing'}`;
  }

  private get ESSModelWorkRadius(): number {
    return this.selectedEntity?.properties?.workRadius._value ?? 0;
  }

  private get ESSModelInnerCircleSizeRadius(): number {
    if (this.ESSModelWorkRadius === 0) return 0;

    return Math.max(
      this.ESSModelWorkRadius < ESS_INNER_CIRCLE_SIZE_THRESHOLD
        ? ESS_INNER_CIRCLE_SIZE_SMALL
        : ESS_INNER_CIRCLE_SIZE_MEDIUM,

      ESS_INNER_CIRCLE_SIZE_SMALL,
    );
  }

  public clearESSModelEditingNodes(): void {
    this.ESSModelEditingLayer.entities.removeAll();
  }

  public showESSModelHeadingEditor(boundingSphere: BoundingSphere): void {
    if (this.selectedLocations === undefined || this.selectedEntity === undefined) {
      return;
    }

    const ARROW_HEAD_RATIO = 2;
    const LENGTH_RATIO = 1.2;
    const MIN_RADIUS_SMALL_MODEL = 5;
    const ARROW_WIDTH_RATIO = 15;
    const MIN_ARROW_WIDTH = .5;

    // Get the matrix of the center position in ENU since the offset
    // will be calculated using the local's north frame as the reference.
    const originalCenter = getMeshOrTerrainPosition(this.selectedLocations[0], this.selectedEntity, this.viewer);
    const localFrame = Transforms.eastNorthUpToFixedFrame(originalCenter);
    const length = boundingSphere.radius * LENGTH_RATIO;
    const width = boundingSphere.radius <= MIN_RADIUS_SMALL_MODEL
      ? boundingSphere.radius / ARROW_WIDTH_RATIO
      : MIN_ARROW_WIDTH;

    const getArrowPosition: (radiusOffset: number) => CallbackProperty = (radiusOffset) => new CallbackProperty(() => {
      // Since the center point for the rotation of the cylinder is
      // at the middle of the entity, put back the position depending on the angle.
      // https://community.cesium.com/t/rotate-cone-with-apex-as-center/7258/3
      const offset = new Cartesian3(
        Math.sin(this.dragAngle) * radiusOffset,
        Math.cos(this.dragAngle) * radiusOffset,
        0,
      );

      const offsetTransformed = Matrix4.multiplyByPointAsVector(localFrame, offset, new Cartesian3());

      return Cartesian3.add(originalCenter, offsetTransformed, new Cartesian3());
    }, false);

    // any is casted to these because CesiumJS typing does not accept
    // CallbackProperty as position when it fact it should.
    const arrowBodyPosition = getArrowPosition(length / 2) as any;
    const arrowHeadPosition = getArrowPosition(length) as any;

    const arrowBodyOrientation = new CallbackProperty(() => {
      const hpr: HeadingPitchRoll = new HeadingPitchRoll(this.dragAngle, 0, 0);
      return Transforms.headingPitchRollQuaternion(originalCenter, hpr);
    }, false);

    const arrowHeadOrientation = new CallbackProperty(() => {
      // Rotate Z with 90 to make the cylinder lie flat on the ground.
      // eslint-disable-next-line no-magic-numbers
      const hpr: HeadingPitchRoll = new HeadingPitchRoll(this.dragAngle, 0, CesiumMath.toRadians(90));
      return Transforms.headingPitchRollQuaternion(originalCenter, hpr);
    }, false);

    this.ESSModelEditingLayer.entities.add({
      id: this.ESSModelHeadingArrowId,
      name: ESS_MODEL_HEADING_CONTROLS,
      orientation: arrowBodyOrientation,
      position: arrowBodyPosition,
      box: {
        dimensions: new Cartesian3(width, length, width),
        material: getCesiumColor(dsPalette.themePrimary),
      },
    });

    this.ESSModelEditingLayer.entities.add({
      id: `HEAD-${this.ESSModelHeadingArrowId}`,
      name: ESS_MODEL_HEADING_CONTROLS,
      orientation: arrowHeadOrientation,
      position: arrowHeadPosition,
      cylinder: {
        length: width * ARROW_HEAD_RATIO * 2,
        topRadius: width * ARROW_HEAD_RATIO,
        bottomRadius: 0,
        material: getCesiumColor(dsPalette.themePrimary),
        numberOfVerticalLines: 0,
      },
    });
  }

  public showESSModelWorkRadius(): void {
    if (
      !this.selectedEntity?.model
      || this.selectedId === undefined
      || this.selectedLocations === undefined
      || this.ESSModelWorkRadius === 0
      // Chances are, there's already circles showing. Do not recreate them.
      || this.ESSModelEditingLayer.entities.values.find((c) => c.name === ESS_MODEL_WORK_RADIUS_RADIUS)
    ) return;

    const maxInnerCircleCount = Math.ceil(this.ESSModelWorkRadius / this.ESSModelInnerCircleSizeRadius) + 1;
    let innerCircleCount = maxInnerCircleCount;

    while (--innerCircleCount) {
      const radius: number = Math.min(this.ESSModelWorkRadius, innerCircleCount * this.ESSModelInnerCircleSizeRadius);

      this.ESSModelEditingLayer.entities.add({
        id: `${makeCesiumId(this.selectedId)}-circle-${innerCircleCount}`,
        name: ESS_MODEL_WORK_RADIUS_RADIUS,
        position: this.selectedLocations[0],
        ellipse: {
          semiMajorAxis: radius,
          semiMinorAxis: radius,
          outline: true,
          outlineColor: getCesiumColor(dsPalette.themePrimaryLighter),
          outlineWidth: innerCircleCount === maxInnerCircleCount - 1 ? ESS_INNER_CIRCLE_WIDTH_LAST : ESS_INNER_CIRCLE_WIDTH,
          fill: false,
          // Put the height at 0 because according to Cesium docs,
          // outline can only be shown when height is defined.
          // The height actually isn't really used since the ellipse
          // is being clamped on the ground.
          height: 0,
          heightReference: HeightReference.CLAMP_TO_GROUND,
        },
      });

      // Place the distance label for every radius to the east of the circle.
      // https://community.cesium.com/t/latitude-longitude-to-east-north/11083/2
      const modelCenter = getMeshOrTerrainPosition(this.selectedLocations[0], this.selectedEntity, this.viewer);
      const normal = Ellipsoid.WGS84.geodeticSurfaceNormal(modelCenter);
      const east = Cartesian3.cross(Cartesian3.UNIT_Z, normal, new Cartesian3());
      const normalizedEast = Cartesian3.normalize(east, new Cartesian3());
      const labelOffset = Cartesian3.multiplyByScalar(normalizedEast, radius, new Cartesian3());
      const labelPosition = Cartesian3.add(this.selectedLocations[0], labelOffset, new Cartesian3());

      const displayRadius: number = calculateDistance(radius, determineUnitType(this.unitType));
      const unit: string = (this.unitType === T.UnitType.IMPERIAL) ?
        getImperialMeasurementUnitFromGeometryType({ geometryType: T.ContentType.LENGTH }) :
        getMeasurementUnitFromGeometryType({ geometryType: T.ContentType.LENGTH });

      this.ESSModelEditingLayer.entities.add({
        id: `${makeCesiumId(this.selectedId)}-circle-label-${innerCircleCount}`,
        name: ESS_MODEL_WORK_RADIUS_LABEL,
        position: labelPosition,
        label: {
          text: `${displayRadius.toFixed(0)} ${unit}`,
          font: commonConstants.labelFontStyle,
          verticalOrigin: VerticalOrigin.BOTTOM,
          disableDepthTestDistance: Infinity,
          // eslint-disable-next-line no-magic-numbers
          scaleByDistance: new NearFarScalar(1, 3, 500, 0.1),
        },
      });

      this.viewer.scene.requestRender();
    }
  }

  public hideESSModelWorkRadius(): void {
    if (this.selectedEntity === undefined || !this.selectedEntity.model) return;

    // For some reason, not spreading this caused some of the entities
    // not being deleted. There might be an immutability issue with Cesium
    // so cloning this is needed in order to remove all entities.
    [...this.ESSModelEditingLayer.entities.values].forEach((entity) => {
      if (entity.name === ESS_MODEL_WORK_RADIUS_RADIUS || entity.name === ESS_MODEL_WORK_RADIUS_LABEL) {
        this.ESSModelEditingLayer.entities.remove(entity);

        this.viewer.scene.requestRender();
      }
    });
  }

  private drawEditingNodes(id: number): void {
    const locations: Cartesian3[] | undefined = this.selectedLocations;
    if (!locations) return;

    const colorOfEntityLabel = getRGBOfEntity(this.selectedEntity?.label?.backgroundColor?.valueOf().toString());
    const colorOfEntityText = getRGBOfEntity(this.selectedEntity?.label?.fillColor?.valueOf().toString());

    switch (this.selectedEntity?.name) {
      // 3D models do not need any editing nodes,
      // since the entity itself would move.
      case makeCesiumType(T.ContentType.ESS_MODEL): {
        const entityProp = this.selectedEntity?.properties;
        if (entityProp === undefined) {
          break;
        }

        // Update the initial drag angle with the data from the model,
        // since the arrow has no info and will always reset to north initially.
        this.dragAngle = entityProp.heading._value ?? 0;

        if (entityProp.boundingSphere !== undefined) {
          this.showESSModelHeadingEditor(entityProp.boundingSphere._value);
          this.drawESSModelEditingNodes();
        } else if (this.selectedEntity) {
          const modelPrimitive: Model = (() => {
            for (let i = 0; i < this.viewer.scene.primitives.length; i++) {
              const primitive = this.viewer.scene.primitives.get(i);
              if (primitive?.id?.id === this.selectedEntity?.id) {
                return primitive;
              }
            }

            throw new Error(`Model primitive not found for entity id: ${this.selectedId}`);
          })();

          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          modelPrimitive.readyPromise.then(() => {
            entityProp.modelRadius = new ConstantProperty(modelPrimitive.boundingSphere);
            this.showESSModelHeadingEditor(modelPrimitive.boundingSphere);
            this.drawESSModelEditingNodes();
          });
        }

        break;
      }
      case makeCesiumType(T.ContentType.ESS_TEXT): {
        this.showOverlay(Overlay.TEXT_EDITOR);
        this.addCornerNode(id, 0, colorOfEntityLabel, colorOfEntityText);
        break;
      }
      default: {
        locations.forEach((_, index) => {
          // Add the white circle icon for every location.
          this.addCornerNode(id, index);

          // For polygons, the last location
          // will also have the plus icon on the last segment,
          // unlike polylines.
          if (index < locations.length - 1 || this.isSelectingPolygon) {
            this.addPlusNode(id, index);
          }
        });

        break;
      }
    }
  }

  private drawESSModelEditingNodes(): void {
    if (this.ESSModelEditingLayer.entities.getById(this.ESSModelRadiusId)) return;

    // Model radius is rendered
    // when the model is being drawn as a preview of the model,
    // and also when the model is selected.
    const position: ConstantPositionProperty | CallbackProperty | undefined = (() => {
      if (this.drawingMode === T.ContentType.ESS_MODEL) {
        return new CallbackProperty(() => this.mousePosition, false);
      }

      if (this.selectedLocations) {
        return new ConstantPositionProperty(this.selectedLocations[0]);
      }

      return undefined;
    })();

    if (!position) return;

    const modelRadius: number | undefined = this.selectedEntity?.properties?.modelRadius?._value?.radius;
    const ellipseRadius = this.ESSModelInnerCircleSizeRadius || (modelRadius ?? ESS_MODEL_RADIUS_RADIUS);

    this.ESSModelEditingLayer.entities.add({
      id: this.ESSModelRadiusId,
      name: ESS_MODEL_HEADING_CONTROLS,
      position: position as any,
      ellipse: {
        semiMajorAxis: ellipseRadius,
        semiMinorAxis: ellipseRadius,
        material: new ColorMaterialProperty(getCesiumColor(dsPalette.themePrimaryLighter).withAlpha(ESS_MODEL_RADIUS_ALPHA)),
        height: this.drawingMode === T.ContentType.ESS_MODEL ? undefined : 0,
        heightReference: this.drawingMode === T.ContentType.ESS_MODEL
          ? HeightReference.NONE
          : HeightReference.CLAMP_TO_GROUND,
      },
    });

    this.viewer.scene.requestRender();
    this.showESSModelWorkRadius();
  }

  /**
   * Toggles the required label behavior depending on the entity name.
   * This is mainly a business logic.
   * @param type Label type.
   */
  private shouldShow(type: Label): boolean {
    switch (this.renderedEntity?.name) {
      case makeCesiumType(T.ContentType.LENGTH): {
        return type === Label.LENGTH_SEGMENT || type === Label.TOTAL_DISTANCE;
      }
      case makeCesiumType(T.ContentType.AREA): {
        return type === Label.TOTAL_AREA;
      }
      case makeCesiumType(T.ContentType.ESS_TEXT): {
        return type === Label.TEXT_EDITOR;
      }
      default:
        return false;
    }
  }

  private addCornerNode(id: number, index: number, labelColor?: Color, textColor?: Color): void {
    // According to Sentry,
    // there's a chance that the entity might already be there.
    // It is not known for sure what the cause is, and it's an edge case.
    // For now, avoid adding the entity if it's already there
    // to avoid crashing the app.
    const entityId: string = `${DRAGGING_POINT_PREFIX}-${id}-${index}`;
    if (!!this.editingLayer.entities.getById(entityId)) return;

    switch (this.selectedEntity?.name) {
      case makeCesiumType(T.ContentType.ESS_TEXT): {
        this.editingLayer.entities.add({
          id: entityId,
          name: DRAGGING_POINT_PREFIX,
          position: new CallbackProperty(() => this.renderedLocations[index], false) as any,
          billboard: createCesiumTextItemSelectPointOptions({ textColor, labelColor }),
        });
        this.selectedEntity.show = false;
        break;
      }
      default: {
        this.editingLayer.entities.add({
          id: entityId,
          name: DRAGGING_POINT_PREFIX,
          position: new CallbackProperty(() => this.renderedLocations[index], false) as any,
          billboard: createCesiumSelectPointOptions(),
        });
        break;
      }
    }
  }


  private addPlusNode(id: number, index: number): void {
    // According to Sentry,
    // there's a chance that the entity might already be there.
    // It is not known for sure what the cause is, and it's an edge case.
    // For now, avoid adding the entity if it's already there
    // to avoid crashing the app.
    const entityId: string = `${ADD_POINT_PREFIX}-${id}-${index}`;

    if (!!this.editingLayer.entities.getById(entityId)) return;

    const isPointToPoint: boolean = !this.renderedEntity?.polyline?.clampToGround?.getValue(new JulianDate());

    this.editingLayer.entities.add({
      id: entityId,
      name: DRAGGING_POINT_PREFIX,
      position: new CallbackProperty(() => getMidLocations(this.renderedLocations[index], index, this.renderedLocations), false) as any,
      billboard: createCesiumPlusIcon(isPointToPoint),
    });
  }

  /**
   * Shows the overlay, attaches the listener to the pre-render event
   * to sync the label/overlay position with the camera position.
   * This also stores the callback so that it can be removed later.
   * @param type Overlay type.
   */
  private showOverlay(type: Overlay): void {
    // There's a chance that this callback is triggered
    // even when the instance has already been destroyed.
    // This is an edge case, but handle them accordingly.
    if (!defined(this.viewer) || this.viewer.isDestroyed()) return;

    this.prevRenderedEntity = this.renderedEntity;
    switch (type) {
      case Overlay.SEGMENT: {
        if (!this.segmentLayerCallback) {
          this.segmentLayerCallback = () => this.drawSegmentLabels();
          this.viewer.scene.preRender.addEventListener(this.segmentLayerCallback);
        }
        break;
      }
      case Overlay.DRAGGING: {
        if ((this.shouldShow(Label.TOTAL_DISTANCE) || this.shouldShow(Label.TOTAL_AREA)) && !this.draggingLayerCallback) {
          this.draggingLayerCallback = () => this.drawDraggingLabel();
          this.viewer.scene.preRender.addEventListener(this.draggingLayerCallback);
        }
        break;
      }
      case Overlay.TEXT_EDITOR: {
        if (this.shouldShow(Label.TEXT_EDITOR) && !this.textEditorLayerCallback) {
          this.textEditorLayerCallback = () => this.showTextEditor();
          this.viewer.scene.preRender.addEventListener(this.textEditorLayerCallback);
        }
        break;
      }
      default: {
        exhaustiveCheck(type);
      }
    }
  }

  /**
   * Hides the overlay and clears the pre-render event callback.
   * @param type Overlay type.
   */
  private hideOverlay(type: Overlay): void {
    // There's a chance that this callback is triggered
    // even when the instance has already been destroyed.
    // This is an edge case, but handle them accordingly.
    if (!defined(this.viewer) || this.viewer.isDestroyed()) return;

    let parent: HTMLElement | undefined;

    switch (type) {
      case Overlay.SEGMENT: {
        parent = this.segmentsLayer;
        if (this.segmentLayerCallback) {
          this.viewer.scene.preRender.removeEventListener(this.segmentLayerCallback);
          this.segmentLayerCallback = undefined;
        }

        // Show the previously hidden Cesium-rendered label
        // since the overlay label is now hidden.
        if (this.prevRenderedEntity?.label) {
          this.prevRenderedEntity.label.show = new ConstantProperty(true);
        }
        break;
      }
      case Overlay.DRAGGING: {
        parent = this.draggingLayer;
        if (this.draggingLayerCallback) {
          this.viewer.scene.preRender.removeEventListener(this.draggingLayerCallback);
          this.draggingLayerCallback = undefined;
        }
        break;
      }
      case Overlay.TEXT_EDITOR: {
        if (this.textEditorLayerCallback) {
          this.viewer.scene.preRender.removeEventListener(this.textEditorLayerCallback);
          this.textEditorLayerCallback = undefined;
          this.hideTextEditor();
        }
        break;
      }
      default: {
        exhaustiveCheck(type);
      }
    }

    if (parent) {
      while (parent.firstChild) parent.removeChild(parent.firstChild);
    }
  }

  private drawSegmentLabels(): void {
    if (!this.renderedEntity || this.renderedLocations.length === 0) return;

    // For entities with labels, it's going to be hidden and then show the HTML popup.
    // For ESS text, the entity itself is the label, so there's no title.
    const hasTitle: boolean = !!this.renderedEntity.label?.text
      && !this.renderedEntity?.name?.includes(T.ContentType.ESS_TEXT);

    const titlePosition: Cartesian3 = hasTitle ? this.titlePosition : Cartesian3.ZERO;

    // Segments work in a way that it shows the information between two locations.
    // No need to show the segment if there's only one location.
    if (this.shouldShow(Label.LENGTH_SEGMENT) && this.renderedLocations.length > 1) {
      const midLocations: Cartesian3[] = this.renderedLocations.map(getMidLocations);
      midLocations.forEach((location, index) => {
        if (index === midLocations.length - 1 || location.equals(this.renderedLocations[this.renderedLocations.length - 1])) return;

        const label: HTMLElement = getOrCreateLabel({
          parent: this.segmentsLayer,
          className: SEGMENT_CLASSNAME,
          identifier: index,
        });

        // Chances are the title label and the segment label is overlapping,
        // when that happens, the segment label is moved slightly by the offset.
        // This is not a perfect solution, but it solves most of the case.
        const offset: [number, number] = hasTitle && Cartesian3.distance(location, titlePosition) < LABEL_OVERLAP_THRESHOLD
          ? LABEL_OVERLAP_OFFSET
          : [0, 0];

        const isPointToPoint: boolean = !this.renderedEntity?.polyline?.clampToGround?.getValue(new JulianDate());

        this.updateLabelPosition({ elem: label, location, offset, isPointToPoint });

        if (label.firstChild) {
          label.firstChild.textContent = this.getSegmentText(index, isPointToPoint);
        }
      });
    }

    // Do not render the title label at all
    // when there's no title, there's no point.
    if (!hasTitle) return;

    // Hide the Cesium-rendered label
    // since the title label is rendered from the overlay instead.
    if (this.renderedEntity?.label) {
      this.renderedEntity.label.show = new ConstantProperty(false);
    }

    const title: HTMLElement = getOrCreateLabel({
      parent: this.segmentsLayer,
      className: SEGMENT_CLASSNAME,
      style: titleStyle,
      identifier: 'title',
      onClick: () => {
        if (!this.hoveredEntity) return;

        this.selectedEntity = this.hoveredEntity;
        this.hoveredEntity = undefined;
      },
    });

    if (title.firstChild) {
      title.firstChild.textContent = String(this.renderedEntity.label?.text);
    }

    // The title label is hidden when dragging.
    // Reason is maybe because there's too many moving labels when dragging.
    // The content of the title does not change anyway when dragging.
    if (this.isDragging) {
      title.style.display = 'none';
    } else {
      title.style.display = 'block';

      const isPointToPoint: boolean = !!this.renderedEntity?.polyline && !this.renderedEntity?.polyline?.clampToGround?.getValue(new JulianDate());
      this.updateLabelPosition({ elem: title, location: titlePosition, isPointToPoint });
    }
  }

  private drawDraggingLabel(): void {
    if (this.renderedLocations.length <= 2) return;

    let location: Cartesian3 = Cartesian3.ZERO;

    // The decision of different location for the label
    // is following how 2D does it.
    if (this.shouldShow(Label.TOTAL_DISTANCE)) {
      location = this.renderedLocations[this.renderedLocations.length - 1];
    } else if (this.shouldShow(Label.TOTAL_AREA)) {
      location = this.titlePosition;
    }

    const elem: HTMLElement = getOrCreateLabel({ parent: this.draggingLayer, className: DRAGGING_LABEL_CLASSNAME });
    this.updateLabelPosition({ elem, location });

    if (elem.firstChild) elem.firstChild.textContent = this.draggingLabelText;
  }

  private showTextEditor(): void {
    if (!this.textEditorElem) {
      const elem: HTMLDivElement | null = document.getElementById(ESS_TEXT_EDITOR_ID) as HTMLDivElement;
      if (elem === null) {
        // eslint-disable-next-line no-console
        console.warn(`Could not find text editor elem with id: ${ESS_TEXT_EDITOR_ID}`);
        this.hideOverlay(Overlay.TEXT_EDITOR);

        return;
      }

      elem.style.display = 'block';
      window.requestAnimationFrame(() => {
        if (elem.firstElementChild) {
          const editableTextElem: HTMLDivElement = elem.firstElementChild as HTMLDivElement;
          editableTextElem.focus();

          // Select all text in order for it to be easier
          // for user should they decide to change all text.
          const range: Range = document.createRange();
          range.selectNodeContents(editableTextElem);
          const sel: Selection | null = window.getSelection();
          if (sel !== null) {
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }

        // Hide the Cesium-rendered label
        // since the text is rendered from the text editor instead.
        if (this.renderedEntity?.label && this.viewer?.scene) {
          this.renderedEntity.label.show = new ConstantProperty(false);
          this.viewer.scene.requestRender();
        }
      });
      this.textEditorElem = elem;
    }

    if (this.renderedLocations[0]) {
      this.updateLabelPosition({
        elem: this.textEditorElem,
        location: this.renderedLocations[0],
        offset: TEXT_EDITOR_OFFSET,
      });
    }
  }

  private hideTextEditor(): void {
    if (this.textEditorElem) {
      this.textEditorElem.style.display = 'none';
      if (this.textEditorElem.firstElementChild) {
        this.textEditorElem.firstElementChild.innerHTML = '';
      }

      this.textEditorElem = undefined;
    }
  }

  private getSegmentText(index: number, isPointToPoint: boolean): string {
    const elevation: Map<number, number> | undefined = this.elevations.get(this.renderedId);
    if (!elevation) return '';

    const nextIndex: number = index === this.renderedLocations.length - 1 ? 0 : index + 1;

    if (isPointToPoint) {
      const distance: string = String(Cartesian3.distance(this.renderedLocations[index], this.renderedLocations[nextIndex]).toFixed(2));
      this.distances.get(this.renderedId)?.set(index, parseFloat(distance));
      return `${distance}${this.lengthUnit}`;
    }

    const firstCoord: Coordinate = Object.values(getLonLatFromPosition(this.renderedLocations[index]));
    const nextCoord: Coordinate = Object.values(getLonLatFromPosition(this.renderedLocations[nextIndex]));

    const geometry: Geometry = createGeometryFromLocations({
      locations: [firstCoord, nextCoord],
      geometryType: T.ContentType.LENGTH,
    });
    const distance: string = (this.unitType === T.UnitType.IMPERIAL) ?
      getImperialMeasurementFromGeometry({ geometry, geometryType: T.ContentType.LENGTH }) :
      getMeasurementFromGeometry({ geometry, geometryType: T.ContentType.LENGTH });

    // To reduce unnecessary location for the total length,
    // the distance of each segments are recorded now.
    this.distances.get(this.renderedId)?.set(index, parseFloat(distance));

    const slope: string = calcSlopeOfLength([
      { coordinate: firstCoord, elevation: elevation.get(index) },
      { coordinate: nextCoord, elevation: elevation.get(index + 1) },
    ]);

    return `${distance}${this.lengthUnit}, ${slope === INVALID ? '-' : slope}%`;
  }

  /**
   * Reprojects the location of the label into the DOM position.
   * This allows the label to be positioned correctly as the camera moves.
   *
   * @param elem The label element
   * @param location Location in Cartesian3
   * @param isPointToPoint
   * @param offset Position offset, if necessary
   */
  private updateLabelPosition({
    elem, location, offset, isPointToPoint,
  }: {
    elem: HTMLElement; location: Cartesian3; offset?: [number, number]; isPointToPoint?: boolean;
  }): void {
    // In order for the position to get the actual height,
    // it needs to get "picked" from the globe using the lon/lat position.
    // It isn't clear why it is needed, but the idea came from this reference below
    // Without these, the label location is clamped to the 0 height.
    // https://groups.google.com/g/cesium-dev/c/wtLygWvNfOo
    const pickedPosition: Cartesian3 = getPositionOnTerrain(location, this.viewer, isPointToPoint);
    const position: Cartesian2 | undefined = this.viewer.scene.cartesianToCanvasCoordinates(pickedPosition, new Cartesian2());

    if (defined(position)) {
      const positionX: number = position.x + LABEL_OFFSET[0] + (offset ? offset[0] : 0);
      const positionY: number = position.y + LABEL_OFFSET[1] + (offset ? offset[1] : 0);

      elem.style.transform = `translate(0%, -100%) translate(${positionX}px, ${positionY}px)`;
    }
  }

  /**
   * Checks whether the point is nearby the reference
   * based on their canvas position.
   *
   * @param point The point to check
   * @param reference The reference point
   * @returns boolean
   */
  private isPointNearby(point: Cartesian3, reference: Cartesian3): boolean {
    const pointInCanvas: Cartesian2 | undefined = this.viewer.scene.cartesianToCanvasCoordinates(point, new Cartesian2(0, 0));
    const referenceInCanvas: Cartesian2 | undefined = this.viewer.scene.cartesianToCanvasCoordinates(reference, new Cartesian2(0, 0));

    if (!pointInCanvas || !referenceInCanvas) return false;

    return (
      Math.abs(pointInCanvas.x - referenceInCanvas.x) <= CONFIRMATION_SNAP_THRESHOLD_PX
      && Math.abs(pointInCanvas.y - referenceInCanvas.y) <= CONFIRMATION_SNAP_THRESHOLD_PX
    );
  }
}
