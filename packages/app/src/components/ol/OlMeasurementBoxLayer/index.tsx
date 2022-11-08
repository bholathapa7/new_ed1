import OlMeasurementBox from '^/components/atoms/OlMeasurementBox';
import { ELEVATION_FIX_FORMAT } from '^/constants/defaultContent';
import route from '^/constants/routes';
import { UseL10n, addMarkerLocationPrecision, isLonLat, useL10n, usePrevProps, useRouteIsMatching } from '^/hooks';
import { useLatLongYXLabel } from '^/hooks/useLongLatXYLabel';
import { useProjectCoordinateSystem } from '^/hooks/useProjectCoordinateSystem';
import * as T from '^/types';
import { LocationLabel, getEPSGfromProjectionLabel } from '^/utilities/coordinate-util';
import OlMap from 'ol/Map';
import { Geometry } from 'ol/geom';
import { toLonLat } from 'ol/proj';
import React, { FC, NamedExoticComponent, memo, useCallback, useEffect } from 'react';
import {
  createGeometryFromLocations,
  getImperialMeasurementFromGeometry,
  getMeasurementFromGeometry,
  getOverlayPositionFromGeometryType,
} from '../contentTypeSwitch';

import proj4 from 'proj4';
import areDeepEqual from 'react-fast-compare';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { OlEventListenerState } from '../OlMapEventListeners/store/State';
import { OlCustomPropertyNames } from '../constants';
import Text from './Text';
import { determineUnitType, VALUES_PER_METER } from '^/utilities/imperial-unit';


const OlMeasurementBoxWrapper = styled.div({});


export interface Props {
  readonly olEventListenerState: OlEventListenerState;
  readonly olMap: OlMap;
}

