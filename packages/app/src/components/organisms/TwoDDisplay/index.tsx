/* eslint-disable max-lines */
import _ from 'lodash-es';
import React, { memo, Dispatch as LocalDispatch, FC, Fragment, ReactNode, useCallback, useMemo, useReducer, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import * as T from '^/types';

import palette from '^/constants/palette';

import OlDesignDXFBorderLayer from '^/components/atoms/OlDesignDXFBorderLayer';
import OlDesignDXFLayer from '^/components/atoms/OlDesignDXFLayer';
import OlGCPGroupLayer from '^/components/atoms/OlGCPGroupLayer';
import OlGoogleMapLayer from '^/components/atoms/OlGoogleMapLayer';
import OlLayerGroup from '^/components/atoms/OlLayerGroup';
import { OlMapProvider } from '^/components/atoms/OlMapProvider';
import { OlSurveyDSMLayer } from '^/components/atoms/OlSurveyDSMLayer';
import OlViewProvider from '^/components/atoms/OlViewProvider';
import { ComparisonFourDisplay } from '^/components/molecules/ComparisonFourDisplay';
import { ComparisonTwoDisplay } from '^/components/molecules/ComparisonTwoDisplay';
import MapController from '^/components/molecules/MapController';
import OlCreatingGCPGroupLayer from '^/components/molecules/OlCreatingGCPGroupLayer';
import { OlTwoDSlider } from '^/components/molecules/OlTwoDSlider';
import OlGeolocationLayer from '^/components/ol/OlGeolocationLayer';
import OlLengthMovablePointLayer from '^/components/ol/OlLengthMovablePointLayer';
import { OlRegisterMapEventListeners } from '^/components/ol/OlMapEventListeners';
import { Actions } from '^/components/ol/OlMapEventListeners/store/Actions';
import { reducer } from '^/components/ol/OlMapEventListeners/store/Reducer';
import { OlEventListenerState, initialState } from '^/components/ol/OlMapEventListeners/store/State';
import { OlMeasurementLayer } from '^/components/ol/OlMeasurementLayer';
import OlPhotoMarkerInteractionProvider from '^/components/ol/OlPhotoMarkerInteractionProvider';
import { OlPhotoMarkerLayer } from '^/components/ol/OlPhotoMarkerLayer';
import OlPrintLayer from '^/components/ol/OlPrintLayer';
import { OlRasterizedBlueprintCADLayer } from '^/components/ol/OlRasterizedBlueprintCADLayer';
import { OlCustomPropertyNames } from '^/components/ol/constants';
import { defaultMapZoom } from '^/constants/defaultContent';
import { LayerGroupZIndex } from '^/constants/zindex';
import OlDSMLayer from '^/containers/atoms/OlDSMLayer';
import OlDetailMapLayer from '^/containers/atoms/OlDetailMapLayer';
import OlBlueprintPDFLayer from '^/containers/organisms/OlBlueprintLayer';
import { UseState, useGetCurrentScreenContentIds } from '^/hooks';
import { contentsSelector } from '^/store/duck/Contents';
import { ChangeFirstVisitStatus, ChangeRotation, ChangeTwoDDisplayCenter, ChangeTwoDDisplayZoom } from '^/store/duck/Pages/Content';
import { getClosestZoomLevel } from '^/utilities/map-util';
import { arePropsEqual } from '^/utilities/react-util';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { Fallback } from './fallback';
import { selectVolumeCalcPopup } from './selectVolumeCalcPopup';

const FIFTY_PERCENT: number = 50;
const GOOGLE_ZINDEX: number = -1000;


export const Root = styled.div({
  width: '100%',
  height: '100%',
});

const HalfRoot = styled.div({
  position: 'absolute',
  left: '50%',
  width: '50%',
  height: '100%',
});

const FourComparisonRoot = styled(Root)({
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'row',

  '> div:nth-of-type(1)': {
    borderRight: `${palette.white.toString()} 1px solid`,
    borderBottom: `${palette.white.toString()} 1px solid`,
  },
  '> div:nth-of-type(2)': {
    borderBottom: `${palette.white.toString()} 1px solid`,
  },
  '> div:nth-of-type(3)': {
    borderRight: `${palette.white.toString()} 1px solid`,
  },
});

const TwoComparisonRoot = styled(Root)({
  display: 'flex',

  '> div:nth-of-type(1)': {
    borderRight: `${palette.white.toString()} 1px solid`,
  },
});

const NonComparisonMapTarget = styled.div.attrs({
  id: OlCustomPropertyNames.OL_ROOT_DIV,
})({
  position: 'relative',

  touchAction: 'none',

  width: '100%',
  height: '100%',
});

const ComparisonTwoMapTarget = styled.div({
  display: 'inline-block',
  position: 'relative',

  width: 'calc(50% - 0.5px)',
  height: '100%',
});
/**
 * @fixme Fix this naming
 */
interface CFMapTargetProps {
  readonly zIndex: number;
}
const ComparisonFourMapTarget =
  styled.div<CFMapTargetProps>({
    position: 'relative',

    width: 'calc(50% - 0.5px)',
    height: 'calc(50% - 0.5px)',
  }, ({ zIndex }) => ({
    zIndex,
  }));

const SliderWrapper =
  styled.div({
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,

    pointerEvents: 'none',
  });

const DarkBackground = styled.div({
  position: 'absolute',
  top: 0,
  height: '100%',
  width: '100%',
  backgroundColor: palette.toggleButtonGray.toString(),
  zIndex: GOOGLE_ZINDEX,
});


interface OlViolatedVolumeLayerProps {
  readonly content: T.VolumeContent;
  readonly editingContentId?: T.Content['id'];
  readonly creatingVolumeInfo?: T.ContentsPageState['creatingVolumeInfo'];
}

const OlViolatedVolumeLayer: FC<OlViolatedVolumeLayerProps> = ({
  content, editingContentId, creatingVolumeInfo,
}) => {
  if (content.info.calculatedVolume.calculation.type !== T.VolumeCalcMethod.DESIGN) return <></>;
  if (!content.info.isBoundaryViolated || editingContentId !== content.id || creatingVolumeInfo !== undefined) return <></>;

  return (
    <OlDesignDXFBorderLayer
      designDxfId={content.info.calculatedVolume.calculation.designDxfId}
      isBoundaryFilled={false}
      hasError={true}
      hasOutsideBlur={true}
      isViolationPanelShown={true}
      zIndex={LayerGroupZIndex.DESIGN_DXF_ERROR_BOUNDARY}
    />
  );
};

export interface Props {
  readonly mapRedraw?: number;
  readonly hoverLengthLocation?: T.GeoPoint;
}

interface ContentsPageSelector {
  readonly twoDDisplayCenter: T.ContentsPageState['twoDDisplayCenter'];
  readonly twoDDisplayMode: T.ContentsPageState['twoDDisplayMode'];
  readonly twoDDisplayZoom: T.ContentsPageState['twoDDisplayZoom'];
  readonly rotation: T.ContentsPageState['rotation'];
  readonly printingContentId: T.ContentsPageState['printingContentId'];
  readonly isFirstVisit: T.ContentsPageState['isFirstVisit'];
  readonly mapPopup: T.ContentsPageState['mapPopup'];
  readonly popup: T.ContentsPageState['popup'];
  readonly previewingDesignId: T.ContentsPageState['previewingDesignId'];
  readonly projectId: T.ContentsPageState['projectId'];
  readonly editingContentId: T.ContentsPageState['editingContentId'];
  readonly creatingVolumeInfo: T.ContentsPageState['creatingVolumeInfo'];
  readonly sidebarTab: T.ContentsPageState['sidebarTab'];
  readonly isInSourcePhotoUpload: T.ContentsPageState['isInSourcePhotoUpload'];
}

type SliderPosition = [number, number];
/**
 * Component for 2D display (openlayers display)
 */
const RawTwoDDisplay: FC<Props> = ({
  mapRedraw, hoverLengthLocation,
}) => {
  const {
    twoDDisplayCenter,
    twoDDisplayMode,
    twoDDisplayZoom,
    rotation,
    printingContentId,
    isFirstVisit,
    mapPopup,
    popup,
    previewingDesignId,
    projectId,
    editingContentId,
    creatingVolumeInfo,
    sidebarTab,
    isInSourcePhotoUpload,
  }: ContentsPageSelector = useSelector((s: T.State) => ({
    twoDDisplayCenter: s.Pages.Contents.twoDDisplayCenter,
    twoDDisplayMode: s.Pages.Contents.twoDDisplayMode,
    twoDDisplayZoom: s.Pages.Contents.twoDDisplayZoom,
    rotation: s.Pages.Contents.rotation,
    printingContentId: s.Pages.Contents.printingContentId,
    isFirstVisit: s.Pages.Contents.isFirstVisit,
    mapPopup: s.Pages.Contents.mapPopup,
    popup: s.Pages.Contents.popup,
    previewingDesignId: s.Pages.Contents.previewingDesignId,
    projectId: s.Pages.Contents.projectId,
    editingContentId: s.Pages.Contents.editingContentId,
    creatingVolumeInfo: s.Pages.Contents.creatingVolumeInfo,
    sidebarTab: s.Pages.Contents.sidebarTab,
    isInSourcePhotoUpload: s.Pages.Contents.isInSourcePhotoUpload,
  }), shallowEqual);

  const projectConfig: T.ProjectConfig | undefined = useSelector((s: T.State) => s.ProjectConfigPerUser.config);
  const contentAllIds: T.ContentsState['contents']['allIds'] = useSelector((s: T.State) => s.Contents.contents.allIds);
  const contentById: T.ContentsState['contents']['byId'] = useSelector((s: T.State) => s.Contents.contents.byId);
  const photos: Array<T.Photo> = useSelector((s: T.State) => s.Photos.photos);

  const geotaggedPhotos: Array<T.Photo> = photos.filter((photo) => photo.latitude !== null && photo.longitude !== null);

  const [sliderPosition, setSliderPosition]: UseState<SliderPosition> = useState([FIFTY_PERCENT, FIFTY_PERCENT]);
  const [olEventListenerState, localDispatchRaw]: [OlEventListenerState, LocalDispatch<Actions>] = useReducer(reducer, initialState);
  const dispatch: Dispatch = useDispatch();
  const localDispatch: LocalDispatch<Actions> = useCallback(localDispatchRaw, []);

  // No ESS contents in 2D, therefore disabled.
  const currentScreenContentIds: Array<T.Content['id']> = useGetCurrentScreenContentIds({ isESSDisabled: true });

  const selectedContents: Array<T.Content> = useSelector((s: T.State) => currentScreenContentIds
    .filter((id) => {
      if (printingContentId !== undefined) {
        const contentType: T.ContentType = contentById[id].type;

        return (
          contentsSelector.isSelected(s.Contents, s.ProjectConfigPerUser)(id) &&
            contentType !== T.ContentType.BLUEPRINT_PDF &&
            contentType !== T.ContentType.DESIGN_DXF
        );
      }
      if (contentById[id] === undefined) return;

      return !contentsSelector.isProcessingOrFailed(s.Contents)(id) &&
          contentsSelector.isSelected(s.Contents, s.ProjectConfigPerUser)(id);
    })
    .map((id) => contentById[id]));
  const unselectedMaps: Array<T.MapContent> = currentScreenContentIds
    .map((id) => contentById[id])
    .filter(({ id: contentId }) => contentAllIds.includes(contentId))
    .filter<T.MapContent>((item): item is T.MapContent => item.type === T.ContentType.MAP && item.config?.selectedAt === undefined);
  const [popupType, mapPopupType]: [T.ContentPagePopupType | undefined, T.ContentPagePopupOnMapType | undefined] =
    [popup?.type, mapPopup?.type];
  const isMapShown: boolean = Boolean(projectConfig?.isMapShown);

  const onRotationChange: (twoDDisplayRotation: number) => void = useCallback((twoDDisplayRotation) => {
    dispatch(ChangeRotation({ rotation: twoDDisplayRotation }));
  }, []);
  const changeFirstVisit: (firstVisit: boolean, unselectedMap?: T.MapContent) => void = useCallback((firstVisit, unselectedMap) => {
    dispatch(ChangeFirstVisitStatus({ firstVisit }));
    if (unselectedMap?.info.tms !== undefined) {
      const closestZoom: number = getClosestZoomLevel(unselectedMap.info.tms, defaultMapZoom);
      const boundaryForZoom: T.MapBoundary | undefined =
        unselectedMap.info.tms.boundaries[closestZoom];
      const lon: number = _.mean([boundaryForZoom.minLon, boundaryForZoom.maxLon]);
      const lat: number = _.mean([boundaryForZoom.minLat, boundaryForZoom.maxLat]);
      dispatch(ChangeTwoDDisplayCenter({ twoDDisplayCenter: [lon, lat] }));
      dispatch(ChangeTwoDDisplayZoom({ twoDDisplayZoom: defaultMapZoom }));
    }
  }, []);

  const handleSliderPositionChange: (position: SliderPosition) => void = useCallback((position: SliderPosition) => {
    setSliderPosition(position);
  }, []);

  const previewDesignLayer: ReactNode = previewingDesignId !== undefined ? (
    <OlLayerGroup>
      <OlDesignDXFBorderLayer
        designDxfId={previewingDesignId}
        zIndex={LayerGroupZIndex.DESIGN_DXF_BOUNDARY}
        isCameraFit={true}
        hasOutsideBlur={false}
        isBoundaryFilled={true}
      />
    </OlLayerGroup>
  ) : undefined;

  const hasSelectedMaps: boolean = selectedContents.some((content) => content.type === T.ContentType.MAP);
  if (!hasSelectedMaps && isFirstVisit) {
    const unselectedLatestMap: T.MapContent | undefined = unselectedMaps
      .filter((content) => content.config?.selectedAt === undefined)
      .sort((a, b) => a.id - b.id)
      .filter((content) => content.info.tms !== undefined)
      .pop();
    changeFirstVisit(false, unselectedLatestMap);
  }

  const baseMap: ReactNode = useMemo(() => {
    if (isMapShown) return <OlGoogleMapLayer zIndex={GOOGLE_ZINDEX} />;

    return <DarkBackground />;
  }, [isMapShown]);

  const layers: {
    [K in T.MeasurementContent['type'] |
      T.OverLayContent['type'] |
      T.ContentType.MAP |
      T.ContentType.DSM |
      T.ContentType.GCP_GROUP
    ]: Array<ReactNode>;
  } = {
    [T.ContentType.AREA]: [],
    [T.ContentType.LENGTH]: [],
    [T.ContentType.MARKER]: [],
    [T.ContentType.VOLUME]: [],
    [T.ContentType.BLUEPRINT_PDF]: [],
    [T.ContentType.BLUEPRINT_DXF]: [],
    [T.ContentType.BLUEPRINT_DWG]: [],
    [T.ContentType.DESIGN_DXF]: [],
    [T.ContentType.MAP]: [],
    [T.ContentType.DSM]: [],
    [T.ContentType.GCP_GROUP]: [],
  };

  // @desc These lines are for our client's project Solasido (솔라시도)
  // @todo Please remove these after Sholashido's request is done
  // eslint-disable-next-line no-magic-numbers
  const isSolashidoProject: boolean = projectId === 457;
  if (isSolashidoProject && printingContentId === undefined) {
    const solashidoMapId: T.MapContent['id'] = 46293;

    if (contentAllIds.includes(solashidoMapId) && !currentScreenContentIds.includes(solashidoMapId)) {
      selectedContents.push(contentById[solashidoMapId]);
    }
  }

  selectedContents.forEach((content) => {
    switch (content.type) {
      case T.ContentType.AREA:
      case T.ContentType.LENGTH:
      case T.ContentType.MARKER:
        layers[content.type].push(
          <OlMeasurementLayer key={content.id} content={content} />,
        );
        break;

      case T.ContentType.VOLUME:
        /**
         * @todo There are lots of wrong migrated volume data
         * After solving that problem please delete this statement
         */
        if (content.info.calculatedVolume === undefined || content.info.calculatedVolume.calculation === undefined) break;

        layers[content.type].push(
          <Fragment key={content.id}>
            <OlSurveyDSMLayer
              content={content}
              olEventListenerState={olEventListenerState}
              zIndex={LayerGroupZIndex.VOLUME_SURVEY_DSM}
            />
            <OlViolatedVolumeLayer content={content} editingContentId={editingContentId} creatingVolumeInfo={creatingVolumeInfo} />
            <OlMeasurementLayer
              content={content}
            />
          </Fragment>,
        );
        break;

      case T.ContentType.BLUEPRINT_PDF:
        layers[content.type].push(
          <OlBlueprintPDFLayer
            key={content.id}
            content={content}
            zIndex={LayerGroupZIndex.BLUEPRINT}
          />,
        );
        break;

      case T.ContentType.BLUEPRINT_DXF:
      case T.ContentType.BLUEPRINT_DWG:
        layers[content.type].push(
          <OlRasterizedBlueprintCADLayer
            key={content.id}
            contentId={content.id}
            zIndex={LayerGroupZIndex.BLUEPRINT}
          />,
        );
        break;

      case T.ContentType.DESIGN_DXF:
        layers[content.type].push(
          <OlDesignDXFLayer
            key={content.id}
            content={content}
            zIndex={LayerGroupZIndex.DESIGN_DXF}
          />,
        );
        break;

      case T.ContentType.MAP:
        layers[content.type].push(
          <OlDetailMapLayer
            key={content.id}
            content={content}
            zIndex={LayerGroupZIndex.MAP}
          />,
        );
        break;

      case T.ContentType.DSM:
        layers[content.type].push(
          <OlDSMLayer
            key={content.id}
            content={content}
            zIndex={LayerGroupZIndex.DSM}
          />,
        );
        break;

      case T.ContentType.GCP_GROUP:
        layers[content.type].push(
          <OlGCPGroupLayer gcps={content.info.gcps} crs={content.info.crs} />,
        );
        break;

      default:
    }
  });

  const photoMarkerLayers: ReactNode = useMemo(() => {
    const photoLayers: Array<ReactNode> = geotaggedPhotos.map((photo) => (
      <OlPhotoMarkerLayer key={`${OlCustomPropertyNames.PHOTO_FEATURE}_${photo.id}`} photo={photo} />
    ));

    return (<OlLayerGroup>{photoLayers}</OlLayerGroup>);
  }, [geotaggedPhotos]);

  const measurementLayers: Array<ReactNode> = [T.ContentType.VOLUME, T.ContentType.AREA, T.ContentType.LENGTH, T.ContentType.MARKER]
    .map((contentType, index) => (
      <OlLayerGroup key={index}>
        {layers[contentType as T.MeasurementContent['type']]}
      </OlLayerGroup>
    ));

  const overlayLayers: Array<ReactNode> = T.OverlayContentTypes.map((contentType, index) => (
    <OlLayerGroup key={index}>
      {layers[contentType as T.OverLayContent['type']]}
    </OlLayerGroup>
  ));

  const dsmLayer: ReactNode = layers[T.ContentType.DSM];
  const mapLayer: ReactNode = layers[T.ContentType.MAP];

  const gcpGroupLayer: ReactNode = layers[T.ContentType.GCP_GROUP];

  const overlayAndDesignLayers: ReactNode = (
    <>
      {overlayLayers}
      {previewDesignLayer}
    </>
  );
  const printLayers: ReactNode = (<>
    <OlPrintLayer zIndex={LayerGroupZIndex.PRINT} />
    <OlLayerGroup>{mapLayer}</OlLayerGroup>
  </>);

  const isSliderMode: boolean = twoDDisplayMode === T.TwoDDisplayMode.SLIDER;
  const isFourComparisonMode: boolean = twoDDisplayMode === T.TwoDDisplayMode.COMPARISON4;
  const isTwoComparsionMode: boolean = twoDDisplayMode === T.TwoDDisplayMode.COMPARISON2;
  const isComparisonMode: boolean = isTwoComparsionMode || isFourComparisonMode;

  const getWrapperElement = () => {
    const isBlueprintAlignMode: boolean = popupType === T.ContentPagePopupType.BLUEPRINT_ALIGN;
    if (isBlueprintAlignMode) return HalfRoot;
    if (isTwoComparsionMode) return TwoComparisonRoot;
    if (isFourComparisonMode) return FourComparisonRoot;

    return Root;
  };

  const wrapperElement = getWrapperElement();

  const nonComparisonDisplay: ReactNode = (() => {
    if (isComparisonMode || isSliderMode) return null;

    const isPrinting: boolean = printingContentId !== undefined;
    const isOnPhotoTab: boolean = sidebarTab === T.ContentPageTabType.PHOTO;
    const isNormalView: boolean = !isPrinting && !isOnPhotoTab && !isInSourcePhotoUpload;

    const normalLayers: ReactNode = (<>
      <OlRegisterMapEventListeners olEventListenerState={olEventListenerState} localDispatchRaw={localDispatchRaw} />
      <OlLayerGroup>{dsmLayer}</OlLayerGroup>
      <OlLengthMovablePointLayer hoverLocation={hoverLengthLocation} />
      {measurementLayers}
      {selectVolumeCalcPopup(mapPopupType)}
    </>);

    const geolocationLayer: ReactNode =
      (<OlGeolocationLayer
        position={olEventListenerState.position}
        accuracyGeometry={olEventListenerState.accuracyGeometry}
      />);

    /**
     * @memo These conditional statements on JSX are intended for tile reusability.
     * don't make it separate to using `return` on each condition (isPrinting, etc).
     */
    return (<>
      <OlMapProvider MapTarget={NonComparisonMapTarget} redraw={mapRedraw}>
        {isPrinting ? printLayers : null}
        {isOnPhotoTab ? photoMarkerLayers : null}
        {isOnPhotoTab ? <OlPhotoMarkerInteractionProvider /> : null}
        {isNormalView ? normalLayers : null}
        {!isPrinting && !isInSourcePhotoUpload ? geolocationLayer : null}

        {!isOnPhotoTab && !isInSourcePhotoUpload ? overlayAndDesignLayers : null}
        {!isPrinting ? <OlLayerGroup>{mapLayer}</OlLayerGroup> : null}
        {!isPrinting ? baseMap : null}
        {!isPrinting && !isOnPhotoTab ? <OlCreatingGCPGroupLayer /> : null}
        {!isPrinting && !isOnPhotoTab && !isInSourcePhotoUpload ? gcpGroupLayer : null}
      </OlMapProvider>
    </>);
  })();

  const comparisonSliderDisplay: ReactNode = (() => {
    if (!isSliderMode) return null;

    return (
      <OlMapProvider MapTarget={NonComparisonMapTarget} redraw={mapRedraw}>
        <SliderWrapper>
          <OlTwoDSlider
            zIndex={LayerGroupZIndex.SLIDER_MAP}
            sliderPosition={sliderPosition}
            changeSliderPosition={handleSliderPositionChange}
          />
        </SliderWrapper>
        {measurementLayers}
        {baseMap}
        {overlayAndDesignLayers}
        {gcpGroupLayer}
      </OlMapProvider>
    );
  })();

  const comparisonTwoDisplay: ReactNode = (() => {
    if (!isTwoComparsionMode) return null;

    return (
      <ComparisonTwoDisplay MapTarget={ComparisonTwoMapTarget} redraw={mapRedraw}>
        {measurementLayers}
        {baseMap}
        {overlayAndDesignLayers}
        {gcpGroupLayer}
      </ComparisonTwoDisplay>
    );
  })();

  const comparisonFourDisplay: ReactNode = (() => {
    if (!isFourComparisonMode) return null;

    return (
      <ComparisonFourDisplay MapTarget={ComparisonFourMapTarget} redraw={mapRedraw}>
        {measurementLayers}
        {baseMap}
        {overlayAndDesignLayers}
        {gcpGroupLayer}
      </ComparisonFourDisplay>
    );
  })();

  return (
    <OlViewProvider
      Wrapper={wrapperElement}
      center={twoDDisplayCenter}
      zoom={twoDDisplayZoom}
      rotation={rotation}
      onRotationChange={onRotationChange}
    >
      {nonComparisonDisplay}
      {comparisonSliderDisplay}
      {comparisonFourDisplay}
      {comparisonTwoDisplay}
      <MapController localDispatch={localDispatch} />
    </OlViewProvider>
  );
};
export const TwoDDisplay: FC<Props> = memo(withErrorBoundary(RawTwoDDisplay)(Fallback), arePropsEqual);
