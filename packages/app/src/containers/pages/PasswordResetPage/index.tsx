import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { ChangeNewPasswordFormValues, ChangeNewPasswordToken } from '^/store/duck/Pages/Front';
import { CancelPatchPassword } from '^/store/duck/Users';
import * as T from '^/types';

import PasswordResetPage, { Props } from '^/components/pages/PasswordResetPage';

type StatePropsKey = 'patchPasswordStatus' | 'patchPasswordError' | 'isPlanConfigLoaded';
type DispatchPropsKey = 'resetPassword' | 'resetPatchPasswordStatus';
export type OwnProps = Omit<Props, StatePropsKey | DispatchPropsKey>;
export type StateProps = Pick<Props, StatePropsKey>;
export type DispatchProps = Pick<Props, DispatchPropsKey>;

export const mapStateToProps: (
  state: Pick<T.State, 'Users' | 'PlanConfig'>,
) => StateProps = (
  state,
) => ({
  patchPasswordError: state.Users.patchPasswordError,
  patchPasswordStatus: state.Users.patchPasswordStatus,
  isPlanConfigLoaded: !!state.PlanConfig.config,
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  resetPassword(): void {
    dispatch(ChangeNewPasswordToken({ newPasswordToken: undefined }));
    dispatch(ChangeNewPasswordFormValues({
      newPasswordFormValues: {
        password: '',
        passwordConfirmation: '',
      },
    }));
  },
  resetPatchPasswordStatus(): void {
    dispatch(CancelPatchPassword());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PasswordResetPage);
