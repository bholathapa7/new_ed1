import { UseState, useAuthHeader, usePrevProps } from '^/hooks';
import { AuthHeader, volumeServiceHostname } from '^/store/duck/API';
import * as T from '^/types';
import { RealTimeMeasurementTooltipOverlayAndElement, makeRealtimeMeasurementTooltip, updateMeasurementTooltip } from '^/utilities/ol-layer-util';
import { getSingleContentId } from '^/utilities/state-util';
import { Overlay } from 'ol';
import OlMap from 'ol/Map';
import { Coordinate } from 'ol/coordinate';
import { boundingExtent, getCenter } from 'ol/extent';
import { LineString, Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import React, { FC, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useSelector } from 'react-redux';
import { Subscription } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map } from 'rxjs/operators';
import { OlEventListenerState } from '../OlMapEventListeners/store/State';
import { OlMinCoordinatesLength } from '../constants';
import { createGeometryFromLocations, getImperialMeasurementFromGeometry, getImperialMeasurementUnitFromGeometryType } from '../contentTypeSwitch';
import {
  CoordinateAndElevation, deleteAllLengthSegmentOverlays, getLengthSegmentOverlayById,
  makeImperialLengthSegmentOverlay,
  makeLengthSegmentOverlay, updateSlopeOnLengthSegmentOverlay,
} from './util';
import { determineUnitType } from '^/utilities/imperial-unit';

function requestAndSetCoordinateElevation({
  lengthCoordinatesElevations,
  setLengthCoordinatesElevations,
  authHeader,
  coordinate,
  targetDSMId,
}: {
  lengthCoordinatesElevations: Readonly<Array<CoordinateAndElevation>>;
  setLengthCoordinatesElevations: Dispatch<SetStateAction<Readonly<Array<CoordinateAndElevation>>>>;
  coordinate: Coordinate;
  authHeader?: AuthHeader;
  targetDSMId?: number;
}): Subscription | undefined {
  const [lon, lat]: Coordinate = coordinate;
  /**
   * If there is no DSM, only store coordinate
   */
  if (targetDSMId === undefined) {
    setLengthCoordinatesElevations([...lengthCoordinatesElevations, { coordinate: [lon, lat] }]);

    return;
  }

  return ajax.get(
    `https://${volumeServiceHostname}/elev/${targetDSMId}?lon=${lon}&lat=${lat}`,
    authHeader,
  ).pipe(
    map(({ response }): T.ElevationInfo => response),
    map(({ value }) => {
      setLengthCoordinatesElevations([...lengthCoordinatesElevations, { elevation: value, coordinate: [lon, lat] }]);
    }),
  ).subscribe();
}

/**
 * For updating coordinate and elevation for each coordinate of the length
 */
function useLengthCoordinatesElevations({
  selectedLength,
}: {
  selectedLength?: { coordinates: Array<Coordinate> };
}): UseState<Readonly<Array<CoordinateAndElevation>>> {
  const [lengthCoordinatesElevations, setLengthCoordinatesElevations]: UseState<Readonly<Array<CoordinateAndElevation>>> = useState([]);
  const prevselectedLength: number | undefined = usePrevProps(selectedLength?.coordinates.length);
  const authHeader: AuthHeader | undefined = useAuthHeader();
  const { ProjectConfigPerUser, Pages, Contents }: T.State = useSelector((state: T.State) => state);
  const targetDSMId: number | undefined = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.DSM);

  useEffect(() => {
    if (!selectedLength) return;
    /**
     * User completes creation of length
     */
    if (prevselectedLength !== undefined && prevselectedLength > selectedLength.coordinates.length) return;
    /**
     * only first two points
     */
    if (
      selectedLength.coordinates.length === OlMinCoordinatesLength.LENGTH - 1 ||
      lengthCoordinatesElevations.length > 1
    ) return;

    const sub: Subscription | undefined = requestAndSetCoordinateElevation({
      lengthCoordinatesElevations,
      setLengthCoordinatesElevations,
      authHeader,
      targetDSMId,
      // request next coordinate
      coordinate: selectedLength.coordinates[lengthCoordinatesElevations.length],
    });

    return () => {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!selectedLength) {
        setLengthCoordinatesElevations([]);
      }
      sub?.unsubscribe();
    };
  }, [selectedLength?.coordinates.length, lengthCoordinatesElevations]);

  useEffect(() => {
    if (!selectedLength || (prevselectedLength !== undefined && prevselectedLength > selectedLength.coordinates.length)) return;
    let sub: Subscription | undefined;
    if (selectedLength.coordinates.length > OlMinCoordinatesLength.LENGTH) {
      const lastVisiblePointindex: number = selectedLength.coordinates.length - 2;
      sub = requestAndSetCoordinateElevation({
        lengthCoordinatesElevations,
        setLengthCoordinatesElevations,
        authHeader,
        targetDSMId,
        coordinate: selectedLength.coordinates[lastVisiblePointindex],
      });
    }

    return () => {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!selectedLength) {
        setLengthCoordinatesElevations([]);
      }
      sub?.unsubscribe();
    };
  }, [selectedLength?.coordinates.length]);

  return [lengthCoordinatesElevations, setLengthCoordinatesElevations];
}

