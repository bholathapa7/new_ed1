import Map from 'ol/Map';
import { Component, ReactNode } from 'react';

import olWrap, { OlProps } from '^/components/atoms/OlWrap';

const changeInteraction: (map: Map, type: Props['type'], enable: boolean) => void = (
  map, type, enable,
) => {
  map.getInteractions().forEach((interaction) => {
    if (interaction instanceof type) {
      interaction.setActive(enable);
    }
  });
};

export interface Props {
  readonly type: new (...args: Array<never>) => object;
}

/**
 * @author Joon-Mo Yang <jmyang@angelswing.io>
 * @desc Component for blocking openlayers interaction
 */
class OlInteractionBlocker extends Component<OlProps<Props>> {
  public componentDidMount(): void {
    changeInteraction(this.props.map, this.props.type, false);
  }

  public componentDidUpdate({
    map: prevMap,
    type: prevType,
  }: OlProps<Props>): void {
    const {
      map,
      type,
    }: OlProps<Props> = this.props;

    if (prevMap !== map) {
      changeInteraction(prevMap, prevType, true);
      changeInteraction(map, type, false);
    }
  }

  public componentWillUnmount(): void {
    changeInteraction(this.props.map, this.props.type, true);
  }

  public render(): ReactNode {
    return null;
  }
}
export default olWrap(OlInteractionBlocker);
