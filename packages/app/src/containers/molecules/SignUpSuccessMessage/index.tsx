import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { ChangeAuthedUserAfterSignUp } from '^/store/duck/Auth';
import * as T from '^/types';

import SignUpSuccessMessage, { Props } from '^/components/molecules/SignUpSuccessMessage';

type StatePropsKey = never;
type DispatchPropsKey = 'onLogin';
export type OwnProps = Omit<Props, StatePropsKey | DispatchPropsKey>;
export type StateProps = Pick<Props, StatePropsKey>;
export type DispatchProps = Pick<Props, DispatchPropsKey>;

export const mapStateToProps: (
  state: Pick<T.State, never>,
) => StateProps = (
) => ({
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onLogin(): void {
    dispatch(ChangeAuthedUserAfterSignUp());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SignUpSuccessMessage);