/**
 * For updating the last segment only
 */
function useLastLengthSegmentOverlay({
  olMap,
  prevselectedLength,
  selectedLength,
  selectedLengthCoordinates,
  selectedLengthCoordinatesLength,
  unitType,
}: {
  olMap: OlMap;
  prevselectedLength: number | undefined;
  selectedLength?: { coordinates: Array<Coordinate> };
  selectedLengthCoordinates: Array<Coordinate> | undefined;
  selectedLengthCoordinatesLength: number | undefined;
  unitType: T.ValidUnitType;
}): void {
  const [{ realtimeMeasurementTooltip, realtimeMeasurementTooltipElement }]: UseState<RealTimeMeasurementTooltipOverlayAndElement> =
    useState(makeRealtimeMeasurementTooltip());

  const [lastX, lastY]: Coordinate = selectedLengthCoordinates && selectedLengthCoordinatesLength !== undefined ?
    selectedLengthCoordinates[selectedLengthCoordinatesLength - 1] : [0, 0];

  useEffect(() => {
    olMap.addOverlay(realtimeMeasurementTooltip);

    return () => {
      olMap.removeOverlay(realtimeMeasurementTooltip);
    };
  }, []);

  /**
   * Whenever you 'click' to make a new segment.
   * This code will remove duplicate overlays in the last segment
   */
  useEffect(() => {
    if (prevselectedLength === undefined || selectedLengthCoordinatesLength === undefined) return;

    if (prevselectedLength >= selectedLengthCoordinatesLength) return;

    if (unitType === T.UnitType.IMPERIAL) {
      const geometry: Point = new Point([lastX, lastY]);
      updateMeasurementTooltip({
        realtimeMeasurementTooltip,
        realtimeMeasurementTooltipElement,
        geometry,
        geometryType: T.ContentType.MARKER,
        overridingTooltipText: `${getImperialMeasurementFromGeometry({
          geometry,
          geometryType: T.ContentType.LENGTH,
        })}${getImperialMeasurementUnitFromGeometryType({
          geometryType: T.ContentType.LENGTH,
        })}`,
      });
    } else {
      updateMeasurementTooltip({
        realtimeMeasurementTooltip,
        realtimeMeasurementTooltipElement,
        geometry: new Point([lastX, lastY]),
        geometryType: T.ContentType.MARKER,
      });
    }
  }, [prevselectedLength, selectedLengthCoordinatesLength]);

  /**
   * For updating the last point only
   */
  useEffect(() => {
    /**
     * Has not started drawing yet
     */
    if (
      !selectedLength ||
        selectedLengthCoordinatesLength === undefined ||
        selectedLengthCoordinatesLength < OlMinCoordinatesLength.LENGTH ||
        selectedLengthCoordinates === undefined
    ) return;

    /**
     * User completes the creation of length
     */
    if (prevselectedLength !== undefined && prevselectedLength > selectedLengthCoordinatesLength) {
      olMap.removeOverlay(realtimeMeasurementTooltip);

      return;
    }

    const lastSegment: LineString = createGeometryFromLocations({
      locations: [[lastX, lastY], selectedLength.coordinates[selectedLengthCoordinatesLength - 2]],
      geometryType: T.ContentType.LENGTH,
    }) as LineString;
    const center: Coordinate = getCenter(boundingExtent([
      [lastX, lastY],
      /**
       * At the moment mouse clicks,
       * coordinates[selectedLengthCoordinatesLength - 2] becomes coordinates[selectedLengthCoordinatesLength - 3].
       */
      selectedLengthCoordinates?.[selectedLengthCoordinatesLength - 2],
    ].map((c) => fromLonLat(c))),
    );

    if (unitType === T.UnitType.IMPERIAL) {
      updateMeasurementTooltip({
        realtimeMeasurementTooltip,
        realtimeMeasurementTooltipElement,
        geometry: lastSegment,
        geometryType: T.ContentType.LENGTH,
        overridingTooltipPosition: center,
        overridingTooltipText: `${getImperialMeasurementFromGeometry({
          geometry: lastSegment,
          geometryType: T.ContentType.LENGTH,
        })}${getImperialMeasurementUnitFromGeometryType({
          geometryType: T.ContentType.LENGTH,
        })}`,
      });
    } else {
      updateMeasurementTooltip({
        realtimeMeasurementTooltip,
        realtimeMeasurementTooltipElement,
        geometry: lastSegment,
        geometryType: T.ContentType.LENGTH,
        overridingTooltipPosition: center,
      });
    }
  }, [lastX, lastY]);
}

