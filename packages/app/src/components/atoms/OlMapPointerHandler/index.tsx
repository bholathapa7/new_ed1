import { autobind } from 'core-decorators';
import MapBrowserPointerEvent from 'ol/MapBrowserPointerEvent';
import { Coordinate } from 'ol/coordinate';
import { toLonLat } from 'ol/proj';
import { Component } from 'react';

import olWrap, { OlProps } from '^/components/atoms/OlWrap';

type PointerEventType =
  | 'click'
  | 'dblclick'
  | 'pointerdrag'
  | 'pointermove'
  | 'singleclick'
  ;
export interface Props {
  readonly children?: undefined;
  readonly type: PointerEventType;
  onEvent(position: Coordinate, event: MapBrowserPointerEvent): void;
}

/**
 * Component for attaching handler to ol map
 * Currently, only MapBrowserEvents are supported
 */
class OlMapPointerHandler extends Component<OlProps<Props>> {
  public componentDidMount(): void {
    this.props.map.on(this.props.type, this.handleEvent);
  }

  public componentDidUpdate(prevProps: OlProps<Props>): void {
    if (prevProps.map !== this.props.map ||
        prevProps.type !== this.props.type) {
      prevProps.map.un(prevProps.type, this.handleEvent);
      this.props.map.on(this.props.type, this.handleEvent);
    }
  }

  public componentWillUnmount(): void {
    this.props.map.un(this.props.type, this.handleEvent);
  }

  /* istanbul ignore next: it's hard to mimic ol event */
  @autobind
  private handleEvent(event: MapBrowserPointerEvent): void {
    this.props.onEvent(toLonLat(event.coordinate), event);
  }

  public render(): null {
    return null;
  }
}
export default olWrap(OlMapPointerHandler);