const UnoptimizedOlMeasurementBox: FC<Props> = ({
  olEventListenerState: { isModifying, currentlyHoveredLayerId, currentlyModifiedLayerId, isTranslating },
  olMap,
}) => {
  const { projectUnit } = useSelector((state: T.State) => state.SharedContents);
  const {
    projectById,
    projectId,
  } = useSelector((s: T.State) => ({
    projectById: s.Projects.projects.byId,
    projectId: s.Pages.Contents.projectId,
  }));

  if (!projectId && !projectUnit) throw new Error(' No Project Id in Pages.Contents.projectId');

  const project: T.Project | null = projectId ? projectById[projectId] : null;
  const unitType: T.ValidUnitType = project ? determineUnitType(project.unit): determineUnitType(projectUnit);

  const { Contents: { contents: { byId } } }: T.State = useSelector((s: T.State) => s);
  const isOnSharePage: boolean = useRouteIsMatching(route.share.main);

  const prevModifying: boolean | undefined = usePrevProps(isModifying);

  const [l10n]: UseL10n = useL10n();
  const coordinateSystem: T.ProjectionEnum =
    isOnSharePage ? useSelector((state: T.State) => state.SharedContents.projection) : useProjectCoordinateSystem();
  const [yLabel, xLabel]: LocationLabel = useLatLongYXLabel({ proj: coordinateSystem });

  const modifiedMeasurementContent: T.MeasurementContent | null =
    currentlyModifiedLayerId === undefined ? null : byId[currentlyModifiedLayerId] as T.MeasurementContent;
  const hoveredMeasurementContent: T.MeasurementContent | null =
    currentlyHoveredLayerId === undefined ? null : byId[currentlyHoveredLayerId] as T.MeasurementContent;

  const targetContent: T.MeasurementContent | null | undefined = modifiedMeasurementContent || hoveredMeasurementContent;

  const geometry: Geometry | null = targetContent ? createGeometryFromLocations({
    geometryType: targetContent.type,
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    locations: (targetContent as T.LengthAreaVolumeContent).info.locations || [
      (targetContent as T.MarkerContent).info.location],
    projectProjection: coordinateSystem,
  }) : null;

  const prevModifiedContent: T.MeasurementContent | null | undefined = usePrevProps(modifiedMeasurementContent);

  const isLengthWaitingForPatchContent: boolean =
    modifiedMeasurementContent?.type === T.ContentType.LENGTH &&
    prevModifying === true && modifiedMeasurementContent?.id === prevModifiedContent?.id &&
    areDeepEqual((prevModifiedContent as T.LengthContent)?.info.locations, (prevModifiedContent as T.LengthContent)?.info.locations);

  const handleMeasurementBoxMouseEnter: () => void = useCallback(() => {
    olMap.set(OlCustomPropertyNames.SHOULD_KEEP_OL_MEASUREMENT_BOX_ON, true);
  }, []);
  const handleMeasurementBoxMouseLeave: () => void = useCallback(() => {
    olMap.set(OlCustomPropertyNames.SHOULD_KEEP_OL_MEASUREMENT_BOX_ON, false);
  }, []);

  useEffect(() => handleMeasurementBoxMouseLeave, []);

  if (geometry === null || targetContent === null || isModifying || isTranslating || isLengthWaitingForPatchContent) return null;

  if (targetContent.type === T.ContentType.MARKER) {
    const elevation: T.ElevationInfo | undefined = targetContent.info.elevationInfo;
    const elevationToShow: string = (!elevation || !elevation.value) ?
      l10n(Text.noDSM) :
      (elevation.value * VALUES_PER_METER[unitType]).toFixed(ELEVATION_FIX_FORMAT);

    const isLonLatProject: boolean = coordinateSystem === T.ProjectionEnum.WGS84_EPSG_4326_LL;
    const locationsWithPreicision: string[] = isLonLat(targetContent.info.location) ?
      addMarkerLocationPrecision(proj4('EPSG:4326', getEPSGfromProjectionLabel(coordinateSystem))
        .forward(targetContent.info.location), isLonLatProject) :
      addMarkerLocationPrecision(targetContent.info.location, isLonLatProject);

    const coordinates: string = [locationsWithPreicision[1], locationsWithPreicision[0]].join(', ');

    return (
      <OlMeasurementBoxWrapper
        onMouseEnter={handleMeasurementBoxMouseEnter}
        onMouseLeave={handleMeasurementBoxMouseLeave}
      >
        <OlMeasurementBox
          content={targetContent}
          measurement={{ Elev: elevationToShow, 고도: elevationToShow, [`${yLabel}, ${xLabel}`] : coordinates }}
          position={toLonLat(getOverlayPositionFromGeometryType({ geometry, geometryType: targetContent.type }))}
        />
      </OlMeasurementBoxWrapper>
    );
  }

  return (
    <OlMeasurementBoxWrapper
      onMouseEnter={handleMeasurementBoxMouseEnter}
      onMouseLeave={handleMeasurementBoxMouseLeave}
    >
      <OlMeasurementBox
        content={targetContent}
        measurement={(unitType === T.UnitType.IMPERIAL) ? (
          getImperialMeasurementFromGeometry({ geometry, geometryType: targetContent.type })
        ) : (
          getMeasurementFromGeometry({ geometry, geometryType: targetContent.type })
        )}
        position={toLonLat(getOverlayPositionFromGeometryType({ geometry, geometryType: targetContent.type }))}
      />
    </OlMeasurementBoxWrapper>
  );
};

type SelectedOlEventListenerStateKeys = 'isModifying' | 'currentlyHoveredLayerId' | 'currentlyModifiedLayerId' | 'isTranslating';

export const OlMeasurementBoxLayer: NamedExoticComponent<Props> = memo(
  UnoptimizedOlMeasurementBox,
  (
    { olEventListenerState: prevOlEventListenerState },
    { olEventListenerState }
  ) => ['isModifying', 'currentlyHoveredLayerId', 'currentlyModifiedLayerId', 'isTranslating']
    .every((key: SelectedOlEventListenerStateKeys) => prevOlEventListenerState[key] === olEventListenerState[key])
);
