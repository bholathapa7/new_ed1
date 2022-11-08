import { autobind } from 'core-decorators';
import { Coordinate } from 'ol/coordinate';
import { get, toLonLat } from 'ol/proj';
import React, { Component, ReactNode } from 'react';

import { makeS3URL } from '^/store/duck/API';
import * as T from '^/types';

import OlPinOverlay from '^/components/atoms/OlPinOverlay';
import OlTileLayer from '^/components/atoms/OlTileLayer';
import { defaultBlueprintPDFHeight, defaultBlueprintPDFWidth } from '^/constants/defaultContent';

export interface Props {
  readonly content: T.BlueprintPDFContent;
  updatePoint(imagePoint: [T.GeoPoint, T.GeoPoint]): void;
}
export interface State {
  // The width & height of a Blueprint image
  readonly imageWidth: number;
  readonly imageHeight: number;
}

/**
 * Blueprint tile layer on align popup
 */
class OlBlueprintAlignLayer extends Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    let imageWidth: number = defaultBlueprintPDFWidth;
    let imageHeight: number = defaultBlueprintPDFHeight;

    const { dimension }: T.BlueprintPDFContent['info'] = this.props.content.info;
    if (
      dimension !== undefined &&
      typeof dimension.width === 'number' &&
      typeof dimension.height === 'number'
    ) {
      imageWidth = dimension.width;
      imageHeight = dimension.height;
    }

    this.state = {
      imageWidth,
      imageHeight,
    };
  }

  @autobind
  private handleMouseUp(index: number, position: Coordinate): void {
    const imagePoint: [Coordinate, Coordinate] = [
      [...this.props.content.info.imagePoint[0]],
      [...this.props.content.info.imagePoint[1]],
    ];
    imagePoint[index] = [position[0] / this.state.imageWidth, position[1] / this.state.imageHeight];
    this.props.updatePoint(imagePoint);
  }

  @autobind
  private handleFirstPinMouseUp(position: Coordinate): void {
    this.handleMouseUp(0, position);
  }

  @autobind
  private handleSecondPinMouseUp(position: Coordinate): void {
    this.handleMouseUp(1, position);
  }

  public render(): ReactNode {
    const preload: number = 2;
    const imagePoint: [Coordinate, Coordinate] = this.props.content.info.imagePoint;
    const geoImagePoint: [Coordinate, Coordinate] = [
      toLonLat([
        imagePoint[0][0] * this.state.imageWidth,
        imagePoint[0][1] * this.state.imageHeight,
      ]),
      toLonLat([
        imagePoint[1][0] * this.state.imageWidth,
        imagePoint[1][1] * this.state.imageHeight,
      ]),
    ];

    return (
      <OlTileLayer
        url={makeS3URL(this.props.content.id, 'tiles', '{z}', '{x}', '{-y}.png')}
        extent={[0, 0, this.state.imageWidth, this.state.imageHeight]}
        projection={get('EPSG:3857')}
        preload={preload}
        crossOrigin='use-credentials'
      >
        <OlPinOverlay
          pinDesign={0}
          position={geoImagePoint[0]}
          onMouseUp={this.handleFirstPinMouseUp}
        />
        <OlPinOverlay
          pinDesign={1}
          position={geoImagePoint[1]}
          onMouseUp={this.handleSecondPinMouseUp}
        />
      </OlTileLayer>
    );
  }
}
export default OlBlueprintAlignLayer;
