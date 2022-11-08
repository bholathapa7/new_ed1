import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { ChangeNewPasswordFormValues } from '^/store/duck/Pages/Front';
import { PatchPassword } from '^/store/duck/Users';
import * as T from '^/types';

import PasswordResetForm, { Props } from '^/components/organisms/PasswordResetForm';

type StatePropsKey = 'formValues' | 'passwordToken' | 'patchPasswordStatus' | 'primaryColor';
type DispatchPropsKey = 'onChange' | 'onSubmit';
export type OwnProps = Omit<Props, StatePropsKey | DispatchPropsKey>;
export type StateProps = Pick<Props, StatePropsKey>;
export type DispatchProps = Pick<Props, DispatchPropsKey>;

export const mapStateToProps: (
  state: Pick<T.State, 'Users' | 'Pages' | 'PlanConfig'>,
) => StateProps = (
  state,
) => ({
  formValues: state.Pages.Front.newPasswordFormValues,
  passwordToken: state.Pages.Front.newPasswordToken,
  patchPasswordStatus: state.Users.patchPasswordStatus,
  primaryColor: state.PlanConfig.config?.primaryColor,
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onChange(formValues: T.NewPasswordFormValues): void {
    dispatch(ChangeNewPasswordFormValues({ newPasswordFormValues: formValues }));
  },
  onSubmit(formValues: T.NewPasswordFormValues, passwordToken: string): void {
    dispatch(PatchPassword({
      token: passwordToken,
      password: formValues.password,
    }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PasswordResetForm);
