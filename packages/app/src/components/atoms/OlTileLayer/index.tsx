import Tile from 'ol/Tile';
import { Extent } from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import Projection from 'ol/proj/Projection';
import RenderEvent from 'ol/render/Event';
import XYZSource from 'ol/source/XYZ';
import React, { Component, ReactNode } from 'react';

import OlLayer from '^/components/atoms/OlLayer';

export interface Props {
  readonly url: string;
  readonly projection: Projection;
  readonly preload: number;
  readonly extent?: Extent;
  readonly revision?: number;
  readonly zIndex?: number;
  readonly maxZoom?: number;
  readonly minZoom?: number;
  readonly opacity?: number;
  readonly crossOrigin?: string;
  /* eslint-disable @typescript-eslint/method-signature-style */
  readonly loadTile?: (tile: Tile, src: string) => void;
  readonly onPrerender?: (event: RenderEvent) => void;
  readonly onPostrender?: (event: RenderEvent) => void;
  /* eslint-enable @typescript-eslint/method-signature-style */
}

export interface State {
  readonly layer: TileLayer;
}

/**
 * Wrapper component of the Openlayers to display detail map
 */
class OlTileLayer extends Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      layer: new TileLayer({
        source: new XYZSource({
          url: props.url,
          projection: props.projection,
          tileLoadFunction: props.loadTile,
          minZoom: props.minZoom,
          maxZoom: props.maxZoom,
          /**
           * @desc crossOrigin is essential for screen capture function, because
           * it is heavily related to 'tainted canvas'.
           * For more, see Confluence docs:
           * https://angelswing.atlassian.net/wiki/spaces/PROD/pages/edit-v2/4489243
           */
          crossOrigin: props.crossOrigin,
        }),
        preload: props.preload,
        extent: props.extent,
        zIndex: props.zIndex,
        opacity: props.opacity,
      }),
    };
  }

  public componentDidMount(): void {
    if (this.props.onPrerender !== undefined) {
      this.state.layer.on('prerender', this.props.onPrerender);
    }
    if (this.props.onPostrender !== undefined) {
      this.state.layer.on('postrender', this.props.onPostrender);
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps !== this.props) {
      this.state.layer.changed();
    }

    if (prevProps.opacity !== this.props.opacity && this.props.opacity !== undefined) {
      this.state.layer.setOpacity(this.props.opacity);
    }

    if (prevProps.extent !== this.props.extent) {
      // This is caused by ol typing error
      this.state.layer.setExtent(this.props.extent as Extent);
    }

    if (prevProps.preload !== this.props.preload) {
      this.state.layer.setPreload(this.props.preload);
    }

    if (prevProps.zIndex !== this.props.zIndex && this.props.zIndex !== undefined) {
      this.state.layer.setZIndex(this.props.zIndex);
    }

    if (
      prevProps.url !== this.props.url ||
      prevProps.projection !== this.props.projection ||
      prevProps.loadTile !== this.props.loadTile ||
      prevProps.revision !== this.props.revision
    ) {
      this.state.layer.setSource(new XYZSource({
        url: this.props.url,
        projection: this.props.projection,
        tileLoadFunction: this.props.loadTile,
        maxZoom: this.props.maxZoom,
        minZoom: this.props.minZoom,
        crossOrigin: this.props.crossOrigin,
      }));
    }

    /* istanbul ignore next: it's hard to test onPrerender/onPostrender */
    if (prevProps.onPrerender !== this.props.onPrerender) {
      if (prevProps.onPrerender !== undefined) {
        this.state.layer.un('prerender', prevProps.onPrerender);
      }
      if (this.props.onPrerender !== undefined) {
        this.state.layer.on('prerender', this.props.onPrerender);
      }
    }
    /* istanbul ignore next: it's hard to test onPrerender/onPostrender */
    if (prevProps.onPostrender !== this.props.onPostrender) {
      if (prevProps.onPostrender !== undefined) {
        this.state.layer.un('postrender', prevProps.onPostrender);
      }
      if (this.props.onPostrender !== undefined) {
        this.state.layer.on('postrender', this.props.onPostrender);
      }
    }
  }

  public render(): ReactNode {
    return (
      <OlLayer layer={this.state.layer}>
        {this.props.children}
      </OlLayer>
    );
  }
}
export default OlTileLayer;
