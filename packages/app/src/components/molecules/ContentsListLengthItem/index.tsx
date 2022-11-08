import { LineString } from 'ol/geom';
import React, { FC, ReactNode, memo, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled, { CSSObject } from 'styled-components';
import { Cartesian3 } from 'cesium';
import Tippy from '@tippyjs/react';

import HorizontalLengthSVG from '^/assets/icons/contents-list/horizontal-length.svg';
import PointToPointLengthSVG from '^/assets/icons/contents-list/point-to-point-length.svg';
import SurfaceLengthSVG from '^/assets/icons/contents-list/surface-length.svg';
import { ContentsListItem, HorizontalDivider } from '^/components/atoms/ContentsListItem';
import ToggleSlider from '^/components/atoms/ToggleSlider';
import LengthMetricList, { MetricsContainer } from '^/components/molecules/LengthMetricList';
import { createGeometryFromLocations, getImperialMeasurementFromGeometry, getMeasurementFromGeometry } from '^/components/ol/contentTypeSwitch';
import dsPalette from '^/constants/ds-palette';
import { UseL10n, UseLastSelectedScreen, useL10n, useLastSelectedScreen } from '^/hooks';
import { PatchContent, RequestLengthElevation } from '^/store/duck/Contents';
import { ChangeElevationExpansionStatus, ChangeMapHorizontalTabStatus } from '^/store/duck/Pages';
import * as T from '^/types';
import { Formats, formatWithOffset } from '^/utilities/date-format';
import { isPhone } from '^/utilities/device';
import { getSingleContentId } from '^/utilities/state-util';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import { Fallback } from './fallback';
import Text from './text';
import { isAvailablePointToPoint, isContentPointToPoint } from '^/components/cesium/cesium-util';
import { determineUnitType, VALUES_PER_METER } from '^/utilities/imperial-unit';

const Balloon2 = styled.div({
  boxSizing: 'border-box',
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const ElevationText = styled.p({
  fontSize: '12px',
  lineHeight: '17px',
  color: dsPalette.title.toString(),
});

const LengthMetricWrapper = styled.div({
  width: '100%',
  height: '100%',
});

type MetricType = keyof NonNullable<T.LengthContent['info']['metrics']>;

export interface Props {
  content: T.LengthContent;
  isPinned?: boolean;
}

const ContentsListLengthItem: FC<Props> = ({ content, isPinned = false }) => {
  const {
    Contents, Pages, Pages: { Common: { timezoneOffset } }, ProjectConfigPerUser,
    Contents: { contents: { byId: contents } },
  }: T.State = useSelector((state: T.State) => state);

  const {
    projectId,
    projectById,
  } = useSelector((s: T.State) => ({
    projectById: s.Projects.projects.byId,
    projectId: s.Pages.Contents.projectId,
  }));

  if (projectId === undefined) throw new Error(' No Project Id in Pages.Contents.projectId');

  const dispatch: Dispatch = useDispatch();
  const [l10n, language]: UseL10n = useL10n();
  const lastSelectedScreen: UseLastSelectedScreen = useLastSelectedScreen();

  const isEditing: boolean = content.id === Pages.Contents.editingContentId;
  const contentId: T.Content['id'] = content.id;

  // DsmMapContent
  const dsmId: T.Content['id'] | undefined = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.DSM);
  const dsmContent: T.DSMContent | undefined = dsmId !== undefined ? contents[dsmId] as T.DSMContent : undefined;

  const unitType: T.ValidUnitType = determineUnitType(projectById[projectId].unit);

  const isDsmAvailable: boolean = Boolean(dsmContent?.status);
  const isElevationGenerated: boolean = content.info.elevations !== undefined && content.info.elevations.length !== 0;
  const isElevationToggled: boolean = Boolean(content.config?.isElevationToggled);
  const isIn3D: T.ContentsPageState['in3D'] = useSelector((s: T.State) => s.Pages.Contents.in3D);

  useEffect(() => {
    if (!isElevationGenerated && isElevationToggled) {
      dispatch(PatchContent({ content: { id: content.id, config: { isElevationToggled: false } } }));
    }
  }, [isDsmAvailable, isEditing]);

  const handleToggle: () => void = () => {
    if (dsmId === undefined) return;

    const isElevationToggledAfterClick: boolean = !isElevationToggled;

    if (isElevationToggledAfterClick && !isElevationGenerated) {
      generateElevation(dsmId);
    }

    if (isElevationToggledAfterClick) {
      dispatch(ChangeMapHorizontalTabStatus({ status: T.MapHorizontalTabStatus.ELEVATION_PROFILE }));
      dispatch(ChangeElevationExpansionStatus({ open: true }));
    }

    dispatch(PatchContent({ content: { id: content.id, config: { isElevationToggled: isElevationToggledAfterClick } } }));
  };

  const generateElevation: (dsmContentId: number) => void = (id) => {
    dispatch(ChangeElevationExpansionStatus({ previousOpen: true, open: true }));
    dispatch(RequestLengthElevation({
      contentId,
      comparisonContentId: id,
      comparison: {
        title: lastSelectedScreen?.appearAt !== undefined ?
          formatWithOffset(timezoneOffset, lastSelectedScreen?.appearAt, Formats.YYYYMMDD) : '',
        color: content.color.toString(),
      },
    }));
  };

  const getMetricContent: (type: MetricType) => string | undefined = useCallback((type) => {
    const metrics: T.LengthContent['info']['metrics'] = content.info.metrics;
    if (!isDsmAvailable) return '-';

    return metrics === undefined ? undefined : (metrics[type] * VALUES_PER_METER[unitType]).toFixed(2);
  }, [content.info.metrics, isDsmAvailable]);

  const elevationToggleButton: ReactNode = isDsmAvailable ? (
    <>
      <ElevationText>
        {l10n(Text.elevation)}
      </ElevationText>
      <ToggleSlider
        onClick={handleToggle}
        enabled={isElevationToggled}
      />
    </>
  ) : (
    <ElevationText>
      {l10n(Text.noDsmElevation)}
    </ElevationText>
  );

  // TODO: There was a bug with the tooltip wrapperhoverable,
  // where it would get into the sidebar and clipped due to overflow: hidden;
  // This positions the tooltip exactly where it needs to be.
  // It only needs this hack on english language where the text are longer.
  // Please update this if the text gets updated...
  const getTooltipCustomStyle: (type: 'horizontal' | 'pointToPoint' | MetricType) => CSSObject = useCallback((type) => language === T.Language.KO_KR
    ? {}
    : type === 'pointToPoint'
      ? { width: '180px', transform: 'translate(-66%, 3px)' }
      : { width: '180px' }, [language]);

  const stringifiedLocations: string = content.info.locations.toString();
  const stringifiedMetrics: string | undefined = content.info.metrics?.toString();
  const measurement: string = useMemo(() => {
    const length: LineString =
      createGeometryFromLocations({ locations: content.info.locations, geometryType: content.type }) as LineString;

    if (unitType === T.UnitType.IMPERIAL) {
      return getImperialMeasurementFromGeometry({ geometry: length, geometryType: content.type });
    }

    return getMeasurementFromGeometry({ geometry: length, geometryType: content.type });
  }, [stringifiedLocations]);
  const pointToPoint: string | undefined = useMemo(() => {
    if (isAvailablePointToPoint(content.info.locations)) {
      const positions: Cartesian3[] = content.info.locations
        .map((location) => Cartesian3.fromDegrees(location[0], location[1], location[2]));

      let total: number = 0;
      positions.forEach((position, index) => {
        const nextIdx = index + 1;
        if (nextIdx < positions.length) {
          total += Cartesian3.distance(position, positions[nextIdx]);
        }
      });

      total *= VALUES_PER_METER[unitType];

      return String(total.toFixed(2));
    }

    return getMetricContent('pointToPoint');
  }, [stringifiedLocations, stringifiedMetrics]);

  const balloon2: ReactNode = isPhone() ? undefined : (
    <>
      <HorizontalDivider />
      <Balloon2>
        {elevationToggleButton}
      </Balloon2>
    </>
  );

  const onChangeDistanceType = (type: T.DistanceType) => () => {
    dispatch(PatchContent({
      content: {
        id: contentId,
        config: {
          distanceType: type,
        },
      },
    }));
  };

  const isSurface: boolean = isIn3D && (content.config?.distanceType === T.DistanceType.SURFACE || !isAvailablePointToPoint(content.info.locations));
  const isPointToPoint: boolean = isIn3D && !isSurface && isContentPointToPoint(content);

  const isSelectAvailablePointToPoint: boolean = isIn3D && isAvailablePointToPoint(content.info.locations);

  return (
    <ContentsListItem
      isPinned={isPinned}
      className={CANCELLABLE_CLASS_NAME}
      content={content}
      firstBalloonTitle={l10n(Text.firstBalloonTitle)}
    >
      <MetricsContainer>
        <Tippy offset={T.TIPPY_OFFSET} theme='angelsw' placement='right' arrow={false} content={l10n(Text.twoDDisabled)} disabled={!isIn3D}>
          <LengthMetricWrapper>
            <LengthMetricList
              type={content.type}
              title={l10n(Text.horizontalLength)}
              tooltip={l10n(Text.horizontalLengthTooltip)}
              icon={<HorizontalLengthSVG />}
              value={measurement}
              isActive={!isIn3D}
              isSelectDisabled={isIn3D}
              tooltipCustomStyle={getTooltipCustomStyle('horizontal')}
              onClick={onChangeDistanceType(T.DistanceType.HORIZONTAL)}
              unitType={unitType}
            />
          </LengthMetricWrapper>
        </Tippy>
        <Tippy offset={T.TIPPY_OFFSET} theme='angelsw' placement='right' arrow={false} content={l10n(Text.threeDDisabled)} disabled={isIn3D}>
          <LengthMetricWrapper>
            <LengthMetricList
              type={content.type}
              title={l10n(Text.surfaceLength)}
              tooltip={l10n(Text.surfaceLengthTooltip)}
              icon={<SurfaceLengthSVG />}
              value={getMetricContent('surface')}
              isActive={isSurface}
              isSelectDisabled={!isIn3D}
              tooltipCustomStyle={getTooltipCustomStyle('surface')}
              onClick={onChangeDistanceType(T.DistanceType.SURFACE)}
              unitType={unitType}
            />
          </LengthMetricWrapper>
        </Tippy>
        <Tippy offset={T.TIPPY_OFFSET} theme='angelsw' placement='right' arrow={false} content={l10n(Text.threeDDisabled)} disabled={isIn3D}>
          <LengthMetricWrapper>
            <LengthMetricList
              type={content.type}
              title={l10n(Text.pointToPointLength)}
              tooltip={l10n(Text.pointToPointLengthTooltip)}
              icon={<PointToPointLengthSVG />}
              value={pointToPoint}
              isActive={isPointToPoint}
              isSelectDisabled={!isSelectAvailablePointToPoint}
              tooltipCustomStyle={getTooltipCustomStyle('pointToPoint')}
              onClick={onChangeDistanceType(T.DistanceType.POINT_TO_POINT)}
              unitType={unitType}
            />
          </LengthMetricWrapper>
        </Tippy>
      </MetricsContainer>
      {balloon2}
    </ContentsListItem >
  );
};

export default memo(withErrorBoundary(ContentsListLengthItem)(Fallback));

