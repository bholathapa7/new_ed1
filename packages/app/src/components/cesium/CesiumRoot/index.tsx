import { Viewer } from 'cesium';
import React, {
  FC, ReactNode, RefObject,
  memo, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import MarkerPinpointer3D from '^/components/atoms/MarkerPinPointer3D';
import { ProgressBar } from '^/components/atoms/ProgressBar';
import { CesiumContext, CesiumContextProps } from '^/components/cesium/CesiumContext';
import MapController from '^/components/molecules/MapController';
import { selectVolumeCalcPopup } from '^/components/organisms/TwoDDisplay/selectVolumeCalcPopup';
import { DRAGGING_LABEL_LAYER, LENGTH_SEGMENTS_LAYER, MARKER_PINPOINTER_ID } from '^/constants/cesium';
import {
  getCurrentScreenContentIds, FindContentById, UseL10n, UseState,
  useAuthHeader, useContentFoundById, useEscapeMeasurement,
  useL10n, usePrevProps, useRole,
} from '^/hooks';
import { AuthHeader } from '^/store/duck/API';
import { contentsSelector } from '^/store/duck/Contents';
import { FinishGetLonLatOn2D3DToggle, GetLonLatOn2D3DToggle } from '^/store/duck/Pages';
import * as T from '^/types';
import { determineUnitType } from '^/utilities/imperial-unit';
import { getSingleContentId } from '^/utilities/state-util';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { IRootBehavior } from '../CesiumBehaviors/root';
import { CesiumContentFactory } from '../CesiumContentFactory';
import { CesiumESSTextEditor } from '../CesiumESSTextEditor';
import { ThreeDOrthoMessage, UpdateMapCenter, calibrateMapCenterForCesium,
  isThreeDOrthoProcessed, useUpdateMapCenter } from '../CesiumHooks';
import { CesiumImageryLayer } from '../CesiumImageryLayer';
import CesiumInteraction from '../CesiumInteraction';
import { Fallback } from './fallback';
import { renderCesium } from './renderCesium';


const OuterRoot = styled.div({
  width: '100%',
  height: '100%',
});
OuterRoot.displayName = 'CesiumOuterRoot';

const InnerRoot = styled.div({
  width: '100%',
  height: '100%',
});
InnerRoot.displayName = 'CesiumInnerRoot';

const CesiumOverlay = styled.div({
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: '0',
  pointerEvents: 'none',
});


export type Props = CesiumContextProps & {
  behavior: IRootBehavior;
  hoverLengthLocation: T.GeoPoint | undefined;
};

const RawCesiumRoot: FC<Props> = ({
  behavior, hoverLengthLocation,
}) => {
  useEscapeMeasurement();

  const [l10n]: UseL10n = useL10n();
  const dispatch: Dispatch = useDispatch();
  const cesiumContainer: RefObject<HTMLDivElement> | null | undefined = useRef(null);
  const findContentById: FindContentById = useContentFoundById();
  const { viewer, setViewer, setInteraction }: CesiumContextProps = useContext(CesiumContext);
  const authHeader: AuthHeader | undefined = useAuthHeader();
  const contentIdsToShow: Array<T.Content['id']> = useSelector((state: T.State) =>
    getCurrentScreenContentIds({ state }).filter((contentId) => !contentsSelector.isProcessingOrFailed(state.Contents)(contentId)),
  );
  const role: T.PermissionRole = useRole();

  const mapPopupType: NonNullable<T.ContentsPageState['mapPopup']>['type'] | undefined
    = useSelector((state: T.State) => state.Pages.Contents.mapPopup?.type);

  const lastThreeDOrthoId: T.ThreeDOrthoContent['id'] | undefined
    = useSelector((state: T.State) => getSingleContentId(state.Contents, state.Pages, state.ProjectConfigPerUser, T.ContentType.THREE_D_ORTHO));

  const twoDDisplayCenter: T.ContentsPageState['twoDDisplayCenter'] = useSelector((state: T.State) => state.Pages.Contents.twoDDisplayCenter);
  const isMapShown: T.ProjectConfig['isMapShown'] = useSelector((state: T.State) => state.ProjectConfigPerUser.config?.isMapShown);
  const twoDDisplayZoom: T.ContentsPageState['twoDDisplayZoom'] = useSelector((state: T.State) => state.Pages.Contents.twoDDisplayZoom);
  const rotation: T.ContentsPageState['rotation'] = useSelector((state: T.State) => state.Pages.Contents.rotation);
  const [numTilesLoaded, setNumTilesLoaded]: UseState<Readonly<number>> = useState(Number.MAX_SAFE_INTEGER);
  const [isFirstLoading, setFirstLoading]: UseState<Readonly<boolean>> = useState(true);
  const lastThreeDOrthoContent: T.ThreeDOrthoContent | undefined = findContentById<T.ThreeDOrthoContent>(lastThreeDOrthoId as number);
  const last3DOrthoDSMId: T.DSMContent['id'] | undefined = lastThreeDOrthoContent?.info.dsm;

  const is3DOrthoSelected: boolean
    = useSelector(({ Contents, ProjectConfigPerUser }: T.State) => contentsSelector.isSelected(Contents, ProjectConfigPerUser)(lastThreeDOrthoId));

  const prevViewer: Viewer | undefined = usePrevProps(viewer);
  const shouldShowLoading: boolean = isFirstLoading && numTilesLoaded > 0;
  const percent: number = behavior.calculateLoadingPercent(numTilesLoaded);
  const contents: ReactNode = useMemo(
    () => {
      if (viewer?.terrainProvider.ready) {
        return contentIdsToShow.map((id) => (
          <CesiumContentFactory
            key={`cesium-content-factory-${id}`}
            contentId={id}
          />
        ));
      }

      return undefined;
    }
    , [contentIdsToShow, viewer?.terrainProvider.ready]);

  const isDrawingMarker: boolean
    = useSelector((state: T.State) => state.Pages.Contents.currentContentTypeFromAnnotationPicker === T.ContentType.MARKER);
  const {
    projectId,
    projectById,
  } = useSelector((s: T.State) => ({
    projectById: s.Projects.projects.byId,
    projectId: s.Pages.Contents.projectId,
  }));

  if (projectId === undefined) throw new Error(' No Project Id in Pages.Contents.projectId');

  const unitType: T.ValidUnitType = determineUnitType(projectById[projectId].unit);

  useEffect(() => {
    if (!viewer) return;

    const interaction: CesiumInteraction = new CesiumInteraction(viewer, role, l10n, unitType);
    setInteraction?.(interaction);

    return () => {
      interaction.destroy();
    };
  }, [viewer, role]);

  const updateMapCenter: UpdateMapCenter = useUpdateMapCenter();
  const handleGetLonLatOn2D3DToggle: () => void = () => dispatch(GetLonLatOn2D3DToggle({}));
  const handleFinishGetLonLatOn2D3DToggle: (error?: T.HTTPError) => void = (error) => dispatch(FinishGetLonLatOn2D3DToggle({ error }));
  const renderCesiumFunc: (isFirstLoad: boolean) => void = (isFirstLoad) =>
    renderCesium({
      cesiumContainer,
      viewer,
      setViewer,
      handleGetLonLatOn2D3DToggle,
      handleFinishGetLonLatOn2D3DToggle,
      updateMapCenter,
      isFirstLoad,
      authHeader,
      dsmId: last3DOrthoDSMId,
      is3DOrthoSelected,
    });

  const calibrateMapCenterForCesiumFunc: () => void = () => {
    calibrateMapCenterForCesium({
      twoDDisplayCenter, twoDDisplayZoom, rotation,
      viewer, lastDSMId: last3DOrthoDSMId, handleGetLonLatOn2D3DToggle, handleFinishGetLonLatOn2D3DToggle,
      authHeader,
    });
  };

  behavior.initCesiumWith(renderCesiumFunc);

  behavior.toggleTerrain(lastThreeDOrthoId);
  behavior.addGoogleMap(isMapShown, prevViewer, renderCesiumFunc, calibrateMapCenterForCesiumFunc);
  behavior.toggleGoogleMap(isMapShown);

  behavior.updateOnDateChange(last3DOrthoDSMId, cesiumContainer);

  behavior.listenTileLoading(numTilesLoaded, setNumTilesLoaded, isFirstLoading);
  behavior.turnOffFirstLoading(isFirstLoading, numTilesLoaded, setFirstLoading);
  behavior.showCompassAfterLoading(shouldShowLoading);
  behavior.measurementCursor(cesiumContainer);
  behavior.elevationProfileHoverPoint(hoverLengthLocation);
  behavior.toggleDesignDXFBorder();

  behavior.hover(cesiumContainer);
  behavior.selectEntity(cesiumContainer);
  behavior.updateEntityPosition();
  behavior.drawInteractibleEntity();
  behavior.updateLocationOverlay();
  behavior.centerOnContent();

  const pinpointer: ReactNode = useMemo(() => isDrawingMarker ? <MarkerPinpointer3D id={MARKER_PINPOINTER_ID} /> : null, [isDrawingMarker]);

  if (!isThreeDOrthoProcessed()) return <ThreeDOrthoMessage />;

  return (
    <OuterRoot>
      <ProgressBar percent={percent} />
      <InnerRoot ref={cesiumContainer} >
        <CesiumImageryLayer />
        {contents}
        <MapController />
      </InnerRoot>
      {pinpointer}
      {selectVolumeCalcPopup(mapPopupType, true)}
      <CesiumOverlay id={LENGTH_SEGMENTS_LAYER} />
      <CesiumOverlay id={DRAGGING_LABEL_LAYER} />
      <CesiumESSTextEditor />
    </OuterRoot>
  );
};

export const CesiumRoot: FC<Props> = withErrorBoundary(memo(RawCesiumRoot))(Fallback);
