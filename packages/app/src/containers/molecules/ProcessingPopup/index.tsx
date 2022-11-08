import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { CloseContentPagePopup } from '^/store/duck/Pages/Content';

import ProcessingPopup, { Props } from '^/components/molecules/ProcessingPopup';

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
    dispatch(CloseContentPagePopup());
  },
});

export default connect(undefined, mapDispatchToProps)(ProcessingPopup);
