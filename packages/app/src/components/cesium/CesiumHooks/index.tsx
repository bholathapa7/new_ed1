/* eslint-disable max-lines */
import { ColorNumbers } from '^/components/ol/styles';
import {
  CallbackProperty, Cartesian3, Cartographic, CesiumTerrainProvider,
  ColorGeometryInstanceAttribute, ColorMaterialProperty, ConstantPositionProperty, ConstantProperty,
  Entity, EntityCollection,
  GeoJsonDataSource, GeometryInstance, GroundPolylineGeometry, GroundPolylinePrimitive,
  HeadingPitchRoll, HeightReference, Ion, IonImageryProvider, JulianDate, Math as CesiumMath,
  PolygonHierarchy, PolylineArrowMaterialProperty, PolylineColorAppearance,
  Primitive, PrimitiveCollection, PropertyBag, Quaternion, Transforms, Viewer, WebMercatorProjection,
  createWorldImagery, defined, PolylineGeometry,
} from 'cesium';
import Color from 'color';
import _ from 'lodash-es';
import { Coordinate } from 'ol/coordinate';
import { toLonLat } from 'ol/proj';
import proj4 from 'proj4';
import React, { FC, MutableRefObject, RefObject, SetStateAction,
  useCallback, useContext, useEffect, useMemo, useRef, useState,
  Dispatch as LocalDispatch,
} from 'react';
import areDeepEqual from 'react-fast-compare';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import { MarkerIconWithShadow } from '^/assets/icons/annotation/marker-on-map.svg';
import MarkerPinPointerPNG from '^/assets/icons/marker-pinpointer.png';
import { requestElevationsFromCoordinates } from '^/components/ol/OlLengthSegmentOverlays/util';
import { getDefaultContentCreatorFromGeometryType } from '^/components/ol/contentTypeSwitch';
import {
  CESIUM_ENTITY_PREFIX,
  DESIGN_DXF_PREVIEW_ID, DRAWING_MEASUREMENT_ID,
  ELEVATION_PROFILE_HOVER_ID,
  POLYGON_ON_GROUND_ALPHA, POLYGON_ON_GROUND_EDGE_ALPHA,
  ARROW_DEFAULT_ALPHA,
  ESS_MODEL_SELECTED_LINE_WIDTH,
} from '^/constants/cesium';
import {
  ELEVATION_FIX_FORMAT, LAT_LON_FIX_FORMAT, Y_X_FIX_FORMAT,
  createDefaultESSModel, createDefaultESSText, createDefaultESSWorkTool,
} from '^/constants/defaultContent';
import { CesiumImageryLayersOrder as CILO, cesiumConstants as CC } from '^/constants/map-display';
import palette from '^/constants/palette';
import dsPalette from '^/constants/ds-palette';
import {
  UseL10n, UseState, isLonLat,
  isMarker, lastSelectedScreenSelector,
  typeGuardDesignDXF, typeGuardVolume,
  useAuthHeader, useDidMountEffect, useExitCreatingVolume, useL10n, useLastSelectedScreen, useProjectCoordinateSystem, typeGuardESSContent,
} from '^/hooks';
import { ImageryLayer } from '^/mocks/cesium/ImageryLayer';
import { AuthHeader, makeS3URL, makeVolumeAPIURL } from '^/store/duck/API';
import { CreateAndEditMeasurement, PostContentArguments, UpdateMeasurementLocations, contentsSelector } from '^/store/duck/Contents';
import { ChangeEditingESSContent, CreateESSContent, PatchESSContent } from '^/store/duck/ESSContents';
import {
  ChangeCreatingVolume, ChangeEditingContent, ChangeRotation,
  ChangeTwoDDisplayCenter, ChangeTwoDDisplayZoom,
} from '^/store/duck/Pages/Content';
import * as T from '^/types';
import { getContentTitlesByType, getMeasurementContentTitlesFromDate } from '^/utilities/content-util';
import { getEPSGfromProjectionLabel, projectionSystem } from '^/utilities/coordinate-util';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { getLocationsForDB } from '^/utilities/math';
import { makeIntoOlIcon } from '^/utilities/ol-layer-util';
import { getSingleContentId } from '^/utilities/state-util';
import styled from 'styled-components';
import { CesiumContext, CesiumContextProps } from '../CesiumContext';
import { viewerDefaultOptions } from '../CesiumRoot/renderCesium';
import {
  SetCesiumCameraPositionParams, convertOlZoomToCesiumAlt,
  getCartographicFromPosition, getCesiumColor, getLonLatFromPosition, getLonLatAltFromPosition,
  getRadiusForCesium, makeCesiumId, makeCesiumType, parseLastNumberFrom, requestElevationInfoOnCoordinate,
  setCesiumCameraPosition,
  setThreeDTilesetCenter,
  getMeshOrTerrainPosition,
  isContentPointToPoint,
  shouldShowMoveCursor, LonLatAlt, getDegreesPositions,
} from '../cesium-util';
import { createCesiumPolylineOptions, createCesiumSelectPointOptions, makeTextEliipsis } from '../styles';
import Text from './text';

import { ajax } from 'rxjs/ajax';
import { map } from 'rxjs/operators';
import { OnDragRadiusEvent } from '../CesiumInteraction';
import { determineUnitType, UNIT_SYMBOL, VALUES_PER_METER } from '^/utilities/imperial-unit';

export const emptyCreditContainer: HTMLDivElement = document.createElement('div');

const ADDITIONAL_ZOOM_LEVEL: number = 4;
const HUNDRED: number = 100;
const DEBOUNCE_Z_MS: number = 200;
const DESELECT_MARKER_TIMEOUT_MS: number = 10;

enum EDGE_ID_PREFIX {
  THICK= 'thickedge',
  THIN= 'thinedge',
}

export enum EDGE_THICKNESS {
  // eslint-disable-next-line no-magic-numbers
  THICK = 3,
  THIN = 2,
}

/**
 * @disclaimer
 * Dear Maintainers, for abstraction's sake,
 * Do not import these hooks directly to your cesium components,
 * use behaviors instead
 */
export function useEntityTitleChange(content?: T.Content): void {
  const { viewer }: CesiumContextProps = useContext(CesiumContext);

  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed() || content === undefined) return;
    const { title, id }: T.Content = content;
    const entity: Entity | undefined = viewer.entities.getById(makeCesiumId(id));
    if (entity?.label === undefined) return;
    entity.label.text = new ConstantProperty(makeTextEliipsis(title));

    viewer.scene.requestRender();
  }, [content?.title]);
}

export function useEntityColorChange(content?: T.GeometryContent): void {
  const { interaction, viewer }: CesiumContextProps = useContext(CesiumContext);

  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed() || content === undefined) return;
    const entity: Entity | undefined = viewer.entities.getById(makeCesiumId(content.id));

    switch (content.type) {
      case T.ContentType.MARKER:
        if (entity === undefined) return;
        if (entity.billboard !== undefined) {
          entity.billboard.image = new ConstantProperty(makeIntoOlIcon(<MarkerIconWithShadow color={content.color} />));
        }
        entity.properties = new PropertyBag(content.color);

        break;
      case T.ContentType.ESS_ARROW:
        if (entity?.polyline !== undefined) {
          entity.polyline.material = new PolylineArrowMaterialProperty(getCesiumColor(content.color).withAlpha(ARROW_DEFAULT_ALPHA));
        }

        break;
      case T.ContentType.ESS_POLYLINE: {
        if (entity?.polyline !== undefined) {
          entity.polyline.material = new ColorMaterialProperty(getCesiumColor(content.color));
        }

        break;
      }
      case T.ContentType.LENGTH:
        if (entity?.polyline !== undefined) {
          entity.polyline.material = new ColorMaterialProperty(getCesiumColor(content.color));
        }

        // During selection, the edges are hidden,
        // so there's no need to update the color.
        if (!interaction?.selectedId) {
          updateEdgeColorOf(content, viewer);
        }

        break;
      case T.ContentType.AREA:
      case T.ContentType.VOLUME:
      case T.ContentType.ESS_POLYGON:
        if (entity?.polyline !== undefined) {
          entity.polyline.material = new ColorMaterialProperty(getCesiumColor(content.color).withAlpha(POLYGON_ON_GROUND_EDGE_ALPHA));
        }

        if (entity?.polygon !== undefined) {
          entity.polygon.material = new ColorMaterialProperty(getCesiumColor(content.color).withAlpha(POLYGON_ON_GROUND_ALPHA));
        }

        // During selection, the edges are hidden,
        // so there's no need to update the color.
        if (!interaction?.selectedId && content.type !== T.ContentType.ESS_POLYGON) {
          updateEdgeColorOf(content, viewer);
        }

        break;
      default:
        exhaustiveCheck(content);
    }

    viewer.scene.requestRender();
  }, [content?.color.toString()]);
}

/**
 * Whether a content is selected by the id (memoized).
 * The reason why it is a memoized state is because
 * the effect that depends on the selected value only has to run
 * when the content itself is selected, for efficiency's sake.
 */
const useIsSelected: (id: T.Content['id'] | undefined) => boolean = (id) => {
  const { interaction }: CesiumContextProps = useContext(CesiumContext);
  const [selectedId, setSelectedId]: UseState<T.Content['id'] | undefined> = useState();

  useEffect(() => {
    if (!interaction) return;

    interaction.onSelect.addEventListener(setSelectedId);

    return () => {
      interaction.onSelect.removeEventListener(setSelectedId);
    };
  }, [interaction]);

  return useMemo(() => selectedId === id, [id, selectedId]);
};

