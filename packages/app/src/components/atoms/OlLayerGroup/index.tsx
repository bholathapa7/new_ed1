import LayerGroup from 'ol/layer/Group';
import React, { Component, ReactNode } from 'react';

import OlLayer from '^/components/atoms/OlLayer';

import { OlLayerGroupProps as OLGP, Provider } from './context';
export { withOlLayerGroup } from './context';
export type OlLayerGroupProps = OLGP;

export interface Props {
  readonly opacity?: number;
  readonly visible?: boolean;
  readonly zIndex?: number;
}

export interface State {
  readonly layerGroup: LayerGroup;
}

/**
 * Wrapper component of a layer group of the openlayers
 */
class OlLayerGroup extends Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      layerGroup: new LayerGroup({
        opacity: props.opacity,
        visible: props.visible,
        zIndex: props.zIndex,
      }),
    };
  }

  public componentDidUpdate({
    opacity: prevOpacity,
    visible: prevVisible,
    zIndex: prevZIndex,
  }: Props): void {
    const {
      opacity,
      visible,
      zIndex,
    }: Props = this.props;
    const layerGroup: LayerGroup = this.state.layerGroup;

    if (opacity !== undefined &&
        prevOpacity !== opacity) {
      layerGroup.setOpacity(opacity);
    }

    if (visible !== undefined &&
        prevVisible !== visible) {
      layerGroup.setVisible(visible);
    }

    if (zIndex !== undefined &&
        prevZIndex !== zIndex) {
      layerGroup.setZIndex(zIndex);
    }
  }

  public render(): ReactNode {
    return (
      <OlLayer layer={this.state.layerGroup}>
        <Provider value={this.state.layerGroup}>
          {this.props.children}
        </Provider>
      </OlLayer>
    );
  }
}
export default OlLayerGroup;
