import OlLayer from '^/components/atoms/OlLayer';
import { makeS3URL } from '^/store/duck/API';
import * as T from '^/types';
import { getExtentAndMaxZoom } from '^/utilities/map-util';
import _ from 'lodash-es';
import OlEvent from 'ol/events/Event';
import ImageLayer from 'ol/layer/Image';
import { get } from 'ol/proj';
import RasterSource from 'ol/source/Raster';
import XYZSource from 'ol/source/XYZ';
import React, { Component, ReactNode } from 'react';
interface OperationData {
  dsmInfo?: T.DSMInfo;
}
/**
 * @desc
 * This function should only use functions in its body, since
 * this function will be executed in other context (by Openlayers).
 */
/* istanbul ignore next:
 * Operation function is almost impossible to test.
 * we should mock ol or detach operation function from component and test it.
 */
const colorizeDSM: (
  pixels: Array<Array<number>>, data: OperationData,
) => Array<number> = (
  pixels, { dsmInfo },
) => {
  const pixel: Array<number> = pixels[0];
  if (dsmInfo === undefined) {
    return pixel;
  }
  const percents: T.DSMPercents = dsmInfo.percents;
  const redChannel: number = 0;
  const greenChannel: number = 1;
  const blueChannel: number = 2;
  const alphaChannel: number = 3;
  const rgbMax: number = 255;
  if (pixel[alphaChannel] !== 0) {
    const numberOfRGBChannels: number = 3;
    const grayscale: number =
      (pixel[redChannel] + pixel[greenChannel] + pixel[blueChannel]) / numberOfRGBChannels;
    const percent: number = interpolate(grayscale, 0, 0, 1, rgbMax);
    if (percent < percents.max && percent > percents.min) {
      const modifiedPercent: number = interpolate(percent, 0, percents.min, rgbMax, percents.max);
      pixel[redChannel] = red(modifiedPercent);
      pixel[greenChannel] = green(modifiedPercent);
      pixel[blueChannel] = blue(modifiedPercent);
      pixel[alphaChannel] = interpolate(dsmInfo.opacity, 0, 0, rgbMax, 1);
    } else {
      pixel[alphaChannel] = 0;
    }
  }

  return pixel;
  /**
   * @author Junyoung Clare Jang
   * @desc Wed Jul 11 20:21:15 2018 UTC
   * project `val` in range `[x0, x1]` to range `[y0, y1]`.
   */
  function interpolate(val: number, y0: number, x0: number, y1: number, x1: number): number {
    return (val - x0) * (y1 - y0) / (x1 - x0) + y0;
  }
  /* eslint-disable no-magic-numbers */
  /**
   * @author Junyoung Clare Jang
   * @desc Wed Jul 11 20:21:15 2018 UTC
   * project `val` to appropriate 8-bit ranged value.
   */
  function base(val: number): number {
    if (val <= 32) {
      return 0;
    } else if (val <= 96) {
      return interpolate(val, 0, 32, 256, 96);
    } else if (val <= 160) {
      return 256;
    } else if (val <= 224) {
      return interpolate(val, 256, 160, 0, 224);
    } else {
      return 0;
    }
  }
  /**
   * @author Junyoung Clare Jang
   * @desc Wed Jul 11 20:21:15 2018 UTC
   */
  function red(gray: number): number {
    return base(gray - 64);
  }
  /**
   * @author Junyoung Clare Jang
   * @desc Wed Jul 11 20:21:15 2018 UTC
   */
  function green(gray: number): number {
    return base(gray);
  }
  /**
   * @author Junyoung Clare Jang
   * @desc Wed Jul 11 20:21:15 2018 UTC
   */
  function blue(gray: number): number {
    return base(gray + 64);
  }
  /* eslint-enable no-magic-numbers */
};
export interface Props {
  readonly content: T.DSMContent;
  readonly dsmInfo?: T.DSMInfo;
  readonly zIndex?: number;
  readonly isShared?: boolean;
}
export interface State {
  readonly layer: ImageLayer;
}
/**
 * @author Junyoung Clare Jang
 * @desc Wed Jul 11 20:21:15 2018 UTC
 */
class OlDSMLayer extends Component<Props, State> {
  private readonly raster: RasterSource;
  public constructor(props: Props) {
    super(props);
    const { extent, maxZoom } = getExtentAndMaxZoom(this.props.content, Boolean(this.props.isShared));
    const source: XYZSource = new XYZSource({
      url: makeS3URL(this.props.content.id, 'tiles', '{z}', '{x}', '{-y}.png'),
      projection: get('EPSG:3857'),
      crossOrigin: 'use-credentials',
      maxZoom,
    });
    this.raster = new RasterSource({
      sources: [source],
    });
    const layer: ImageLayer = new ImageLayer({
      source: this.raster,
      zIndex: this.props.zIndex,
      extent,
    });
    this.state = {
      layer,
    };
  }
  public componentDidMount(): void {
    this.raster.on(
      'beforeoperations',
      /* istanbul ignore next: testing ol is really hard :*/
      (event: OlEvent & { data: OperationData }) => {
        event.data.dsmInfo = this.props.dsmInfo;
        this.raster.changed();
      },
    );
    this.raster.setOperation(colorizeDSM);
  }
  public componentDidUpdate(): void {
    this.raster.changed();
  }

  public render(): ReactNode {
    if (this.props.dsmInfo === undefined) return null;

    return (
      <OlLayer layer={this.state.layer}>
        {this.props.children}
      </OlLayer>
    );
  }
}
export default OlDSMLayer;
