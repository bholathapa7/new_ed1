/* eslint-disable max-lines, max-len */
import * as Sentry from '@sentry/browser';
import axios, { AxiosResponse } from 'axios';
import Color from 'color';
import React, { FC, ReactNode, memo, useEffect, useState, useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import ChartLine from '^/components/molecules/ChartLine';
import { ElevationProfileDatePicker } from '^/components/molecules/ElevationProfileDatePicker';
import LengthElevationExportButton from '^/components/molecules/LengthElevationExportButton';
import palette from '^/constants/palette';
import { QueryContentWithId, QueryContentsWithType,
  QueryIDWithTypeAndScreenId, UseL10n, UseState, typeGuardDSMs, typeGuardDesignDXF,
  useGetAllContentsOf, useGetContentIdOf, useGetContentOf, useL10n, usePrevProps,
} from '^/hooks';
import { QueryScreenWithId, UseGetScreenDateAndTitle, useGetScreenDateAndTitle, useGetScreenOf } from '^/hooks/screens';
import { AuthHeader, makeAuthHeader, volumeServiceHostname } from '^/store/duck/API';
import { ChangeAuthedUser } from '^/store/duck/Auth';
import { PatchContent, RequestLengthElevation } from '^/store/duck/Contents';
import * as T from '^/types';
import { isPhone } from '^/utilities/device';
import { determineUnitType, VALUES_PER_METER } from '^/utilities/imperial-unit';
import { useDebouncedEffect } from '^/utilities/react-util';
import LoadingIcon from '../LoadingIcon';
import Text from './text';

type ComparisonInput = T.Screen['id'] | T.DesignDXFContent['id'];
export type ComparisonContentId = T.DSMContent['id'] | T.DesignDXFContent['id'];

const MAX_COMPARISON_COUNT: number = 5;
const LOCAION_UPDATE_DEBOUNCE_TIME: number = 1000;
// eslint-disable-next-line no-magic-numbers
const REQUEST_SUCCESS_STATUS_RANGE: Array<number> = [200, 300];

const Root = styled.div({
  width: '100%',
  margin: '20px 20px 0',
});

const SpinnerWrapper = styled.div({
  width: '100%',
  height: '268px',

  position: 'absolute',
  top: 0,

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  alignSelf: 'center',
  color: palette.white.toString(),
});
const ElevationChartWrapper = styled.div({
  width: '100%',
  height: '100%',
  overflow: 'hidden',
});
const ElevationChartTitleWrapper =
  styled.div({
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  });
const ElevationComparisonTitleWrapper = styled.div({
  paddingLeft: 50,
  marginRight: 'auto',
  position: 'relative',
  display: 'flex',
  zIndex: 250,
});
const ChartWrapper = styled.div<{ isLoading: boolean }>({
  height: '268px',

  marginTop: '10px',
  width: '100%',
}, ({ isLoading }) => ({
  // eslint-disable-next-line no-magic-numbers
  opacity: isLoading ? 0.4 : 1,
}));
const ChartTitle = styled.div({
  paddingTop: '5px',
  paddingLeft: '20px',
  minWidth: 96,

  display: 'flex',
  flexDirection: 'column',

  fontSize: '19px',
  fontWeight: 'bold',
  lineHeight: 2.95,
  whiteSpace: 'pre',

  color: 'var(--color-theme-primary-lighter)',
});

const ElevationChartContentWrapper = styled.div({
  position: 'relative',
});

export interface Props {
  handleUpdateLengthHoverPoint(): void;
}

interface ElevationProfileSelector {
  Auth: T.AuthState;
  PlanConfig: T.PlanConfig;
  projectConfig?: T.ProjectConfig;
  projectId?: T.Project['id'];
  projectById: T.ProjectsState['projects']['byId'];
  editingLengthId?: T.Content['id'];
  sidebarTab: T.ContentPageTabType;
  contentById: T.ContentsState['contents']['byId'];
  requestLengthElevationInfo: T.ContentsState['requestLengthElevationInfo'];
  patchContentStatus: T.ContentsState['patchContentStatus'];
}

const ElevationProfile: FC<Props> = ({ handleUpdateLengthHoverPoint }) => {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();

  const [locations, setLocations]: UseState<Array<T.GeoPoint> | undefined> = useState();

  const prevLocations: Readonly<Array<T.GeoPoint> | undefined> = usePrevProps(locations);

  const {
    Auth,
    PlanConfig,
    projectConfig,
    projectId,
    projectById,
    editingLengthId,
    contentById,
  }: ElevationProfileSelector = useSelector((s: T.State) => ({
    Auth: s.Auth,
    PlanConfig: s.PlanConfig.config,
    projectConfig: s.ProjectConfigPerUser.config,
    projectById: s.Projects.projects.byId,
    projectId: s.Pages.Contents.projectId,
    editingLengthId: s.Pages.Contents.editingContentId,
    contentById: s.Contents.contents.byId,
    sidebarTab: s.Pages.Contents.sidebarTab,
  }), shallowEqual);

  if (projectId === undefined) throw new Error(' No Project Id in Pages.Contents.projectId');
  if (isPhone()) return null;

  const project: T.Project = projectById[projectId];
  const projectProjection: T.ProjectionEnum | undefined = project.coordinateSystem;
  const isLengthElevationExpanded: boolean
    = useSelector((s: T.State) => s.Pages.Contents.mapHorizontalTabStatus === T.MapHorizontalTabStatus.ELEVATION_PROFILE);

  const unitType: T.ValidUnitType = determineUnitType(project.unit);

  const getContentOfId: QueryContentWithId = useGetContentOf(T.ContentsQueryParam.ID);
  const getContentIdOfType: QueryIDWithTypeAndScreenId = useGetContentIdOf(T.ContentsQueryParam.TYPE_AND_SCREENID);
  const getGetAllContentsOf: QueryContentsWithType = useGetAllContentsOf(T.ContentsQueryParam.TYPE);

  const getScreenDateAndTitle: UseGetScreenDateAndTitle = useGetScreenDateAndTitle();
  const getScreenOf: QueryScreenWithId = useGetScreenOf(T.ScreensQueryParam.ID);

  let comparisonContentIds: Array<ComparisonContentId> = [];
  let comparisonTitles: Array<string> = [];
  let comparisonColors: Array<Color> = [];

  let isElevationToggled: T.LengthConfigPerUser['isElevationToggled'] | undefined;
  let editingLengthContent: T.LengthContent | undefined;

  const [prevEditingLengthId, setPrevEditingLengthId]: UseState<T.Content['id'] | undefined> = useState(editingLengthId);
  const [isLoading, setIsLoading]: UseState<boolean> = useState(true);

  const onChartRendered: () => void = () => {
    setIsLoading(false);
  };

  if (editingLengthId !== undefined) {
    editingLengthContent = contentById[editingLengthId] as T.LengthContent;
    isElevationToggled = editingLengthContent.config?.isElevationToggled;
    const isLegacyLengthContent: boolean = editingLengthContent?.info.elevations?.length as number > MAX_COMPARISON_COUNT;
    if (!locations) setLocations(editingLengthContent.info.locations);
    if (editingLengthContent?.info.elevations && isElevationToggled && !isLegacyLengthContent) {
      comparisonContentIds = editingLengthContent.info.elevations.map((elevation) => elevation.comparisonContentId);
      const screenOrDXFIds: Array<T.Screen['id'] | T.DesignDXFContent['id'] | undefined> = comparisonContentIds.map((cid) => {
        const c: T.Content | undefined = getContentOfId(cid);

        return c?.screenId !== undefined ? c.screenId : c?.id;
      });
      comparisonTitles = screenOrDXFIds.map(getTitleFrom);
      comparisonColors = editingLengthContent.info.elevations.map((elevation) => new Color(elevation.comparison.color));
      comparisonColors[0] = editingLengthContent.color;
    }
  }

  useDebouncedEffect(() => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!editingLengthContent || !editingLengthContent.info) return;
    if (editingLengthContent.info.locations.toString() !== locations?.toString()) {
      setLocations(editingLengthContent.info.locations);
    }
  }, LOCAION_UPDATE_DEBOUNCE_TIME);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      try {
        const isEditingContentChanged: boolean = editingLengthId !== prevEditingLengthId;
        if (isEditingContentChanged) {
          setPrevEditingLengthId(editingLengthId);

          return;
        }
        if (!editingLengthContent || !editingLengthContent.info.elevations) return;

        const isLocationOutdated: boolean = prevLocations !== undefined && (locations?.toString() !== prevLocations.toString());

        if (isLocationOutdated) {
          setIsLoading(true);
          const oldElevations: T.LengthContent['info']['elevations'] = editingLengthContent.info.elevations;
          // eslint-disable-next-line @typescript-eslint/promise-function-async
          const updateElevationReuqests: Array<Promise<any>> = oldElevations.map((elevation) => getUpdatedElevation(elevation.comparisonContentId));
          const updatedPoints: Array<Array<T.LengthElevationRawData> | undefined> = await Promise.all(updateElevationReuqests);
          const updatedElevations: T.LengthContent['info']['elevations'] = oldElevations;
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          updatedElevations.map((elevation, i) => elevation.points = updatedPoints[i] || []);

          dispatch(PatchContent({
            content: {
              id: editingLengthContent.id,
              info: {
                ...editingLengthContent.info,
                elevations: updatedElevations,
                locations,
              },
            },
          }));
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        Sentry.captureException(e);
      }
    })();
  }, [locations]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      try {
        if (
          !isElevationToggled || !locations ||
        !editingLengthContent?.info.elevations ||
        !editingLengthContent.info.elevations[0].comparison?.title
        ) return;

        if (projectConfig?.lastSelectedScreenId === undefined) throw new Error('No last selected screenId');

        const currentScreen: T.Screen | undefined = getScreenOf(projectConfig?.lastSelectedScreenId);
        if (currentScreen === undefined) throw new Error('No last selected screenId');

        const dsmId: number | undefined = getContentIdOfType(T.ContentType.DSM, projectConfig?.lastSelectedScreenId);

        const isFirstGraphOutdated: boolean = editingLengthContent.info.elevations[0].comparisonContentId !== dsmId;

        if (isFirstGraphOutdated) {
          setIsLoading(true);
          const oldElevations: T.LengthContent['info']['elevations'] = editingLengthContent.info.elevations;
          const updatedPoint: Array<T.LengthElevationRawData> | undefined = await getUpdatedElevation(dsmId as number);
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          oldElevations[0].points = updatedPoint || [];
          oldElevations[0].comparison.title = getTitleFrom(currentScreen.id);
          oldElevations[0].comparisonContentId = dsmId as T.DSMContent['id'];
          const updatedElevations: T.LengthContent['info']['elevations'] = oldElevations;

          dispatch(PatchContent({
            content: {
              id: editingLengthContent.id,
              info: {
                ...editingLengthContent.info,
                elevations: updatedElevations,
              },
            },
          }));
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        Sentry.captureException(e);
      }
    })();
  }, [editingLengthId]);

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  async function getUpdatedElevation(comparisonContentId: ComparisonContentId): Promise<Array<T.LengthElevationRawData> | undefined> {
    const url: string = `https://${volumeServiceHostname}/elev-prof/${comparisonContentId}`;
    const auth: AuthHeader | undefined = makeAuthHeader(Auth, PlanConfig?.slug);
    if (auth === undefined) dispatch(ChangeAuthedUser({}));

    const isDSM: boolean = contentById[comparisonContentId].type === T.ContentType.DSM;

    const body: {} = {
      wkt: `LINESTRING (${locations!.map(([x, y]) => `${x} ${y}`).join(',')})`,
      profile_type : isDSM ? T.ContentType.DSM : T.ContentType.DESIGN_DXF.split('_')[0],
    };
    // eslint-disable-next-line max-len
    const result: AxiosResponse<any> = await axios.post(url, body, { headers: { Authorization: auth?.Authorization, 'Content-Type': 'application/json' } });
    if (REQUEST_SUCCESS_STATUS_RANGE[0] <= result.status && result.status < REQUEST_SUCCESS_STATUS_RANGE[1]) {
      return result.data.elevations.map(({ lon, lat, dist, alt }: T.LengthElevationData) => [Number(lon), Number(lat), Number(dist), Number(alt)]);
    } else {
      throw new Error(`elev-prof request returned outside range of ${REQUEST_SUCCESS_STATUS_RANGE[0]}~${REQUEST_SUCCESS_STATUS_RANGE[1]}`);
    }
  }
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
  function addComparison(input: ComparisonInput): void {
    const newColor: Color = getColor(comparisonColors.length, input);
    const newTitle: string = getTitleFrom(input);
    const comparisonContentId: ComparisonContentId | undefined = isDesignDXFId(input) ? input : getContentIdOfType(T.ContentType.DSM, input);
    if (comparisonContentId === undefined) throw new Error('Failed to get Comparison content ID');

    setIsLoading(true);
    dispatch(RequestLengthElevation({
      contentId: editingLengthId as T.LengthContent['id'],
      comparisonContentId,
      comparison: { title: newTitle, color: newColor.toString() },
    }));
  }

  function getTitleFrom(input: ComparisonInput): string {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return isDesignDXFId(input) ? ((typeGuardDesignDXF(getContentOfId(input)))?.title || '') : Object.values(getScreenDateAndTitle(input)).join(' ');
  }

  function isDesignDXFId(input: ComparisonInput): boolean {
    const content: T.Content | undefined = getContentOfId(input);

    return content !== undefined && content.type === T.ContentType.DESIGN_DXF;
  }

  function getColor(idx: number, input: ComparisonInput): Color {
    if (shouldBePurpleColored(input)) return palette.ElevationProfile.purple;

    return calculateColorFor(idx);
  }

  function calculateColorFor(idx: number): Color {
    const comparisonColorStrings: Array<string> = comparisonColors.map((color) => color.toString());
    const graphColorSequence: Array<string> = palette.ElevationProfile.graphColors.map((color) => color.toString());
    const prevUsedColorSequenceIdx: number = graphColorSequence.indexOf(comparisonColorStrings[idx - 1]);

    if (prevUsedColorSequenceIdx !== -1) return new Color(graphColorSequence[(prevUsedColorSequenceIdx + 1) % graphColorSequence.length]);
    if (palette.ElevationProfile.purple.toString() === comparisonColorStrings[idx - 1]) {
      const prevPrevUsedColorSequenceIdx: number = graphColorSequence.indexOf(comparisonColorStrings[idx - 2]);
      if (prevPrevUsedColorSequenceIdx === -1) return new Color(graphColorSequence[0]);

      return new Color(graphColorSequence[(prevPrevUsedColorSequenceIdx + 1) % graphColorSequence.length]);
    }

    return new Color(graphColorSequence[0]);
  }

  function deleteComparison(idx: number): void {
    if (!editingLengthId || !editingLengthContent) throw new Error('Failed to delete comparison: no editing content found');
    dispatch(PatchContent({
      content: {
        id: editingLengthId,
        info: {
          ...editingLengthContent.info,
          elevations: editingLengthContent.info.elevations?.filter((_, i) => i !== idx),
        },
      },
    }));
  }

  function shouldBePurpleColored(input: ComparisonInput): boolean {
    return isDesignDXFId(input) && !comparisonColors.map((color) => color.toString()).includes(palette.ElevationProfile.purple.toString());
  }

  function getPickableScreens(): T.Screen[] {
    const dsms: T.DSMContent[] = typeGuardDSMs(getGetAllContentsOf(T.ContentType.DSM));
    const dsmsNotYetUsed: T.DSMContent[] = dsms.filter((d) => !comparisonContentIds.includes(d.id));

    return [...new Set(dsmsNotYetUsed.map((d) => getScreenOf(d.screenId as T.Screen['id']) as T.Screen))];
  }

  const progressSpinner: ReactNode = (
    <SpinnerWrapper>
      <LoadingIcon />
    </SpinnerWrapper>
  );

  const chartData: Array<Array<T.LengthElevationRawData>> = ((
    editingLengthContent !== undefined &&
      editingLengthContent.info.elevations !== undefined &&
      editingLengthContent.info.elevations.length > 0
  ) ? Object.values(editingLengthContent.info.elevations.map((elevation) => elevation.points)) : []).map((data) => data.map(([lon, lat, dist, alt]) => ([
    lon,
    lat,
    dist * VALUES_PER_METER[unitType],
    alt * VALUES_PER_METER[unitType],
  ])));

  const lengthElevationExportButton: ReactNode = chartData.length > 0 ? (
    <LengthElevationExportButton
      editingLengthContent={editingLengthContent}
      comparisonTitles={comparisonTitles}
      comparisonColors={comparisonColors}
      projectProjection={projectProjection}
    />
  ) : undefined;

  const comparisonDatePicker: Array<ReactNode> = (comparisonTitles.length < MAX_COMPARISON_COUNT ?
    [...comparisonTitles, undefined] : comparisonTitles).map((comparisonTitle, idx) => (
    <ElevationProfileDatePicker
      key={idx}
      idx={idx}
      isDesignDXF={isDesignDXFId(comparisonContentIds[idx])}
      title={comparisonTitle}
      color={comparisonColors[idx]}
      pickableScreens={getPickableScreens()}
      calendarType={T.CalendarType.SELECTED_DATE}
      addComparison={addComparison}
      deleteComparison={deleteComparison}
      customCalendarPosition='BOTTOM_RIGHT'
    />),
  );

  const isDesignDXFMap: boolean[] = comparisonContentIds.map(isDesignDXFId);

  const chartWrapper: ReactNode = useMemo(() => {
    if (chartData.length === 0) {
      return progressSpinner;
    }

    return (
      <ChartWrapper isLoading={isLoading}>
        <ChartLine
          isDesignDXFMap={isDesignDXFMap}
          comparisonTitles={comparisonTitles}
          comparisonColors={comparisonColors}
          data={chartData}
          hoverOn={handleUpdateLengthHoverPoint}
          onRendered={onChartRendered}
          unitType={unitType}
        />
      </ChartWrapper>
    );
  }, [chartData, isLoading]);

  const elevationProfile: ReactNode = editingLengthContent && isElevationToggled ? (
    <ElevationChartWrapper>
      <ElevationChartTitleWrapper>
        <ChartTitle>{l10n(Text.elevationProfile)}</ChartTitle>
        <ElevationComparisonTitleWrapper >
          {comparisonDatePicker}
        </ElevationComparisonTitleWrapper>
        {lengthElevationExportButton}
      </ElevationChartTitleWrapper>
      <ElevationChartContentWrapper>
        {isLengthElevationExpanded ? chartWrapper : undefined}
        {isLoading ? progressSpinner : undefined}
      </ElevationChartContentWrapper>
    </ElevationChartWrapper>
  ) : undefined;

  return (<Root>{elevationProfile}</Root>);
};

export default memo(ElevationProfile);