/**
 * For updating the slope info on overlay
 */
function useSlopeOnLengthSegmentOverlay({
  olMap,
  lengthCoordinatesElevations,
}: {
  olMap: OlMap;
  lengthCoordinatesElevations: Readonly<Array<CoordinateAndElevation>>;
}): void {
  useEffect(() => {
    /**
     * At least two so that we can calculate slope
     */
    if (lengthCoordinatesElevations.length < 2) return;

    const index: number = lengthCoordinatesElevations.length - 1;
    const overlayId: number = index - 1;
    const overlay: Overlay | undefined = getLengthSegmentOverlayById(olMap, overlayId);

    if (!overlay) return;

    updateSlopeOnLengthSegmentOverlay({
      overlay,
      pairOfCoordinateAndElevations: [lengthCoordinatesElevations[index - 1], lengthCoordinatesElevations[index]],
    });
  }, [lengthCoordinatesElevations.length]);
}

/**
 * For updating all segments except the last segment
 */
function useLengthSegmentOverlays({
  olMap,
  prevselectedLength,
  selectedLength,
  selectedLengthCoordinatesLength,
  unitType,
}: {
  olMap: OlMap;
  prevselectedLength: number | undefined;
  selectedLength?: { coordinates: Array<Coordinate> };
  selectedLengthCoordinatesLength: number | undefined;
  unitType: T.ValidUnitType;
}): void {
  useEffect(() => {
    /**
     * Has not started drawing yet
     */
    if (!selectedLength || selectedLengthCoordinatesLength === undefined || selectedLengthCoordinatesLength < OlMinCoordinatesLength.LENGTH) return;

    /**
     * User completes the creation of length
     */
    if (prevselectedLength !== undefined && prevselectedLength > selectedLengthCoordinatesLength) return;

    if (unitType === T.UnitType.IMPERIAL) {
      olMap.addOverlay(makeImperialLengthSegmentOverlay({
        coordinate0: selectedLength.coordinates[selectedLengthCoordinatesLength - 1],
        coordinate1: selectedLength.coordinates[selectedLengthCoordinatesLength - OlMinCoordinatesLength.LENGTH],
        idPostfix: selectedLengthCoordinatesLength - OlMinCoordinatesLength.LENGTH,
      }));
    } else {
      olMap.addOverlay(makeLengthSegmentOverlay({
        coordinate0: selectedLength.coordinates[selectedLengthCoordinatesLength - 1],
        coordinate1: selectedLength.coordinates[selectedLengthCoordinatesLength - OlMinCoordinatesLength.LENGTH],
        idPostfix: selectedLengthCoordinatesLength - OlMinCoordinatesLength.LENGTH,
      }));
    }
  }, [selectedLengthCoordinatesLength]);
}

export const LengthSegmentsOverlayOnDraw: FC<{
  olMap: OlMap;
  selectedLength: OlEventListenerState['selectedLength'];
}> = ({
  olMap,
  selectedLength,
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

  const prevselectedLength: number | undefined = usePrevProps(selectedLength?.coordinates.length);
  const [
    lengthCoordinatesElevations,
    setLengthCoordinatesElevations,
  ]: UseState<Readonly<Array<CoordinateAndElevation>>> = useLengthCoordinatesElevations({
    selectedLength,
  });
  const selectedLengthCoordinates: Array<Coordinate> | undefined = selectedLength?.coordinates;
  const selectedLengthCoordinatesLength: number | undefined = selectedLength?.coordinates.length;

  const reset: () => void = () => {
    setLengthCoordinatesElevations([]);
    deleteAllLengthSegmentOverlays(olMap);
  };

  useLastLengthSegmentOverlay({
    olMap,
    prevselectedLength,
    selectedLength,
    selectedLengthCoordinates,
    selectedLengthCoordinatesLength,
    unitType,
  });

  useLengthSegmentOverlays({
    olMap,
    prevselectedLength,
    selectedLength,
    selectedLengthCoordinatesLength,
    unitType,
  });

  useSlopeOnLengthSegmentOverlay({
    olMap,
    lengthCoordinatesElevations,
  });

  useEffect(() => reset, []);

  return <></>;
};
