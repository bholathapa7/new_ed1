import * as Sentry from '@sentry/browser';
import { AuthHeader, volumeServiceHostname } from '^/store/duck/API';
import * as T from '^/types';
import { calcSlopeOfLength } from '^/utilities/math';
import _ from 'lodash-es';
import { Overlay } from 'ol';
import OlMap from 'ol/Map';
import { Coordinate } from 'ol/coordinate';
import { boundingExtent, getCenter } from 'ol/extent';
import { LineString } from 'ol/geom';
import Interaction from 'ol/interaction/Interaction';
import Modify from 'ol/interaction/Modify';
import { fromLonLat } from 'ol/proj';
import { Observable, forkJoin } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { catchError, map, publishLast, refCount } from 'rxjs/operators';
import { INVALID, OlCustomPropertyNames, SINGLE_LENGTH_SEGMENT_OVERLAY_OFFSET } from '../constants';
import {
  createGeometryFromLocations,
  getImperialMeasurementFromGeometry,
  getImperialMeasurementUnitFromGeometryType,
  getMeasurementFromGeometry,
  getMeasurementUnitFromGeometryType,
} from '../contentTypeSwitch';

export interface CoordinateAndElevation {
  elevation?: T.ElevationInfo['value'];
  coordinate: Coordinate;
}

export function makeLengthSegmentOverlayId(idPostfix: string | number): string {
  return `${OlCustomPropertyNames.LENGTH_SEGMENT}${idPostfix}`;
}

export function setLengthSegmentOverlayId(overlay: Overlay, idPostfix: string | number): Overlay {
  overlay.set('id', makeLengthSegmentOverlayId(idPostfix));

  return overlay;
}

function getOverlaysArrayFromMap(olMap: OlMap): Array<Overlay> {
  return olMap.getOverlays().getArray();
}

function filterLengthSegmentOverlay(overlay: Overlay): boolean {
  return overlay?.get('id')?.toString().startsWith(OlCustomPropertyNames.LENGTH_SEGMENT);
}

export function getLengthSegmentOverlayById(olMap: OlMap, id: string | number): Overlay | undefined {
  return getOverlaysArrayFromMap(olMap).find((o) => o.get('id') === makeLengthSegmentOverlayId(id));
}

export function deleteAllLengthSegmentOverlays(olMap: OlMap): void {
  getOverlaysArrayFromMap(olMap).filter(filterLengthSegmentOverlay).forEach((overlay) => olMap.removeOverlay(overlay));
}

export function hasLengthSegmentOverlays(olMap: OlMap): boolean {
  return getOverlaysArrayFromMap(olMap).some(filterLengthSegmentOverlay);
}

export function makeLengthSegmentOverlay({
  coordinate0,
  coordinate1,
  idPostfix,
  customOffset,
}: {
  coordinate0: Coordinate;
  coordinate1: Coordinate;
  /**
   * indicates index from coordinates array
   */
  idPostfix: number | string;
  customOffset?: [number, number];
}): Overlay {
  const div: HTMLDivElement = document.createElement('div');
  const overlay: Overlay = new Overlay({
    position: getCenter(boundingExtent([
      coordinate0,
      coordinate1,
    ].map((c) => fromLonLat(c))),
    ),
    element: div,
    className: `${OlCustomPropertyNames.OL_REALTIME_MEASUREMENT_TOOLTIP_LENGTH_CLASSNAME} ${OlCustomPropertyNames.OL_LOADING_TOOLTIP_SMALL}`,
    // eslint-disable-next-line no-magic-numbers
    offset: customOffset === undefined ? [7.5, 7.5] : customOffset,
    stopEvent: false,
  });
  /**
   * id starts from 0
   */
  setLengthSegmentOverlayId(overlay, idPostfix);
  const measurementElement: HTMLParagraphElement = document.createElement('p');
  measurementElement.className = OlCustomPropertyNames.OL_LENGTH_SEGMENT_MEASUREMENT;
  const slopeElement: HTMLParagraphElement = document.createElement('p');
  slopeElement.className = OlCustomPropertyNames.OL_LENGTH_SEGMENT_SLOPE;
  div.appendChild(measurementElement);
  div.appendChild(slopeElement);

  updateMeasurementOnLengthSegmentOverlay({
    overlay,
    pairOfCoordinates: [coordinate0, coordinate1],
  });
  updateSlopeOnLengthSegmentOverlay({
    overlay,
    customText: '- %',
  });

  return overlay;
}

