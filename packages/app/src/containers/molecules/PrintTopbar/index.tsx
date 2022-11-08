import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {
  ChangeSidebarStatus, OpenContentPagePopup, TogglePrintView,
} from '^/store/duck/Pages/Content';

import PrintTopbar, { Props } from '^/components/molecules/PrintTopbar';
import * as T from '^/types';

type DispatchPropKeys = 'next' | 'cancel';
export type OwnProps = Omit<Props, DispatchPropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: any = undefined;

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  next(): void {
    dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.PRINT_START }));
  },
  cancel(): void {
    dispatch(TogglePrintView({}));
    dispatch(ChangeSidebarStatus({ open: true }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PrintTopbar);
