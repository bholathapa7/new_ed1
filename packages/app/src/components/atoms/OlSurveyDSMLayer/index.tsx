import _ from 'lodash-es';
import { Extent } from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import { createXYZ } from 'ol/tilegrid';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import OlLayer from '^/components/atoms/OlLayer';
import { OlEventListenerState } from '^/components/ol/OlMapEventListeners/store/State';
import { GOOGLE_MAPS_MAX_ZOOM } from '^/constants/map-display';
import { UseState } from '^/hooks';
import * as T from '^/types';
import { getExtentFromVolumeContent } from '^/utilities/map-util';

const opacityRatio: number = 100;

const initTileLayer: (param: {
  parameter: string;
  extent: Extent;
  zIndex?: number;
  wmsInfo?: T.APIWMSInfo;
}) => TileLayer = ({
  parameter, extent, zIndex, wmsInfo,
}) =>
  new TileLayer({
    source: new TileWMS({
      url: `${wmsInfo?.url}${parameter}`,
      params: {
        /* eslint-disable quote-props */
        'FORMAT': 'image/png',
        'LAYERS': wmsInfo?.layer,
        'exceptions': 'application/vnd.ogc.se_blank',
        'VERSION': '1.1.1',
        /* eslint-enable quote-props */
      },
      tileGrid: createXYZ({ maxZoom: GOOGLE_MAPS_MAX_ZOOM }),
    }),
    extent,
    zIndex,
  });

export const assignParam: (dsmInfo?: T.DSMInfo) => string = (dsmInfo) => {
  let [minLow, minHigh, maxLow, maxHigh, opacity]: Array<number> = [0, 0, 0, 0, 1];

  if (dsmInfo?.percents.survey) {
    minLow = dsmInfo.percents.survey.maxFill < 0 ?
      (-dsmInfo.percents.survey.maxLow) : 0;
    maxLow = dsmInfo.percents.survey.maxFill < 0 ?
      (-dsmInfo.percents.survey.minLow) : 0;
    minHigh = dsmInfo.percents.survey.minHigh;
    maxHigh = dsmInfo.percents.survey.maxHigh;
    opacity = (dsmInfo.opacity / opacityRatio);
  }

  return `?env=opacity:${opacity};minLow:${minLow};maxLow:${maxLow};minHigh:${minHigh};maxHigh:${maxHigh}`;
};

export interface Props {
  content: T.VolumeContent;
  olEventListenerState: OlEventListenerState;
  zIndex?: number;
}

export const OlSurveyDSMLayer: FC<Props> = ({
  content, zIndex, olEventListenerState,
}) => {
  const dsmInfo: T.DSMInfo | undefined = content.config?.dsm;
  const param: string = assignParam(dsmInfo);
  const wmsInfo: T.APIWMSInfo | undefined = content.info.calculatedVolume?.wmsInfo;
  const { Contents: { requestVolumeCalculation } }: T.State = useSelector((s: T.State) => s);
  const [tile, setTile]: UseState<TileLayer> =
    useState<TileLayer>(initTileLayer({ parameter: param, extent: getExtentFromVolumeContent(content), zIndex, wmsInfo }));
  /* Because useEffect's dependency array uses shallow check,
   * We have to consider when we want to detect object changes.
   * 1. JSON.stringify() <= very simple
   * 2. Custom hook like useDeepEffect()
   */

  useEffect(() => {
    setTile(initTileLayer({ parameter: param, extent: getExtentFromVolumeContent(content), zIndex, wmsInfo }));
  }, [param, JSON.stringify(wmsInfo)]);

  const isNotCurrentContentModifying: boolean =
    (!olEventListenerState.isModifying &&
    !olEventListenerState.isStillVolumeModifying && requestVolumeCalculation[content.id]?.status !== T.APIStatus.PROGRESS)
    || olEventListenerState.currentlyModifiedLayerId !== content.id
  ;

  const tileLayer: ReactNode =
    isNotCurrentContentModifying && Boolean(dsmInfo?.isOn) && wmsInfo ? (
      <OlLayer layer={tile} />
    ) : undefined;

  return <>{tileLayer}</>;
};
