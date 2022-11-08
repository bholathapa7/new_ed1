import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { ResetSignUpAPI } from '^/store/duck/Auth';
import * as T from '^/types';

import SignUpPage, { Props } from '^/components/pages/SignUpPage';

type StatePropsKey = 'signUpStatus' | 'signUpError' | 'isPlanConfigLoaded';
type DispatchPropsKey = 'resetSignUpAPI';
export type OwnProps = Omit<Props, StatePropsKey | DispatchPropsKey>;
export type StateProps = Pick<Props, StatePropsKey>;
export type DispatchProps = Pick<Props, DispatchPropsKey>;

export const mapStateToProps: (
  state: Pick<T.State, 'Auth' | 'PlanConfig'>,
) => StateProps = (
  { Auth, PlanConfig },
) => ({
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  signUpStatus: Auth.signUpStatus || T.APIStatus.IDLE,
  signUpError: Auth.signUpError,
  isPlanConfigLoaded: !!PlanConfig.config,
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  resetSignUpAPI(): void {
    dispatch(ResetSignUpAPI());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SignUpPage);

