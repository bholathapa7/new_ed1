import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import routes from '^/constants/routes';

import * as T from '^/types';

import AccountCard, { Props } from '^/components/molecules/AccountCard';

type StatePropKeys = 'authedUser';
type DispatchPropKeys = 'toMyPage';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: (
  state: Pick<T.State, 'Auth' | 'Users'>,
) => StateProps = (
  { Auth, Users },
) => ({
  authedUser: (
    Auth.authedUser !== undefined ?
    Users.users.byId[Auth.authedUser.id] as T.FullUser : undefined
  ),
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  toMyPage(): void {
    dispatch(push(routes.project.mypage));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountCard);