/**
 * Wheter a content is currently being dragged by the user or not.
 * Approach is similar to useIsSelected.
 */
const useIsDragging: (id: T.Content['id'] | undefined) => boolean = (id) => {
  const { interaction }: CesiumContextProps = useContext(CesiumContext);
  const [draggingId, setDraggingId]: UseState<T.Content['id'] | undefined> = useState();

  const getDraggingId: (entity: Entity | undefined) => void = (entity) => {
    const parsedId: T.Content['id'] | undefined = entity?.id.includes(CESIUM_ENTITY_PREFIX)
      ? parseLastNumberFrom(entity?.id)
      : undefined;

    setDraggingId(parsedId);
  };

  useEffect(() => {
    if (!interaction) return;

    interaction.onDrag.addEventListener(getDraggingId);

    return () => {
      interaction.onDrag.removeEventListener(getDraggingId);
    };
  }, [interaction]);

  return useMemo(() => draggingId === id, [id, draggingId]);
};

/**
 * Updates the length/area/volume location depending on the selection.
 * When it's not selected, it uses the content location(s).
 * When it's selected, it uses the interaction's rendered locations.
 * This hook also runs the required side effects.
 */
export const useContentSetLocations: (
  content?: T.LengthAreaVolumeContent | T.ESSLineBasedContent, entity?: Entity,
) => void = (
  content, entity,
) => {
  const { viewer, interaction }: CesiumContextProps = useContext(CesiumContext);
  const isSelected: boolean = useIsSelected(content?.id);
  const setEdge: () => void = (() => {
    switch (content?.type) {
      case T.ContentType.ESS_ARROW:
      case T.ContentType.ESS_POLYGON:
      case T.ContentType.ESS_POLYLINE: {
        return () => undefined;
      }
      default: {
        return useEdge(content);
      }
    }
  })();
  const locations: Cartesian3[] = useMemo(() => {
    const geopoints: T.GeoPoint[] = content?.info.locations ?? [];

    return getDegreesPositions(geopoints);
  }, [content?.info.locations]);

  useEffect(() => {
    if (!interaction || !viewer || !entity || !content) return;

    const getLocations: () => Cartesian3[] = () => {
      if (isSelected && interaction.editingLocations !== undefined) {
        return interaction.editingLocations;
      }

      return locations;
    };

    switch (content.type) {
      case T.ContentType.ESS_ARROW:
      case T.ContentType.ESS_POLYLINE:
      case T.ContentType.LENGTH: {
        if (entity.polyline) entity.polyline.positions = new CallbackProperty(getLocations, false);
        break;
      }
      case T.ContentType.AREA:
      case T.ContentType.VOLUME:
      case T.ContentType.ESS_POLYGON: {
        if (entity.polyline) {
          // For polylines as edges of the ploygons, in order to "wrap" the entire area,
          // the last position is back to the first position, completing the loop.
          entity.polyline.positions = new CallbackProperty(() => {
            const loc: Cartesian3[] = getLocations();

            return loc.concat(loc[0]);
          }, false);
        }
        if (entity.polygon) {
          entity.polygon.hierarchy = new CallbackProperty(() => new PolygonHierarchy(getLocations()), false);
        }
        break;
      }
      default:
        exhaustiveCheck(content);
    }

    // ESS contents don't have edges to be modified,
    // different from other measurements.
    if (typeGuardESSContent(content)) return;

    // These edges are only shown when hovering the entity.
    // Toggle them on/off when selecting because it is not needed.
    if (isSelected) {
      deleteEdgesOf(content.id, viewer);
    } else {
      setEdge();
    }
  }, [entity, isSelected]);
};


/**
 * Updates the marker volume location depending on the selection.
 * It is separated from the length/area/volume hook because it runs a different side effect.
 */
export const useMarkerToggleSelected: (content?: T.MarkerContent, entity?: Entity) => void = (content, entity) => {
  const { viewer, interaction }: CesiumContextProps = useContext(CesiumContext);
  const isSelected: boolean = useIsSelected(content?.id);

  useEffect(() => {
    if (!interaction || !viewer || !entity) return;

    // For markers, the entity itself is hidden when selecting,
    // because the white circle editing dot will be replacing it.
    // However, when marker is created, it's immediately selected,
    // so no need to toggle this.
    if (!interaction.isCreating) {
      entity.show = !isSelected;
      viewer.scene.requestRender();
    }
  }, [entity, isSelected]);
};

export const useSelectEntity: (container: RefObject<HTMLDivElement> | null | undefined) => void = (container) => {
  const { interaction }: CesiumContextProps = useContext(CesiumContext);
  const dispatch: Dispatch = useDispatch();

  // Only select the content on the sidebar when the id is there,
  // do not deselect them when user clicks an empty area. Not how it works.
  const selectContent: (contentId: number | undefined, isESS: boolean) => void = useCallback((contentId, isESS) => {
    if (contentId !== undefined) {
      if (isESS) dispatch(ChangeEditingESSContent({ contentId }));
      else dispatch(ChangeEditingContent({ contentId }));
      if (container?.current) {
        container.current.style.cursor = shouldShowMoveCursor(interaction?.selectedEntity)
          ? 'move'
          : 'pointer';
      }
    }
  }, [interaction]);

  useEffect(() => {
    interaction?.onSelect.addEventListener(selectContent);

    return () => {
      interaction?.onSelect.removeEventListener(selectContent);
    };
  }, [interaction]);
};

export const useESSModelSetLocation: (
  content?: T.ESSModelContent, entity?: Entity,
) => void = (
  content, entity,
) => {
  const { viewer, interaction }: CesiumContextProps = useContext(CesiumContext);
  const isDragging: boolean = useIsDragging(content?.id);
  const position: Cartesian3 = useMemo(() => {
    if (content?.info.location) {
      return Cartesian3.fromDegrees(content.info.location[0], content.info.location[1]);
    }

    return Cartesian3.ZERO;
  }, [content?.info.location]);
  const heading: number = useMemo(() => content?.info.heading ?? 0, [content?.info.heading]);
  const isSelected: boolean = useIsSelected(content?.id);

  // Whenever this hook is called,
  // model is loaded from either 3d mesh or 3d ortho.
  // Re-run the useEffect because the height reference is different (mesh vs terrain).
  const is3DMeshSelected: boolean = useSelector(({ Contents, ProjectConfigPerUser, Pages }: T.State) => {
    const threeDMeshId: T.ThreeDMeshContent['id'] | undefined =
      getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.THREE_D_MESH);

    return contentsSelector.isSelected(Contents, ProjectConfigPerUser)(threeDMeshId);
  });

  const getEntityOrientation: (
    pos: Cartesian3, angle: number, initialAngle: number,
  ) => Quaternion = (
    pos, angle, initialAngle,
  ) => {
    const hpr: HeadingPitchRoll = new HeadingPitchRoll(initialAngle + angle, 0, 0);

    return Transforms.headingPitchRollQuaternion(pos, hpr);
  };

  useEffect(() => {
    if (!interaction || interaction.isDraggingRadius || !viewer || !defined(viewer) || !viewer.cesiumWidget || !entity || !content) return;

    if (isDragging) {
      // Set the model to no height reference because
      // when dragging, it uses the clamped/terrain height anyway.
      if (entity.model?.heightReference?.getValue(new JulianDate(0)) === HeightReference.CLAMP_TO_GROUND) {
        entity.model.heightReference = new ConstantProperty(HeightReference.NONE);
      }

      entity.position = new CallbackProperty(() => {
        if (!defined(viewer)) return new Cartesian3(0, 0, 0);

        const unclampedPosition: Cartesian3 = interaction.isDragging && interaction.editingLocations !== undefined
          ? interaction.editingLocations[0]
          : position;

        viewer.scene.requestRender();

        // Models can be dragged out of their original position relative to the mouse,
        // which causes some offset between them. Add the offset to normalize the offset.
        const locationAfterOffset: Cartesian3 = Cartesian3.add(
          unclampedPosition,
          interaction.draggingOffset ?? Cartesian3.ZERO,
          new Cartesian3(0, 0, 0),
        );

        return getMeshOrTerrainPosition(locationAfterOffset, entity, viewer);
      }, true) as any;
    } else {
      // When not dragging, use the constant position property for performance reasons.
      entity.position = new ConstantPositionProperty(getMeshOrTerrainPosition(position, entity, viewer));
      viewer.scene.requestRender();
    }
  }, [entity, isDragging, is3DMeshSelected]);

  useEffect(() => {
    if (!viewer || !defined(viewer) || !viewer.cesiumWidget || !entity || !interaction) return;

    const setEntityOrientation: OnDragRadiusEvent['raiseEvent'] = (isCurrentlyDragging, id, angle) => {
      if (!defined(viewer) || !viewer.cesiumWidget || id !== content?.id) return;

      if (isCurrentlyDragging) {
        // Only use callback property when dragging is started,
        // for optimization purpose.
        entity.orientation = new CallbackProperty(() => getEntityOrientation(
          position,
          interaction.dragAngle,
          entity?.properties?.initialHeading?._value ?? 0,
        ), false);
      } else {
        // Heading property is cached to the entity
        // to retrieve it easily from the entity on the next dragging action.
        if (entity.properties?.heading) {
          entity.properties.heading = new ConstantProperty(angle);
        }

        // Set to constant property when no longer dragging,
        // for optimization purpose.
        entity.orientation = new ConstantProperty(
          getEntityOrientation(
            position,
            angle,
            entity?.properties?.initialHeading?._value ?? 0,
          ),
        );
      }

      viewer.scene.requestRender();
    };

    interaction.onDragRadius.addEventListener(setEntityOrientation);

    return () => {
      interaction.onDragRadius.removeEventListener(setEntityOrientation);
    };
  }, [entity, content?.id]);

  // When the store updates, there's a chance that the request throws an error
  // and it gets reverted back to the original heading. The model has to be
  // manually reset because it's using a constant property.
  useEffect(() => {
    if (!viewer || !defined(viewer) || !viewer.cesiumWidget || !entity || !interaction) return;

    // There's a chance that somehow store updates when the previous request
    // has returned a response and user is already in the next dragging action
    // (e.g. slow internet). Do not update back to constant property,
    // always use the current callback property while dragging.
    if (interaction.isDraggingRadius) return;

    if (entity.properties?.heading) {
      entity.properties.heading = new ConstantProperty(heading);
    }

    entity.orientation = new ConstantProperty(
      getEntityOrientation(
        position,
        heading,
        entity?.properties?.initialHeading?._value ?? 0,
      ),
    );

    viewer.scene.requestRender();
  }, [entity, interaction, heading]);

  useEffect(() => {
    if (!entity?.model || !viewer || !content?.id) return;

    if (isSelected) {
      entity.model.silhouetteColor = new ConstantProperty(getCesiumColor(dsPalette.themePrimaryLighter));
      entity.model.silhouetteSize = new ConstantProperty(ESS_MODEL_SELECTED_LINE_WIDTH);
    } else {
      entity.model.silhouetteSize = undefined;
      entity.model.silhouetteColor = undefined;
    }

    viewer.scene.requestRender();
  }, [entity, viewer, isSelected]);
};

