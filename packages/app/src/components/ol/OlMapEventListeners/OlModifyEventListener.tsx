/* eslint-disable max-lines */
import * as Sentry from '@sentry/browser';
import Color from 'color';
import _ from 'lodash-es';
import { Feature, MapBrowserEvent, Overlay } from 'ol';
import { FeatureLike } from 'ol/Feature';
import OlMap from 'ol/Map';
import { Coordinate } from 'ol/coordinate';
import { boundingExtent, getCenter } from 'ol/extent';
import Geometry from 'ol/geom/Geometry';
import GeometryType from 'ol/geom/GeometryType';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import Modify, { ModifyEvent } from 'ol/interaction/Modify';
import Translate, { TranslateEvent } from 'ol/interaction/Translate';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import proj4 from 'proj4';
import React, { Dispatch as LocalDispatch, FC, useEffect, useMemo, useState } from 'react';
import isDeepEqual from 'react-fast-compare';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { Dispatch as ReduxDispatch } from 'redux';

import {
  UseDeleteContent,
  UseL10n,
  UseState,
  useAuthHeader,
  useDeleteContent,
  useL10n,
  usePrevProps,
  useProjectCoordinateSystem,
  typeGuardLength,
} from '^/hooks';
import { PatchContent, RequestMarkerElevationInfo, RequestVolumeCalculation, UpdateLengthAreaVolumeLocations } from '^/store/duck/Contents';
import { ChangeEditingContent, SetMeasurementClickedFromMap } from '^/store/duck/Pages/Content';

import * as T from '^/types';
import {
  RealTimeMeasurementTooltipOverlayAndElement,
  UpdateRealtimeMeasuementTooltipParams,
  attachLayer,
  createMiddlePointLayer,
  detachLayer,
  filterPoints,
  getLayerById,
  getLineStringFromLayer,
  getPolygonFromLayer,
  makeRealtimeMeasurementTooltip,
  updateMeasurementTooltip,
} from '^/utilities/ol-layer-util';

