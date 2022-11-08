import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import NoPermissionPopup, { Props } from '^/components/molecules/NoPermissionPopup';
import { CloseContentPagePopup, CloseProjectPagePopup } from '^/store/duck/Pages';

type StatePropKeys = never;
type DispatchPropKeys = 'onClose';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapDispatchToProps: (dispatch: Dispatch) => DispatchProps = (
  dispatch,
) => ({
  onClose(): void {
    dispatch(CloseContentPagePopup());
    dispatch(CloseProjectPagePopup());
  },
});

export default connect(undefined, mapDispatchToProps)(NoPermissionPopup);
