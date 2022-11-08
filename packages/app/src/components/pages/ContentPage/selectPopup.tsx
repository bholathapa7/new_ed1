import React, { ReactNode } from 'react';

import DXF2RasterProcessingFailPopup from '^/components/molecules/DXF2RasterProcessingFailPopup';
import { DeleteGroupPopup } from '^/components/molecules/DeleteGroupPopup';
import DeletePhotoPopup from '^/components/molecules/DeletePhotoPopup';
import DeletingConfirmPopup from '^/components/molecules/DeletingConfirmPopup';
import PhotoUploadSuccessPopup from '^/components/molecules/PhotoUploadSuccessPopup';
import PhotoUploadFailPopup from '^/components/molecules/PhotoUploadFailPopup';
import ProcessingFailedPopup from '^/components/molecules/ProcessingFailedPopup';
import { WarningPopup } from '^/components/molecules/WarningPopup';
import { AttachUploadPopup } from '^/components/organisms/AttachUploadPopup';
import { CancelVolumeCreationPopup } from '^/components/organisms/CancelVolumeCreationPopup';
import ContentUploadPopup from '^/components/organisms/ContentUploadPopup';
import PrintPopup from '^/components/organisms/PrintPopup';
import PrintSuccessPopup from '^/components/organisms/PrintSuccessPopup';
import { ContentPagePopup } from '^/constants/zindex';
import AttachmentDownloadPopup from '^/containers/molecules/AttachmentDownloadPopup';
import CancelPopup from '^/containers/molecules/CancelPopup';
import ContentImagePopup from '^/containers/molecules/ContentImagePopup';
import NoPermissionPopup from '^/containers/molecules/NoPermissionPopup';
import NoSelectedMapPopup from '^/containers/molecules/NoSelectedMapPopup';
import ProcessingPopup from '^/containers/molecules/ProcessingPopup';
import SourceErrorPopup from '^/containers/molecules/SourceErrorPopup';
import UndownloadableAttachmentPopup from '^/containers/molecules/UndownloadableAttachmentPopup';
import UploadCompletePopup from '^/containers/molecules/UploadCompletePopup';
import BlueprintAlignPopup from '^/components/organisms/BlueprintAlignPopup';
import ContentSharePopup from '^/containers/organisms/ContentSharePopup';
import ProgressBarPopup from '^/containers/organisms/ProgressBarPopup';
import ProjectSharePopup from '^/components/organisms/ProjectSharePopup';
import ShareAlertPopup from '^/components/organisms/ShareAlertPopup';
import * as T from '^/types';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import ReportDownloadPopup from '^/components/organisms/ReportDownloadPopup';

