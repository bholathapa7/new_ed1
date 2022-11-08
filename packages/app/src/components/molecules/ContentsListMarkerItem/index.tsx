/* eslint-disable max-lines */
import proj4 from 'proj4';
import React, { FC, ReactNode, memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { ContentsListItem, HorizontalDivider } from '^/components/atoms/ContentsListItem';
import MarkerPinpointer from '^/components/atoms/MarkerPinPointer';
import ContentAttachments from '^/components/molecules/ContentAttachments';
import ContentDescription from '^/components/molecules/ContentDescription';
import { ELEVATION_FIX_FORMAT } from '^/constants/defaultContent';
import dsPalette from '^/constants/ds-palette';
import { FontFamily } from '^/constants/styles';
import {
  UseL10n,
  UseState,
  addMarkerLocationPrecision,
  isLonLat,
  lastSelectedScreenSelector,
  useL10n,
} from '^/hooks';
import { GetAttachments } from '^/store/duck/Attachments';
import { RequestMarkerElevationInfo, SetMarkerPinSelected } from '^/store/duck/Contents';
import * as T from '^/types';
import { defaultCoordinateSystem, getEPSGfromProjectionLabel } from '^/utilities/coordinate-util';
import { determineUnitType, UNIT_SYMBOL, VALUES_PER_METER } from '^/utilities/imperial-unit';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import { Fallback } from './fallback';
import Text from './text';

const Header = styled.div({
  width: '165px',
  height: '48px',

  position: 'relative',

  top: '-11.5px',
  left: '-30px',

  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

const ContentsList = styled.ul({
  width: '100%',
  boxSizing: 'border-box',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const ContentWrapper = styled.li({
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const Key = styled.span({
  fontSize: '12px',
  color: dsPalette.title.toString(),
});

const ElevationWrapper = styled(ContentWrapper)({
  marginBottom: '22px',
});
const Elevation = styled.span<{ readonly isOutdated?: boolean }>(({ isOutdated }) => ({
  fontFamily: FontFamily.ROBOTO,
  fontSize: '13px',
  fontWeight: 500,
  color: isOutdated ? 'transparent' : 'var(--color-theme-primary-lighter)',
}));

const getCoordinateSystem: (param: {
  Projects: T.ProjectsState;
  Pages: T.PagesState;
}) => T.ProjectionEnum = ({
  Projects, Pages,
}) => {
  const projectId: T.Project['id'] | undefined = Pages.Contents.projectId;

  if (projectId === undefined) {
    return defaultCoordinateSystem;
  }

  const coordinateSystem: T.ProjectionEnum | undefined
    = Projects.projects.byId[projectId].coordinateSystem;

  if (coordinateSystem === undefined) {
    return defaultCoordinateSystem;
  }

  return coordinateSystem;
};

export interface Props {
  content: T.MarkerContent;
  isPinned?: boolean;
}

const RawContentsListMarkerItem: FC<Props> = memo(({ content, isPinned = false }) => {
  const dispatch: Dispatch = useDispatch();
  const {
    Attachments: { attachments }, Projects, Pages,
    Pages: { Contents: { editingContentId } },
  }: T.State = useSelector((state: T.State) => state);
  const [l10n]: UseL10n = useL10n();
  const coordinateSystem: T.ProjectionEnum = getCoordinateSystem({ Projects, Pages });

  const [isElevationInfoOutdated, setIsElevationInfoOutdated]: UseState<boolean> = useState<boolean>(true);
  const isLonLatProject: boolean = coordinateSystem === T.ProjectionEnum.WGS84_EPSG_4326_LL;
  const isEditing: boolean = content.id === editingContentId;

  const requestMarkerElevationInfoStatus: T.APIStatus | undefined = useSelector(
    (s: T.State) => s.Contents.requestMarkerElevationInfo[content.id]?.status,
  );

  const {
    projectId,
    projectById,
  } = useSelector((s: T.State) => ({
    projectById: s.Projects.projects.byId,
    projectId: s.Pages.Contents.projectId,
  }));

  if (projectId === undefined) throw new Error(' No Project Id in Pages.Contents.projectId');

  const unitType: T.ValidUnitType = determineUnitType(projectById[projectId].unit);

  const dsmId: T.DSMContent['id'] | undefined = useSelector((s: T.State) => {
    const lastSelectedScreen: T.Screen | undefined = lastSelectedScreenSelector(s);

    if (lastSelectedScreen) {
      return s.Contents.contents.allIds
        .map((c) => s.Contents.contents.byId[c])
        .find((c) => c.screenId === lastSelectedScreen.id && c.type === T.ContentType.DSM)
        ?.id;
    }

    return undefined;
  });

  const locationsWithPreicision: string[] = isLonLat(content.info.location) ?
    addMarkerLocationPrecision(proj4('EPSG:4326', getEPSGfromProjectionLabel(coordinateSystem)).forward(content.info.location), isLonLatProject) :
    addMarkerLocationPrecision(content.info.location, isLonLatProject);

  const locations: string = [locationsWithPreicision[1], locationsWithPreicision[0]].join(', ');

  useEffect(() => {
    if (isEditing) {
      setIsElevationInfoOutdated(true);
      dispatch(RequestMarkerElevationInfo({ contentId: content.id }));
    }
  }, [isEditing]);

  useEffect(() => {
    if (requestMarkerElevationInfoStatus === T.APIStatus.ERROR || requestMarkerElevationInfoStatus === T.APIStatus.SUCCESS) {
      setIsElevationInfoOutdated(false);
    }
  }, [requestMarkerElevationInfoStatus]);

  useEffect(() => {
    const isEditingAndPinNotSelected: boolean = isEditing && !Boolean(content.info.move);
    const isNotEditingAndPinSelected: boolean = !isEditing && Boolean(content.info.move);
    const isAttachmentsLoaded: boolean = attachments.allIds
      .filter((aid) => attachments.byId[aid].contentId === content.id).length === content.attachmentsCount;

    if (isEditing && !isAttachmentsLoaded) {
      dispatch(GetAttachments({ contentId: content.id }));
    }

    if (isEditingAndPinNotSelected) {
      dispatch(SetMarkerPinSelected({ contentId: content.id, move: true }));
    } else if (isNotEditingAndPinSelected) {
      dispatch(SetMarkerPinSelected({ contentId: content.id, move: false }));
    }
  }, [isEditing]);

  const elevation: T.ElevationInfo | undefined = content.info.elevationInfo;
  const elevationInfo: ReactNode = (!elevation || !elevation.value || !dsmId) ? (
    <Elevation>
      {l10n(Text.noDSM)}
    </Elevation>
  ) : (
    <Elevation isOutdated={isElevationInfoOutdated}>
      {(elevation.value * VALUES_PER_METER[unitType]).toFixed(ELEVATION_FIX_FORMAT)} {UNIT_SYMBOL[unitType]}
    </Elevation>
  );

  return (
    <ContentsListItem
      isPinned={isPinned}
      className={CANCELLABLE_CLASS_NAME}
      content={content}
    >
      <Header>
        <MarkerPinpointer
          contentId={content.id}
          location={T.MarkerPinpointerLocation.LEFT_SIDEBAR}
          defaultYX={locations.replace(',', '').split(' ')}
        />
      </Header>
      <HorizontalDivider />
      <ContentsList>
        <ElevationWrapper>
          <Key>{l10n(Text.elevation)}</Key>
          {elevationInfo}
        </ElevationWrapper>
        <ContentDescription content={content} />
        <ContentAttachments content={content} />
      </ContentsList>
    </ContentsListItem>
  );
});

export const ContentsListMarkerItem: FC<Props> = withErrorBoundary(RawContentsListMarkerItem)(Fallback);
