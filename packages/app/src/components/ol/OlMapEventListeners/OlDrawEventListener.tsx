/* eslint-disable max-lines */
import {
  UseL10n, UseLastSelectedScreen, UseState,
  useEscapeMeasurement, useExitCreatingVolume,
  useL10n, useLastSelectedScreen, useProjectCoordinateSystem, useRole,
} from '^/hooks';
import { CreateAndEditMeasurement, PostContentArguments } from '^/store/duck/Contents';
import {
  ChangeCreatingVolume,
  ChangeCurrentContentTypeFromAnnotationPicker,
  OpenContentPagePopup,
} from '^/store/duck/Pages';
import * as T from '^/types';
import {
  RealTimeMeasurementTooltipOverlayAndElement,
  UpdateRealtimeMeasuementTooltipParams,
  attachLayer, detachLayer,
  makeRealtimeMeasurementTooltip,
  updateMeasurementTooltip,
} from '^/utilities/ol-layer-util';
import { isRoleViewer } from '^/utilities/role-permission-check';
import _ from 'lodash-es';
import { Feature, MapBrowserEvent } from 'ol';
import OlMap from 'ol/Map';
import { Coordinate } from 'ol/coordinate';
import BaseEvent from 'ol/events/Event';
import { noModifierKeys } from 'ol/events/condition';
import { LineString } from 'ol/geom';
import Geometry from 'ol/geom/Geometry';
import GeometryType from 'ol/geom/GeometryType';
import Point from 'ol/geom/Point';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import React, { Dispatch as LocalDispatch, FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch as ReduxDispatch } from 'redux';

import { getMeasurementContentTitlesFromDate } from '^/utilities/content-util';
import { isMobile } from '^/utilities/device';
import { Point as SimplePoint, Polygon, isPointInPolygon } from '^/utilities/math';
import { deleteAllLengthSegmentOverlays } from '../OlLengthSegmentOverlays/util';
import {
  InteractionEventTypes, ListenerNames, MAX_THRESHOLD_TO_ASSUME_SAME_COORDINATE, OlCustomPropertyNames, OlMinCoordinatesLength,
} from '../constants';
import {
  contentTypeToGeometryType,
  getCoordinatesFromGeometry,
  getDefaultContentCreatorFromGeometryType,
  getImperialMeasurementFromGeometry,
  getImperialMeasurementUnitFromGeometryType,
  getMeasurementFromGeometry,
  getMeasurementUnitFromGeometryType,
} from '../contentTypeSwitch';
import { makeCustomDrawStyle, olStyleFunctions } from '../styles';
import { ActionTypes, Actions } from './store/Actions';
import { useLoadingLayer } from './useLoadingLayer';
import { setMarkerPinpointerOn, unsetMarkerPinpointerOn } from './utils/markerPinpointerSetter';
import { determineUnitType } from '^/utilities/imperial-unit';

export function setRootMapCursor(map: OlMap, cursorStyle: string): void {
  map.getViewport().style.cursor = cursorStyle;
}

interface Props {
  layerGroup?: LayerGroup;
  localDispatch: LocalDispatch<Actions>;
  map: OlMap;
}

