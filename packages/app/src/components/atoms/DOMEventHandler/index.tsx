import _ from 'lodash-es';
import { Component } from 'react';

const addListener: (props: Props) => void = (
  { target, type, onEvent },
) => {
  target.addEventListener(type, onEvent);
};

const removeListener: (props: Props) => void = (
  { target, type, onEvent },
) => {
  target.removeEventListener(type, onEvent);
};

export interface Props {
  readonly target: Element;
  readonly type: string;
  onEvent(event: Event): void;
}

/**
 * @author Junyoung Clare Jang <clare.angelswing@gmail.com>
 * @desc Event handler for non-react (or not accesible) DOM element.
 */
class DOMEventHandler extends Component<Props> {
  public componentDidMount(): void {
    addListener(this.props);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (!_.isEqual(prevProps, this.props)) {
      removeListener(prevProps);
      addListener(this.props);
    }
  }

  public componentWillUnmount(): void {
    removeListener(this.props);
  }

  public render(): null {
    return null;
  }
}
export default DOMEventHandler;