export const useDrawMarkerLengthAreaContent: () => void = () => {
  const { interaction }: CesiumContextProps = useContext(CesiumContext);
  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();
  const dispatch: Dispatch = useDispatch();
  const [, language]: UseL10n = useL10n();
  const contentTitlesOnCurrentDate: Array<T.Content['title']>
    = useSelector((state: T.State) => getMeasurementContentTitlesFromDate(state.Contents.contents.byId, lastSelectedScreenSelector(state)?.appearAt));
  const authHeader: AuthHeader | undefined = useAuthHeader();
  const targetDSMId: T.DSMContent['id'] | undefined
    = useSelector(
      ({ Contents, Pages, ProjectConfigPerUser }: T.State) => getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.DSM)
    );

  const handleSegmentRequest: (mode: T.MeasurementContent['type'], position: Cartesian3, index: number) => void = useCallback(async (
    mode, position, index,
  ) => {
    // For length measurement, whenever it creates one segment,
    // it needs to request the elevation to calculate the scope.
    // This should update the values back to the interaction elevation.
    if (mode === T.ContentType.LENGTH) {
      const response: Array<T.ElevationInfo['value']> = await requestElevationsFromCoordinates({
        targetDSMId,
        coordinates: [Object.values(getLonLatFromPosition(position))],
        authHeader,
      });

      response.forEach((elevation) => {
        interaction?.elevations.get(DRAWING_MEASUREMENT_ID)?.set(index, elevation);
      });
    }
  }, [interaction, targetDSMId, authHeader]);

  const createMeasurementContents: (type: T.MeasurementContent['type']) => (positions: Cartesian3[]) => void = useCallback((type) => (positions) => {
    const locations: T.GeoPoint[] = getReprojectedLocations(positions, type, projectProjection);
    const { info, title, color }: Pick<T.GeometryContent | T.ESSTextContent, PostContentArguments> = getDefaultContentCreatorFromGeometryType({
      geometryType: type,
      createOptions: {
        locations,
        language,
        usingNames: contentTitlesOnCurrentDate,
      },
    });

    dispatch(CreateAndEditMeasurement({ data: { info, title, color, type } }));
  }, [language, projectProjection, contentTitlesOnCurrentDate]);

  useEffect(() => {
    const createMarkerContent: (positions: Cartesian3[]) => void = createMeasurementContents(T.ContentType.MARKER);
    const createLengthContent: (positions: Cartesian3[]) => void = createMeasurementContents(T.ContentType.LENGTH);
    const createAreaContent: (positions: Cartesian3[]) => void = createMeasurementContents(T.ContentType.AREA);

    interaction?.onEndDrawing[T.ContentType.MARKER].addEventListener(createMarkerContent);
    interaction?.onEndDrawing[T.ContentType.LENGTH].addEventListener(createLengthContent);
    interaction?.onEndDrawing[T.ContentType.AREA].addEventListener(createAreaContent);

    return () => {
      interaction?.onEndDrawing[T.ContentType.MARKER].removeEventListener(createMarkerContent);
      interaction?.onEndDrawing[T.ContentType.LENGTH].removeEventListener(createLengthContent);
      interaction?.onEndDrawing[T.ContentType.AREA].removeEventListener(createAreaContent);
    };
  }, [interaction, createMeasurementContents]);

  useEffect(() => {
    interaction?.onCreateSegment.addEventListener(handleSegmentRequest);

    return () => {
      interaction?.onCreateSegment.removeEventListener(handleSegmentRequest);
    };
  }, [interaction, handleSegmentRequest]);
};

export const useDrawVolumeContent: () => void = () => {
  const { interaction }: CesiumContextProps = useContext(CesiumContext);
  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();
  const dispatch: Dispatch = useDispatch();
  const [, language]: UseL10n = useL10n();

  const volumeType: NonNullable<T.ContentsPageState['creatingVolumeInfo']>['type']
    = useSelector((state: T.State) => state.Pages.Contents.creatingVolumeInfo?.type);
  const designDxfId: NonNullable<T.ContentsPageState['creatingVolumeInfo']>['designDxfId']
    = useSelector((state: T.State) => state.Pages.Contents.creatingVolumeInfo?.designDxfId);
  const previousDsmId: NonNullable<T.ContentsPageState['creatingVolumeInfo']>['previousDsmId']
    = useSelector((state: T.State) => state.Pages.Contents.creatingVolumeInfo?.previousDsmId);
  const contentTitlesOnCurrentDate: Array<T.Content['title']>
    = useSelector((state: T.State) => getMeasurementContentTitlesFromDate(state.Contents.contents.byId, lastSelectedScreenSelector(state)?.appearAt));

  // Every type of volume has its own default values
  // which will be populated by another request to BE VCM
  // once the content is created.
  const createVolumeDefaultValues: T.CalculatedVolumeInfo | undefined = useMemo(() => {
    if (volumeType === undefined) return;

    switch (volumeType) {
      case T.VolumeCalcMethod.BASIC: {
        return {
          calculation: {
            type: T.VolumeCalcMethod.BASIC,
            volumeAlgorithm: T.BasicCalcBasePlane.TRIANGULATED,
            volumeElevation: 0,
          },
          cut: 0, fill: 0, total: 0,
        };
      }
      case T.VolumeCalcMethod.DESIGN: {
        if (!designDxfId) return;

        return {
          calculation: {
            type: T.VolumeCalcMethod.DESIGN,
            volumeAlgorithm: T.BasicCalcBasePlane.CUSTOM,
            volumeElevation: 0,
            designDxfId,
          },
          cut: 0, fill: 0, total: 0,
        };
      }
      case T.VolumeCalcMethod.SURVEY: {
        if (!previousDsmId) return;

        return {
          calculation: {
            type: T.VolumeCalcMethod.SURVEY,
            volumeAlgorithm: T.BasicCalcBasePlane.CUSTOM,
            volumeElevation: 0,
            previousDsmId,
          },
          cut: 0, fill: 0, total: 0,
        };
      }
      default: {
        exhaustiveCheck(volumeType);
      }
    }
  }, [volumeType, designDxfId, previousDsmId]);

  const exitCreatingVolume: () => void = useExitCreatingVolume();

  const createVolume: (positions: Cartesian3[]) => void = useCallback((positions) => {
    const locations: T.GeoPoint[] = getReprojectedLocations(positions, T.ContentType.VOLUME, projectProjection);
    const { info, title, color }: Pick<T.GeometryContent, PostContentArguments> = getDefaultContentCreatorFromGeometryType({
      geometryType: T.ContentType.VOLUME,
      createOptions: {
        locations,
        language,
        usingNames: contentTitlesOnCurrentDate,
      },
    });

    dispatch(CreateAndEditMeasurement({
      data: { info: { ...info, calculatedVolume: createVolumeDefaultValues }, title, color, type: T.ContentType.VOLUME },
    }));

    exitCreatingVolume();
  }, [language, projectProjection, createVolumeDefaultValues, contentTitlesOnCurrentDate]);

  const toggleDrawingMode: () => void = () => {
    // Volume creation needs to toggle the drawing state in the store
    // in order to update UI states (e.g. search bar in DBVC popup).
    dispatch(ChangeCreatingVolume({ info: { isDrawing: true } }));
  };

  useEffect(() => {
    interaction?.onEndDrawing[T.ContentType.VOLUME].addEventListener(createVolume);
    interaction?.onCreateSegment.addEventListener(toggleDrawingMode);

    return () => {
      interaction?.onEndDrawing[T.ContentType.VOLUME].removeEventListener(createVolume);
      interaction?.onCreateSegment.addEventListener(toggleDrawingMode);
    };
  }, [interaction, createVolume]);
};

