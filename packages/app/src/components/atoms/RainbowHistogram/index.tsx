import _ from 'lodash-es';
import React, { FC, useRef, useEffect } from 'react';
import styled from 'styled-components';


import palette from '^/constants/palette';

import * as T from '^/types';

const drawHistogram: (
  ctx: CanvasRenderingContext2D,
  data: Array<number>,
  percents: T.DSMPercents,
) => void = (
  ctx,
  data,
  { min, max },
) => {
  ctx.fillStyle = palette.textBlack.toString();
  ctx.fillRect(0, 0, histogramWidth, histogramHeight);
  /**
   * @desc
   * Colorful gradient of DSM viewer.
   * For more detail, see
   * https://angelswing.gitbook.io/angelswing-frontend/project-structure/dsm-viewer#frontend-part
   */
  const gradientStart: number = histogramWidth * min;
  const gradientWidth: number = histogramWidth * (max - min);
  const gradientEnd: number = histogramWidth * max;
  const rainbowGradient: CanvasGradient =
    ctx.createLinearGradient(gradientStart, 0, gradientEnd, 0);
  /* eslint-disable no-magic-numbers */
  rainbowGradient.addColorStop(0, 'rgb(0, 0, 128)');
  rainbowGradient.addColorStop(1 / 8, 'rgb(0, 0, 256)');
  rainbowGradient.addColorStop(3 / 8, 'rgb(0, 256, 256)');
  rainbowGradient.addColorStop(5 / 8, 'rgb(256, 256, 0)');
  rainbowGradient.addColorStop(7 / 8, 'rgb(256, 0, 0)');
  rainbowGradient.addColorStop(1, 'rgb(128, 0, 0)');
  /* eslint-enable no-magic-numbers */

  ctx.fillStyle = rainbowGradient;
  ctx.fillRect(gradientStart, 0, gradientWidth, histogramHeight);

  const dataLength: number = data.length;
  const minValue: number = _.min(data) || 0 as number;
  const maxValue: number = _.max(data) || 0 as number;
  const maxHeight: number = maxValue - minValue;

  data.forEach((value, index) => {
    const startX: number = histogramWidth * index / dataLength;
    /**
     * @desc
     * `+ 1` is required because of rounding problem.
     * i.e., because of the problem of floating point division,
     * `histogramWidth * index / dataLength + histogramWidth / dataLength` can be
     * smaller than `histogramWidth * (index + 1) / dataLength`, and
     * then it displays unremoved pixel lines on the histogram.
     */
    const width: number = histogramWidth / dataLength + 1;
    const clearHeight: number = histogramHeight * (maxValue - value) / maxHeight;

    ctx.clearRect(startX, 0, width, clearHeight);
  });
};

const histogramWidth: number = 226;
const histogramHeight: number = 38;

const HistogramCanvas = styled('canvas').attrs({
  width: `${histogramWidth.toString()}px`,
  height: `${histogramHeight.toString()}px`,
})({
  width: `${histogramWidth}px`,
  height: `${histogramHeight}px`,
});

/**
 * @desc There is forwardProps feature in glamorous, but no feature in Styled-components.
 * I will just pass this props as attr. it will be better
 *
 * const HistogramCanvas: GlamorousHTMLComponent<HTMLCanvasElement> =
 *   glamorous('canvas', {
 *     forwardProps: ['width', 'height'],
 *   })({
 *     width: `${histogramWidth}px`,
 *     height: `${histogramHeight}px`,
 *   });
 */

export interface Props {
  readonly data: Array<number>;
  readonly percents: T.DSMPercents;
}

/**
 * @author Junyoung Clare Jang
 * @desc Fri Sep 14 19:00:07 2018 UTC
 */
const RainbowHistogram: FC<Props> = ({
  data, percents,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (canvas === null) {
      return;
    }

    drawHistogram(
      canvas.getContext('2d') as CanvasRenderingContext2D,
      data,
      percents,
    );
  });

  return (
    <HistogramCanvas
      width={`${histogramWidth}px`}
      height={`${histogramHeight}px`}
      ref={canvasRef}
    />
  );
};
export default RainbowHistogram;
