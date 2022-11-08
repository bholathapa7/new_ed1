import * as T from '^/types';

import { UseL10n, useAuthHeader, useL10n, usePrevProps } from '^/hooks';
import { AuthHeader } from '^/store/duck/API';
import { getLayerById } from '^/utilities/ol-layer-util';
import { getSingleContentId } from '^/utilities/state-util';
import _ from 'lodash-es';
import OlMap from 'ol/Map';
import { Geometry, LineString } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { toLonLat } from 'ol/proj';
import React, { Dispatch as LocalDispatch, FC, useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ActionTypes, Actions } from '../OlMapEventListeners/store/Actions';
import { OlEventListenerState } from '../OlMapEventListeners/store/State';
import { OlCustomPropertyNames } from '../constants';
import {
  CoordinateAndElevation,
  deleteAllLengthSegmentOverlays,
  isMapModifying,
  makeManyMeasurementOverlays,
  requestElevationsFromCoordinates,
} from './util';
import { determineUnitType } from '^/utilities/imperial-unit';

export const LengthSegmentOverlaysOnHover: FC<{
  olMap: OlMap;
  localDispatch: LocalDispatch<Actions>;
  isHoveringOnLayer: OlEventListenerState['isHoveringOnLayer'];
  selectedLength: OlEventListenerState['selectedLength'];
  selectedLengthElevations: OlEventListenerState['selectedLengthElevations'];
  currentlyHoveredLayerId: OlEventListenerState['currentlyHoveredLayerId'];
}> = ({
  olMap,
  localDispatch,
  isHoveringOnLayer,
  selectedLength,
  currentlyHoveredLayerId,
  selectedLengthElevations,
}) => {
  const {
    projectId,
    projectById,
  } = useSelector((s: T.State) => ({
    projectById: s.Projects.projects.byId,
    projectId: s.Pages.Contents.projectId,
  }));

  if (projectId === undefined) throw new Error(' No Project Id in Pages.Contents.projectId');

  const unitType: T.ValidUnitType = determineUnitType(projectById[projectId].unit);

  const prevselectedLength: OlEventListenerState['selectedLength'] = usePrevProps(selectedLength);
  const prevHoveredLayerId: OlEventListenerState['currentlyHoveredLayerId'] = usePrevProps(currentlyHoveredLayerId);
  const authHeader: AuthHeader | undefined = useAuthHeader();
  const { ProjectConfigPerUser, Pages, Contents }: T.State = useSelector((state: T.State) => state);
  const targetDSMId: number | undefined = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.DSM);
  const []: UseL10n = useL10n();

  const hoveredLengthGeometry: LineString | undefined = useMemo(
    () => {
      if (currentlyHoveredLayerId === undefined) return undefined;

      const l: VectorLayer | undefined = getLayerById({ olMap, id: currentlyHoveredLayerId });

      const targetGeom: Geometry | undefined = l?.getSource().getFeatureById(OlCustomPropertyNames.MAIN_FEATURE).getGeometry();

      return (targetGeom instanceof LineString ? targetGeom : undefined);
    }, [currentlyHoveredLayerId],
  );

  const resetElevations: () => void = useCallback(() => {
    localDispatch({
      type: ActionTypes.UPDATE_LENGTH_ELEVATIONS,
      payload: { elevations: [] },
    });
  }, []);

  useEffect(() => () => {
    if (!isMapModifying(olMap)) {
      deleteAllLengthSegmentOverlays(olMap);
      resetElevations();
    }
  }, []);

  useEffect(() => {
    /**
     * Reset elevations on hover out
     */
    if (isMapModifying(olMap)) return;

    return resetElevations;
  }, [isHoveringOnLayer]);

  useEffect(() => {
    /**
     * A user has moved his mouse to another layer to hover
     * then turn off overlays on the previous layer and
     * turn them on on the next layer
     */
    if (
      currentlyHoveredLayerId !== undefined &&
      currentlyHoveredLayerId !== prevHoveredLayerId
    ) {
      return () => {
        deleteAllLengthSegmentOverlays(olMap);
        resetElevations();
      };
    }

    return;
  }, [currentlyHoveredLayerId, prevHoveredLayerId]);

  useEffect(() => {
    /**
     * The length is not hovered on yet
     */
    if (selectedLength === undefined || selectedLength?.coordinates.length === prevselectedLength?.coordinates.length) return;

    if (targetDSMId !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      (async () => {
        if (isHoveringOnLayer) {
          const elevations: Array<T.ElevationInfo['value']> =
            await requestElevationsFromCoordinates({ coordinates: selectedLength.coordinates, targetDSMId, authHeader });
          localDispatch({ type: ActionTypes.UPDATE_LENGTH_ELEVATIONS, payload: { elevations } });
        }
      })();
    } else {
      /**
       * Fill in undefined to render overlays correctly if there is no dsm
       */
      localDispatch({
        type: ActionTypes.UPDATE_LENGTH_ELEVATIONS,
        payload: { elevations: Array(selectedLength.coordinates.length).fill(undefined) },
      });
    }

    return;
  }, [isHoveringOnLayer, selectedLength?.coordinates.length, prevselectedLength]);

  useEffect(() => {
    if (isMapModifying(olMap)) return;

    if (
      selectedLengthElevations?.elevations.length === 0 ||
      hoveredLengthGeometry === undefined
    ) {
      return () => deleteAllLengthSegmentOverlays(olMap);
    }

    const lengthCoordinatesElevations: Array<CoordinateAndElevation> =
      _.zip(
        selectedLengthElevations.elevations,
        selectedLength?.coordinates === undefined || selectedLength?.coordinates.length === 0 ?
          hoveredLengthGeometry.getCoordinates().map((c) => toLonLat(c)) :
          selectedLength.coordinates,
      )
        .map(([elevation, coordinate]) => ({ elevation, coordinate })) as Array<CoordinateAndElevation>;

    makeManyMeasurementOverlays({ lengthCoordinatesElevations, olMap, unitType });

    return;
  }, [selectedLengthElevations?.elevations]);

  return <></>;
};
