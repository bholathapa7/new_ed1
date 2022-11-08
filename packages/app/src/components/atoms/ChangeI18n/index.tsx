import { ComponentType } from 'react';
import {
  ConnectedComponentClass,
  GetProps,
  Matching,
  Shared,
  connect,
} from 'react-redux';

import { ChangeLanguage } from '^/store/duck/Pages/Common';
import * as T from '^/types';

export interface ChangeI18nProps {
  changeLanguage(language: T.Language): void;
}

/**
 * @author Junyoung Clare Jang
 * @desc Tue Jan 30 21:34:22 2018 UTC
 * HOC for changing language
 */
function changeI18n<C extends ComponentType<Matching<ChangeI18nProps, GetProps<C>>>>(
  Comp: C,
): ConnectedComponentClass<C, Omit<GetProps<C>, keyof Shared<ChangeI18nProps, GetProps<C>>>> {
  /**
   * @author Junyoung Clare Jang
   * @desc Tue Jan 30 21:34:22 2018 UTC
   * Wrapped component without changeLanguage props.
   */
  return connect(undefined, (dispatch) => ({
    changeLanguage(language: T.Language): void {
      dispatch(ChangeLanguage({ language }));
    },
  }), undefined, {
    getDisplayName(componentName: string): string {
      return `changeI18(${componentName})`;
    },
  })(Comp);
}
export default changeI18n;
