import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { ChangePasswordFormValues } from '^/store/duck/Pages/Front';
import { PostPasswordReset, PostPasswordResetBody } from '^/store/duck/Users';
import * as T from '^/types';

import PasswordForm, { Props } from '^/components/organisms/PasswordForm';

type StatePropsKey = 'formValues' | 'resetPasswordStatus' | 'resetPasswordError' | 'primaryColor';
type DispatchPropsKey = 'onChange' | 'onSubmit';
export type OwnProps = Omit<Props, StatePropsKey | DispatchPropsKey>;
export type StateProps = Pick<Props, StatePropsKey>;
export type DispatchProps = Pick<Props, DispatchPropsKey>;

export const mapStateToProps: (
  state: Pick<T.State, 'Users' | 'Pages' | 'PlanConfig'>,
) => StateProps = (
  state,
) => ({
  formValues: state.Pages.Front.passwordFormValues,
  resetPasswordStatus: state.Users.postPasswordResetStatus,
  resetPasswordError: state.Users.postPasswordResetError,
  primaryColor: state.PlanConfig.config?.primaryColor,
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onChange(formValues: T.PasswordFormValues): void {
    dispatch(ChangePasswordFormValues({ passwordFormValues: formValues }));
  },
  onSubmit(formValues: PostPasswordResetBody): void {
    dispatch(PostPasswordReset({ resetPasswordRequestData: formValues }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PasswordForm);
