import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { CancelSignUp } from '^/store/duck/Auth';
import * as T from '^/types';

import SignUpFailureMessage, { Props } from '^/components/molecules/SignUpFailureMessage';

type StatePropsKey = never;
type DispatchPropsKey = 'resetSignUpAPI';
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
  resetSignUpAPI(): void {
    dispatch(CancelSignUp());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SignUpFailureMessage);