import { AuthHeader, volumeServiceHostname } from '^/store/duck/API';
import { getEPSGfromProjectionLabel } from '^/utilities/coordinate-util';
import { isMobile } from '^/utilities/device';
import { getSingleContentId } from '^/utilities/state-util';
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom';
import Draw from 'ol/interaction/Draw';
import { toLonLat } from 'ol/proj';
import { Subject, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { catchError, debounceTime, map as rxjsMap } from 'rxjs/operators';
import {
  CoordinateAndElevation,
  deleteAllLengthSegmentOverlays,
  getInteraction,
  getLengthSegmentOverlayById,
  hasLengthSegmentOverlays,
  makeLengthSegmentOverlay,
  makeManyMeasurementOverlays,
  requestElevationsFromCoordinates,
  setLengthSegmentOverlayId,
  updateImperialMeasurementOnLengthSegmentOverlay,
  updateMeasurementOnLengthSegmentOverlay,
  updateSlopeOnLengthSegmentOverlay,
} from '../OlLengthSegmentOverlays/util';
import { InteractionEventTypes, ListenerNames, OlCustomPropertyNames, hitTolerance3px } from '../constants';
import {
  getImperialMeasurementFromGeometry,
  getImperialMeasurementUnitFromGeometryType,
  getMeasurementFromGeometry,
  getMeasurementUnitFromGeometryType,
  getMinNumberOfPointsToMakeShape,
} from '../contentTypeSwitch';
import { olStyleFunctions } from '../styles';
import { ActionTypes, Actions } from './store/Actions';
import { OlEventListenerState } from './store/State';
import { setRootMapCursor } from './OlDrawEventListener';
import { determineUnitType, VALUES_PER_METER } from '^/utilities/imperial-unit';

const DEBOUNCE_TIME: number = 2000;

interface ModifiedVolume {
  layerId: T.Content['id'];
  locationsForServer: Array<Coordinate>;
}

const isWhitePlainPoint: (feature: Feature) => boolean =
  (feature) => feature.get('id')?.toString().startsWith(OlCustomPropertyNames.WHITE_PLAIN);

const makeClickedPointStyleToDefault: (layer: VectorLayer) => void = (layer) => {
  /**
  * Make default point style if there is a selected(for deletion) point.
  */
  layer.getSource().getFeatures().find(
    (feat) => feat.get(OlCustomPropertyNames.TO_BE_DELETED_POINT)?.toString() === OlCustomPropertyNames.TO_BE_DELETED_POINT,
  )?.setStyle(olStyleFunctions.plainWhitePoint);
};

const makePlainWhitePointFeautresFromCoordinates: (
  coordiantes: Array<Coordinate>, isContentTypeLength: boolean,
) => Array<Feature> = (
  coordinates, isContentTypeLength,
) => {
  const pointFeatures: Array<Feature<Point>> = coordinates.map((coordinate: Coordinate, idx: number) => {
    const pointFeature: Feature<Point> = new Feature(new Point(coordinate));
    pointFeature.setStyle(olStyleFunctions.plainWhitePoint);

    pointFeature.set('id', `${OlCustomPropertyNames.WHITE_PLAIN}${idx}`);

    return pointFeature;
  });

  /**
   * if length, don't pop
   */
  if (!isContentTypeLength) pointFeatures.pop();

  return pointFeatures;
};

const makePlusPointFeaturesFromCoordinates: (coordinates: Array<Coordinate>) => Array<Feature> = (coordinates) => {
  const plusPointCoordinates: Array<Coordinate> = coordinates.map((loc, index) =>
    getCenter(
      boundingExtent(
        index === coordinates.length - 1 ?
          [coordinates[0], coordinates[coordinates.length - 1]] : [loc, coordinates[index + 1]],
      ),
    ),
  );

  const pointFeatures: Array<Feature<Point>> = plusPointCoordinates.map((coordinate: Coordinate, idx: number) => {
    const pointFeature: Feature<Point> = new Feature(new Point(coordinate));
    pointFeature.setStyle(olStyleFunctions.plusPoint);

    pointFeature.set('id', `${OlCustomPropertyNames.PLUS}${idx}`);

    return pointFeature;
  });

  pointFeatures.pop();

  return pointFeatures;
};

const getCoordinatesBasedOnContentType: (
  layer: VectorLayer, isContentTypeLength: boolean,
) => Array<Coordinate> = (
  layer, isContentTypeLength,
) =>
  isContentTypeLength ?
    getLineStringFromLayer(layer).getCoordinates() : getPolygonFromLayer(layer).getCoordinates()[0];

type AddPointFearuesToLayerFunction = (
  layer: VectorLayer, isContentTypeLength: boolean,
) => void;

const addPlainWhitePointFeaturesToLayer: AddPointFearuesToLayerFunction = (
  layer, isContentTypeLength,
) => {
  layer.getSource().addFeatures(
    makePlainWhitePointFeautresFromCoordinates(
      getCoordinatesBasedOnContentType(layer, isContentTypeLength),
      isContentTypeLength,
    ),
  );
};

const addPlusPointFeaturesToLayer: AddPointFearuesToLayerFunction = (layer, isContentTypeLength) => {
  layer.getSource().addFeatures(
    makePlusPointFeaturesFromCoordinates(
      getCoordinatesBasedOnContentType(layer, isContentTypeLength),
    ),
  );
};

const getIdsOfPlusPointsToUpdateWhenWhitePointMoves:
  (idOfFeatureBeingDragged: string, maxBoundary: number) => [string, string] =
  (idOfFeatureBeingDragged, numOfFeatures) => {
    const right: string = idOfFeatureBeingDragged;
    /**
     * To account for the first point (which has the last point next to it)
     */
    const left: number = Number(idOfFeatureBeingDragged) - 1 === -1 ? numOfFeatures - 1 : Number(idOfFeatureBeingDragged) - 1;

    return [String(left), right];
  };

type LeftAndRight = [number | undefined, number | undefined];

function getIdsOfWhitePointsNextToDraggedPoint(
  idOfFeatureBeingDragged: number, isDraggedFeatureWhitePoint: boolean, numOfFeatures: number, isContentTypeLength: boolean,
): LeftAndRight {
  const returnUndefinedIfLength: (value: number) => number | undefined =
  (value) => isContentTypeLength ? undefined : value;

  if (isDraggedFeatureWhitePoint) {
    const left: number = idOfFeatureBeingDragged - 1;
    const right: number = idOfFeatureBeingDragged + 1;

    /**
   * To account for the first point (which has the last point next to it)
   */
    return [
      left === -1 ? returnUndefinedIfLength(numOfFeatures - 1) : left,
      right === numOfFeatures ? returnUndefinedIfLength(0) : right,
    ];
  } else {
    const right: number = idOfFeatureBeingDragged + 1;

    return [idOfFeatureBeingDragged, right === numOfFeatures ? returnUndefinedIfLength(0) : right];
  }
}

function initializeEmptyCircleVectorLayerAtCoordinate(coordinate: Coordinate): VectorLayer {
  const emptyCircleFeature: Feature<Point> = new Feature(new Point(coordinate));
  emptyCircleFeature.setStyle(olStyleFunctions.emptyCircle);

  return new VectorLayer({
    source: new VectorSource({
      features: [emptyCircleFeature],
    }),
    zIndex: 9999999999999999999,
  });
}

function resetLayerToInitialStyle(map: OlMap, layerId?: number, hideTitle: boolean = false): void {
  if (layerId === undefined) return;

  const lyr: VectorLayer | undefined = getLayerById({ olMap: map, id: layerId });

  /**
   * @desc Without this statement, after deleting annotation, platform will be crashed
   */
  if (lyr === undefined) return;

  const color: string = lyr.get(OlCustomPropertyNames.COLOR);
  const title: string | undefined = hideTitle ? undefined : lyr.get(OlCustomPropertyNames.TITLE);
  if (lyr.get(OlCustomPropertyNames.GEOMETRY_TYPE) === T.ContentType.MARKER) {
    lyr.setStyle(olStyleFunctions.markerWithShadow(new Color(color), title));

    return;
  }
  const source: VectorSource = lyr.getSource();
  source.getFeatures().forEach((feat: Feature) => {
    const id: string = String(feat.get('id'));
    if (id.startsWith(OlCustomPropertyNames.PLUS) || id.startsWith(OlCustomPropertyNames.WHITE_PLAIN)) source.removeFeature(feat);
  });
  lyr.setStyle(olStyleFunctions.defaultLayerStyle(new Color(color), title));
}

interface Props {
  currentContentTypeFromAnnotationPicker?: T.ContentsPageState['currentContentTypeFromAnnotationPicker'];
  layerGroup?: LayerGroup;
  map: OlMap;
  isDrawing: OlEventListenerState['isDrawing'];
  localDispatch: LocalDispatch<Actions>;
}

const OlModifyEventListener: FC<Props> = ({
  currentContentTypeFromAnnotationPicker,
  map,
  layerGroup,
  isDrawing,
  localDispatch,
}) => {
  /**
   * after clicking on some layer, user can click on another layer as well.
   * In that case, this stores the previous layer's id.
   * FYI, all layer ids are their respective content ids (initialized in OlAnnotationLayer)
   */
  const reduxDispatch: ReduxDispatch = useReduxDispatch();
  const { ProjectConfigPerUser, Pages, Contents }: T.State = useSelector((state: T.State) => state);
  const [, lang]: UseL10n = useL10n();

  const volumeModifySubjects$: Map<number, Subject<ModifiedVolume>> = useMemo(() => new Map(), []);
  const [previouslyClickedLayerId, setPreviouslyClickedLayerId]: UseState<Readonly<number | undefined>> = useState(undefined);
  const previousContentTypeFromAnnotationPicker: Readonly<string | undefined> = usePrevProps(currentContentTypeFromAnnotationPicker);
  const authHeader: AuthHeader | undefined = useAuthHeader();
  const deleteContent: UseDeleteContent = useDeleteContent();
  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();
  const {
    projectId,
    projectById,
  } = useSelector((s: T.State) => ({
    projectById: s.Projects.projects.byId,
    projectId: s.Pages.Contents.projectId,
  }));

  if (projectId === undefined) throw new Error(' No Project Id in Pages.Contents.projectId');

  const unitType: T.ValidUnitType = determineUnitType(projectById[projectId].unit);

  /**
   * We need to use useSelector as well because newly drawn layers won't work with useContentFoundById();
   */

  useEffect(() => {
    /**
     * this won't work with useState. That's why we use closure here.
     */

    /**
     * For length, area and volume
     */

    /**
     * modify interaction
     */
    let modify: Modify | undefined;
    /**
     * the layer that's clicked on by the user.
     */
    let selectedLayer: VectorLayer | undefined;
    /**
     * we need this layer to display fake plus points when user is dragging any plain white points.
     */
    let middlePointLayer: VectorLayer | undefined;
    /**
     * we need this layer to show fake white point when user drags a plain white point.
     */
    let whitePointLayer: VectorLayer | undefined;
    /**
     * we need this layer to show fake plus point next to the point dragged
     */
    let leftAndRightPlusPointLayers: [VectorLayer, VectorLayer] | undefined;
    /**
     * feature.get('id') of plus point that is being dragged.
     * undefined means it's not being dragged
     */
    let featureIdOfPlusPointBeingDragged: string | undefined;
    /**
     * feagure.get('id') of white point that is being dragged.
     * undefined means it's not being dragged.
     */
    let featureIdOfWhitePointBeingDragged: string | undefined;
    /**
     * a boolean to check if styles of the two plus points
     * that should disappear when some point is dragged have disappeared
     */
    let isEmptyCircleStyleSet: boolean = false;
    /**
     * to be used for closure only
     */
    let previouslyClickedLayerIdInClosure: number | undefined;
    /**
     * to be used for closure only
     */
    let leftAndRightOverlays: [Overlay | undefined, Overlay | undefined] | undefined;
    /**
     * left and right points next to the point being dragged on
     */
    let leftAndRightWhitePoints: Array<Feature<Point>> = [];

    /**
     * Translate interaction
     */
    let translate: Translate | undefined;
    /**
     * To know if user has dragged a marker more than once
     */
    let hasTranslated: boolean = false;
    /**
     * Elevations for calculating length segment slopes
     */
    let lengthCoordinatesElevations: Array<CoordinateAndElevation> = [];

    /**
     * New length segment overlay to appear when plus point is dragged
     */
    let newLengthSegmentWhenPlusPointDragged: Overlay | undefined;
    /**
     * Tooltip for real-time measurement
     */
    const {
      realtimeMeasurementTooltip,
      realtimeMeasurementTooltipElement,
    }: RealTimeMeasurementTooltipOverlayAndElement = makeRealtimeMeasurementTooltip();
    map.addOverlay(realtimeMeasurementTooltip);

    /**
     * If user tries to draw after clicking a layer, delete the points shown for modify
     */
    if (currentContentTypeFromAnnotationPicker !== previousContentTypeFromAnnotationPicker) {
      resetLayerToInitialStyle(map, previouslyClickedLayerId);
    }

    if (!map.get(ListenerNames.CLICK)) {
      const clickListener: (e: MapBrowserEvent) => void = (e) => {
        /**
         * If you are drawing, don't let modify happen
         */
        if (getInteraction(map, Draw)) return;
        /**
         * If user clicks on a blank space in the map, abort modify
         */
        const featuresNearby: Array<FeatureLike> | undefined = map.getFeaturesAtPixel(e.pixel, hitTolerance3px);
        const isMarkerIncludedInFeaturesNearBy: boolean =
          Boolean(
            featuresNearby
              .find((feat) => feat.getGeometry().getType() === GeometryType.POINT && feat.getId() === OlCustomPropertyNames.MAIN_FEATURE),
          );

        if ((e as any).isBlankSpaceClick || (featuresNearby?.length === 0)) {
          setRootMapCursor(map, 'auto');
          localDispatch({ type: ActionTypes.END_MODIFYING });
          localDispatch({ type: ActionTypes.END_HOVERING_ON_LAYER });
          volumeModifySubjects$.clear();

          if (previouslyClickedLayerIdInClosure) {
            resetLayerToInitialStyle(map, previouslyClickedLayerIdInClosure);
            deleteAllLengthSegmentOverlays(map);
            lengthCoordinatesElevations = [];
          }

          /**
           * You clicked on a blank space, so there is no previously clicked layer anymore
           */
          previouslyClickedLayerIdInClosure = undefined;

          localDispatch({ type: ActionTypes.REGISTER_CLICK_EVENT, payload: { currentlyModifiedLayerId: undefined } });
          /**
           * Disable translate until user clicks on a marker again
           */
          translate?.setActive(false);
          /**
           * Marker is not ready to be translated anymore until it gets clicked again
           */
          selectedLayer?.set(OlCustomPropertyNames.IS_MAKRER_READY_TO_TRANSLATE, false);
          /**
           * If you are not drawing and clicking on a blank space
           */
          if (!isDrawing) localDispatch({ type: ActionTypes.HIDE_LENGTH_SEGMENT_OVERLAYS });
          /**
           * Remove event listeners. They have to be renewed anyways.
           */

          if (map.get(ListenerNames.MODIFY_START)) modify?.un(InteractionEventTypes.MODIFY_START, map.get(ListenerNames.MODIFY_START));
          map.unset(ListenerNames.MODIFY_START);
          if (map.get(ListenerNames.MODIFY_END)) modify?.un(InteractionEventTypes.MODIFY_END, map.get(ListenerNames.MODIFY_END));
          map.unset(ListenerNames.MODIFY_END);
          if (map.get(ListenerNames.LAYER_CHANGE)) selectedLayer?.un(InteractionEventTypes.CHANGE, map.get(ListenerNames.LAYER_CHANGE));
          map.unset(ListenerNames.LAYER_CHANGE);
          if (map.get(ListenerNames.TRANSLATE_START)) translate?.un(InteractionEventTypes.TRANSLATE_START, map.get(ListenerNames.TRANSLATE_START));
          map.unset(ListenerNames.TRANSLATE_START);
          if (map.get(ListenerNames.TRANSLATING)) translate?.un(InteractionEventTypes.TRANSLATING, map.get(ListenerNames.TRANSLATING));
          map.unset(ListenerNames.TRANSLATING);
          if (map.get(ListenerNames.TRANSLATE_END)) translate?.un(InteractionEventTypes.TRANSLATE_END, map.get(ListenerNames.TRANSLATE_END));
          map.unset(ListenerNames.TRANSLATE_END);
          if (modify) map.removeInteraction(modify);
          if (translate) map.removeInteraction(translate);

          return;
        }

        const layerIdClickedFromSidebar: T.Content['id'] = (e as any).contentId;

        if (layerIdClickedFromSidebar === undefined) reduxDispatch(SetMeasurementClickedFromMap({ value: true }));

        /**
         * forEachLayerAtPixel doesn't work for some reason
         */
        map.forEachFeatureAtPixel(e.pixel, ((feature: Feature, layer: VectorLayer) => {
          /**
           * If marker is inside some area or volume, prevent forEachFeatureAtPixel from running for more than once
           */
          if (isMarkerIncludedInFeaturesNearBy && layer.get(OlCustomPropertyNames.GEOMETRY_TYPE) !== T.ContentType.MARKER) return;
          /**
           * just need this for unlistening to events on unmount (see function being returned from useEffect)
           */
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          selectedLayer = layerIdClickedFromSidebar === undefined ? layer : getLayerById({ olMap: map, id: layerIdClickedFromSidebar }) || layer;

          const editingLayer: VectorLayer = selectedLayer;
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          if (feature) {
            if (feature.getGeometry().getType() === GeometryType.POINT && isWhitePlainPoint(feature)) {
              editingLayer.getSource().getFeatures()
                .filter(isWhitePlainPoint)
                .forEach((feat) => {
                  if (feature === feat) {
                    feat.setStyle(olStyleFunctions.clickedWhitePoint(new Color(editingLayer.get(OlCustomPropertyNames.COLOR))));
                    feat.set(OlCustomPropertyNames.TO_BE_DELETED_POINT, OlCustomPropertyNames.TO_BE_DELETED_POINT);
                  } else {
                    feat.setStyle(olStyleFunctions.plainWhitePoint);
                    feat.unset(OlCustomPropertyNames.TO_BE_DELETED_POINT);
                  }
                });
            }
          }
          /**
           * deactivate modify interaction when you are drawing
           */
          if (editingLayer === null) {
            /**
             * remove previous modify interaction
             */
            if (modify) map.removeInteraction(modify);

            return;
          }

          const layerId: number = layerIdClickedFromSidebar === undefined ? editingLayer.get('id') : layerIdClickedFromSidebar;

          /**
           * If id is undefined, that means user's not clicking on the layer
           * because we set id on every layer in OlAnnotationLayer.
           */
          if (layerId === undefined) {
            if (modify && feature.get('id') && !feature.get('id').toString().startsWith('fake-white')) map.removeInteraction(modify);

            return;
          }
          /**
           * If the user clicks on the same layer, do nothing
           * and preserve original modify interaction
           */
          if (
            previouslyClickedLayerIdInClosure === layerId && !layerIdClickedFromSidebar
            // Excluding volume content since there's no translate interaction for volume.
            && editingLayer.get(OlCustomPropertyNames.GEOMETRY_TYPE) === T.ContentType.VOLUME
          ) {
            return;
          }
          /**
           * Refresh modify interaction
           */
          if (modify) {
            /**
             * remove listeners for modifying interaction
             */
            // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
            if (map.get(ListenerNames.MODIFY_START)) modify?.un(InteractionEventTypes.MODIFY_START, map.get(ListenerNames.MODIFY_START));
            map.unset(ListenerNames.MODIFY_START);
            // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
            if (map.get(ListenerNames.MODIFY_END)) modify?.un(InteractionEventTypes.MODIFY_END, map.get(ListenerNames.MODIFY_END));
            map.unset(ListenerNames.MODIFY_END);
            map.removeInteraction(modify);
          }

          /**
           * If the user has clicked on some layer and clicks on another layer
           */
          if (previouslyClickedLayerIdInClosure !== undefined && previouslyClickedLayerIdInClosure !== layerId) {
            setRootMapCursor(map, 'auto');
            /**
             * remove points for the previous layer
             */
            resetLayerToInitialStyle(map, previouslyClickedLayerIdInClosure);
            deleteAllLengthSegmentOverlays(map);
            lengthCoordinatesElevations = [];
            /**
             * remove listeners for previous annotation selected
             *
             * do not remove click, because then it won't let you click again
             */
            if (map.get(ListenerNames.MODIFY_START)) modify?.un(InteractionEventTypes.MODIFY_START, map.get(ListenerNames.MODIFY_START));
            map.unset(ListenerNames.MODIFY_START);
            if (map.get(ListenerNames.MODIFY_END)) modify?.un(InteractionEventTypes.MODIFY_END, map.get(ListenerNames.MODIFY_END));
            map.unset(ListenerNames.MODIFY_END);
            // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
            if (map.get(ListenerNames.LAYER_CHANGE)) selectedLayer?.un(InteractionEventTypes.CHANGE, map.get(ListenerNames.LAYER_CHANGE));
            map.unset(ListenerNames.LAYER_CHANGE);
            if (map.get(ListenerNames.TRANSLATE_START)) translate?.un(InteractionEventTypes.TRANSLATE_START, map.get(ListenerNames.TRANSLATE_START));
            map.unset(ListenerNames.TRANSLATE_START);
            if (map.get(ListenerNames.TRANSLATING)) translate?.un(InteractionEventTypes.TRANSLATING, map.get(ListenerNames.TRANSLATING));
            map.unset(ListenerNames.TRANSLATING);
            if (map.get(ListenerNames.TRANSLATE_END)) translate?.un(InteractionEventTypes.TRANSLATE_END, map.get(ListenerNames.TRANSLATE_END));
            map.unset(ListenerNames.TRANSLATE_END);
          }
          /**
           * Do nothing more if it's design dxf
           */
          if (editingLayer.get(OlCustomPropertyNames.IS_DESIGN_DXF)) {
            previouslyClickedLayerIdInClosure = undefined;

            localDispatch({ type: ActionTypes.END_MODIFYING });
            localDispatch({ type: ActionTypes.DEREGISTER_CLICK_EVENT });
            localDispatch({ type: ActionTypes.END_HOVERING_ON_LAYER });

            return;
          }

          const isContentTypeLength: boolean = editingLayer.get(OlCustomPropertyNames.GEOMETRY_TYPE) === T.ContentType.LENGTH;
          const isContentTypeVolume: boolean = editingLayer.get(OlCustomPropertyNames.GEOMETRY_TYPE) === T.ContentType.VOLUME;
          const isContentTypeMarker: boolean = editingLayer.get(OlCustomPropertyNames.GEOMETRY_TYPE) === T.ContentType.MARKER;

          /**
           * Remove any length segment overlays that are left over
           */
          if (isContentTypeLength) {
            const coordinates: Array<Coordinate> = getCoordinatesBasedOnContentType(editingLayer, true).map((c) => toLonLat(c));
            const targetDSMId: number | undefined = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.DSM);
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            (async () => {
              const lengthElevations: Array<T.ElevationInfo['value']> = await requestElevationsFromCoordinates({
                coordinates, targetDSMId, authHeader,
              });

              lengthCoordinatesElevations =
                _.zip(lengthElevations, coordinates)
                  .map(([elevation, coordinate]) => ({ elevation, coordinate })) as Array<CoordinateAndElevation>;
              /**
               * if user clicks on another layer again
               */
              if ((!hasLengthSegmentOverlays(map) || previouslyClickedLayerIdInClosure !== layerId) && layerId !== undefined) {
                makeManyMeasurementOverlays({ lengthCoordinatesElevations, olMap: map, unitType });
              }
            })();
          }

          if (isContentTypeVolume && volumeModifySubjects$.get(layerId) === undefined) {
            volumeModifySubjects$.set(layerId, new Subject());
            volumeModifySubjects$.get(layerId)?.pipe(

              debounceTime(DEBOUNCE_TIME),
            ).subscribe({
              next: ({ layerId: _layerId, locationsForServer }) => {
                localDispatch({ type: ActionTypes.END_MODIFYING_VOLUME });
                reduxDispatch(RequestVolumeCalculation({ contentId: _layerId, locations: locationsForServer }));
              },
            });
          }

          if (layerIdClickedFromSidebar === undefined) {
            reduxDispatch(ChangeEditingContent({ contentId: layerId }));
          }
          localDispatch({ type: ActionTypes.REGISTER_CLICK_EVENT, payload: { currentlyModifiedLayerId: layerId } });

          if (!isContentTypeVolume) {
            if (translate) map.removeInteraction(translate);
            // Reset translate every time because it can be a different content.
            translate = new Translate({
              layers: [editingLayer],
              hitTolerance: hitTolerance3px.hitTolerance,
            });

            translate.setActive(true);

            /**
             * Marker needs to set initial points to the white point
             * to hide the actual marker flag icon
            */
            if (isContentTypeMarker) {
              editingLayer.setStyle(olStyleFunctions.plainWhitePoint);
              editingLayer.set(OlCustomPropertyNames.IS_MAKRER_READY_TO_TRANSLATE, true);
            } else {
              setRootMapCursor(map, 'move');
            }

            map.on(InteractionEventTypes.POINTER_MOVE, (_evt: MapBrowserEvent) => {
              if (map.get(ListenerNames.TRANSLATE_START)) {
                if (isContentTypeMarker) {
                  setRootMapCursor(map, 'auto');
                  if (_evt.dragging) setRootMapCursor(map, 'grabbing');
                } else {
                  /**
                   * Logic for cursor changes when MODIFYING & TRANSLATING the LENGTH or AREA feature
                   *
                   * When the cursor moves out of the selected feature,
                   * it should change to 'pointer',
                   * otherwise it should stay as it was ('move')
                   * as long as the feature is selected
                  */
                  if (feature !== null) {
                    setRootMapCursor(map, 'pointer');
                  }
                  map.forEachFeatureAtPixel(_evt.pixel, (feat: Feature) => {
                    if (feature === feat) setRootMapCursor(map, 'move');
                    /**
                     * If the cursor moves on to points(white-plain && plus) of the selected feature,
                     * the cursor should change to 'grab',
                     * and when it's being dragged,
                     * the cursor should change to 'grabbing'
                    */
                    if (feat.getGeometry().getType() === GeometryType.POINT) {
                      setRootMapCursor(map, 'grab');
                      if (_evt.dragging) setRootMapCursor(map, 'grabbing');
                    }
                    return true;
                  });
                }
              }
            });

            hasTranslated = false;

            map.set(ListenerNames.TRANSLATE_START, (_evt: TranslateEvent) => {
              localDispatch({ type: ActionTypes.START_TRANSLATING });
              localDispatch({ type: ActionTypes.HIDE_LENGTH_SEGMENT_OVERLAYS });
              getInteraction(map, DoubleClickZoom)?.setActive(false);

              if (isContentTypeMarker) {
                editingLayer.setStyle(olStyleFunctions.plainWhitePoint);
              } else {
                // No need to show everything else while translating polygon/poyline,
                // so hide all the plus and white points.
                resetLayerToInitialStyle(map, previouslyClickedLayerIdInClosure, true);
                deleteAllLengthSegmentOverlays(map);
              }
            });
            translate.on(InteractionEventTypes.TRANSLATE_START, map.get(ListenerNames.TRANSLATE_START));

            map.set(ListenerNames.TRANSLATING, (_evt: TranslateEvent) => {
              if (!hasTranslated) hasTranslated = true;
            });
            translate.on(InteractionEventTypes.TRANSLATING, map.get(ListenerNames.TRANSLATING));

            map.set(ListenerNames.TRANSLATE_END, ({ coordinate: lastCoordinate, startCoordinate, mapBrowserEvent }: TranslateEvent) => {
              /**
               * Do not allow 'clicking' on the white point
               * when it's ready to be translated
               *
               * But allow dragging marker around and putting the marker at the
               * same original coordinate
               */
              if (
                !hasTranslated &&
                  isDeepEqual(lastCoordinate, startCoordinate)) {
                /**
                 * For OlMeasurementBoxLayer to appear again
                 */
                localDispatch({ type: ActionTypes.END_TRANSLATING });

                return;
              }

              localDispatch({ type: ActionTypes.END_MODIFYING });
              localDispatch({ type: ActionTypes.END_HOVERING_ON_LAYER });
              localDispatch({ type: ActionTypes.END_TRANSLATING });

              if (isContentTypeMarker) {
                editingLayer.setStyle(olStyleFunctions.markerWithShadow(
                  new Color(editingLayer.get(OlCustomPropertyNames.COLOR)), editingLayer.get(OlCustomPropertyNames.TITLE),
                ));
                editingLayer.set(OlCustomPropertyNames.IS_MAKRER_READY_TO_TRANSLATE, false);

                reduxDispatch(PatchContent({
                  content: { id: layerId, info: {
                    location: proj4('EPSG:3857', getEPSGfromProjectionLabel(projectProjection)).forward(lastCoordinate),
                  } },
                }));

                /**
                 * To resolve a bit of lag when marker drag is finished
                 * Give javascript thread a bit of time before executing this
                 */
                window.setTimeout(() => {
                  reduxDispatch(RequestMarkerElevationInfo({
                    contentId: layerId,
                  }));
                });

                // Turn off translation only for marker
                // so that the rest of the contents (area, distance)
                // can immediately translate again if they want to.
                translate?.setActive(false);
                /**
                 * To enable color change on hover again
                 */
                localDispatch({ type: ActionTypes.REGISTER_CLICK_EVENT, payload: { currentlyModifiedLayerId: undefined } });
              } else {
                const coordinates: Array<Coordinate> = getCoordinatesBasedOnContentType(layer, isContentTypeLength);

                // Area and volume polygons' end point is the same as start point (since it's a polygon)
                // therefore, remove it.
                if (!isContentTypeLength) coordinates.pop();
                const locationsForServer: Array<Coordinate> = coordinates.map((coordinate) => toLonLat(coordinate));
                const hasElevations: boolean = typeGuardLength(Contents.contents.byId[layerId])?.info?.elevations !== undefined;

                if (isContentTypeLength && hasElevations) {
                  reduxDispatch(UpdateLengthAreaVolumeLocations({
                    contentId: layerId,
                    locations: locationsForServer,
                  }));
                } else {
                  reduxDispatch(PatchContent({ content: { id: layerId, info: { locations: locationsForServer } } }));
                }

                // To complete an interaction and reset the state,
                // the simplest way is to emulate clicking on somewhere else
                // and click the content again. This is because the code to
                // set up and clear the events are written all over the place here.
                map.dispatchEvent({
                  type: 'click',
                  pixel: [Infinity, Infinity],
                } as any);

                map.dispatchEvent({
                  type: 'click',
                  pixel: mapBrowserEvent.pixel,
                } as any);
              }

              // Reset the translation.
              hasTranslated = false;
              // Re-enable double click to zoom, since it's paused in the beginning of translate.
              getInteraction(map, DoubleClickZoom)?.setActive(true);
            });
            translate.on(InteractionEventTypes.TRANSLATE_END, map.get(ListenerNames.TRANSLATE_END));

            map.addInteraction(translate);

            setPreviouslyClickedLayerId(layerId);
            previouslyClickedLayerIdInClosure = layerId;
          }

          // Markers do not need any Modify interaction
          // since it's being handled by the Translate interaction itself.
          if (isContentTypeMarker) {
            return;
          }
          /**
           * Attach more features to the layer for modification
           */
          addPlainWhitePointFeaturesToLayer(editingLayer, isContentTypeLength);
          addPlusPointFeaturesToLayer(editingLayer, isContentTypeLength);
          // Remove text style from layer if it's clicked
          editingLayer.setStyle(olStyleFunctions.defaultLayerStyle(new Color(editingLayer.get(OlCustomPropertyNames.COLOR))));

          modify = new Modify({
            source: editingLayer.getSource(),
            style: olStyleFunctions.emptyCircle,
            /**
             * Default is 10. If set to 10, plus and white points
             * that are close to each other may get confused.
             */
            // eslint-disable-next-line no-magic-numbers
            pixelTolerance: isMobile() ? 10 : 5,
            /**
             * do not allow adding new points to any sides of a polygon
             */
            insertVertexCondition: (evt: MapBrowserEvent) => {
              const featureBeingModified: Feature<Point> = editingLayer.getSource().getClosestFeatureToCoordinate(
                evt.coordinate, ((f: Feature) => f.getGeometry().getType() === GeometryType.POINT) as any,
              ) as Feature<Point>;

              if (featureBeingModified === undefined) return false;

              return String(featureBeingModified.get('id'))?.startsWith(OlCustomPropertyNames.PLUS);
            },
            // When both Modify and Translate interaction exist,
            // it might cause event conflicts. // https://stackoverflow.com/a/69417410
            // Modify allows adding vertex when dragging the line, while Translate also
            // drags the line/polygon area to move the feature. To avoid that, specifically set the condition to modify
            // only when dragging the plus and white plain feature, not everything else (line/polygon).
            condition: (evt: MapBrowserEvent) => {
              let isClickingEditingNodes = false;

              // Note: getClosestFeatureAtCoordinate doesn't work for some reason,
              // it always returns either the polygon or polyline.
              // This might be slower, but more accurate.
              // Besides, this only triggers once when the modification starts.
              map.forEachFeatureAtPixel(evt.pixel, (f) => {
                const featureId = f.get('id') ?? '';
                if (featureId.startsWith(OlCustomPropertyNames.PLUS) || featureId.startsWith(OlCustomPropertyNames.WHITE_PLAIN)) {
                  isClickingEditingNodes = true;
                }
              });
              return isClickingEditingNodes;
            },
          });

          const geometryType: T.MeasurementContent['type'] = editingLayer.get(OlCustomPropertyNames.GEOMETRY_TYPE) as T.MeasurementContent['type'];
          if (!map.get(ListenerNames.MODIFY_START)) {
            map.set(ListenerNames.MODIFY_START, (evt: ModifyEvent) => {
              /**
               * Modify doen't have lastPointerEvent_ so we have to use 'any' instead
              */
              if (!(modify as any).lastPointerEvent_) {
                return;
              }
              /**
               * Reset again, just to make sure when MODIFY_END has not been called at proper time
               */
              featureIdOfWhitePointBeingDragged = undefined;
              featureIdOfPlusPointBeingDragged = undefined;
              isEmptyCircleStyleSet = false;
              [whitePointLayer, middlePointLayer].forEach((l) => detachLayer({ map, layerGroup, layer: l }));
              leftAndRightPlusPointLayers?.forEach((l) => detachLayer({ map, layerGroup, layer: l }));

              /**
               * Disable unwanted double click zoom while editing very fast more than twice
               */
              getInteraction(map, DoubleClickZoom)?.setActive(false);

              localDispatch({ type: ActionTypes.START_MODIFYING });
              /**
               * Use overlay for realtime measurement tooltip in LAYER_CHANGE callback
               */
              if (geometryType !== T.ContentType.VOLUME) {
                (realtimeMeasurementTooltip as any).element.classList.remove(OlCustomPropertyNames.OL_HIDE_MEASUREMENT_BOX);
              }
              /**
               * remove all plus points on modify start
               */
              editingLayer
                .getSource()
                .getFeatures()
                .filter((feat) => feat.get('id')?.toString().startsWith(OlCustomPropertyNames.PLUS))
                .forEach((feat) => editingLayer.getSource().removeFeature(feat));

              const coordinatesOnModifyStart: Array<Coordinate> = getCoordinatesBasedOnContentType(editingLayer, isContentTypeLength);
              /**
               * Delete last point, because it's duplicate
               * For more, check out https://openlayers.org/en/latest/apidoc/module-ol_geom_Polygon-Polygon.html
               */
              if (!isContentTypeLength) coordinatesOnModifyStart.splice(-1, 1);

              middlePointLayer = createMiddlePointLayer({
                locations: coordinatesOnModifyStart,
                geoType: isContentTypeLength ? GeometryType.LINE_STRING : GeometryType.POLYGON,
              });

              whitePointLayer = initializeEmptyCircleVectorLayerAtCoordinate(evt.mapBrowserEvent.coordinate);
              leftAndRightPlusPointLayers = [
                initializeEmptyCircleVectorLayerAtCoordinate(evt.mapBrowserEvent.coordinate),
                initializeEmptyCircleVectorLayerAtCoordinate(evt.mapBrowserEvent.coordinate),
              ];

              [middlePointLayer, whitePointLayer, ...leftAndRightPlusPointLayers]
                .forEach((l) => attachLayer({ map, layerGroup, layer: l }));

              /**
               * @warning this line might cause an error
               */
              const featuresPossiblyBeingModified: Array<Feature<Point>> = [editingLayer, middlePointLayer].map((l: VectorLayer) =>
                l.getSource().getClosestFeatureToCoordinate(
                  evt.mapBrowserEvent.coordinate, ((f: Feature) => f.getGeometry().getType() === GeometryType.POINT) as any,
                ),
              ) as Array<Feature<Point>>;
              if (featuresPossiblyBeingModified.length > 2) Sentry.captureMessage('Features possibly being modified should at most be 2');
              const featureBeingModifiedId: string =
                (evt.mapBrowserEvent.dragging ? featuresPossiblyBeingModified[0] : featuresPossiblyBeingModified[1]).get('id').toString();
              /**
               * When the user drags on a plus point
               */
              if (featureBeingModifiedId.startsWith(OlCustomPropertyNames.PLUS)) {
                featureIdOfPlusPointBeingDragged = featureBeingModifiedId.replace(/[^0-9]/g, '');
                makeClickedPointStyleToDefault(editingLayer);
              /**
               * When the user drags on a white plain point
               */
              } else if (featureBeingModifiedId.startsWith(OlCustomPropertyNames.WHITE_PLAIN)) {
                featureIdOfWhitePointBeingDragged = featureBeingModifiedId.replace(/[^0-9]/g, '');
                makeClickedPointStyleToDefault(editingLayer);
              }

              if (map.get(ListenerNames.LAYER_CHANGE)) return;
              /**
               * Whenever user is dragging any points
               */
              map.set(ListenerNames.LAYER_CHANGE, (_evt: MapBrowserEvent) => {
                /**
                 * Prevent unknown bugs by exiting if modify.lastPointerEvent_ is undefined
                 */
                if (!(modify as any).lastPointerEvent_) return;
                /**
                 * @warning There is no other way than this.
                 * Properties ending with `_` are subject to change.
                 * Every version update on Openlayers should be done with caution at this line.
                 */
                const draggedToCoordinate: Coordinate = (modify as any).lastPointerEvent_.coordinate_;
                const numberOfPointsInLayer: number = editingLayer.getSource().getFeatures().filter(filterPoints).length;
                /**
                 * If user drags on something that's not a point
                 */
                if (draggedToCoordinate === null) return;

                /**
                 * Hide points next to the point being dragged so that we can instead show fake points
                 */
                if (!isEmptyCircleStyleSet) {
                  const middlePointLayerFeatures: Array<Feature> | undefined = middlePointLayer?.getSource().getFeatures();
                  if (!middlePointLayerFeatures) return;

                  /**
                   * If a plus point is being dragged
                   */
                  if (featureIdOfPlusPointBeingDragged) {
                    /**
                     * This part also is O(n), but is only ran once, so don't worry
                     */
                    const featToHide: Feature<Geometry> | undefined = middlePointLayerFeatures.find(
                      (feat) => `${OlCustomPropertyNames.PLUS}${featureIdOfPlusPointBeingDragged}` === feat.get('id'),
                    );

                    featToHide?.setStyle(olStyleFunctions.emptyCircle);

                    /**
                     * Add one more length segment overlay
                     */
                    if (isContentTypeLength) {
                      /**
                       * First, set id of the existing overlays again by n + 1
                       */
                      for (
                        let overlayIdToOverwrite: number = Number(featureIdOfPlusPointBeingDragged) + 1;
                        overlayIdToOverwrite < numberOfPointsInLayer - 1;
                        overlayIdToOverwrite++
                      ) {
                        const overlay: Overlay | undefined = getLengthSegmentOverlayById(map, overlayIdToOverwrite);
                        if (overlay) setLengthSegmentOverlayId(overlay, overlayIdToOverwrite + 1);
                      }
                      /**
                       * Add one missing overlay because now one more length segment appeared
                       */

                      newLengthSegmentWhenPlusPointDragged = makeLengthSegmentOverlay({
                        coordinate0: [0, 0],
                        coordinate1: [0, 0],
                        idPostfix: Number(featureIdOfPlusPointBeingDragged) + 1,
                      });
                      map.addOverlay(newLengthSegmentWhenPlusPointDragged);
                    }

                    isEmptyCircleStyleSet = true;
                    editingLayer.setStyle(olStyleFunctions.defaultLayerStyle(new Color(editingLayer.get(OlCustomPropertyNames.COLOR))));
                  /**
                   * If a white point is being dragged
                   */
                  } else if (featureIdOfWhitePointBeingDragged) {
                    const leftAndRight: [string, string] = getIdsOfPlusPointsToUpdateWhenWhitePointMoves(
                      featureIdOfWhitePointBeingDragged,
                      numberOfPointsInLayer,
                    );

                    const leftAndRightFullIds: Array<string> = leftAndRight.map((id) => `${OlCustomPropertyNames.PLUS}${id}`);

                    let loopCount: number = 0;

                    for (const feat of middlePointLayerFeatures) {
                      if (leftAndRightFullIds.includes(feat.get('id'))) {
                        feat.setStyle(olStyleFunctions.emptyCircle);
                        ++loopCount;
                      }
                      if (loopCount === 2) break;
                    }
                    isEmptyCircleStyleSet = true;
                    editingLayer.setStyle(olStyleFunctions.defaultLayerStyle(new Color(editingLayer.get(OlCustomPropertyNames.COLOR))));
                  }
                }

                /**
                 * This white point follows mouse drag location
                 */
                const whitePointFeature: Feature<Point> = new Feature(new Point(draggedToCoordinate));
                whitePointFeature.set('id', 'fake-white');
                whitePointFeature.setStyle(olStyleFunctions.movingPoint(new Color(editingLayer.get(OlCustomPropertyNames.COLOR))));
                whitePointLayer?.setSource(new VectorSource({
                  features: [whitePointFeature],
                }));
                if (featureIdOfPlusPointBeingDragged || featureIdOfWhitePointBeingDragged) {
                  const leftAndRightWhitePointsIds: LeftAndRight = getIdsOfWhitePointsNextToDraggedPoint(
                    Number(featureIdOfPlusPointBeingDragged || featureIdOfWhitePointBeingDragged),
                    !!featureIdOfWhitePointBeingDragged,
                    numberOfPointsInLayer,
                    isContentTypeLength,
                  );

                  leftAndRightWhitePoints = leftAndRightWhitePointsIds
                    .map((pointId) => {
                      const [whitePoint]: Array<Feature<Point>> =
                        editingLayer
                          .getSource()
                          .getFeatures()
                          .filter((feat) => feat.get('id') === `${OlCustomPropertyNames.WHITE_PLAIN}${pointId}`) as Array<Feature<Point>>;

                      return whitePoint;
                    })
                    /**
                     * This will give you only one point if you are dragging a length at the either end
                     */
                    .filter((point) => point !== undefined);

                  const midPoints: Array<Coordinate> = leftAndRightWhitePoints.map((whitePoint) => getCenter(
                    boundingExtent([draggedToCoordinate, whitePoint.getGeometry().getCoordinates()]),
                  ));

                  leftAndRightOverlays =
                    leftAndRightWhitePointsIds
                      .map((id, index) => getLengthSegmentOverlayById(
                        map,
                        featureIdOfPlusPointBeingDragged !== undefined ?
                          String(id) : (`${index === 1 ? Number(id) - 1 : id}`),
                      )) as [Overlay | undefined, Overlay | undefined];

                  leftAndRightOverlays
                    .filter((overlay) => overlay)
                    .forEach((overlay: Overlay, index) => {
                      overlay.setPosition(midPoints[index]);
                      const pairOfCoordinates: [Coordinate, Coordinate] = [
                        (leftAndRightWhitePoints[index].getGeometry()).getLastCoordinate(), draggedToCoordinate,
                      ].map((c) => toLonLat(c)) as [Coordinate, Coordinate];
                      if (unitType === T.UnitType.IMPERIAL) {
                        updateImperialMeasurementOnLengthSegmentOverlay({
                          overlay,
                          pairOfCoordinates,
                        });
                      } else {
                        updateMeasurementOnLengthSegmentOverlay({
                          overlay,
                          pairOfCoordinates,
                        });
                      }
                      updateSlopeOnLengthSegmentOverlay({
                        overlay,
                        customText: ' -%',
                      });
                    });

                  midPoints.map((midPoint: Coordinate, idx: number) => {
                    const midPointFeature: Feature = new Feature(new Point(midPoint));
                    midPointFeature.setStyle(olStyleFunctions.plusPoint);
                    /**
                     * It could be undefined when you drag on the edge of a length
                     */
                    leftAndRightPlusPointLayers?.[idx].setSource(
                      new VectorSource({ features: [midPointFeature] }),
                    );
                  });
                }

                const geometry: Geometry = editingLayer.getSource().getFeatureById(OlCustomPropertyNames.MAIN_FEATURE).getGeometry();
                if (geometryType !== T.ContentType.VOLUME) {
                  const baseParams: UpdateRealtimeMeasuementTooltipParams = {
                    realtimeMeasurementTooltip,
                    realtimeMeasurementTooltipElement,
                    geometry,
                    geometryType,
                  };
                  if (geometryType === T.ContentType.LENGTH) {
                    updateMeasurementTooltip({
                      ...baseParams,
                      // eslint-disable-next-line max-len
                      overridingTooltipText: (unitType === T.UnitType.IMPERIAL) ?
                        `${lang === T.Language.KO_KR ? '전체' : 'Total' }: ${getImperialMeasurementFromGeometry({
                          geometry,
                          geometryType,
                        })}${getImperialMeasurementUnitFromGeometryType({
                          geometryType,
                        })}` : `${lang === T.Language.KO_KR ? '전체' : 'Total' }: ${getMeasurementFromGeometry({
                          geometry,
                          geometryType,
                        })}${getMeasurementUnitFromGeometryType({
                          geometryType,
                        })}`,
                      overridingTooltipPosition: (geometry as LineString).getLastCoordinate(),
                    });
                  } else if (geometryType === T.ContentType.AREA) {
                    updateMeasurementTooltip({
                      ...baseParams,
                      // eslint-disable-next-line max-len
                      overridingTooltipText: (unitType === T.UnitType.IMPERIAL) ?
                        `${getImperialMeasurementFromGeometry({ geometry, geometryType })}${getImperialMeasurementUnitFromGeometryType({
                          geometryType,
                        })}` : `${getMeasurementFromGeometry({ geometry, geometryType })}${getMeasurementUnitFromGeometryType({
                          geometryType,
                        })}`,
                      overridingTooltipPosition: (geometry as LineString).getLastCoordinate(),
                    });
                  } else {
                    updateMeasurementTooltip(baseParams);
                  }
                }
              });

              editingLayer.on(InteractionEventTypes.CHANGE, map.get(ListenerNames.LAYER_CHANGE));
            });
            modify.on(InteractionEventTypes.MODIFY_START, map.get(ListenerNames.MODIFY_START));
          }
          if (!map.get(ListenerNames.MODIFY_END)) {
            map.set(ListenerNames.MODIFY_END, (modifyEndEvent: ModifyEvent) => {
              getInteraction(map, DoubleClickZoom)?.setActive(true);
              /**
               * For some reason classList does not work here
               */
              if (geometryType !== T.ContentType.VOLUME) {
                (realtimeMeasurementTooltip as any).element.className += ` ${OlCustomPropertyNames.OL_HIDE_MEASUREMENT_BOX}`;
              }

              localDispatch({ type: ActionTypes.END_MODIFYING });
              /**
               * Delete all white points on modify end
               */
              editingLayer.getSource().getFeatures().filter((feat) => feat.get('id')?.toString().startsWith(OlCustomPropertyNames.WHITE_PLAIN))
                .forEach((feat) => editingLayer.getSource().removeFeature(feat));

              /**
               * Add 'real' plus and white points
               */
              const coordinates: Array<Coordinate> = getCoordinatesBasedOnContentType(editingLayer, isContentTypeLength);
              editingLayer.getSource().addFeatures(makePlusPointFeaturesFromCoordinates(coordinates));
              editingLayer.getSource().addFeatures(makePlainWhitePointFeautresFromCoordinates(coordinates, isContentTypeLength));

              /**
               * Update measurement on length segment overlays
               */

              const cleanup: () => void = () => {
                featureIdOfWhitePointBeingDragged = undefined;
                featureIdOfPlusPointBeingDragged = undefined;
                leftAndRightOverlays = undefined;
                newLengthSegmentWhenPlusPointDragged = undefined;
                isEmptyCircleStyleSet = false;
                [whitePointLayer, middlePointLayer].forEach((l) => detachLayer({ map, layerGroup, layer: l }));
                leftAndRightPlusPointLayers?.forEach((l) => detachLayer({ map, layerGroup, layer: l }));

                /**
                 * Area or volume has duplicate points at first and last
                 */
                if (!isContentTypeLength) coordinates.pop();

                // Height is maintained when the length made in 3D is modified in 2D.
                // For normal calculation of Point-to-Point, the Height value is excluded if modified in 2D.
                const locationsForServer: Array<Coordinate> = coordinates
                  .map((coordinate) => coordinate.slice(0, 2))
                  .map((coordinate) => proj4('EPSG:3857', 'EPSG:4326').forward(coordinate));
                /**
                 * Update locations in server
                 */
                const hasElevations: boolean = typeGuardLength(Contents.contents.byId[layerId])?.info?.elevations !== undefined;

                if (isContentTypeLength && hasElevations) {
                  reduxDispatch(UpdateLengthAreaVolumeLocations({
                    contentId: layerId,
                    locations: locationsForServer,
                  }));
                } else if (isContentTypeVolume) {
                  localDispatch({ type: ActionTypes.START_MODIFYING_VOLUME });
                  volumeModifySubjects$.get(layerId)?.next({ layerId, locationsForServer });
                } else {
                  reduxDispatch(PatchContent({ content: { id: layerId, info: { locations: locationsForServer } } }));
                }
              };

              if (isContentTypeLength) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                (async () => {
                  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                  if (!leftAndRightOverlays || !lengthCoordinatesElevations) return;

                  const targetDSMId: number | undefined = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.DSM);
                  const [lon, lat]: Coordinate = toLonLat(modifyEndEvent.mapBrowserEvent.coordinate);

                  const draggedPointElevation: number | undefined = targetDSMId ? await ajax.get(
                    `https://${volumeServiceHostname}/elev/${targetDSMId}?lon=${lon}&lat=${lat}`,
                    authHeader,
                  ).pipe(
                    rxjsMap(({ response }): T.ElevationInfo => response),
                    rxjsMap(({ value }) => value),
                    catchError((err) => {
                      Sentry.captureException(err);

                      return of(undefined);
                    }),
                  ).toPromise() : undefined;

                  let leftAndRightWhitePointsForOverlays: Array<null | Feature<Point>> = [];
                  for (const [index, overlay] of leftAndRightOverlays.entries()) {
                    if (overlay === undefined) {
                      if (index === 0) leftAndRightWhitePointsForOverlays = [null, ...leftAndRightWhitePoints];
                      if (index === 1) leftAndRightWhitePointsForOverlays = [...leftAndRightWhitePoints, null];
                    }
                  }
                  if (leftAndRightWhitePointsForOverlays.length === 0) leftAndRightWhitePointsForOverlays = leftAndRightWhitePoints;

                  for (const [index, overlay] of leftAndRightOverlays.entries()) {
                    if (!overlay) continue;
                    const leftOrRightPointIndex: number | undefined =
                      leftAndRightWhitePointsForOverlays[index]?.get('id').toString().replace(/[^0-9]/g, '');

                    const pointForOverlay: Feature<Point> | null = leftAndRightWhitePointsForOverlays[index];
                    if (leftOrRightPointIndex === undefined || pointForOverlay === null) continue;

                    const leftOrRightPointElevation: number | undefined = lengthCoordinatesElevations[leftOrRightPointIndex].elevation;
                    updateSlopeOnLengthSegmentOverlay({
                      overlay,
                      pairOfCoordinateAndElevations: [
                        {
                          elevation: (leftOrRightPointElevation !== undefined) ? (leftOrRightPointElevation * VALUES_PER_METER[unitType]) : undefined,
                          coordinate: (toLonLat(pointForOverlay.getGeometry().getLastCoordinate())),
                        },
                        {
                          elevation: (draggedPointElevation !== undefined) ? (draggedPointElevation * VALUES_PER_METER[unitType]) : undefined,
                          coordinate: [lon, lat],
                        },
                      ],
                      customText: targetDSMId === undefined ? '-%' : undefined,
                    });
                  }

                  return { draggedPointElevation, lon, lat };
                })().then((updatedElevInfo) => {
                  if (updatedElevInfo !== undefined) {
                    const { draggedPointElevation, lon, lat } = updatedElevInfo;
                    const updatedPointInfo: CoordinateAndElevation = {
                      elevation: draggedPointElevation,
                      coordinate: [lon, lat],
                    };
                    if (featureIdOfPlusPointBeingDragged !== undefined) {
                      lengthCoordinatesElevations = [
                        ...lengthCoordinatesElevations.slice(0, Number(featureIdOfPlusPointBeingDragged) + 1),
                        updatedPointInfo,
                        ...lengthCoordinatesElevations.slice(1 + Number(featureIdOfPlusPointBeingDragged)),
                      ];
                    } else if (featureIdOfWhitePointBeingDragged !== undefined) {
                      lengthCoordinatesElevations[Number(featureIdOfWhitePointBeingDragged)] = updatedPointInfo;
                    }
                  }

                  deleteAllLengthSegmentOverlays(map);
                  makeManyMeasurementOverlays({
                    lengthCoordinatesElevations,
                    olMap: map,
                    unitType,
                  });

                  cleanup();
                });
              } else {
                cleanup();
              }
            });
            /**
             * add all plus points on modify end again
             */
            modify.on(InteractionEventTypes.MODIFY_END, map.get(ListenerNames.MODIFY_END));
          }

          map.addInteraction(modify);

          setPreviouslyClickedLayerId(layerId);
          previouslyClickedLayerIdInClosure = layerId;

          return true;
        }), hitTolerance3px);
      };
      map.set(ListenerNames.CLICK, clickListener);
    }
    const keyboardListener: (e: KeyboardEvent) => void = ({ key }) => {
      /**
       * Whenever user presses the key anyways, but no layer is selected
       */
      if (!selectedLayer) return;
      if (selectedLayer.get('id') === undefined) return;
      const geometryType: T.MeasurementContent['type'] = selectedLayer.get(OlCustomPropertyNames.GEOMETRY_TYPE) as T.MeasurementContent['type'];

      /**
       * If content type is marker, delete function should not work
       */
      if (geometryType === T.ContentType.MARKER) return;

      if (['Delete', 'Backspace'].includes(key)) {
        /**
         * @desc Without this statement, error occurs
         */
        const layer: VectorLayer = selectedLayer;
        layer.getSource().getFeatures().forEach((feature) => {
          /**
           * @desc There is only one point in map named FEATURE_DELETION_KEY
           * because If we click outside, All feature id are gone
           */
          if (feature.get(OlCustomPropertyNames.TO_BE_DELETED_POINT)) {
            const isContentTypeLength: boolean = layer.get(OlCustomPropertyNames.GEOMETRY_TYPE) === T.ContentType.LENGTH;
            const isContentTypeVolume: boolean = layer.get(OlCustomPropertyNames.GEOMETRY_TYPE) === T.ContentType.VOLUME;
            const mainGeometry: LineString | Polygon = isContentTypeLength ? getLineStringFromLayer(layer) : getPolygonFromLayer(layer);
            const mainCoordinates: Array<Coordinate> = getCoordinatesBasedOnContentType(layer, isContentTypeLength);

            if (mainCoordinates.length > getMinNumberOfPointsToMakeShape(geometryType)) {
              const index: number = parseInt(feature.get('id').replace(/[^0-9]/g, ''), 10);
              let coordinates: Array<Coordinate> = [...mainCoordinates.slice(0, index), ...mainCoordinates.slice(index + 1)];

              if (!isContentTypeLength) {
                coordinates = coordinates.slice(0, coordinates.length - 1);
                coordinates.push(coordinates[0]);
                (mainGeometry as Polygon).setCoordinates([coordinates]);
              } else {
                (mainGeometry as LineString).setCoordinates(coordinates);

                /**
                 * Reset length segment overlays
                 */
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                (async () => {
                  const targetDSMId: number | undefined = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.DSM);

                  /**
                   * Hide overlays next to the point deleted first
                   */
                  [index, index - 1]
                    .map((i) => getLengthSegmentOverlayById(map, i))
                    .forEach((overlay) => {
                      if (overlay) map.removeOverlay(overlay);
                    });

                  const coordinatesIn4326: Array<Coordinate> = coordinates.map((c) => toLonLat(c));
                  const lengthElevations: Array<T.ElevationInfo['value']> =
                      await requestElevationsFromCoordinates({ coordinates: coordinatesIn4326, targetDSMId, authHeader });

                  lengthCoordinatesElevations =
                    _.zip(lengthElevations, coordinatesIn4326)
                      .map(([elevation, coordinate]) => ({ elevation, coordinate })) as Array<CoordinateAndElevation>;
                  deleteAllLengthSegmentOverlays(map);
                  makeManyMeasurementOverlays({
                    lengthCoordinatesElevations,
                    olMap: map,
                    unitType,
                  });
                })();
              }

              layer.getSource().removeFeature(feature);
              resetLayerToInitialStyle(map, layer.get('id'), true);
              addPlusPointFeaturesToLayer(layer, isContentTypeLength);
              addPlainWhitePointFeaturesToLayer(layer, isContentTypeLength);

              /**
               * Area or volume has duplicate points at first and last
               */
              if (!isContentTypeLength) coordinates.pop();
              const locationsForServer: Array<Coordinate> = coordinates.map((coordinate) => proj4('EPSG:3857', 'EPSG:4326').forward(coordinate));

              const hasElevations: boolean = (Contents.contents.byId[layer.get('id')] as T.LengthContent)?.info?.elevations !== undefined;

              if (isContentTypeLength && hasElevations) {
                reduxDispatch(UpdateLengthAreaVolumeLocations({
                  contentId: layer.get('id'),
                  locations: locationsForServer,
                }));
              } else if (isContentTypeVolume) {
                localDispatch({ type: ActionTypes.START_MODIFYING_VOLUME });
                volumeModifySubjects$.get(layer.get('id'))?.next({ layerId: layer.get('id'), locationsForServer });
              } else {
                reduxDispatch(PatchContent({ content: { id: layer.get('id'), info: { locations: locationsForServer } } }));
              }
            } else {
              if (layer.get('id') === undefined) return;

              deleteContent(layer.get('id'), layer.get(OlCustomPropertyNames.GEOMETRY_TYPE));
            }
          }
        });
      }
    };
    document.addEventListener(InteractionEventTypes.KEYDOWN, keyboardListener);
    map.on(InteractionEventTypes.CLICK, map.get(ListenerNames.CLICK));

    return () => {
      localDispatch({ type: ActionTypes.END_MODIFYING_VOLUME });
      localDispatch({ type: ActionTypes.DEREGISTER_CLICK_EVENT });
      map.un(InteractionEventTypes.CLICK, map.get(ListenerNames.CLICK));
      map.unset(ListenerNames.CLICK);
      if (map.get(ListenerNames.MODIFY_START)) modify?.un(InteractionEventTypes.MODIFY_START, map.get(ListenerNames.MODIFY_START));
      map.unset(ListenerNames.MODIFY_START);
      if (map.get(ListenerNames.MODIFY_END)) modify?.un(InteractionEventTypes.MODIFY_END, map.get(ListenerNames.MODIFY_END));
      map.unset(ListenerNames.MODIFY_END);
      if (map.get(ListenerNames.TRANSLATE_START)) translate?.un(InteractionEventTypes.TRANSLATE_START, map.get(ListenerNames.TRANSLATE_START));
      map.unset(ListenerNames.TRANSLATE_START);
      if (map.get(ListenerNames.TRANSLATE_END)) translate?.un(InteractionEventTypes.TRANSLATE_END, map.get(ListenerNames.TRANSLATE_END));
      map.unset(ListenerNames.TRANSLATE_END);
      if (map.get(ListenerNames.TRANSLATING)) translate?.un(InteractionEventTypes.TRANSLATING, map.get(ListenerNames.TRANSLATING));
      map.unset(ListenerNames.TRANSLATING);
      if (map.get(ListenerNames.LAYER_CHANGE)) selectedLayer?.un(InteractionEventTypes.CHANGE, map.get(ListenerNames.LAYER_CHANGE));
      map.unset(ListenerNames.LAYER_CHANGE);

      document.removeEventListener(InteractionEventTypes.KEYDOWN, keyboardListener);

      if (modify) map.removeInteraction(modify);
      if (translate) map.removeInteraction(translate);
      map.removeOverlay(realtimeMeasurementTooltip);

      volumeModifySubjects$.clear();
    };
  }, [
    currentContentTypeFromAnnotationPicker,
    isDrawing,
  ]);

  return <></>;
};

export default OlModifyEventListener;
