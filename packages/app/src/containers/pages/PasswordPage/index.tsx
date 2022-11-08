import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { ChangePasswordFormValues } from '^/store/duck/Pages/Front';
import { CancelPostPasswordReset } from '^/store/duck/Users';
import * as T from '^/types';

import PasswordPage, { Props } from '^/components/pages/PasswordPage';

type StatePropsKey = 'passwordResetStatus' | 'passwordResetError' | 'needsCustomization' | 'isPlanConfigLoaded';
type DispatchPropsKey = 'resetEmail' | 'resetPasswordResetStatus';
export type OwnProps = Omit<Props, StatePropsKey | DispatchPropsKey>;
export type StateProps = Pick<Props, StatePropsKey>;
export type DispatchProps = Pick<Props, DispatchPropsKey>;

export const mapStateToProps: (
  state: Pick<T.State, 'Users' | 'PlanConfig'>,
) => StateProps = (
  state,
) => ({
  passwordResetError: state.Users.postPasswordResetError,
  passwordResetStatus: state.Users.postPasswordResetStatus,
  isPlanConfigLoaded: !!state.PlanConfig.config,
  needsCustomization: !!state.PlanConfig.config?.slug,
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  resetEmail(): void {
    dispatch(ChangePasswordFormValues({ passwordFormValues: { email: '' } }));
  },
  resetPasswordResetStatus(): void {
    dispatch(CancelPostPasswordReset());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PasswordPage);
