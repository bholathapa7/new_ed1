import { autobind } from 'core-decorators';
import _ from 'lodash-es';
import { get } from 'ol/proj';
import React, { Component, ReactNode } from 'react';

import { getCenterBoundary, getExtentAndMaxZoom } from '^/utilities/map-util';

import { defaultMapZoom } from '^/constants/defaultContent';

import { makeS3URL } from '^/store/duck/API';
import * as T from '^/types';

import OlTileLayer from '^/components/atoms/OlTileLayer';

export interface Props {
  readonly content: T.MapContent;
  readonly zoom: number;
  readonly zIndex?: number;
  readonly isShared?: boolean;
  readonly isFirstVisit?: boolean;
  readonly opacity?: number;
  changeCenter(position: T.GeoPoint): void;
  changeZoom(zoom: number): void;
  changeFirstVisit(firstVisit: boolean): void;
}

/**
 * Wrapper component of the Openlayers to display detail map
 */
class OlDetailMapLayer extends Component<Props> {
  public componentDidUpdate({ content: { config } }: Props): void {
    if (config?.selectedAt?.getTime() !== this.props.content.config?.selectedAt?.getTime()) this.changeCenterAndZoom(this.props.content.info);
  }

  public componentDidMount(): void {
    const { isFirstVisit, content }: Props = this.props;
    if (isFirstVisit) {
      this.changeCenterAndZoom(content.info);
      this.props.changeFirstVisit(false);
    }
  }

  @autobind
  private changeCenterAndZoom(info: T.MapContent['info']): void {
    if (info.tms === undefined) {
      return;
    }
    this.props.changeZoom(defaultMapZoom);

    const boundaryForZoom: T.MapBoundary | undefined = info.tms.boundaries[defaultMapZoom];

    if (boundaryForZoom === undefined) {
      /** @todo add error popup for no-boundary-map */
      return;
    }

    const centerLocation: T.GeoPoint = getCenterBoundary(boundaryForZoom);
    this.props.changeCenter(centerLocation);
  }

  public render(): ReactNode {
    const preload: number = 2;
    const url: string = makeS3URL(this.props.content.id, 'tiles', '{z}', '{x}', '{-y}.png');
    const { extent, maxZoom } = getExtentAndMaxZoom(this.props.content, Boolean(this.props.isShared));
    const tileOpacity: number = this.props.opacity !== undefined ?
      // eslint-disable-next-line no-magic-numbers
      (this.props.opacity / 100) : 1;

    return (
      <OlTileLayer
        url={url}
        projection={get('EPSG:3857')}
        preload={preload}
        zIndex={this.props.zIndex}
        maxZoom={maxZoom}
        opacity={tileOpacity}
        crossOrigin='use-credentials'
        extent={extent}
      >
        {this.props.children}
      </OlTileLayer>
    );
  }
}
export default OlDetailMapLayer;