export function makeImperialLengthSegmentOverlay({
  coordinate0,
  coordinate1,
  idPostfix,
  customOffset,
}: {
  coordinate0: Coordinate;
  coordinate1: Coordinate;
  /**
   * indicates index from coordinates array
   */
  idPostfix: number | string;
  customOffset?: [number, number];
}): Overlay {
  const div: HTMLDivElement = document.createElement('div');
  const overlay: Overlay = new Overlay({
    position: getCenter(boundingExtent([
      coordinate0,
      coordinate1,
    ].map((c) => fromLonLat(c))),
    ),
    element: div,
    className: `${OlCustomPropertyNames.OL_REALTIME_MEASUREMENT_TOOLTIP_LENGTH_CLASSNAME} ${OlCustomPropertyNames.OL_LOADING_TOOLTIP_SMALL}`,
    // eslint-disable-next-line no-magic-numbers
    offset: customOffset === undefined ? [7.5, 7.5] : customOffset,
    stopEvent: false,
  });
  /**
   * id starts from 0
   */
  setLengthSegmentOverlayId(overlay, idPostfix);
  const measurementElement: HTMLParagraphElement = document.createElement('p');
  measurementElement.className = OlCustomPropertyNames.OL_LENGTH_SEGMENT_MEASUREMENT;
  const slopeElement: HTMLParagraphElement = document.createElement('p');
  slopeElement.className = OlCustomPropertyNames.OL_LENGTH_SEGMENT_SLOPE;
  div.appendChild(measurementElement);
  div.appendChild(slopeElement);

  updateImperialMeasurementOnLengthSegmentOverlay({
    overlay,
    pairOfCoordinates: [coordinate0, coordinate1],
  });
  updateSlopeOnLengthSegmentOverlay({
    overlay,
    customText: '- %',
  });

  return overlay;
}

// eslint-disable-next-line @typescript-eslint/promise-function-async
export function requestElevationsFromCoordinates({
  coordinates,
  targetDSMId,
  authHeader,
}: {
  coordinates: Array<Coordinate>;
  targetDSMId?: number;
  authHeader?: AuthHeader;
}): Promise<Array<T.ElevationInfo['value']>> {
  if (targetDSMId === undefined || authHeader === undefined) return new Promise((resolve) => resolve(new Array(coordinates.length).fill(undefined)));

  const elevationsArr: Array<Observable<T.ElevationInfo['value']>> = [];
  for (const [lon, lat] of coordinates) {
    const ob$: Observable<T.ElevationInfo['value']> = ajax.get(
      `https://${volumeServiceHostname}/elev/${targetDSMId}?lon=${lon}&lat=${lat}`,
      authHeader,
    ).pipe(
      map(({ response }): T.ElevationInfo => response),
      map(({ value }) => value),
      publishLast(),
      refCount(),
      catchError((err) => {
        Sentry.captureException(err);

        return new Array(coordinates.length).fill(undefined);
      }),
    );
    elevationsArr.push(ob$);
  }

  return forkJoin<Array<Observable<T.ElevationInfo['value']>>>(elevationsArr).toPromise();
}

