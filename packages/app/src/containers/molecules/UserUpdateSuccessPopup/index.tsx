import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { CloseProjectPagePopup } from '^/store/duck/Pages';

import UserUpdateSuccessPopup, { Props } from '^/components/molecules/UserUpdateSuccessPopup';

type StatePropKeys = never;
type DispatchPropKeys = 'onClose';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onClose(): void {
    dispatch(CloseProjectPagePopup());
  },
});

export default connect(undefined, mapDispatchToProps)(UserUpdateSuccessPopup);
