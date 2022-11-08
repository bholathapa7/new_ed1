import { autobind } from 'core-decorators';
import React, { Component, ReactNode } from 'react';

import DOMEventHandler, { Props as DOMProps } from '^/components/atoms/DOMEventHandler';
import olWrap, { OlProps } from '^/components/atoms/OlWrap';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Props extends Omit<DOMProps, 'target'> { }

/**
 * @author Junyoung Clare Jang <clare.angelswing@gmail.com>
 * @desc Event handler for Target of ol map.
 */
class OlMapDOMEventHandler extends Component<OlProps<Props>> {
  private get target(): HTMLElement | null {
    return this.props.map.getTargetElement() as HTMLElement | null;
  }

  public componentDidUpdate(): void {
    this.props.map.on('change:target', this.triggerUpdate);
  }

  @autobind
  private triggerUpdate(): void {
    this.forceUpdate();
  }

  public componentWillUnmount(): void {
    this.props.map.un('change:target', this.triggerUpdate);
  }

  public render(): ReactNode {
    if (this.target !== null) {
      return (
        <DOMEventHandler target={this.target} type={this.props.type} onEvent={this.props.onEvent} />
      );
    } else {
      return null;
    }
  }
}
export default olWrap(OlMapDOMEventHandler);