const OlDrawEventListener: FC<Props> = ({
  localDispatch,
  map,
  layerGroup,
}) => {
  const {
    Contents: { contents: { byId } },
    Pages: {
      Contents: {
        creatingVolumeInfo,
        currentContentTypeFromAnnotationPicker,
        projectId,
      },
    },
    Projects: { projects: { byId: projectById } },
  }: T.State = useSelector((state: T.State) => state);
  const reduxDispatch: ReduxDispatch = useDispatch();

  const [, language]: UseL10n = useL10n();
  const role: T.PermissionRole = useRole();
  const lastSelectedScreen: UseLastSelectedScreen = useLastSelectedScreen();
  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();
  const contentTitlesShownOnCurrentDate: Array<string> = getMeasurementContentTitlesFromDate(byId, lastSelectedScreen?.appearAt);

  const [coordinatesSentToServer, setCoordinatesSentToServer]: UseState<Array<Coordinate> | undefined> = useState();

  if (projectId === undefined) throw new Error(' No Project Id in Pages.Contents.projectId');

  const unitType: T.ValidUnitType = determineUnitType(projectById[projectId].unit);

  useLoadingLayer({
    currentContentTypeFromAnnotationPicker,
    olMap: map,
    layerGroup,
    coordinatesSentToServer,
    setCoordinatesSentToServer,
  });

  useEscapeMeasurement();

  const exitCreatingVolume: () => void = useExitCreatingVolume();

  useEffect(() => {
    deleteAllLengthSegmentOverlays(map);

    localDispatch({ type: ActionTypes.SELECT_LENGTH, payload: undefined });
    localDispatch({ type: ActionTypes.END_HOVERING_ON_LAYER });

    // eslint-disable-next-line prefer-const
    let draw: Draw | undefined;
    const source: VectorSource | undefined = new VectorSource();
    const layer: VectorLayer | undefined = new VectorLayer({
      source,
      style: olStyleFunctions.newlyCreatedVectorLayer,
    });
    /**
     * Use this for displaying real-time value when drawing something
     */
    let featureUnderSketch: Feature<Geometry> | undefined;
    /**
     * Used to count previous length of coordinates of layer being drawn
     */
    let previousLengthOfCoordinates: number | undefined;

    /**
     * Used to track coordinates from the geometry being drawn
     */
    let drawnCoordinates: Array<Coordinate> | undefined;
    /**
     * Tooltip for real-time measurement
     */
    const {
      realtimeMeasurementTooltip,
      realtimeMeasurementTooltipElement,
    }: RealTimeMeasurementTooltipOverlayAndElement = makeRealtimeMeasurementTooltip();
    /**
     * Layer to display the check (tick) icon
     */
    const checkIconLayer: VectorLayer = (() => {
      const [firstCoordinateFeat, lastCoordinateFeat]: Array<Feature<Point>> =
       [[new Feature(new Point([0, 0])), OlCustomPropertyNames.FIRST_COORDINATE_CHECK_ICON],
         [new Feature(new Point([0, 0])), OlCustomPropertyNames.LAST_COORDINATE_CHECK_ICON]]
         .map(([feat, featId]: [Feature<Point>, OlCustomPropertyNames]) => {
           feat.setId(featId);

           return feat;
         });

      return new VectorLayer({
        source: new VectorSource({
          features: [firstCoordinateFeat, lastCoordinateFeat],
        }),
        style: olStyleFunctions.checkPoint,
        zIndex: 999999999999999,
        /**
         * Keep the layer above the drawing layer
         */
        declutter: true,
      });
    })();

    /**
     * When user clicks on arrow (select) button to quit draw mode
     */
    if (currentContentTypeFromAnnotationPicker === undefined) {
      if (draw) map.removeInteraction(draw);

      return;
    }

    if (isRoleViewer(role)) {
      reduxDispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));

      return;
    }
    // isPrevContentTypeFromAnnotationPickerDefined = true;
    if (draw) map.removeInteraction(draw);

    const designDxfContent: T.DesignDXFContent | undefined =
      creatingVolumeInfo?.designDxfId !== undefined && creatingVolumeInfo?.type === T.VolumeCalcMethod.DESIGN ?
        byId[creatingVolumeInfo.designDxfId] as T.DesignDXFContent : undefined;

    /**
     * @desc This function will distinguish between where you can draw
     */
    const isPointInPolygonCondition: (event: MapBrowserEvent) => boolean = (event) => {
      if (designDxfContent === undefined) return false;
      const point: SimplePoint = event.coordinate as SimplePoint;
      const designBorderPolygon: Polygon = [...designDxfContent.info.designBorder];

      return isPointInPolygon(designBorderPolygon, point);
    };

    draw = (() => {
      if (currentContentTypeFromAnnotationPicker === T.ContentType.MARKER && !isMobile() && !isRoleViewer(role)) {
        setMarkerPinpointerOn(map, projectProjection);
      } else {
        setRootMapCursor(map, 'crosshair');
      }

      let isCheckIconLayerDetachedInClosure: boolean = false;
      const isDBVC: boolean = designDxfContent !== undefined && currentContentTypeFromAnnotationPicker === T.ContentType.VOLUME;

      return new Draw({
        condition: isDBVC ? isPointInPolygonCondition : noModifierKeys,
        source,
        type: contentTypeToGeometryType[currentContentTypeFromAnnotationPicker],
        style: (feature: Feature, _resolution) => {
          const geometryType: GeometryType = feature.getGeometry().getType();

          if (drawnCoordinates && geometryType === GeometryType.POINT) {
            const firstCoordinateInEPSG3857: Coordinate = fromLonLat(drawnCoordinates[0]);
            const movingMouseCoordinateInEPSG3857: Coordinate = (feature.getGeometry() as Point).getLastCoordinate();
            const difference: Coordinate =
              firstCoordinateInEPSG3857.map((elem, idx) => Math.abs(elem - movingMouseCoordinateInEPSG3857[idx]));
            /**
             * If user hovers over the first coordinate
             */
            if (difference[0] < MAX_THRESHOLD_TO_ASSUME_SAME_COORDINATE && difference[1] < MAX_THRESHOLD_TO_ASSUME_SAME_COORDINATE) {
              /**
               * Detach the check point at the last coordinate
               */
              detachLayer({ map, layerGroup, layer: checkIconLayer });
              isCheckIconLayerDetachedInClosure = true;

              return olStyleFunctions.checkPoint();
            }
            if (isCheckIconLayerDetachedInClosure) {
              attachLayer({ map, layerGroup, layer: checkIconLayer });
              isCheckIconLayerDetachedInClosure = false;
            }
          }

          /**
           * To get rid of the blue dot when drawing
           */
          return geometryType === GeometryType.POINT ? new Style({}) : makeCustomDrawStyle({
            contentType: currentContentTypeFromAnnotationPicker as T.MeasurementContent['type'],
            geometryType,
          });
        },
      });
    })();

    if (!map.get(ListenerNames.DRAW_START)) {
      map.set(ListenerNames.DRAW_START, (drawEvent: DrawEvent) => {
        reduxDispatch(ChangeCreatingVolume({ info: { isDrawing: true } }));
        if (currentContentTypeFromAnnotationPicker !== T.ContentType.VOLUME) map.addOverlay(realtimeMeasurementTooltip);

        featureUnderSketch = drawEvent.feature;
        if (!map.get(ListenerNames.GEOMETRY_CHANGE)) {
          /**
           * Show area/length real time when the user is drawing it
           */
          map.set(ListenerNames.GEOMETRY_CHANGE, (geometryChangeEvent: BaseEvent) => {
            const geometry: Geometry = geometryChangeEvent.target;

            const baseParams: UpdateRealtimeMeasuementTooltipParams = {
              realtimeMeasurementTooltip,
              realtimeMeasurementTooltipElement,
              geometry,
              geometryType: currentContentTypeFromAnnotationPicker,
            };
            if (currentContentTypeFromAnnotationPicker === T.ContentType.LENGTH) {
              updateMeasurementTooltip({
                ...baseParams,
                // eslint-disable-next-line max-len
                overridingTooltipText: (unitType === T.UnitType.IMPERIAL) ?
                  `${language === T.Language.KO_KR ? '전체' : 'Total' }: ${getImperialMeasurementFromGeometry({
                    geometry,
                    geometryType: currentContentTypeFromAnnotationPicker,
                  })}${getImperialMeasurementUnitFromGeometryType({
                    geometryType: currentContentTypeFromAnnotationPicker,
                  })}` : `${language === T.Language.KO_KR ? '전체' : 'Total' }: ${getMeasurementFromGeometry({
                    geometry,
                    geometryType: currentContentTypeFromAnnotationPicker,
                  })}${getMeasurementUnitFromGeometryType({
                    geometryType: currentContentTypeFromAnnotationPicker,
                  })}` ,
                overridingTooltipPosition: (geometry as LineString).getLastCoordinate(),
              });
            } else if (currentContentTypeFromAnnotationPicker === T.ContentType.AREA) {
              updateMeasurementTooltip({
                ...baseParams,
                // eslint-disable-next-line max-len
                overridingTooltipText: (unitType === T.UnitType.IMPERIAL) ?
                  `${getImperialMeasurementFromGeometry({
                    geometry,
                    geometryType: currentContentTypeFromAnnotationPicker,
                  })}${getImperialMeasurementUnitFromGeometryType({
                    geometryType: currentContentTypeFromAnnotationPicker,
                  })}` : `${getMeasurementFromGeometry({
                    geometry,
                    geometryType: currentContentTypeFromAnnotationPicker,
                  })}${getMeasurementUnitFromGeometryType({
                    geometryType: currentContentTypeFromAnnotationPicker,
                  })}`,
                overridingTooltipPosition: (geometry as LineString).getLastCoordinate(),
              });
            } else {
              updateMeasurementTooltip(baseParams);
            }

            if (currentContentTypeFromAnnotationPicker === T.ContentType.MARKER) return;

            const coordinates: Array<Coordinate> =
            getCoordinatesFromGeometry(geometry, currentContentTypeFromAnnotationPicker);

            /**
             * Update the length as you draw point by point
             */
            if (currentContentTypeFromAnnotationPicker === T.ContentType.LENGTH) {
              localDispatch({ type: ActionTypes.SELECT_LENGTH, payload: { coordinates } });
            }

            /**
             * If they are under proper length, don't show the check icon
             */
            if (coordinates.length < OlMinCoordinatesLength.LENGTH && currentContentTypeFromAnnotationPicker === T.ContentType.LENGTH) return;
            if (coordinates.length < OlMinCoordinatesLength.AREA &&
                (currentContentTypeFromAnnotationPicker === T.ContentType.AREA ||
                currentContentTypeFromAnnotationPicker === T.ContentType.VOLUME)
            ) return;
            /**
             * Store the first coordinate drawn for check icon styling
             */
            if (drawnCoordinates === undefined) drawnCoordinates = coordinates;
            /**
             * Second last point
             */
            const indexOfSecondLastPoint: Readonly<number> = coordinates.length - 2;
            /**
             * Only render again if index is not out of range and another point has been added
             */
            if (indexOfSecondLastPoint > 0 && previousLengthOfCoordinates !== coordinates.length) {
              checkIconLayer.getSource()
                .getFeatureById(OlCustomPropertyNames.LAST_COORDINATE_CHECK_ICON)
                .setGeometry(new Point(fromLonLat(coordinates[indexOfSecondLastPoint])));
              previousLengthOfCoordinates = coordinates.length;
            }
          });
        }
        featureUnderSketch.getGeometry().on(InteractionEventTypes.CHANGE, map.get(ListenerNames.GEOMETRY_CHANGE));
      });
      draw.on(InteractionEventTypes.DRAW_START, map.get(ListenerNames.DRAW_START));
    }

    draw.on(InteractionEventTypes.DRAW_END, (drawEvent: DrawEvent & {unprojectedLocation: T.GeoPoint[]}) => {
      unsetMarkerPinpointerOn(map);

      map.removeOverlay(realtimeMeasurementTooltip);
      if (layer && draw) {
        const locations: Array<T.GeoPoint> = drawEvent.unprojectedLocation !== undefined ?
          drawEvent.unprojectedLocation :
          getCoordinatesFromGeometry(drawEvent.feature.getGeometry(), currentContentTypeFromAnnotationPicker, projectProjection);

        // ESS is not available in 2D OpenLayers, disabling it.
        if (
          currentContentTypeFromAnnotationPicker === T.ContentType.ESS_TEXT
          || currentContentTypeFromAnnotationPicker === T.ContentType.ESS_POLYLINE
          || currentContentTypeFromAnnotationPicker === T.ContentType.ESS_POLYGON
          || currentContentTypeFromAnnotationPicker === T.ContentType.ESS_ARROW
        ) {
          return;
        }

        const { info, title, color, type }: Pick<T.GeometryContent, PostContentArguments> = getDefaultContentCreatorFromGeometryType({
          geometryType: currentContentTypeFromAnnotationPicker,
          createOptions: {
            locations,
            language,
            usingNames: contentTitlesShownOnCurrentDate,
          },
        });

        switch (currentContentTypeFromAnnotationPicker) {
          case T.ContentType.VOLUME: {
            localDispatch({
              type: ActionTypes.END_DRAWING_VOLUME,
              payload: ({
                info,
                title,
                color,
                type,
              }) as Pick<T.VolumeContent, PostContentArguments>,
            });

            if (creatingVolumeInfo !== undefined) {
              switch (creatingVolumeInfo.type) {
                case T.VolumeCalcMethod.BASIC:
                  reduxDispatch(CreateAndEditMeasurement({
                    data: {
                      info: {
                        ...info,
                        calculatedVolume: {
                          calculation: {
                            type: T.VolumeCalcMethod.BASIC,
                            volumeAlgorithm: T.BasicCalcBasePlane.TRIANGULATED,
                            volumeElevation: 0,
                          },
                          cut: 0, fill: 0, total: 0,
                        },
                      },
                      title,
                      color,
                      type: currentContentTypeFromAnnotationPicker,
                    },
                  }));
                  break;
                case T.VolumeCalcMethod.DESIGN:
                  if (creatingVolumeInfo?.designDxfId !== undefined) {
                    reduxDispatch(CreateAndEditMeasurement({
                      data: {
                        info: {
                          ...info,
                          calculatedVolume: {
                            calculation: {
                              type: T.VolumeCalcMethod.DESIGN,
                              volumeAlgorithm: T.BasicCalcBasePlane.CUSTOM,
                              volumeElevation: 0,
                              designDxfId: creatingVolumeInfo.designDxfId,
                            },
                            cut: 0, fill: 0, total: 0,
                          },
                        },
                        title,
                        color,
                        type: currentContentTypeFromAnnotationPicker,
                      },
                    }));
                  }
                  break;
                case T.VolumeCalcMethod.SURVEY:
                  if (creatingVolumeInfo?.previousDsmId !== undefined) {
                    reduxDispatch(CreateAndEditMeasurement({
                      data: {
                        info: {
                          ...info,
                          calculatedVolume: {
                            calculation: {
                              type: T.VolumeCalcMethod.SURVEY,
                              volumeAlgorithm: T.BasicCalcBasePlane.CUSTOM,
                              volumeElevation: 0,
                              previousDsmId: creatingVolumeInfo.previousDsmId,
                            },
                            cut: 0, fill: 0, total: 0,
                          },
                        },
                        title,
                        color,
                        type: currentContentTypeFromAnnotationPicker,
                      },
                    }));
                  }
                  break;
                default:
              }
            }
            break;
          }
          case T.ContentType.MARKER:
          case T.ContentType.AREA:
          case T.ContentType.LENGTH: {
            reduxDispatch(CreateAndEditMeasurement({
              data: {
                info,
                title,
                color,
                type: currentContentTypeFromAnnotationPicker,
              },
            }));
            break;
          }
          default: {
            throw new Error(`Invalid type: ${currentContentTypeFromAnnotationPicker}`);
          }
        }

        setCoordinatesSentToServer(locations);
        draw.setActive(false);
        /**
         * @todo wait for the request to finish (show loading), and finally detach the layer
         * because we are going to show the content in OlAnnotationLayer
         */
        detachLayer({ map, layerGroup, layer });
        /**
         * To prevent modify after finishing draw on the top of another layer
         */
        window.setTimeout(() => {
          if (draw) map.removeInteraction(draw);
        });

        localDispatch({ type: ActionTypes.END_DRAWING });
        if (currentContentTypeFromAnnotationPicker === T.ContentType.VOLUME) exitCreatingVolume();
        reduxDispatch(ChangeCurrentContentTypeFromAnnotationPicker({}));

        if (map.get(ListenerNames.GEOMETRY_CHANGE)) featureUnderSketch?.un(InteractionEventTypes.CHANGE, map.get(ListenerNames.GEOMETRY_CHANGE));
        map.unset(ListenerNames.GEOMETRY_CHANGE);
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        if (map.get(ListenerNames.DRAW_START)) draw?.un(InteractionEventTypes.DRAW_START, map.get(ListenerNames.DRAW_START));
        map.unset(ListenerNames.DRAW_START);

        if (currentContentTypeFromAnnotationPicker === T.ContentType.LENGTH) {
          localDispatch({ type: ActionTypes.SELECT_LENGTH, payload: undefined });
        }
        map.removeLayer(checkIconLayer);
      }
    });
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (layer && draw) attachLayer({ map, layerGroup, layer, interactions: [draw] });
    attachLayer({ map, layerGroup, layer: checkIconLayer });
    localDispatch({ type: ActionTypes.START_DRAWING });
    localDispatch({ type: ActionTypes.SHOW_LENGTH_SEGMENT_OVERLAYS });

    return () => {
      setRootMapCursor(map, 'auto');

      if (layer && draw) {
        draw.setActive(false);
        detachLayer({ map, layerGroup, layer });
        /**
         * To prevent modify after finishing draw on the top of another layer
         */
        window.setTimeout(() => {
          if (draw) map.removeInteraction(draw);
        });
        detachLayer({ map, layerGroup, layer: checkIconLayer });
        localDispatch({ type: ActionTypes.END_DRAWING });

        if (map.get(ListenerNames.GEOMETRY_CHANGE)) featureUnderSketch?.un(InteractionEventTypes.CHANGE, map.get(ListenerNames.GEOMETRY_CHANGE));
        map.unset(ListenerNames.GEOMETRY_CHANGE);
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        if (map.get(ListenerNames.DRAW_START)) draw?.un(InteractionEventTypes.DRAW_START, map.get(ListenerNames.DRAW_START));
        map.unset(ListenerNames.DRAW_START);

        map.removeOverlay(realtimeMeasurementTooltip);
      }
    };
  }, [currentContentTypeFromAnnotationPicker, creatingVolumeInfo?.designDxfId, creatingVolumeInfo?.previousDsmId]);

  useEffect(() => {
    if (currentContentTypeFromAnnotationPicker !== T.ContentType.MARKER) {
      unsetMarkerPinpointerOn(map);
    }
  }, [currentContentTypeFromAnnotationPicker]);

  return <></>;
};

export default OlDrawEventListener;
// eslint-disable-next-line max-lines