export const useDrawESSPolyline: () => void = () => {
  const { interaction }: CesiumContextProps = useContext(CesiumContext);
  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();
  const dispatch: Dispatch = useDispatch();
  const [, language]: UseL10n = useL10n();
  const titles: Array<T.ESSLineBasedContent['title']>
    = useSelector((state: T.State) => getContentTitlesByType(state.Contents.contents.byId, T.ContentType.ESS_ARROW));

  const createESSPolyline: (type: T.ESSLineBasedType) => (positions: Cartesian3[]) => void
    = useCallback((type) => (positions) => {
      const locations: T.GeoPoint[] = getReprojectedLocations(positions, type, projectProjection);
      const { info, title, color }: Pick<T.ESSLineBasedContent, PostContentArguments> = createDefaultESSWorkTool({
        locations,
        language,
        usingNames: titles,
        type,
      });

      dispatch(CreateESSContent({ content: { info, title, color, type } }));
    }, [language, projectProjection, titles]);

  useEffect(() => {
    const onESSArrowCreated: (positions: Cartesian3[]) => void = createESSPolyline(T.ContentType.ESS_ARROW);
    const onESSPolygonCreated: (positions: Cartesian3[]) => void = createESSPolyline(T.ContentType.ESS_POLYGON);
    const onESSPolylineCreated: (positions: Cartesian3[]) => void = createESSPolyline(T.ContentType.ESS_POLYLINE);

    interaction?.onEndDrawing[T.ContentType.ESS_ARROW].addEventListener(onESSArrowCreated);
    interaction?.onEndDrawing[T.ContentType.ESS_POLYGON].addEventListener(onESSPolygonCreated);
    interaction?.onEndDrawing[T.ContentType.ESS_POLYLINE].addEventListener(onESSPolylineCreated);

    return () => {
      interaction?.onEndDrawing[T.ContentType.ESS_ARROW].removeEventListener(onESSArrowCreated);
      interaction?.onEndDrawing[T.ContentType.ESS_POLYGON].removeEventListener(onESSPolygonCreated);
      interaction?.onEndDrawing[T.ContentType.ESS_POLYLINE].removeEventListener(onESSPolylineCreated);
    };
  }, [interaction, createESSPolyline]);
};

export const useDrawESSModel: () => void = () => {
  const { viewer, interaction }: CesiumContextProps = useContext(CesiumContext);
  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();
  const dispatch: Dispatch = useDispatch();
  const [, language]: UseL10n = useL10n();
  const titles: Array<T.ESSArrowContent['title']>
    = useSelector((state: T.State) => getContentTitlesByType(state.Contents.contents.byId, T.ContentType.ESS_MODEL));
  const selectedModelId: T.ESSModelInstance['id'] | undefined = useSelector((state: T.State) => state.ESSModels.selectedModelId);
  const ESSModel: T.ESSModelInstance | undefined = useSelector((state: T.State) => state.ESSModels.byId?.[selectedModelId ?? NaN]);
  const contentType: T.ContentsPageState['currentContentTypeFromAnnotationPicker']
    = useSelector((state: T.State) => state.Pages.Contents.currentContentTypeFromAnnotationPicker);
  const contentsById: T.ContentsState['contents']['byId'] = useSelector((state: T.State) => state.Contents.contents.byId);

  const updateModelHeading: OnDragRadiusEvent['raiseEvent'] = useCallback((isDragging, id, angle, deltaAngle) => {
    // Chances are user is updating the exact same angle (dragging in one full circle).
    // When that happens, do not update the store for efficiency's sake.
    if (isDragging || (!isDragging && deltaAngle === 0)) return;

    const content: T.Content = contentsById[id];
    if (content.type === T.ContentType.ESS_MODEL) {
      ga('send', 'event', {
        eventCategory: 'content-update',
        eventAction: 'ess-model-update-direction',
        eventLabel: `ess-content-model-${content.info?.modelId}`,
      });
    }

    dispatch(PatchESSContent({
      content: {
        id,
        info: {
          heading: angle,
        },
      },
    }));

    // Reset cursor since previously it was showing dragging cursor.
    if (viewer?.container) {
      (viewer.container as HTMLDivElement).style.cursor = 'auto';
    }
  }, [viewer, contentsById]);

  const createESSModel: (positions: Cartesian3[]) => void = useCallback((positions) => {
    if (ESSModel === undefined) return;

    const locations: T.GeoPoint[] = getReprojectedLocations(positions, T.ContentType.ESS_MODEL, projectProjection);
    const { info, title, color }: Pick<T.ESSModelContent, PostContentArguments> = createDefaultESSModel({
      locations,
      language,
      usingNames: titles,
      model: ESSModel,
    });

    dispatch(CreateESSContent({ content: { info, title, color, type: T.ContentType.ESS_MODEL } }));
  }, [language, projectProjection, titles, ESSModel]);

  useEffect(() => {
    interaction?.onEndDrawing[T.ContentType.ESS_MODEL].addEventListener(createESSModel);
    interaction?.onDragRadius.addEventListener(updateModelHeading);

    return () => {
      interaction?.onEndDrawing[T.ContentType.ESS_MODEL].removeEventListener(createESSModel);
      interaction?.onDragRadius.removeEventListener(updateModelHeading);
    };
  }, [interaction, createESSModel]);

  // Toggle drawing mode depending on what is currently being selected
  // from the annotation picker. However, ESS models are not part of the annotation
  // but it also needs to be drawn, which is why selectedModelId is selected.
  useEffect(() => {
    if (!interaction) return;

    if (selectedModelId !== undefined) {
      interaction.drawingMode = T.ContentType.ESS_MODEL;
    } else {
      interaction.drawingMode = contentType;
      interaction.clearESSModelEditingNodes();
    }
  }, [interaction, contentType, selectedModelId]);
};

export const useDrawESSText: () => void = () => {
  const { interaction }: CesiumContextProps = useContext(CesiumContext);
  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();
  const dispatch: Dispatch = useDispatch();
  const [, language]: UseL10n = useL10n();
  const titles: Array<T.ESSTextContent['title']>
    = useSelector((state: T.State) => getContentTitlesByType(state.Contents.contents.byId, T.ContentType.ESS_TEXT));

  const createESSText: (positions: Cartesian3[]) => void = useCallback((positions) => {
    const { info, title, color }: Pick<T.ESSTextContent, PostContentArguments> = createDefaultESSText({
      locations: [Object.values(getLonLatFromPosition(positions[0])) ?? []],
      language,
      usingNames: titles,
    });

    dispatch(CreateESSContent({
      content: {
        info,
        title,
        color,
        type: T.ContentType.ESS_TEXT,
      },
    }));
  }, [language, projectProjection, titles]);

  useEffect(() => {
    interaction?.onEndDrawing[T.ContentType.ESS_TEXT].addEventListener(createESSText);

    return () => {
      interaction?.onEndDrawing[T.ContentType.ESS_TEXT].removeEventListener(createESSText);
    };
  }, [interaction, createESSText]);
};

export const useDrawInteractibleEntity: () => void = () => {
  useDrawMarkerLengthAreaContent();
  useDrawVolumeContent();
  useDrawESSPolyline();
  useDrawESSModel();
  useDrawESSText();
};

export function usePinpointer(marker?: T.MarkerContent | T.ESSTextContent): void {
  const { viewer }: CesiumContextProps = useContext(CesiumContext);
  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();

  if (!marker) return;

  const location: T.GeoPoint = marker.info.location;

  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed()) return;

    const [lon, lat]: T.GeoPoint = getMarkerLocationInLonLat(location, projectProjection);

    const billboardEntity: Entity | undefined = viewer?.entities.getById(makeCesiumId(marker.id));
    if (billboardEntity === undefined) return;

    billboardEntity.position = new ConstantPositionProperty(Cartesian3.fromDegrees(lon, lat));

    viewer.scene.requestRender();
  }, [location.toString()]);
}

function updateEdgeColorOf(content: T.MeasurementContent | T.ESSLineBasedContent, viewer: Viewer): void {
  deleteEdgesOf(content.id, viewer);
  makeEdgesWith(EDGE_THICKNESS.THICK, content, viewer);
  makeEdgesWith(EDGE_THICKNESS.THIN, content, viewer);
}

export function useEdge(content?: T.MeasurementContent | T.ESSLineBasedContent): () => void {
  const { viewer }: CesiumContextProps = useContext(CesiumContext);

  return () => {
    if (viewer === undefined || viewer.isDestroyed() || content === undefined) return;
    const thickEdge: Primitive | undefined = makeEdgesWith(EDGE_THICKNESS.THICK, content, viewer);
    const thinEdge: Primitive | undefined = makeEdgesWith(EDGE_THICKNESS.THIN, content, viewer);
    if (thickEdge === undefined || thinEdge === undefined) return;
    viewer.scene.requestRender();
  };
}

