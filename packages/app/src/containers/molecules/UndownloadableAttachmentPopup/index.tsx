import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { CloseContentPagePopup, OpenContentPagePopup } from '^/store/duck/Pages/Content';
import * as T from '^/types';

import UndownloadableAttachmentPopup, {
  Props,
} from '^/components/molecules/UndownloadableAttachmentPopup';

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
    dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.DOWNLOAD }));
  },
});

export default connect(undefined, mapDispatchToProps)(UndownloadableAttachmentPopup);
