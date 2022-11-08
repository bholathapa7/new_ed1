import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { CancelPostPasswordReset } from '^/store/duck/Users';
import * as T from '^/types';

import PasswordResetFailureMessage, {
  Props,
} from '^/components/molecules/PasswordResetFailureMessage';

type StatePropKeys = 'primaryColor';
type DispatchPropKeys = 'backToForm';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: (
  state: Pick<T.State, 'PlanConfig'>,
) => StateProps = (
  state,
) => ({
  primaryColor: state.PlanConfig.config?.primaryColor,
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  backToForm(): void {
    dispatch(CancelPostPasswordReset());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PasswordResetFailureMessage);