export function makeEdgesWith(width: number, content: T.MeasurementContent | T.ESSLineBasedContent, viewer?: Viewer): Primitive | undefined {
  if (isMarker(content) || viewer === undefined || viewer.isDestroyed()) return;

  const positions: Cartesian3[] = getDegreesPositions(content.info.locations);

  if (isContentPointToPoint(content)) {
    try {
      return viewer.scene.groundPrimitives.add(
        new Primitive({
          show: width !== EDGE_THICKNESS.THICK,
          geometryInstances: new GeometryInstance({
            id: width === EDGE_THICKNESS.THICK ? `${EDGE_ID_PREFIX.THICK}-${content.id}` : `${EDGE_ID_PREFIX.THIN}-${content.id}`,
            geometry : new PolylineGeometry({
              positions,
              width,
            }),
            attributes : {
              color : width === EDGE_THICKNESS.THICK ?
                ColorGeometryInstanceAttribute.fromColor(getCesiumColor(content.color)) :
                ColorGeometryInstanceAttribute.fromColor(getCesiumColor(content.color).withAlpha(POLYGON_ON_GROUND_EDGE_ALPHA)),
            },
          }),
          allowPicking: false,
          appearance : new PolylineColorAppearance(),
          releaseGeometryInstances: false,
        }),
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  try {
    return viewer.scene.groundPrimitives.add(
      new GroundPolylinePrimitive({
        show: width !== EDGE_THICKNESS.THICK,
        geometryInstances: new GeometryInstance({
          id: width === EDGE_THICKNESS.THICK ? `${EDGE_ID_PREFIX.THICK}-${content.id}` : `${EDGE_ID_PREFIX.THIN}-${content.id}`,
          geometry : new GroundPolylineGeometry({
            positions,
            width,
            loop: content.type !== T.ContentType.LENGTH,
          }),
          attributes : {
            color : width === EDGE_THICKNESS.THICK ?
              ColorGeometryInstanceAttribute.fromColor(getCesiumColor(content.color)) :
              ColorGeometryInstanceAttribute.fromColor(getCesiumColor(content.color).withAlpha(POLYGON_ON_GROUND_EDGE_ALPHA)),
          },
        }),
        allowPicking: false,
        appearance : new PolylineColorAppearance(),
        releaseGeometryInstances: false,
      }),
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }

  return;
}

export function useHover(container: RefObject<HTMLDivElement> | null | undefined): void {
  const { viewer, interaction }: CesiumContextProps = useContext(CesiumContext);

  let prevHoveredEntity: Entity | undefined;
  const toggleHoverStyle: (entity: Entity | undefined) => void = useCallback((entity) => {
    if (!viewer || viewer.isDestroyed()) return;

    const contentId: number | undefined = entity?.id ? parseLastNumberFrom(entity.id) : undefined;

    // Differences between the previous id
    // and the current hovered id means it's gone out
    // from hovering one item to the other.
    const hoveredOut: boolean = prevHoveredEntity?.id !== entity?.id;

    if (container?.current) {
      if (contentId !== undefined) {
        container.current.style.cursor = interaction?.selectedId !== undefined && shouldShowMoveCursor(entity)
          ? 'move'
          : 'pointer';
      } else if (hoveredOut) {
        container.current.style.cursor = 'auto';
      }
    }

    // Disabling hover when selecting a content because
    // it would toggle into a different icon instead
    // of keeping it as the selected icon.
    if (interaction?.selectedId !== undefined) {
      return;
    }

    if (hoveredOut) {
      turnOffHover(viewer);

      if (prevHoveredEntity?.model) {
        prevHoveredEntity.model.silhouetteColor = undefined;
        prevHoveredEntity.model.silhouetteSize = undefined;
      }
    }

    if (contentId !== undefined) {
      switch (entity?.name) {
        case makeCesiumType(T.ContentType.MARKER): {
          dimUp(entity?.id, viewer);
          break;
        }
        case makeCesiumType(T.ContentType.ESS_MODEL): {
          if (entity.model) {
            entity.model.silhouetteColor = new ConstantProperty(getCesiumColor(dsPalette.themePrimaryLighter));
            entity.model.silhouetteSize = new ConstantProperty(ESS_MODEL_SELECTED_LINE_WIDTH);
          }
          break;
        }
        default: {
          turnOnThickEdgesOf(contentId, viewer);
          break;
        }
      }
    }

    prevHoveredEntity = entity;

    viewer.scene.requestRender();
  }, [viewer, interaction]);

  useEffect(() => {
    interaction?.onHover.addEventListener(toggleHoverStyle);

    return () => {
      interaction?.onHover.removeEventListener(toggleHoverStyle);
    };
  }, [interaction]);
}

export const useMeasurementCursor: (container: RefObject<HTMLDivElement> | null | undefined) => void = (
  container,
) => {
  const { interaction }: CesiumContextProps = useContext(CesiumContext);
  const currentContentTypeFromAnnotationPicker: T.ContentsPageState['currentContentTypeFromAnnotationPicker']
    = useSelector((s: T.State) => s.Pages.Contents.currentContentTypeFromAnnotationPicker);

  useEffect(() => {
    if (container === null || container === undefined || container?.current === null) return;

    switch (currentContentTypeFromAnnotationPicker) {
      case T.ContentType.MARKER: {
        container.current.style.cursor = `url(${MarkerPinPointerPNG}) 35 35, auto`;
        break;
      }
      case undefined: {
        container.current.style.cursor = 'auto';
        break;
      }
      default: {
        container.current.style.cursor = 'crosshair';
      }
    }
  }, [container, currentContentTypeFromAnnotationPicker]);

  useEffect(() => {
    // Show the dragging cursor when dragging,
    // to make it the same with OL/2D.
    const toggleDraggingCursor: (entity: Entity | undefined) => void = (entity) => {
      if (container === null || container === undefined || container?.current === null) return;

      if (shouldShowMoveCursor(entity)) {
        container.current.style.cursor = 'move';
      } else if (entity === undefined) {
        container.current.style.cursor = 'auto';
      } else {
        container.current.style.cursor = 'grabbing';
      }
    };

    interaction?.onDrag.addEventListener(toggleDraggingCursor);

    return () => {
      interaction?.onDrag.removeEventListener(toggleDraggingCursor);
    };
  }, [container, interaction]);
};

export const useUpdateEntityPosition: () => void = () => {
  const dispatch: Dispatch = useDispatch();
  const { viewer, interaction }: CesiumContextProps = useContext(CesiumContext);

  const triggerDoneDragging: (entity: Entity | undefined) => void = useCallback((entity) => {
    if (!viewer || !interaction || !interaction.selectedId || interaction.isDraggingRadius || entity) return;

    const selectedEntityName: string | undefined = interaction.selectedEntity?.name;
    const locations: T.GeoPoint[] = interaction.editingLocations?.map((location) => {
      if (selectedEntityName === makeCesiumType(T.ContentType.ESS_MODEL)) {
        // Models can be dragged out of their original position relative to the mouse,
        // which causes some offset between them. Add the offset to normalize the offset.
        const locationAfterOffset: Cartesian3 = Cartesian3.add(
          location,
          interaction.draggingOffset ?? Cartesian3.ZERO,
          new Cartesian3(0, 0, 0),
        );

        return Object.values(getLonLatFromPosition(locationAfterOffset));
      }

      const lonLatAlt: LonLatAlt = getLonLatAltFromPosition(location);
      return lonLatAlt.alt === 0
        ? [lonLatAlt.lon, lonLatAlt.lat]
        : [lonLatAlt.lon, lonLatAlt.lat, lonLatAlt.alt];
    }) ?? [];

    const clearSelection: () => void = () => {
      setTimeout(() => {
        interaction.selectedEntity = undefined;
        viewer.scene.requestRender();
      }, DESELECT_MARKER_TIMEOUT_MS);
    };

    switch (selectedEntityName) {
      case makeCesiumType(T.ContentType.ESS_POLYGON):
      case makeCesiumType(T.ContentType.ESS_POLYLINE):
      case makeCesiumType(T.ContentType.ESS_ARROW): {
        dispatch(PatchESSContent({
          content: {
            id: interaction.selectedId,
            info: {
              locations,
            },
          },
        }));
        break;
      }
      case makeCesiumType(T.ContentType.ESS_TEXT):
      case makeCesiumType(T.ContentType.ESS_MODEL): {
        dispatch(PatchESSContent({
          content: {
            id: interaction.selectedId,
            info: {
              location: locations[0],
            },
          },
        }));

        // For ESS models, clear the selection after updating
        // similar to how markers work (because they behave similarly as well).
        clearSelection();
        break;
      }
      default: {
        dispatch(UpdateMeasurementLocations({
          id: interaction.selectedId,
          locations,
        }));

        // Deselect marker the moment it is done updating, just like in 2D.
        // The setTimeout is needed because the position is toggled whenever it gets selected.
        // And it may happen at the same time, therefore giving this function some time
        // before it executes.
        if (selectedEntityName === makeCesiumType(T.ContentType.MARKER)) {
          clearSelection();
        }
      }
    }
  }, [interaction]);

  useEffect(() => {
    interaction?.onDrag.addEventListener(triggerDoneDragging);

    return () => {
      interaction?.onDrag.removeEventListener(triggerDoneDragging);
    };
  }, [interaction]);
};

function turnOffHover(viewer: Viewer): void {
  dimDown(viewer.entities);
  turnOffThickEdgesOf(viewer.scene.groundPrimitives);
  viewer.scene.requestRender();
}

function turnOffThickEdgesOf(primitives: PrimitiveCollection): void {
  const length: number = primitives.length;

  for (let i: number = 0; i < length; ++i) {
    const p: Primitive = primitives.get(i);
    if (p.geometryInstances === undefined) continue;
    if (
      !Array.isArray(p.geometryInstances)
      && p.geometryInstances.id.split('-')[0] === EDGE_ID_PREFIX.THICK
      && p.show
    ) {
      p.show = false;
    }
  }
}

function turnOnThickEdgesOf(contentId: T.Content['id'], viewer: Viewer): void {
  const primitives: PrimitiveCollection = viewer.scene.groundPrimitives;
  const length: number = primitives.length;

  for (let i: number = 0; i < length; ++i) {
    const p: Primitive = primitives.get(i);
    if (p.geometryInstances === undefined) continue;
    if (!Array.isArray(p.geometryInstances) &&
      (p.geometryInstances.id === `${EDGE_ID_PREFIX.THICK}-${contentId}`) &&
      !p.show) {
      p.show = true;
    } else if (!Array.isArray(p.geometryInstances) &&
      p.geometryInstances.id !== `${EDGE_ID_PREFIX.THICK}-${contentId}` &&
      !p.geometryInstances.id.includes(EDGE_ID_PREFIX.THIN) &&
      p.show
    ) {
      p.show = false;
    }
  }
}

export function deleteEdgesOf(contentId: number, viewer: Viewer): void {
  const primitives: PrimitiveCollection = viewer.scene.groundPrimitives;
  const length: number = primitives.length;
  const edges: Primitive[] = [];

  for (let i: number = 0; i < length; ++i) {
    const p: Primitive = primitives.get(i);
    if (p.geometryInstances === undefined) continue;
    if (!Array.isArray(p.geometryInstances) && (
      (p.geometryInstances.id === `${EDGE_ID_PREFIX.THICK}-${contentId}`) ||
      (p.geometryInstances.id === `${EDGE_ID_PREFIX.THIN}-${contentId}`))
    ) {
      // Don't remove p in here directly, there's a problem with sync, somehow it deletes thin edge before the loop
      edges.push(p);
    }
  }
  for (const e of edges) {
    primitives.remove(e);
  }
}

function dimUp(objectId: string, viewer: Viewer): void {
  const o: Entity | Primitive | undefined = viewer.entities.getById(objectId);
  const originalColor: Color<string> = new Color(`rgb(${o?.properties?.color._value.toString()})`);
  const lighterColor: Color<string> = originalColor.darken(ColorNumbers.Point02).lighten(ColorNumbers.Point05);
  if (o?.billboard === undefined) return;
  o.billboard.image = new ConstantProperty(makeIntoOlIcon(<MarkerIconWithShadow color={lighterColor} />));
}

function dimDown(entities: EntityCollection): void {
  const length: number = entities.values.length;
  for (let i: number = 0; i < length; ++i) {
    const e: Entity = entities.values[i];
    if (e.billboard?.image === undefined || e.properties === undefined) continue;
    const originalColor: Color<string> = new Color(`rgb(${e.properties.color._value.toString()})`);
    e.billboard.image = new ConstantProperty(makeIntoOlIcon(<MarkerIconWithShadow color={originalColor} />));
  }
}

export const useUpdateLocationOverlay: () => void = () => {
  proj4.defs(projectionSystem);

  const { interaction }: CesiumContextProps = useContext(CesiumContext);
  const [l10n]: UseL10n = useL10n();
  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();
  const authHeader: AuthHeader | undefined = useAuthHeader();
  const targetDSMId: T.DSMContent['id'] | undefined = useSelector(
    ({ Contents, Pages, ProjectConfigPerUser }: T.State) => getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.DSM)
  );
  const _isLonLat: boolean = projectProjection === T.ProjectionEnum.WGS84_EPSG_4326_LL;
  const coordPrecision: number = _isLonLat ? LAT_LON_FIX_FORMAT : Y_X_FIX_FORMAT;
  const projectionSystemLabel: string = getEPSGfromProjectionLabel(projectProjection);

  const {
    projectById,
    projectId,
  } = useSelector((s: T.State) => ({
    projectById: s.Projects.projects.byId,
    projectId: s.Pages.Contents.projectId,
  }));

  if (projectId === undefined) throw new Error(' No Project Id in Pages.Contents.projectId');

  const project: T.Project = projectById[projectId];
  const unitType: T.ValidUnitType = determineUnitType(project.unit);

  // Use let for these three elements
  // to avoid querying the document again once one is found.
  let coordX: HTMLElement | null = null;
  let coordY: HTMLElement | null = null;
  let coordZ: HTMLElement | null = null;

  const getLonLat: (position: Cartesian3 | undefined) => Coordinate = useCallback((position) => {
    if (position) {
      const cartographic: Cartographic = Cartographic.fromCartesian(position);

      return [CesiumMath.toDegrees(cartographic.longitude), CesiumMath.toDegrees(cartographic.latitude)];
    }

    return [0, 0];
  }, []);

  const getProjectCoordinate: (position: Cartesian3 | undefined) => Coordinate = useCallback((position) => {
    if (position) {
      const cartographic: Cartographic = Cartographic.fromCartesian(position);
      const [reprojectedX, reprojectedY]: Coordinate = proj4('EPSG:4326', projectionSystemLabel).forward([
        CesiumMath.toDegrees(cartographic.longitude),
        CesiumMath.toDegrees(cartographic.latitude),
      ]);

      return [reprojectedX, reprojectedY];
    }

    return [0, 0];
  }, []);

  const updateXY: (position: Cartesian3) => void = useCallback((position) => {
    const elemX: HTMLElement | null = (() => {
      if (!coordX) {
        coordX = document.getElementById('coordX');
      }

      return coordX;
    })();
    const elemY: HTMLElement | null = (() => {
      if (!coordY) {
        coordY = document.getElementById('coordY');
      }

      return coordY;
    })();
    if (!elemX || !elemY) return ;

    const [reprojectedX, reprojectedY]: Coordinate = getProjectCoordinate(position);
    elemX.textContent = reprojectedX.toFixed(coordPrecision);
    elemY.textContent = reprojectedY.toFixed(coordPrecision);
  }, [coordPrecision]);

  const updateZ: (position: Cartesian3) => void = useCallback((position) => {
    if (targetDSMId === undefined) return;

    const elem: HTMLElement | null = (() => {
      if (!coordZ) {
        coordZ = document.getElementById('coordZ');
      }

      return coordZ;
    })();
    if (!elem) return;

    const [lon, lat]: Coordinate = getLonLat(position);
    const url: string = makeVolumeAPIURL('elev', `${targetDSMId}?lon=${lon}&lat=${lat}`);
    const onSuccess: (params: T.ElevationInfo) => void = ({ value }) => {
      elem.textContent = `${(value * VALUES_PER_METER[unitType]).toFixed(ELEVATION_FIX_FORMAT)} ${UNIT_SYMBOL[unitType]}`;
    };
    const onError: () => void = () => {
      elem.textContent = l10n(Text.noDSM);
    };

    ajax.get(url, authHeader).pipe(map(({ response }): T.ElevationInfo => response))
      .subscribe(onSuccess, onError);
  }, [targetDSMId, authHeader]);

  useEffect(() => {
    // Updating the z value is debounced because
    // it does a request to BE. It doesn't have to update in realtime
    // since it would request too many times.
    const debouncedUpdateZ: (position: Cartesian3) => void = _.debounce(updateZ, DEBOUNCE_Z_MS);

    interaction?.onMouseMove.addEventListener(updateXY);
    interaction?.onMouseMove.addEventListener(debouncedUpdateZ);

    return () => {
      interaction?.onMouseMove.removeEventListener(updateXY);
      interaction?.onMouseMove.removeEventListener(debouncedUpdateZ);
    };
  }, [interaction]);
};

export function changeCoordinateSystemForDesignDXF(): void {
  GeoJsonDataSource.crsNames['urn:ogc:def:crs:EPSG::3857'] = (coordinates: [number, number, number]) => {
    const convertedXY: [number, number] = proj4('EPSG:3857', 'EPSG:4326').forward([coordinates[0], coordinates[1]]);

    return Cartesian3.fromDegrees(convertedXY[0], convertedXY[1], coordinates[2]);
  };
}

export type UseInitCesiumWith = (renderCesiumFunc: (isFirstLoad: boolean) => void) => void;
export const useInitCesiumWith: UseInitCesiumWith = (renderCesiumFunc) => {
  const { viewer, setViewer }: CesiumContextProps = useContext(CesiumContext);

  useEffect(() => {
    // eslint-disable-next-line max-len
    Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2MDUwN2EyNy1mZTI1LTQyMjYtOTcxMC05Y2E5OWQ0MTVjMTEiLCJpZCI6MTk5OTQsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzY1NzY3MjB9.bpxAKNDb7HQRuMsOsAr9OiUxsQYWT0BiB-9MWps9-ak';
    renderCesiumFunc(true);

    return () => {
      deleteViewer(viewer, setViewer);
    };
  }, []);
};

export type UseUpdateOnDateChange = (
  last3DOrthoDSMId?: T.DSMContent['id'], cesiumContainer?: RefObject<HTMLDivElement> | null | undefined,
) => void;
export const useUpdateOnDateChange: UseUpdateOnDateChange = (last3DOrthoDSMId, cesiumContainer) => {
  const { viewer, setViewer }: CesiumContextProps = useContext(CesiumContext);
  const dsmId = useSelector((state: T.State) =>
    last3DOrthoDSMId !== undefined && !contentsSelector.isProcessingOrFailed(state.Contents)(last3DOrthoDSMId)
      ? last3DOrthoDSMId
      : undefined);

  useDidMountEffect(() => {
    deleteViewer(viewer, setViewer);
    createViewerWith(dsmId, setViewer, cesiumContainer);
  }, [last3DOrthoDSMId]);
};

function deleteViewer(viewer: Viewer | undefined, setViewer: ((viewer?: Viewer | undefined) => void) | undefined): void {
  viewer?.destroy();
  setViewer?.(undefined);
}

function createViewerWith(
  dsmId: T.DSMContent['id'] | undefined,
  setViewer: ((viewer?: Viewer | undefined) => void) | undefined,
  cesiumContainer: RefObject<HTMLDivElement> | null | undefined
): void {
  if (!cesiumContainer?.current) return;
  const terrainProvider = dsmId !== undefined
    ? new CesiumTerrainProvider({
      url: makeS3URL(dsmId, 'terrain-reduced'),
    })
    : undefined;

  setViewer?.(new Viewer(cesiumContainer.current, {
    terrainProvider,
    creditContainer: emptyCreditContainer,
    skyAtmosphere: false,
    skyBox: false,
    ...viewerDefaultOptions,
  }));
  changeCoordinateSystemForDesignDXF();
}

export type UseAddGoogleMap = (
  isMapShown: T.ProjectConfig['isMapShown'] | undefined,
  prevViewer: Viewer | undefined,
  renderCesiumFunc: (isFirstLoad: boolean) => void,
  calibrateMapCenterForCesiumFunc: () => void,
) => void;
export const useAddGoogleMap: UseAddGoogleMap = (isMapShown, prevViewer, renderCesiumFunc, calibrateMapCenterForCesiumFunc) => {
  const { viewer }: CesiumContextProps = useContext(CesiumContext);
  const isIn3DPointCloud = useSelector((state: T.State) => state.Pages.Contents.in3DPointCloud);

  const currentPointCloudEngine = useSelector((state: T.State) => state.Pages.Contents.currentPointCloudEngine);

  const isInCesiumPointCloud = isIn3DPointCloud && currentPointCloudEngine === T.PointCloudEngine.CESIUM;

  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed()) return;
    /** @fixme fix this painful update */
    if (!areDeepEqual(prevViewer, viewer)) {
      calibrateMapCenterForCesiumFunc();
      renderCesiumFunc(false);
    }

    const hasNoNeedToUpdateWorldImagery: boolean = (viewer?.imageryLayers?.get(CILO.WORLD_IMAGERY) instanceof IonImageryProvider);
    if (hasNoNeedToUpdateWorldImagery) return;

    const worldImagery: ImageryLayer | undefined =
      viewer?.imageryLayers.addImageryProvider(createWorldImagery({}), CILO.WORLD_IMAGERY);

    if (isMapShown !== undefined && Boolean(worldImagery)) {
      worldImagery.show = !isInCesiumPointCloud && isMapShown;
    }
  }, [viewer]);
};

