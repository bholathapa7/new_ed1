import Map from 'ol/Map';
import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';
import { PureComponent, ReactNode } from 'react';

import olWrap, { OlProps } from '^/components/atoms/OlWrap';

const detachLayer: (layer: BaseLayer, map: Map, layerGroup?: LayerGroup) => void = (
  layer, map, layerGroup,
) => {
  if (layerGroup !== undefined) {
    layerGroup.getLayers().remove(layer);
  } else {
    map.removeLayer(layer);
  }
};

const attachLayer: (layer: BaseLayer, map: Map, layerGroup?: LayerGroup) => void = (
  layer, map, layerGroup,
) => {
  if (layerGroup !== undefined) {
    layerGroup.getLayers().push(layer);
  } else {
    map.addLayer(layer);
  }
};

export interface Props {
  readonly layer: BaseLayer;
}

/**
 * @author Junyoung Clare Jang
 * @desc Thu Jul 12 12:43:18 2018 UTC
 */
class OlLayer extends PureComponent<OlProps<Props>> {
  public componentDidMount(): void {
    const {
      layer,
      map,
      layerGroup,
    }: OlProps<Props> = this.props;

    attachLayer(layer, map, layerGroup);
  }

  public componentDidUpdate({
    layer: prevLayer,
    map: prevMap,
    layerGroup: prevLayerGroup,
  }: OlProps<Props>): void {
    const {
      layer,
      map,
      layerGroup,
    }: OlProps<Props> = this.props;

    detachLayer(prevLayer, prevMap, prevLayerGroup);
    attachLayer(layer, map, layerGroup);
  }

  public componentWillUnmount(): void {
    const {
      layer,
      map,
      layerGroup,
    }: OlProps<Props> = this.props;

    detachLayer(layer, map, layerGroup);
  }

  public render(): ReactNode {
    return this.props.children !== undefined ? this.props.children : null;
  }
}
export default olWrap(OlLayer);
