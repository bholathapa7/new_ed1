import { ComponentType } from 'react';
import {
  ConnectedComponentClass,
  DispatchProp,
  GetProps,
  Matching,
  Shared,
  connect,
} from 'react-redux';
import { AnyAction } from 'redux';

import * as T from '^/types';

export interface L10nProps {
  readonly language: T.Language;
}

type InjectedProps =
  DispatchProp<AnyAction> & L10nProps;

/**
 * @author Joon-Mo Yang <jmyang@angelswing.io>
 * @desc HOC for transform context to props
 */
function withL10n<C extends ComponentType<Matching<InjectedProps, GetProps<C>>>>(
  Comp: C,
): ConnectedComponentClass<C, Omit<GetProps<C>, keyof Shared<InjectedProps, GetProps<C>>>> {
  /**
   * @author Junyoung Clare Jang <jjc9310@gmail.com>
   * @desc Wrapped component
   */
  return connect((state: Pick<T.State, 'Pages'>) => ({
    language: state.Pages.Common.language,
  }), undefined, undefined, {
    getDisplayName(componentName: string): string {
      return `withL10n(${componentName})`;
    },
  })(Comp);
}
export default withL10n;
