import * as _ from 'lodash-es';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { CancelPostAttachment, CancelPostAttachmentNew } from '^/store/duck/Attachments';
import {
  CancelUploadBlueprint, CancelUploadDsm, CancelUploadLas,
  CancelUploadOrthophoto, CancelUploadSourcePhoto, DeleteContent, DeleteUploadContent,
} from '^/store/duck/Contents';
import { OpenContentPagePopup } from '^/store/duck/Pages';
import * as T from '^/types';

import ProgressBarPopup, { Props } from '^/components/organisms/ProgressBarPopup';

type StatePropKeys = 'content' | 'uploadStatus';
type DispatchPropKeys = 'onComplete' | 'onCancel';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: (
  state: Pick<T.State, 'Contents' | 'Attachments' | 'Pages'>,
) => StateProps = (
  { Contents, Attachments, Pages },
) => ({
  uploadStatus: (
    Pages.Contents.popup && Pages.Contents.popup.contentId &&
        Attachments.postAttachmentStatus[Pages.Contents.popup.contentId] !== undefined
  ) ?
    Attachments.postAttachmentStatus[Pages.Contents.popup.contentId] :
    {},
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  content: Contents.uploadContents[Pages.Contents.popup!.contentId!],
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onCancel(type: T.AttachmentType, contentId: T.Content['id'], hash: string | Array<string>): void {
    switch (type) {
      case T.AttachmentType.SOURCE:
        dispatch(CancelUploadSourcePhoto());
        break;

      case T.AttachmentType.BLUEPRINT_PDF:
      case T.AttachmentType.BLUEPRINT_DXF:
      case T.AttachmentType.BLUEPRINT_DWG:
        dispatch(CancelUploadBlueprint());
        break;

      case T.AttachmentType.DSM:
        dispatch(CancelUploadDsm());
        break;

      case T.AttachmentType.ORTHO:
        dispatch(CancelUploadOrthophoto());
        break;

      case T.AttachmentType.POINTCLOUD:
        dispatch(CancelUploadLas({ contentId }));
        break;

      default:
    }

    dispatch(DeleteUploadContent({ contentId }));

    if (type !== T.AttachmentType.DSM && type !== T.AttachmentType.POINTCLOUD) {
      dispatch(DeleteContent({ contentId }));
    }

    /* SourcePhoto can have a lot of hashes */
    if (hash instanceof Array) {
      hash.forEach((h) => dispatch(CancelPostAttachmentNew({ contentId, hash: h })));
    } else if (type === T.AttachmentType.BLUEPRINT_PDF) {
      /* Canceling BluePrint (Not DXF) needs CancelPostAttachemnt */
      dispatch(CancelPostAttachment({ contentId, hash }));
    } else {
      dispatch(CancelPostAttachmentNew({ contentId, hash }));
    }

    dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.CANCEL }));
  },
  onComplete(contentId: T.Content['id']): void {
    dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.UPLOAD_COMPLETE, contentId }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ProgressBarPopup);