export type UseToggleGoogleMap = (isMapShown?: T.ProjectConfig['isMapShown']) => void;
export const useToggleGoogleMap: UseToggleGoogleMap = (isMapShown) => {
  const { viewer }: CesiumContextProps = useContext(CesiumContext);
  const isIn3DPointCloud: boolean = useSelector((state: T.State) => state.Pages.Contents.in3DPointCloud);

  const currentPointCloudEngine = useSelector((state: T.State) => state.Pages.Contents.currentPointCloudEngine);

  const isInCesiumPointCloud = isIn3DPointCloud && currentPointCloudEngine === T.PointCloudEngine.CESIUM;

  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed() || isMapShown === undefined) return;

    const worldImagery: ImageryLayer | undefined = viewer.imageryLayers.get(CILO.WORLD_IMAGERY);
    if (worldImagery === undefined) {
      viewer.imageryLayers.addImageryProvider(createWorldImagery({}), CILO.WORLD_IMAGERY);
    } else {
      viewer.imageryLayers.get(CILO.WORLD_IMAGERY).show = !isInCesiumPointCloud && isMapShown;
    }
  }, [isMapShown, isInCesiumPointCloud]);
};

export type UseToggleTerrain = (threeDOrthoId?: T.ThreeDOrthoContent['id']) => void;
export const useToggleTerrain: UseToggleTerrain = (threeDOrthoId) => {
  const { viewer }: CesiumContextProps = useContext(CesiumContext);
  const isViewerDefined: boolean = viewer !== undefined;

  const threeDOrthoDSMId: T.ThreeDOrthoContent['info']['dsm'] | undefined = useSelector(({ Contents }: T.State) => {
    if (threeDOrthoId === undefined) return;

    const content: T.Content = Contents.contents.byId[threeDOrthoId];

    if (content.type === T.ContentType.THREE_D_ORTHO) {
      return content.info.dsm !== undefined && !contentsSelector.isProcessingOrFailed(Contents)(content.info.dsm)
        ? content.info.dsm
        : undefined;
    }

    return undefined;
  });

  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed()) return;

    if (threeDOrthoDSMId !== undefined) {
      viewer.terrainProvider = new CesiumTerrainProvider({
        url: makeS3URL(threeDOrthoDSMId, 'terrain-reduced'),
      });
    }
  }, [isViewerDefined, threeDOrthoDSMId]);
};

