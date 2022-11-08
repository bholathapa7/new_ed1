import { VectorTile } from 'ol';
import Feature from 'ol/Feature';
import { Extent } from 'ol/extent';
import MVT from 'ol/format/MVT';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileRenderType from 'ol/layer/VectorTileRenderType';
import Projection from 'ol/proj/Projection';
import RenderEvent from 'ol/render/Event';
import VectorTileSource from 'ol/source/VectorTile';
import StyleStyle from 'ol/style/Style';
import React, { Component, ReactNode } from 'react';

import { getFillStyle, getStrokeStyle, getTextStyle } from '^/utilities/ol-dxf-ogr-style-util';
import { LayerActionFunctionParams, attachLayer, detachLayer } from '^/utilities/ol-layer-util';
import { arePropsEqual } from '^/utilities/react-util';

import olWrap, { OlProps } from '^/components/atoms/OlWrap';

const getFeatureStyle: (
  feature: Feature, resolution: number, isSelected?: boolean,
) => StyleStyle = (
  feature, resolution, isSelected,
) => {
  const { OGR_STYLE }: any = feature.getProperties();

  return new StyleStyle({
    text: getTextStyle(resolution, OGR_STYLE),
    stroke: getStrokeStyle(resolution, OGR_STYLE, isSelected),
    fill: getFillStyle(resolution, OGR_STYLE, isSelected),
  });
};
const getVectorFeatureStyle: (feature: Feature, resolution: number) => StyleStyle =
  (f, r) => getFeatureStyle(f, r, false);

const getVectorTileSource: (props: Props) => VectorTileSource = (props) => new VectorTileSource({
  format: new MVT({
    featureClass: Feature,
  } as any),
  url: props.url,
  projection: props.projection,
  tileLoadFunction: props.loadTile,
  maxZoom: props.maxZoom,
  minZoom: props.minZoom,
});
const getVectorTileLayer: (props: Props) => VectorTileLayer = (props) => new VectorTileLayer({
  declutter: true,
  renderMode: VectorTileRenderType.HYBRID,
  source: getVectorTileSource(props),
  extent: props.extent,
  zIndex: props.zIndex,
  opacity: props.opacity,
  style: getVectorFeatureStyle,
});

export interface Props {
  readonly url: string;
  readonly projection: Projection;
  readonly preload: number;
  readonly extent?: Extent;
  readonly revision?: number;
  readonly zIndex?: number;
  readonly opacity?: number;
  readonly maxZoom?: number;
  readonly minZoom?: number;
  loadTile?(tile: VectorTile, src: string): void;
  onPrerender?(event: RenderEvent): void;
  onPostrender?(event: RenderEvent): void;
}

/**
 * Wrapper component of the Openlayers to display detail map
 */
class OlVectorTileLayer extends Component<OlProps<Props>> {
  private readonly vectorTileLayer: VectorTileLayer;

  public constructor(props: OlProps<Props>) {
    super(props);
    this.vectorTileLayer = getVectorTileLayer(props);
  }

  public shouldComponentUpdate(nextProps: Props): boolean {
    return !arePropsEqual(this.props, nextProps);
  }

  public componentDidMount(): void {
    if (this.props.onPrerender !== undefined) {
      this.vectorTileLayer.on('prerender', this.props.onPrerender);
    }
    if (this.props.onPostrender !== undefined) {
      this.vectorTileLayer.on('postrender', this.props.onPostrender);
    }

    const { map, layerGroup }: OlProps<Props> = this.props;
    attachLayer({
      map,
      layerGroup,
      layer: this.vectorTileLayer,
    });
  }

  public componentDidUpdate(prevProps: OlProps<Props>): void {
    if (
      prevProps.url !== this.props.url ||
      prevProps.projection !== this.props.projection ||
      prevProps.revision !== this.props.revision
    ) {
      this.vectorTileLayer.setSource(getVectorTileSource(this.props));
    } else {
      if (prevProps.preload !== this.props.preload) {
        this.vectorTileLayer.setPreload(this.props.preload);
      }
      if (prevProps.opacity !== this.props.opacity && this.props.opacity !== undefined) {
        this.vectorTileLayer.setOpacity(this.props.opacity);
      }

      if (prevProps.zIndex !== this.props.zIndex && this.props.zIndex !== undefined) {
        this.vectorTileLayer.setZIndex(this.props.zIndex);
      }

      if (prevProps.extent !== this.props.extent && this.props.extent !== undefined) {
        this.vectorTileLayer.setExtent(this.props.extent);
      }
    }

    /* istanbul ignore next: it's hard to test onPrerender/onPostrender */
    if (prevProps.onPrerender !== this.props.onPrerender) {
      if (prevProps.onPrerender !== undefined) {
        this.vectorTileLayer.un('prerender', prevProps.onPrerender);
      }
      if (this.props.onPrerender !== undefined) {
        this.vectorTileLayer.on('prerender', this.props.onPrerender);
      }
    }
    /* istanbul ignore next: it's hard to test onPrerender/onPostrender */
    if (prevProps.onPostrender !== this.props.onPostrender) {
      if (prevProps.onPostrender !== undefined) {
        this.vectorTileLayer.un('postrender', prevProps.onPostrender);
      }
      if (this.props.onPostrender !== undefined) {
        this.vectorTileLayer.on('postrender', this.props.onPostrender);
      }
    }

    if (
      prevProps.layerGroup !== this.props.layerGroup ||
      (
        prevProps.layerGroup === undefined &&
        prevProps.map !== this.props.map
      )
    ) {
      const { map, layerGroup }: OlProps<Props> = this.props;
      const options: LayerActionFunctionParams = {
        map,
        layerGroup,
        layer: this.vectorTileLayer,
      };
      detachLayer(options);
      attachLayer(options);
    }
  }

  public componentWillUnmount(): void {
    const { map, layerGroup }: OlProps<Props> = this.props;
    detachLayer({
      map,
      layerGroup,
      layer: this.vectorTileLayer,
    });
  }

  public render(): ReactNode {
    return <></>;
  }
}
export default olWrap(OlVectorTileLayer);
