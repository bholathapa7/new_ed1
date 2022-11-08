import route from '^/constants/routes';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { SignUp } from '^/store/duck/Auth';
import * as T from '^/types';

import SignUpForm, { Props } from '^/components/organisms/SignUpForm';

type StatePropsKey = 'signUpStatus' | 'signUpError' | 'primaryColor' | 'companyName';
type DispatchPropsKey = 'onSubmit';
export type OwnProps = Omit<Props, StatePropsKey | DispatchPropsKey>;
export type StateProps = Pick<Props, StatePropsKey>;
export type DispatchProps = Pick<Props, DispatchPropsKey>;

export const mapStateToProps: (
  state: Pick<T.State, 'Auth' | 'PlanConfig'>,
) => StateProps = (
  state,
) => ({
  signUpError: state.Auth.signUpError,
  signUpStatus: state.Auth.signUpStatus,
  primaryColor: state.PlanConfig.config?.primaryColor,
  companyName: state.PlanConfig.config?.companyName,
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onSubmit(formValues: T.SignUpFormValues): void {
    dispatch(SignUp({ user: formValues }));
    dispatch(push(route.signup.request));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SignUpForm);
