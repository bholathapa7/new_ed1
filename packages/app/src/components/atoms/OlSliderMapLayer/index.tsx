import { get } from 'ol/proj';
import RenderEvent from 'ol/render/Event';
import React, { FC } from 'react';

import { makeS3URL } from '^/store/duck/API';
import * as T from '^/types';

import OlTileLayer from '^/components/atoms/OlTileLayer';
import { getExtentAndMaxZoom } from '^/utilities/map-util';
import _ from 'lodash-es';
import { Pixel } from 'ol/pixel';
import { getRenderPixel } from 'ol/render';
import { Size } from 'ol/size';
import olWrap from '../OlWrap';

export interface Props {
  readonly mapContent?: T.MapContent;
  readonly zIndex?: number;
  readonly sliderPosition: number;
  readonly isLeft: boolean;
}

export const OlSliderMapLayer: FC<Props> = olWrap(({
  mapContent, zIndex, sliderPosition, isLeft, map, children,
}) => {
  /* istanbul ignore next: can't simulate composing sequence yet */
  function handlePrecompose(event: RenderEvent): void {
    const percent: number = 100;
    const ctx: CanvasRenderingContext2D = event.context;
    const mapSize: Size = map.getSize();
    const width: number = mapSize[0] * (sliderPosition / percent);
    const topLeft: Pixel = getRenderPixel(event, [isLeft ? 0 : width, 0]);
    const topRight: Pixel = getRenderPixel(event, [isLeft ? width : mapSize[0], 0]);
    const bottomRight: Pixel = getRenderPixel(event, isLeft ? [width, mapSize[1]] : mapSize);
    const bottomLeft: Pixel = getRenderPixel(event, [isLeft ? 0 : width, mapSize[1]]);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topLeft[0], topLeft[1]);
    ctx.lineTo(topRight[0], topRight[1]);
    ctx.lineTo(bottomRight[0], bottomRight[1]);
    ctx.lineTo(bottomLeft[0], bottomLeft[1]);
    ctx.closePath();
    ctx.clip();
  }

  /* istanbul ignore next: can't simulate composing sequence yet */
  function handlePostcompose(event: RenderEvent): void {
    const ctx: CanvasRenderingContext2D = event.context;
    ctx.restore();
  }

  const preload: number = 2;

  const { extent, maxZoom } = getExtentAndMaxZoom(mapContent);

  return mapContent ? (
    <OlTileLayer
      url={makeS3URL(mapContent.id, 'tiles', '{z}', '{x}', '{-y}.png')}
      projection={get('EPSG:3857')}
      preload={preload}
      zIndex={zIndex}
      maxZoom={maxZoom}
      onPrerender={handlePrecompose}
      onPostrender={handlePostcompose}
      crossOrigin='use-credentials'
      extent={extent}
    >
      {children}
    </OlTileLayer>
  ) : null;
});
