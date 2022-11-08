import { push } from 'connected-react-router';
import { parse } from 'path-to-regexp';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import * as T from '^/types';

import route from '^/constants/routes';

import FrontTopbar, { Props } from '^/components/molecules/FrontTopbar';

type StatePropsKey = 'isLoginPage' | 'isSignUpPage' | 'isPasswordPage';
type DispatchPropsKey = 'toHomePage' | 'toLoginPage' | 'toSignUpPage';
export type OwnProps = Omit<Props, StatePropsKey | DispatchPropsKey>;
export type StateProps = Pick<Props, StatePropsKey>;
export type DispatchProps = Pick<Props, DispatchPropsKey>;

export const mapStateToProps: (
  state: Pick<T.State, 'router'>,
) => StateProps = (
  { router },
) => {
  const resetPasswordPath: string = String(parse(route.password.reset)[0]);

  return {
    // The root path "/" points to the login page as well.
    isLoginPage: router.location.pathname === route.login.main || router.location.pathname === '/',
    isSignUpPage: router.location.pathname === route.signup.main,
    isPasswordPage:
      router.location.pathname.startsWith(resetPasswordPath) ||
      router.location.pathname === route.password.main,
  };
};

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  toHomePage(): void {
    window.location.href = route.externalLink.homepage;
  },
  toLoginPage(): void {
    dispatch(push(route.login.main));
  },
  toSignUpPage(): void {
    dispatch(push(route.signup.main));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(FrontTopbar);
