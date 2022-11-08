import _ from 'lodash-es';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {
  ChangeImageViewerAttachment,
  CloseContentPagePopup,
  OpenContentPagePopup,
} from '^/store/duck/Pages/Content';
import * as T from '^/types';

import ContentImagePopup, { Props } from '^/components/molecules/ContentImagePopup';
import { RemoveAttachment } from '^/store/duck/Attachments';
import { RemoveESSAttachment } from '^/store/duck/ESSAttachments';
import { isAllowMarkerAttachOrDelete } from '^/utilities/role-permission-check';

type StatePropKeys =
  | 'attachments'
  | 'selected'
  | 'timezoneOffset'
  | 'sidebarTab'
  | 'editingId'
  | 'isAllowMarkerAttachOrDelete'
;
type DispatchPropKeys = 'onClick' | 'onClose' | 'onDelete' | 'onNoPermission';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: (
  state: Pick<T.State, 'ESSAttachments' | 'Attachments' | 'Pages' | 'Projects'>,
) => StateProps = (
  { ESSAttachments, Attachments, Pages, Pages: { Contents: { projectId } }, Projects },
) => {
  const sidebarTab: T.ContentsPageState['sidebarTab'] = Pages.Contents.sidebarTab;
  const attachments: T.ESSAttachmentsState['attachments'] | T.AttachmentsState['attachments'] =
    sidebarTab === T.ContentPageTabType.ESS ? ESSAttachments.attachments : Attachments.attachments;

  return {
    attachments: attachments.allIds.map(
      (id) => attachments.byId[id],
    ).filter((attachment) =>
      attachment.contentId === Pages.Contents.imageViewerStatus.contentId &&
      attachment.type === T.AttachmentType.PHOTO,
    ).map(({ id, file }) => ({
      id,
      file,
    })),
    sidebarTab,
    selected: attachments.byId[Pages.Contents.imageViewerStatus.attachmentId],
    timezoneOffset: Pages.Common.timezoneOffset,
    editingId: Pages.Contents.editingContentId,
    isAllowMarkerAttachOrDelete: isAllowMarkerAttachOrDelete(
      projectId !== undefined && Projects.projects.allIds.includes(projectId) ?
        Projects.projects.byId[projectId].permissionRole :
        T.PermissionRole.VIEWER,
    ),
  };
};

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onClick(attachmentId: number): void {
    dispatch(ChangeImageViewerAttachment({ attachmentId }));
  },
  onClose(): void {
    dispatch(CloseContentPagePopup());
  },
  onDelete(attachmentId: number, type: T.ContentsPageState['sidebarTab']): void {
    switch (type) {
      case T.ContentPageTabType.ESS: {
        dispatch(RemoveESSAttachment({ attachmentId }));
        break;
      }
      case T.ContentPageTabType.MEASUREMENT: {
        dispatch(RemoveAttachment({ attachmentId }));
        break;
      }
      default:
    }
  },
  onNoPermission(): void {
    dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ContentImagePopup);