export type UseListenTileLoading = (
  numTilesLoaded: number, setNumTilesLoaded: LocalDispatch<SetStateAction<number>>, isFirstLoading: boolean,
) => void;
export const useListenTileLoading: UseListenTileLoading = (numTilesLoaded, setNumTilesLoaded, isFirstLoading) => {
  const { viewer }: CesiumContextProps = useContext(CesiumContext);

  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed()) return;
    if (Number.MAX_SAFE_INTEGER === numTilesLoaded && isFirstLoading) {
      viewer.scene.globe.tileLoadProgressEvent.addEventListener((num) => {
        setNumTilesLoaded(() => num);
      });
    }
  }, [viewer?.scene.globe]);
};

export type UseTurnOffFirstLoading = (
  isFirstLoading: boolean, numTilesLoaded: number, setFirstLoading: LocalDispatch<SetStateAction<boolean>>,
) => void;
export const useTurnOffFirstLoading: UseTurnOffFirstLoading = (isFirstLoading, numTilesLoaded, setFirstLoading) => {
  const lastSelectedScreen: T.Screen | undefined = useLastSelectedScreen();

  useEffect(() => {
    if (numTilesLoaded <= 0 && isFirstLoading) {
      setFirstLoading(() => false);
    }
  }, [numTilesLoaded]);

  useEffect(() => {
    setFirstLoading(true);
  }, [lastSelectedScreen?.id]);
};

export type UseShowCompassAfterLoading = (shouldShowLoading: boolean) => void;
export const useShowCompassAfterLoading: UseShowCompassAfterLoading = (shouldShowLoading) => {
  if (!shouldShowLoading) {
    const compass: HTMLElement | null = document.querySelector('.compass');
    if (compass !== null && compass.style.zIndex !== '250') {
      compass.style.zIndex = '250';
    }
  }
};

export function useCenterOnContent(): void {
  const { viewer }: CesiumContextProps = useContext(CesiumContext);
  const twoDDisplayCenter: T.ContentsPageState['twoDDisplayCenter'] = useSelector((state: T.State) => state.Pages.Contents.twoDDisplayCenter);
  const skipFirstZoom: MutableRefObject<boolean> = useRef(false);
  const threeDOrthoProcessingStatus: T.ThreeDOrthoContent['status'] = useCesiumThreeDContentStatus();
  const threeDTilesetBounds = useSelector((s: T.State) => s.Pages.Contents.threeDTilesetBounds);

  useEffect(() => {
    if (
      viewer === undefined
      || threeDOrthoProcessingStatus === undefined
      || threeDOrthoProcessingStatus !== T.ContentProcessingStatus.COMPLETED
    ) return;

    // The first zoom after this hook is initialized
    // is always from the map center switching from 2D to 3D.
    // Skip the first zoom with this approach.
    if (!skipFirstZoom.current !== undefined) {
      skipFirstZoom.current = true;
    } else if (threeDTilesetBounds !== undefined) {
      setThreeDTilesetCenter({
        viewer,
        minBounds: threeDTilesetBounds.min,
        maxBounds: threeDTilesetBounds.max,
      });
    } else {
      const [lon, lat]: T.GeoPoint = twoDDisplayCenter;
      const pos: Cartographic = Cartographic.fromDegrees(lon, lat);

      const nextZoom: number = CC.zoom.defaultLevel + ADDITIONAL_ZOOM_LEVEL;
      const radiusIn4326: number = getRadiusForCesium(nextZoom)(-CC.defaultCameraOrientation.pitch);

      // The altitude needs to take the content height into account,
      // so pick the height from the globe.
      const height: number = viewer.scene.globe.getHeight(pos) ?? viewer.camera.positionCartographic.height;

      viewer.camera.setView({
        destination: Cartesian3.fromDegrees(lon, lat - radiusIn4326, convertOlZoomToCesiumAlt(nextZoom) + height),
        orientation: CC.defaultCameraOrientation,
      });
    }
  }, [twoDDisplayCenter]);
}

export type UpdateMapCenter = (mapCenter: T.MapCenter) => void;

type UseUpdateMapCenter = () => UpdateMapCenter;

export const useUpdateMapCenter: UseUpdateMapCenter = () => {
  const dispatch: Dispatch = useDispatch();

  return ({ lon, lat, alt, rotation }: T.MapCenter) => {
    dispatch(ChangeTwoDDisplayZoom({ twoDDisplayZoom: alt }));
    dispatch(ChangeTwoDDisplayCenter({ twoDDisplayCenter: [lon, lat] }));
    dispatch(ChangeRotation({ rotation }));
  };
};

