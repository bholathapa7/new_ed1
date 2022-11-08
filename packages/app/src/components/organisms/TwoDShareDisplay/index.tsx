import { Coordinate } from 'ol/coordinate';
import React, { Dispatch as LocalDispatch, FC, Fragment, ReactNode, useCallback, useReducer } from 'react';
import styled from 'styled-components';

import OlDesignDXFLayer from '^/components/atoms/OlDesignDXFLayer';
import OlGoogleMapLayer from '^/components/atoms/OlGoogleMapLayer';
import OlLayerGroup from '^/components/atoms/OlLayerGroup';
import { OlMapProvider } from '^/components/atoms/OlMapProvider';
import { OlSurveyDSMLayer } from '^/components/atoms/OlSurveyDSMLayer';
import OlViewProvider from '^/components/atoms/OlViewProvider';
import MapController from '^/components/molecules/MapController';
import OlGeolocationLayer from '^/components/ol/OlGeolocationLayer';
import { OlRegisterMapEventListeners } from '^/components/ol/OlMapEventListeners';
import { Actions } from '^/components/ol/OlMapEventListeners/store/Actions';
import { reducer } from '^/components/ol/OlMapEventListeners/store/Reducer';
import { OlEventListenerState, initialState } from '^/components/ol/OlMapEventListeners/store/State';
import { OlMeasurementLayer } from '^/components/ol/OlMeasurementLayer';
import { OlRasterizedBlueprintCADLayer } from '^/components/ol/OlRasterizedBlueprintCADLayer';
import { LayerGroupZIndex } from '^/constants/zindex';
import OlDSMLayer from '^/containers/atoms/OlDSMLayer';
import OlDetailMapLayer from '^/containers/atoms/OlDetailMapLayer';
import OlBlueprintPDFLayer from '^/containers/organisms/OlBlueprintLayer';
import * as T from '^/types';

const GOOGLE_ZINDEX: number = -1000;

const Root = styled.div({
  width: '100%',
  height: '100%',
});

const MapTarget = styled.div({
  position: 'relative',

  width: '100%',
  height: '100%',
});

export interface Props {
  readonly contents: Array<T.Content>;
  readonly center: Coordinate;
  readonly zoom: number;
  readonly rotation: number;
  onCenterChange(center: [number, number]): void;
  onZoomChange(zoom: number): void;
  onRotationChange(rotation: number): void;
}

/**
 * @author Junyoung Clare Jang
 * @desc Sun Feb  4 10:55:50 2018 UTC
 */
const TwoDShareDisplay: FC<Props> = (props) => {
  const [olEventListenerState, localDispatchRaw]: [OlEventListenerState, LocalDispatch<Actions>] = useReducer(reducer, initialState);

  const layers: {
    [K in T.MeasurementContent['type'] | T.OverLayContent['type'] | T.ContentType.MAP | T.ContentType.DSM]: Array<ReactNode>;
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
  };

  props.contents.forEach((content) => {
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

      default:
    }
  });

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

  const mapAndDSMLayers: Array<ReactNode> = [T.ContentType.DSM, T.ContentType.MAP]
    .map((contentType) => layers[contentType as T.ContentType.MAP | T.ContentType.DSM]);

  const localDispatch: LocalDispatch<Actions> = useCallback(localDispatchRaw, []);

  return (
    <OlViewProvider
      Wrapper={Root}
      center={props.center}
      zoom={props.zoom}
      rotation={props.rotation}
      onRotationChange={props.onRotationChange}
    >
      <OlMapProvider
        MapTarget={MapTarget}
      >
        <OlRegisterMapEventListeners
          olEventListenerState={olEventListenerState}
          localDispatchRaw={localDispatchRaw}
        />
        <OlGeolocationLayer
          position={olEventListenerState.position}
          accuracyGeometry={olEventListenerState.accuracyGeometry}
        />
        {measurementLayers}
        {overlayLayers}
        <OlLayerGroup>
          {mapAndDSMLayers}
        </OlLayerGroup>
        <OlGoogleMapLayer zIndex={GOOGLE_ZINDEX} />
      </OlMapProvider>
      <MapController localDispatch={localDispatch} />
    </OlViewProvider>
  );
};
export default TwoDShareDisplay;
