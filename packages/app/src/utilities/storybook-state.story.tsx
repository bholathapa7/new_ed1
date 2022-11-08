/* istanbul ignore file: it is hard to test storybook */
import React, { Component, ReactNode } from 'react';

export interface Store<S> {
  readonly state: S;
  readonly setState: Component<{}, S>['setState'];
}

export type StatefulRenderFunction<S> = (store: Store<S>) => any;

interface WithStateProps<S> {
  readonly initialState: S;
  readonly children: StatefulRenderFunction<S>;
}
/**
 * @author Junyoung Clare Jang
 * @desc Fri Jul 27 20:50:33 2018 UTC
 */
class WithState<S> extends Component<WithStateProps<S>, S> {
  public constructor(props: WithStateProps<S>) {
    super(props);
    this.state = props.initialState;
  }

  public render(): ReactNode {
    return this.props.children({
      state: this.state,
      setState: this.setState.bind(this),
    });
  }
}

/**
 * @author Junyoung Clare Jang
 * @desc Fri Jul 27 20:50:33 2018 UTC
 * Storybook addon for stateful UI
 */
export function withState<S>(initialState: S): (
  render: StatefulRenderFunction<S>,
) => any {
  return (render) => () => (
    <WithState<S> initialState={initialState}>
      {render}
    </WithState>
  );
}
