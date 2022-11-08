import _ from 'lodash-es';
import React, { Component, ReactNode } from 'react';

export interface Props {
  delay: number;
  children: ReactNode;
}
interface State {
  visible: boolean;
}

/**
 * Class for self-destructing component after a delay of some time.
 * Useful when you want to unmount a component after a few seconds, etc.
 */
export default class Expire extends Component<Props, State> {
  private _timer: number | null;

  public constructor(props: Props) {
    super(props);
    this.state = { visible: true };
    this._timer = null;
  }

  private setTimer(): void {
    // Clear any existing timer
    if (this._timer !== null) {
      clearTimeout(this._timer);
    }

    // Hide after `delay` milliseconds
    this._timer = window.setTimeout(() => {
      this.setState({ visible: false });
      this._timer = null;
    }, this.props.delay);
  }

  public componentWillReceiveProps(nextProps: Props, prevState: State): void {
    // Reset the timer if children are changed
    if (nextProps.children !== this.props.children) {
      this.setTimer();
      this.setState({ visible: !prevState.visible });
    }
  }

  public componentDidMount(): void {
    this.setTimer();
  }

  public componentWillUnmount(): void {
    if (this._timer) {
      clearTimeout(this._timer);
    }
  }

  public render(): ReactNode {
    return this.state.visible
      ? <div>{this.props.children}</div>
      : null;
  }
}
