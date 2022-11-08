import { autobind } from 'core-decorators';
import OverlayPositioning from 'ol/OverlayPositioning';
import { Coordinate } from 'ol/coordinate';
import DragPanInteraction from 'ol/interaction/DragPan';
import { fromLonLat } from 'ol/proj';
import React, { Component, ReactNode } from 'react';
import styled, { CSSObject } from 'styled-components';

import OlInteractionBlocker from '^/components/atoms/OlInteractionBlocker';
import OlMapDOMEventHandler from '^/components/atoms/OlMapDOMEventHandler';
import OlMapPointerHandler from '^/components/atoms/OlMapPointerHandler';
import OlOverlay from '^/components/atoms/OlOverlay';
import palette from '^/constants/palette';
import * as T from '^/types';
import IconPinMarkerA from './pinmarkerA.svg';
import IconPinMarkerB from './pinmarkerB.svg';

const Pin = styled.i.attrs({
  className: 'fa fa-thumb-tack',
})({
  fontSize: '18px',

  color: palette.measurements.volume.toString(),

  userSelect: 'none',
  cursor: 'pointer',
});

const PinPointWrapper = styled.div({
  display: 'inline-block',
  width: '40px',
  height: '60px',
  userSelect: 'none',
  cursor: 'pointer',
});

const IconPinMarkerCSS: CSSObject = {
  width: '40px',
  height: '60px',
  position: 'absolute',
  zIndex: -1,
};

const PinMarkers = [
  styled(IconPinMarkerA)(IconPinMarkerCSS),
  styled(IconPinMarkerB)(IconPinMarkerCSS),
];

export interface Props {
  readonly position: Coordinate;
  readonly pinDesign?: 0 | 1;
  // eslint-disable-next-line @typescript-eslint/method-signature-style
  readonly onMouseUp?: (position: Coordinate) => void;
}
export interface State {
  readonly selected: boolean;
  readonly position: Coordinate;
}

/**
 * @author Joon-Mo Yang <clare.angelswing@gmail.com>
 * @desc Overlay for displaying pins for blueprint editing.
 */
class OlPinOverlay extends Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = {
      selected: false,
      position: props.position,
    };
  }

  public componentDidUpdate({
    position: prevPosition,
  }: Props): void {
    const {
      position,
    }: Props = this.props;
    if (prevPosition[0] !== position[0] ||
        prevPosition[1] !== position[1]) {
      this.setState({ position });
    }
  }

  @autobind
  private handleMouseDown(): void {
    this.setState({ selected: true });
  }

  @autobind
  private handlePointerMove(position: T.GeoPoint): void {
    /**
     * @todo If following surely does not occur,
     * It should throw an error.
     */
    /* istanbul ignore if: this doesn't occur */
    if (!this.state.selected) {
      return;
    }
    this.setState({ position });
  }

  @autobind
  private handleMouseUp(): void {
    /* istanbul ignore if: this doesn't occur */
    /**
     * @todo If following surely does not occur,
     * It should throw an error.
     */
    if (!this.state.selected) {
      return;
    }
    this.setState({ selected: false });
    if (this.props.onMouseUp !== undefined) {
      this.props.onMouseUp(fromLonLat(this.state.position));
    }
  }

  public render(): ReactNode {
    const { pinDesign }: Props = this.props;

    let pin: ReactNode = (
      <Pin
        onMouseDown={this.handleMouseDown}
        data-testid='olpinoverlay-pin'
      />
    );

    if (pinDesign !== undefined) {
      const PinPoint = PinMarkers[pinDesign];
      pin = (
        <PinPointWrapper
          onMouseDown={this.handleMouseDown}
          data-testid='olpinoverlay-pin'
        >
          <PinPoint />
        </PinPointWrapper>
      );
    }

    const mouseHandler: ReactNode = !this.state.selected ? undefined : [
      <OlMapPointerHandler key='pointermove' type='pointermove' onEvent={this.handlePointerMove} />,
      <OlMapDOMEventHandler key='mouseup' type='mouseup' onEvent={this.handleMouseUp} />,
      <OlInteractionBlocker key='block' type={DragPanInteraction} />,
    ];

    return (
      <OlOverlay
        position={this.state.position}
        positioning={OverlayPositioning.BOTTOM_CENTER}
        insertFirst={false}
      >
        {pin}
        {mouseHandler}
      </OlOverlay>
    );
  }
}
export default OlPinOverlay;
