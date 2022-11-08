import { Polygon } from 'ol/geom';
import React, { useMemo, FC } from 'react';
import { useSelector } from 'react-redux';

import HorizontalAreaSVG from '^/assets/icons/contents-list/horizontal-area.svg';
import SurfaceAreaSVG from '^/assets/icons/contents-list/surface-area.svg';
import { ContentsListItem } from '^/components/atoms/ContentsListItem';
import MetricList, { MetricsContainer } from '^/components/molecules/MetricList';
import { createGeometryFromLocations, getImperialMeasurementFromGeometry, getMeasurementFromGeometry } from '^/components/ol/contentTypeSwitch';
import { UseL10n, useL10n } from '^/hooks';
import * as T from '^/types';
import { calculateArea, determineUnitType } from '^/utilities/imperial-unit';
import { getSingleContentId } from '^/utilities/state-util';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import { Fallback } from './fallback';
import Text from './text';

export interface Props {
  readonly content: T.AreaContent;
  readonly isPinned?: boolean;
}

const ContentsListAreaItem: FC<Props> = ({ content, isPinned = false }) => {
  const [l10n]: UseL10n = useL10n();

  const {
    projectId,
    projectById,
  } = useSelector((s: T.State) => ({
    projectById: s.Projects.projects.byId,
    projectId: s.Pages.Contents.projectId,
  }));

  if (projectId === undefined) throw new Error(' No Project Id in Pages.Contents.projectId');

  const unitType: T.ValidUnitType = determineUnitType(projectById[projectId].unit);

  const stringifiedLocations: string = content.info.locations.toString();
  const measurement: string = useMemo(() => {
    const area: Polygon =
      createGeometryFromLocations({ locations: content.info.locations, geometryType: content.type }) as Polygon;

    if (unitType === T.UnitType.IMPERIAL) {
      return getImperialMeasurementFromGeometry({ geometry: area, geometryType: content.type });
    }

    return getMeasurementFromGeometry({ geometry: area, geometryType: content.type });
  }, [stringifiedLocations]);

  const isDsmAvailable: boolean = useSelector((state: T.State) => {
    const dsmId: T.Content['id'] | undefined = getSingleContentId(state.Contents, state.Pages, state.ProjectConfigPerUser, T.ContentType.DSM);
    const dsmContent: T.DSMContent | undefined = dsmId !== undefined ? state.Contents.contents.byId[dsmId] as T.DSMContent : undefined;

    return Boolean(dsmContent?.status);
  });
  const isIn3D: T.ContentsPageState['in3D'] = useSelector((s: T.State) => s.Pages.Contents.in3D);

  const metricValue: string | undefined = useMemo(() => {
    if (!isDsmAvailable) {
      return '-';
    }

    return content.info.surface === undefined
      ? undefined
      : (calculateArea(content.info.surface, unitType)).toFixed(2);
  }, [content.info.surface, isDsmAvailable]);

  return (
    <ContentsListItem
      isPinned={isPinned}
      className={CANCELLABLE_CLASS_NAME}
      content={content}
      firstBalloonTitle={l10n(Text.firstBalloonTitle)}
    >
      <MetricsContainer>
        <MetricList
          type={content.type}
          title={l10n(Text.horizontalArea)}
          tooltip={l10n(Text.horizontalAreaTooltip)}
          icon={<HorizontalAreaSVG />}
          value={measurement}
          isActive={!isIn3D}
          unitType={unitType}
        />
        <MetricList
          type={content.type}
          title={l10n(Text.surfaceArea)}
          tooltip={l10n(Text.surfaceAreaTooltip)}
          icon={<SurfaceAreaSVG />}
          value={metricValue}
          isActive={isIn3D}
          unitType={unitType}
        />
      </MetricsContainer>
    </ContentsListItem>
  );
};

export default withErrorBoundary(ContentsListAreaItem)(Fallback);
