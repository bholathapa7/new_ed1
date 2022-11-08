import React, { useEffect, useState } from 'react';

import Geometry from 'ol/geom/Geometry';
import ReactDOMServer from 'react-dom/server';

import { createGeometryFromLocations, getOverlayPositionFromGeometryType, initVectorLayer } from '../contentTypeSwitch';

import VectorSource from 'ol/source/Vector';

import { Feature, Overlay } from 'ol';
import OlMap from 'ol/Map';

import OverlayPositioning from 'ol/OverlayPositioning';

import { OlCustomPropertyNames } from '../constants';

import * as T from '^/types';

import LoadingIcon from '^/components/atoms/LoadingIcon';
import { UseState, usePrevProps, useProjectCoordinateSystem } from '^/hooks';
import { attachLayer } from '^/utilities/ol-layer-util';
import { Coordinate } from 'ol/coordinate';
import { useSelector } from 'react-redux';

import palette from '^/constants/palette';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';

export function useLoadingLayer({
  currentContentTypeFromAnnotationPicker,
  olMap,
  layerGroup,
  coordinatesSentToServer,
  setCoordinatesSentToServer,
}: {
  currentContentTypeFromAnnotationPicker?: NonNullable<T.ContentsPageState['currentContentTypeFromAnnotationPicker']>;
  olMap: OlMap;
  setCoordinatesSentToServer: any;
  coordinatesSentToServer?: Array<Coordinate>;
  layerGroup?: LayerGroup;
}): void {
  const { Contents: { postContentStatus } }: T.State = useSelector((state: T.State) => state);
  const prevContentTypeFromAnnotationPicker: T.ContentsPageState['currentContentTypeFromAnnotationPicker']
    = usePrevProps(currentContentTypeFromAnnotationPicker);
  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();

  const [loadingLayer, setLoadingLayer]: UseState<VectorLayer | undefined> = useState();
  const [loadingOverlay, setLoadingOverlay]: UseState<Overlay | undefined> = useState();
  const [loadingGeometry, setLoadingGeometry]: UseState<Geometry | undefined> = useState();

  const cleanUpFunc: () => void = () => {
    if (loadingOverlay) olMap.removeOverlay(loadingOverlay);
    if (loadingLayer) olMap.removeLayer(loadingLayer);
    setLoadingLayer(undefined);
    setLoadingOverlay(undefined);
    setCoordinatesSentToServer(undefined);
    setLoadingGeometry(undefined);
  };

  useEffect(() => cleanUpFunc, []);

  useEffect(() => {
    /**
     * If it's being requested, show loading
     */
    if (postContentStatus === T.APIStatus.PROGRESS) {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!coordinatesSentToServer || !prevContentTypeFromAnnotationPicker) return;
      const geometry: Geometry = createGeometryFromLocations({
        locations: coordinatesSentToServer,
        geometryType: prevContentTypeFromAnnotationPicker,
        projectProjection,
      });
      setLoadingGeometry(geometry);
      setLoadingLayer(initVectorLayer({
        source: new VectorSource({ features: [new Feature(geometry)] }),
        color: palette.measurements[prevContentTypeFromAnnotationPicker as T.MeasurementContent['type']],
        geometryType: prevContentTypeFromAnnotationPicker,
      }));
    }
    /**
     * Cleanup here. Don't return a function.
     */
    if ([T.APIStatus.SUCCESS, T.APIStatus.ERROR].includes(postContentStatus)) {
      cleanUpFunc();
    }
  }, [coordinatesSentToServer, postContentStatus, prevContentTypeFromAnnotationPicker]);

  useEffect(() => {
    if (!loadingLayer) return;
    const loadingOverlayHTMLElement: HTMLDivElement = document.createElement('div');
    loadingOverlayHTMLElement.innerHTML = (ReactDOMServer.renderToString(<LoadingIcon />));

    setLoadingOverlay(new Overlay({
      element: loadingOverlayHTMLElement,
      positioning: OverlayPositioning.CENTER_CENTER,
      className: `${OlCustomPropertyNames.OL_REALTIME_MEASUREMENT_TOOLTIP_CLASSNAME} ${OlCustomPropertyNames.OL_LOADING_TOOLTIP}`,
    }));
  }, [loadingLayer]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!loadingOverlay || !loadingGeometry || !prevContentTypeFromAnnotationPicker) return;
    loadingOverlay.setPosition(getOverlayPositionFromGeometryType({ geometry: loadingGeometry, geometryType: prevContentTypeFromAnnotationPicker }));

    attachLayer({ map: olMap, layerGroup, layer: loadingLayer });
    olMap.addOverlay(loadingOverlay);
  }, [loadingOverlay, loadingGeometry, prevContentTypeFromAnnotationPicker]);
}
