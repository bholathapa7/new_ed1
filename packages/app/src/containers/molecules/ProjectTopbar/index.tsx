import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { ChangeAuthedUser } from '^/store/duck/Auth';

import route from '^/constants/routes';

import ProjectTopbar, { Props } from '^/components/molecules/ProjectTopbar';
import { makeAuthHeader } from '^/store/duck/API';
import * as T from '^/types';

type StatePropsKey = 'authHeader';
type DispatchPropsKey = 'openListTab' | 'openMypage' | 'signout';
export type OwnProps = Omit<Props, StatePropsKey | DispatchPropsKey>;
export type StateProps = Pick<Props, StatePropsKey>;
export type DispatchProps = Pick<Props, DispatchPropsKey>;

export const mapStateToProps: (
  state: Pick<T.State, 'Auth' | 'PlanConfig'>,
) => StateProps = (
  { Auth, PlanConfig },
) => ({
  authHeader: makeAuthHeader(Auth, PlanConfig.config?.slug),
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  openListTab(): void {
    dispatch(push(route.project.main));
  },
  openMypage(): void {
    dispatch(push(route.project.mypage));
  },
  signout(): void {
    dispatch(ChangeAuthedUser({}));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectTopbar);
