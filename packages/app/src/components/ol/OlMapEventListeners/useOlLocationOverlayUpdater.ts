import { useLayoutEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { MapBrowserEvent } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { toLonLat } from 'ol/proj';
import proj4 from 'proj4';
import { Observable, Subscription } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';

import * as T from '^/types';

import { ELEVATION_FIX_FORMAT, LAT_LON_FIX_FORMAT, Y_X_FIX_FORMAT } from '^/constants/defaultContent';
import { UseL10n, useAuthHeader, useL10n, useProjectCoordinateSystem } from '^/hooks';
import { AuthHeader, volumeServiceHostname } from '^/store/duck/API';
import { getEPSGfromProjectionLabel, projectionSystem } from '^/utilities/coordinate-util';
import { getSingleContentId } from '^/utilities/state-util';

import Text from './text';
import { determineUnitType, UNIT_SYMBOL, VALUES_PER_METER } from '^/utilities/imperial-unit';

export const useOlLocationOverlayUpdater: (
  isClickEventRegistered: boolean,
  createHandlePointerMove$: () => Observable<MapBrowserEvent>,
) => void = (
  isClickEventRegistered,
  createHandlePointerMove$,
) => {
  proj4.defs(projectionSystem);

  const [l10n]: UseL10n = useL10n();
  const { Contents, Pages, ProjectConfigPerUser }: T.State = useSelector((state: T.State) => state);
  const authHeader: AuthHeader | undefined = useAuthHeader();
  const { projectUnit } = useSelector((state: T.State) => state.SharedContents);
  const updaterState: T.LocationOverlayUpdaterState = useMemo(() => ({
    lastDebounceTimeout: -1,
    isDebouncing: false,
    debounceTime: 200,
  }), []);
  const {
    projectById,
    projectId,
  } = useSelector((s: T.State) => ({
    projectById: s.Projects.projects.byId,
    projectId: s.Pages.Contents.projectId,
  }));

  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();

  const targetDSMId: T.DSMContent['id'] | undefined = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.DSM);

  const INITIAL_COORDS: number = 0;

  const isLonLat: boolean = projectProjection === T.ProjectionEnum.WGS84_EPSG_4326_LL;
  const coordPrecision: number = isLonLat ? LAT_LON_FIX_FORMAT : Y_X_FIX_FORMAT;


  if (!projectId && !projectUnit) throw new Error(' No Project Id in Pages.Contents.projectId');

  const project: T.Project | null = projectId ? projectById[projectId] : null;
  const unitType: T.ValidUnitType = project ? determineUnitType(project.unit): determineUnitType(projectUnit);

  useLayoutEffect(() => {
    const coordX: HTMLElement | null = document.getElementById('coordX');
    const coordY: HTMLElement | null = document.getElementById('coordY');
    const coordZ: HTMLElement | null = document.getElementById('coordZ');

    if (coordX && coordY && coordZ) {
      if (coordX.textContent === '') coordX.textContent = INITIAL_COORDS.toFixed(coordPrecision);
      if (coordY.textContent === '') coordY.textContent = INITIAL_COORDS.toFixed(coordPrecision);
      if (coordZ.textContent === '' || targetDSMId === undefined) coordZ.textContent = l10n(Text.noDSM);
    }

    const locationOverlayUpdater: T.LocationOverlayUpdater<MapBrowserEvent> = {
      getLonLat: (e) => toLonLat(e.coordinate),
      getProjectCoordinate: (e) => proj4('EPSG:3857', getEPSGfromProjectionLabel(projectProjection)).forward(e.coordinate),
      setCoordXY: (e) => {
        if (!coordX || !coordY) return;

        const [reprojectedX, reprojectedY]: Coordinate = locationOverlayUpdater.getProjectCoordinate(e);

        coordX.textContent = reprojectedX.toFixed(coordPrecision);
        coordY.textContent = reprojectedY.toFixed(coordPrecision);
      },
    };

    const pointerMoveSubscription: Subscription = createHandlePointerMove$()
      .subscribe((e) => {
        locationOverlayUpdater.setCoordXY(e);
      });

    const debounce$: Observable<MapBrowserEvent> = new Observable((subscriber) => {
      const debouncePointerMoveSubscription: Subscription = createHandlePointerMove$().pipe(
        debounceTime(updaterState.debounceTime),
      ).subscribe((e) => subscriber.next(e));

      return () => debouncePointerMoveSubscription.unsubscribe();
    });

    const debounceSubscription: Subscription = debounce$.pipe(
      switchMap((e) => {
        if (!coordZ || targetDSMId === undefined) return [];
        const [lon, lat]: Coordinate = locationOverlayUpdater.getLonLat(e);

        return ajax.get(`https://${volumeServiceHostname}/elev/${targetDSMId}?lon=${lon}&lat=${lat}`, authHeader).pipe(
          map(({ response }): T.ElevationInfo => response),
          map(({ value }) => {
            coordZ.textContent = `${(value * VALUES_PER_METER[unitType]).toFixed(ELEVATION_FIX_FORMAT)} ${UNIT_SYMBOL[unitType]}`;
          }),
          catchError(() => coordZ.textContent = l10n(Text.noDSM)),
        );
      }),
    ).subscribe();

    return () => {
      pointerMoveSubscription.unsubscribe();
      debounceSubscription.unsubscribe();
    };
  }, [isClickEventRegistered, targetDSMId]);
};
