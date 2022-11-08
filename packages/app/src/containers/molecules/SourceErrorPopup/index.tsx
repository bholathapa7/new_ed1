import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { CloseContentPagePopup } from '^/store/duck/Pages/Content';

import SourceErrorPopup, { Props } from '^/components/molecules/SourceErrorPopup';

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

export default connect(undefined, mapDispatchToProps)(SourceErrorPopup);