export function makeManyMeasurementOverlays({
  lengthCoordinatesElevations,
  olMap,
  unitType,
}: {
  lengthCoordinatesElevations: Array<CoordinateAndElevation>;
  olMap: OlMap;
  unitType: T.UnitType;
}): void {
  for (const [index, { elevation, coordinate }] of lengthCoordinatesElevations.entries()) {
    /**
     * Length of overlays = lengthCoordinatesElevations.length - 1
     */
    if (index === lengthCoordinatesElevations.length - 1) continue;

    if (lengthCoordinatesElevations[index + 1].coordinate === undefined) return;

    const anyExistingOverlay: Overlay | undefined = getLengthSegmentOverlayById(olMap, index);
    if (anyExistingOverlay) olMap.removeOverlay(anyExistingOverlay);

    const overlay: Overlay = (unitType === T.UnitType.IMPERIAL) ?
      makeImperialLengthSegmentOverlay({
        coordinate0: coordinate,
        coordinate1: lengthCoordinatesElevations[index + 1].coordinate,
        idPostfix: index,
        customOffset: lengthCoordinatesElevations.length === 2 ? SINGLE_LENGTH_SEGMENT_OVERLAY_OFFSET : undefined,
      }) :
      makeLengthSegmentOverlay({
        coordinate0: coordinate,
        coordinate1: lengthCoordinatesElevations[index + 1].coordinate,
        idPostfix: index,
        customOffset: lengthCoordinatesElevations.length === 2 ? SINGLE_LENGTH_SEGMENT_OVERLAY_OFFSET : undefined,
      });
    updateSlopeOnLengthSegmentOverlay({
      overlay,
      pairOfCoordinateAndElevations: [{ elevation, coordinate }, lengthCoordinatesElevations[index + 1]],
    });
    olMap.addOverlay(overlay);
  }
}

export function updateMeasurementOnLengthSegmentOverlay({
  overlay,
  pairOfCoordinates,
}: {
  overlay: Overlay;
  pairOfCoordinates: [Coordinate, Coordinate];
}): Overlay {
  const measurementHTMLElement: Element =
    ((overlay as any).element as HTMLElement).getElementsByClassName(OlCustomPropertyNames.OL_LENGTH_SEGMENT_MEASUREMENT)[0];

  const singleSegment: LineString = createGeometryFromLocations({
    locations: pairOfCoordinates,
    geometryType: T.ContentType.LENGTH,
  }) as LineString;

  // eslint-disable-next-line max-len
  measurementHTMLElement.textContent = `${getMeasurementFromGeometry({ geometry: singleSegment, geometryType: T.ContentType.LENGTH })}${getMeasurementUnitFromGeometryType({ geometryType: T.ContentType.LENGTH })},`;

  return overlay;
}

export function updateImperialMeasurementOnLengthSegmentOverlay({
  overlay,
  pairOfCoordinates,
}: {
  overlay: Overlay;
  pairOfCoordinates: [Coordinate, Coordinate];
}): Overlay {
  const measurementHTMLElement: Element =
    ((overlay as any).element as HTMLElement).getElementsByClassName(OlCustomPropertyNames.OL_LENGTH_SEGMENT_MEASUREMENT)[0];

  const singleSegment: LineString = createGeometryFromLocations({
    locations: pairOfCoordinates,
    geometryType: T.ContentType.LENGTH,
  }) as LineString;

  // eslint-disable-next-line max-len
  measurementHTMLElement.textContent = `${getImperialMeasurementFromGeometry({ geometry: singleSegment, geometryType: T.ContentType.LENGTH })}${getImperialMeasurementUnitFromGeometryType({ geometryType: T.ContentType.LENGTH })},`;

  return overlay;
}

interface UpdateOverlayParams {
  overlay: Overlay;
  pairOfCoordinateAndElevations?: [CoordinateAndElevation, CoordinateAndElevation];
  customText?: string;
}

export function updateSlopeOnLengthSegmentOverlay({
  overlay,
  pairOfCoordinateAndElevations,
  customText,
}: UpdateOverlayParams): Overlay {
  const slopeHTMLElement: Element =
    ((overlay as any).element as HTMLElement).getElementsByClassName(OlCustomPropertyNames.OL_LENGTH_SEGMENT_SLOPE)[0];

  if (customText !== undefined) {
    slopeHTMLElement.textContent = customText;

    return overlay;
  }
  if (pairOfCoordinateAndElevations !== undefined) {
    const slope: string = calcSlopeOfLength(pairOfCoordinateAndElevations);
    slopeHTMLElement.textContent = `${slope === INVALID ? '-' : slope}%`;

    return overlay;
  }

  return overlay;
}

export function isMapModifying(olMap: OlMap): boolean {
  return olMap.getInteractions().getArray().some((interaction) => interaction instanceof Modify);
}

export function getInteraction(olMap: OlMap, I: new (...params: any) => Interaction): Interaction | undefined {
  return olMap.getInteractions().getArray().find((i) => i instanceof I);
}