const selectPopup: (
  popup?: T.ContentPagePopupType,
) => ReactNode = (
  popup,
) => {
  const zIndexPopup: number = ContentPagePopup.DEFAULT; // Enable the background of popups to overlay of sidebar

  // The background of Blueprint (alignment) should not overlay the sidebar
  const zIndexBlueprintAlignPopup: number = ContentPagePopup.BLUEPRINT_ALIGN_POPUP;

  switch (popup) {
    case T.ContentPagePopupType.IMAGE:
      return <ContentImagePopup zIndex={zIndexPopup} />;
    case T.ContentPagePopupType.UPLOAD:
      return <ContentUploadPopup zIndex={zIndexPopup} />;
    case T.ContentPagePopupType.DOWNLOAD:
      return <AttachmentDownloadPopup zIndex={zIndexPopup} />;
    case T.ContentPagePopupType.UNDOWNLOADABLE:
      return <UndownloadableAttachmentPopup zIndex={zIndexPopup} />;

    case T.ContentPagePopupType.PHOTO_UPLOAD_SUCCESS:
      return <PhotoUploadSuccessPopup zIndex={zIndexPopup} />;
    case T.ContentPagePopupType.PHOTO_UPLOAD_FAIL:
      return <PhotoUploadFailPopup zIndex={zIndexPopup} />;
    case T.ContentPagePopupType.DELETE_PHOTO:
      return <DeletePhotoPopup zIndex={zIndexPopup} />;

    case T.ContentPagePopupType.BLUEPRINT_UPLOAD:
    case T.ContentPagePopupType.ORTHO_UPLOAD:
    case T.ContentPagePopupType.LAS_UPLOAD:
    case T.ContentPagePopupType.DSM_UPLOAD:
    case T.ContentPagePopupType.DESIGN_UPLOAD:
    case T.ContentPagePopupType.PHOTO_UPLOAD:
      return <AttachUploadPopup popupType={popup} zIndex={zIndexPopup} />;

    case T.ContentPagePopupType.BLUEPRINT_ALIGN:
      return <BlueprintAlignPopup zIndex={zIndexBlueprintAlignPopup} />;

    case T.ContentPagePopupType.SOURCE_ERROR:
      return <SourceErrorPopup zIndex={zIndexPopup} />;

    case T.ContentPagePopupType.DELETE_CONFIRM:
      return <DeletingConfirmPopup zIndex={zIndexPopup} />;
    case T.ContentPagePopupType.DELETE_GROUP:
      return <DeleteGroupPopup zIndex={zIndexPopup} />;
    case T.ContentPagePopupType.DELETE_SCREEN:
      return <WarningPopup zIndex={zIndexPopup} type={popup} />;
    case T.ContentPagePopupType.OVERWRITE_SCREEN:
      return <WarningPopup zIndex={zIndexPopup} type={popup} />;

    case T.ContentPagePopupType.REPORT_DOWNLOAD:
      return <ReportDownloadPopup zIndex={zIndexPopup} />;

    case T.ContentPagePopupType.SHARE:
      return <ProjectSharePopup zIndex={zIndexPopup} />;
    case T.ContentPagePopupType.SHARE_ALERT:
      return <ShareAlertPopup zIndex={zIndexPopup} />;

    case T.ContentPagePopupType.EXTERNAL_SHARE:
      return <ContentSharePopup zIndex={zIndexPopup} />;

    case T.ContentPagePopupType.NO_SELECTED_MAP:
      return <NoSelectedMapPopup zIndex={zIndexPopup} />;

    case T.ContentPagePopupType.PROCESSING_FAILED:
      return <ProcessingFailedPopup zIndex={zIndexPopup} />;

    case T.ContentPagePopupType.PROCESSING:
      return <ProcessingPopup zIndex={zIndexPopup} />;
    case T.ContentPagePopupType.CANCEL:
      return <CancelPopup zIndex={zIndexPopup} />;

    case T.ContentPagePopupType.NO_PERMISSION:
      return <NoPermissionPopup zIndex={zIndexPopup} />;

    case T.ContentPagePopupType.PRINT_START:
      return <PrintPopup zIndex={zIndexPopup} />;
    case T.ContentPagePopupType.PRINT_SUCCESS:
      return <PrintSuccessPopup zIndex={zIndexPopup} />;

    case T.ContentPagePopupType.PROGRESS_BAR:
      return <ProgressBarPopup zIndex={zIndexPopup} />;
    case T.ContentPagePopupType.UPLOAD_COMPLETE:
      return <UploadCompletePopup zIndex={zIndexPopup} />;

    case T.ContentPagePopupType.DXF2RASTER_PROCESSING_FAIL:
      return <DXF2RasterProcessingFailPopup zIndex={zIndexPopup} />;

    case T.ContentPagePopupType.CANCEL_VOLUME_CREATION_POPUP:
      return <CancelVolumeCreationPopup zIndex={zIndexPopup} />;
    case undefined:
      return undefined;

    /* istanbul ignore next: exhaustive check is validated by type checking */
    default:
      return exhaustiveCheck(popup);
  }
};

export default selectPopup;
