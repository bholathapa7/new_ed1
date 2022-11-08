import { autobind } from 'core-decorators';
import Overlay from 'ol/Overlay';
import OverlayPositioning from 'ol/OverlayPositioning';
import { Coordinate } from 'ol/coordinate';
import { fromLonLat } from 'ol/proj';
import React, { Component, ReactNode } from 'react';

import olWrap, { OlProps } from '^/components/atoms/OlWrap';
import Portal from '^/components/atoms/Portal';

const getContainer: (overlay: Overlay) => HTMLElement | null = (overlay) => {
  const dummy: HTMLElement = document.createElement('div');
  overlay.setElement(dummy);
  const container: HTMLElement | null = dummy.parentElement;
  overlay.setElement(undefined as any);

  return container;
};

export interface Props {
  readonly position: Coordinate;
  readonly positioning: OverlayPositioning;
  readonly stopEvent?: boolean;
  readonly passEvent?: boolean;
  readonly insertFirst?: boolean;
  readonly id?: number;
}
export interface State {
  readonly container: HTMLElement | null;
}

/**
 * @author Joon-Mo Yang <jmyang@angelswing.io>
 * @desc Wrapper component for openlayers overlay
 */
class OlOverlay extends Component<OlProps<Props>, State> {
  private readonly overlay: Overlay;

  public constructor(props: OlProps<Props>) {
    super(props);

    this.state = {
      container: null,
    };
    this.overlay = new Overlay({
      id: props.id,
      position: fromLonLat(props.position),
      positioning: props.positioning,
      stopEvent: props.stopEvent,
      insertFirst: props.insertFirst,
    });
  }

  public componentDidMount(): void {
    this.props.map.addOverlay(this.overlay);
    const container: HTMLElement | null = getContainer(this.overlay);
    this.setState({
      container,
    });
    this.decorateContainer(container);
  }

  public componentDidUpdate({
    position: prevPosition,
    map: prevMap,
  }: OlProps<Props>): void {
    const { position, map }: OlProps<Props> = this.props;
    if (prevPosition[0] !== position[0] ||
        prevPosition[1] !== position[1]) {
      this.overlay.setPosition(fromLonLat(position));
    }

    if (prevMap !== map) {
      prevMap.removeOverlay(this.overlay);
      map.addOverlay(this.overlay);
      const container: HTMLElement | null = getContainer(this.overlay);
      this.setState({
        container,
      });
      this.decorateContainer(container);
    }
  }

  public componentWillUnmount(): void {
    this.props.map.removeOverlay(this.overlay);
  }

  @autobind
  private decorateContainer(container: HTMLElement | null): void {
    if (container !== null && this.props.passEvent) {
      container.style.pointerEvents = 'none';
    }
  }

  public render(): ReactNode {
    /**
     * @author Junyoung Clare Jang
     * @todo Remove following ignore.
     * I don't think the following comment makes sense.
     */
    /* istanbul ignore if: overlay has container in most cases */
    if (this.state.container === null) {
      return null;
    }

    return (
      <Portal node={this.state.container}>
        {this.props.children}
      </Portal>
    );
  }
}
export default olWrap(OlOverlay);
