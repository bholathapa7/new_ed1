import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { CloseContentPagePopup } from '^/store/duck/Pages';
import * as T from '^/types';

import UploadCompletePopup, { Props } from '^/components/molecules/UploadCompletePopup';
import { DeleteUploadContent } from '^/store/duck/Contents';

type StatePropKeys = 'success' | 'contentId';
type DispatchPropKeys = 'onClose';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: (
  state: Pick<T.State, 'Contents' | 'Pages'>,
) => StateProps = (
  { Contents, Pages },
) => ({
  success: Pages.Contents.popup && Pages.Contents.popup.contentId ?
    Contents.uploadContents[Pages.Contents.popup.contentId].error === undefined : false,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  contentId: Pages.Contents.popup!.contentId!,
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onClose(contentId: T.Content['id']): void {
    dispatch(DeleteUploadContent({ contentId }));
    dispatch(CloseContentPagePopup());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(UploadCompletePopup);