export interface CalibrateMapCenterForCesiumParams {
  viewer?: Viewer;
  lastDSMId?: number;
  authHeader?: AuthHeader;
  twoDDisplayCenter: T.GeoPoint;
  twoDDisplayZoom: number;
  rotation: number;
  handleGetLonLatOn2D3DToggle(): void;
  handleFinishGetLonLatOn2D3DToggle(error?: T.HTTPError): void;
}

export function calibrateMapCenterForCesium({
  viewer,
  lastDSMId,
  twoDDisplayCenter, twoDDisplayZoom, rotation,
  authHeader,
  handleGetLonLatOn2D3DToggle,
  handleFinishGetLonLatOn2D3DToggle,
}: CalibrateMapCenterForCesiumParams): void {
  if (!viewer || lastDSMId === undefined) {
    return;
  }

  const [lon, lat]: T.GeoPoint = twoDDisplayCenter;
  const pitch: number = 70;
  const radius: number = getRadiusForCesium(twoDDisplayZoom)(CesiumMath.toRadians(pitch));
  const alt: number = convertOlZoomToCesiumAlt(twoDDisplayZoom);

  const cosRotation: number = Math.cos(-rotation);
  const sinRotation: number = Math.sin(-rotation);

  const newLon: number = lon - radius * sinRotation;
  const newLat: number = lat - radius * cosRotation;

  const defaultOptions: SetCesiumCameraPositionParams = {
    viewer,
    alt,
    pitch,
    rotation,
    lon: newLon,
    lat: newLat,
  };

  setCesiumCameraPosition(defaultOptions);
  handleGetLonLatOn2D3DToggle();
  requestElevationInfoOnCoordinate({
    lastDSMId,
    lon,
    lat,
    authHeader,
  }).subscribe({
    next: (additionalAltitude: number) => {
      setCesiumCameraPosition({
        ...defaultOptions,
        alt: alt + additionalAltitude,
      });
      handleFinishGetLonLatOn2D3DToggle();
    },
    error: handleFinishGetLonLatOn2D3DToggle,
  });
}


export const ThreeDOrthoMessageViewer = styled.div({
  background: palette.textBlack.toString(),
  height: '100%',
  width: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  /**
   * @todo change it
   */
  color: '#777777',
  fontSize: '15px',
});


export type UseCesiumThreeDContentStatus = () => T.ThreeDOrthoContent['status'];
export const useCesiumThreeDContentStatus: UseCesiumThreeDContentStatus = () => {
  const {
    Contents, Pages, ProjectConfigPerUser,
    Contents: { contents: { byId: contents } },
  }: T.State = useSelector((state: T.State) => state);

  // Cesium can also visualize pointcloud so check the status.
  if (Pages.Contents.in3DPointCloud && Pages.Contents.currentPointCloudEngine === T.PointCloudEngine.CESIUM) {
    const pointCloudId: T.PointCloudContent['id'] | undefined
    = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.POINTCLOUD);

    const pointCloudContent: T.PointCloudContent | undefined
      = pointCloudId !== undefined ? contents[pointCloudId] as T.PointCloudContent : undefined;

    return pointCloudContent?.status;
  }

  // 3D can be either mesh or ortho, mesh is prioritized.
  if (Pages.Contents.in3D) {
    const threeDOrthoId: T.ThreeDOrthoContent['id'] | undefined
      = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.THREE_D_ORTHO);
    const threeMeshId: T.ThreeDOrthoContent['id'] | undefined
      = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.THREE_D_MESH);

    const threeDOrthoContent: T.ThreeDOrthoContent | undefined
      = threeDOrthoId !== undefined ? contents[threeDOrthoId] as T.ThreeDOrthoContent : undefined;
    const threeDMeshContent: T.ThreeDMeshContent | undefined
      = threeMeshId !== undefined ? contents[threeMeshId] as T.ThreeDMeshContent : undefined;

    return threeDMeshContent?.status ?? threeDOrthoContent?.status;
  }

  return undefined;
};

export const ThreeDOrthoMessage: FC = () => {
  const [l10n]: UseL10n = useL10n();
  const threeDOrthoProcessingStatus: T.ThreeDOrthoContent['status'] = useCesiumThreeDContentStatus();

  const message: string = l10n(
    threeDOrthoProcessingStatus === undefined ? Text.noThreeDOrthoDataMessage : Text.threeDOrthoBeingProcessedMessage,
  );

  return (
    <ThreeDOrthoMessageViewer data-testid='three-d-ortho-message-viewer'>
      {message}
    </ThreeDOrthoMessageViewer>
  );
};

export function isThreeDOrthoProcessed(): boolean {
  const threeDOrthoProcessingStatus: T.ThreeDOrthoContent['status'] = useCesiumThreeDContentStatus();

  return threeDOrthoProcessingStatus === T.ContentProcessingStatus.COMPLETED;
}

export function getMarkerLocationInLonLat(location: Coordinate, projectProjection: T.ProjectionEnum): T.GeoPoint {
  return isLonLat(location) ?
    location :
    proj4(getEPSGfromProjectionLabel(projectProjection), 'EPSG:4326').forward(location);
}

export function useCalculateLoadingPercent(numTilesLoaded: number): number {
  const [numTilesToGet, setNumTilesToGet]: UseState<Readonly<number>> = useState(Number.MIN_SAFE_INTEGER);

  useEffect(() => {
    if (numTilesToGet < numTilesLoaded && numTilesLoaded !== Number.MAX_SAFE_INTEGER) setNumTilesToGet(numTilesLoaded);
    if (numTilesLoaded === 0) setNumTilesToGet(Number.MIN_SAFE_INTEGER);
  }, [numTilesLoaded]);

  const isInvalidPercent: boolean =
    numTilesLoaded === Number.MAX_SAFE_INTEGER ||
    numTilesToGet === Number.MIN_SAFE_INTEGER ||
    numTilesLoaded === 0;

  return isInvalidPercent ? HUNDRED : HUNDRED * (numTilesToGet - numTilesLoaded) / numTilesToGet;
}

export const useElevationProfileHoverPoint: (location: T.GeoPoint | undefined) => void = (location) => {
  const { viewer }: CesiumContextProps = useContext(CesiumContext);
  const pointEntityRef: MutableRefObject<Entity | undefined> = useRef();

  useEffect(() => {
    if (!viewer) return;

    if (!pointEntityRef.current) {
      pointEntityRef.current = viewer.entities.add({
        id: ELEVATION_PROFILE_HOVER_ID,
        billboard: createCesiumSelectPointOptions(),
      });
    }

    pointEntityRef.current.position = new ConstantPositionProperty(location ? Cartesian3.fromDegrees(location[0], location[1]) : undefined);

    return () => {
      if (viewer.isDestroyed()) return;

      if (location === undefined && pointEntityRef.current) {
        viewer.entities.remove(pointEntityRef.current);
        pointEntityRef.current = undefined;
      }
    };
  }, [viewer, location]);
};

export const useToggleDesignDXFBorder: () => void = () => {
  const { viewer }: CesiumContextProps = useContext(CesiumContext);

  const previewingDesignDXF: T.DesignDXFContent | undefined = useSelector((state: T.State) => {
    const designDxfId: T.DesignDXFContent['id'] | undefined = state.Pages.Contents.previewingDesignId;

    return typeGuardDesignDXF(state.Contents.contents.byId[designDxfId ?? NaN]);
  });

  const editingVolume: T.VolumeContent | undefined = useSelector((state: T.State) => {
    const editingVolumeId: T.VolumeContent['id'] | undefined = state.Pages.Contents.editingContentId;

    return typeGuardVolume(state.Contents.contents.byId[editingVolumeId ?? NaN]);
  });

  useEffect(() => {
    if (!viewer || viewer.isDestroyed() || editingVolume === undefined || previewingDesignDXF?.info.designBorder === undefined) return;

    const locations: T.GeoPoint[] = previewingDesignDXF.info.designBorder.map((p) => toLonLat(p));
    const entity: Entity = viewer.entities.add({
      id: DESIGN_DXF_PREVIEW_ID,
      polyline: createCesiumPolylineOptions({
        color: editingVolume.info.isBoundaryViolated ? palette.error : palette.designDXFLayerBorder,
        locations,
      }),
    });

    return () => {
      if (viewer.isDestroyed()) return;

      viewer.entities.remove(entity);
    };
  }, [editingVolume?.id, previewingDesignDXF?.info.designBorder]);
};

function getReprojectedLocations(
  positions: Cartesian3[],
  type: T.GeometryContent['type'] | T.ContentType.ESS_MODEL,
  projectProjection: T.ProjectionEnum,
): T.GeoPoint[] {
  // Project the locations to web mercator position.
  // This is to standardize the process as to how it is done in 2D as well.
  const locations: T.GeoPoint[] = positions.map((position) => {
    const webMercatorProjection: WebMercatorProjection = new WebMercatorProjection();
    const cartographic: Cartographic = getCartographicFromPosition(position);
    const webMercatorPosition: Cartesian3 = webMercatorProjection.project(cartographic);

    return type === T.ContentType.LENGTH
      ? [webMercatorPosition.x, webMercatorPosition.y, webMercatorPosition.z]
      : [webMercatorPosition.x, webMercatorPosition.y];
  });

  // See getLocationsForDB function on more details on why it is needed.
  return getLocationsForDB(type, locations, projectProjection);
}
