import React, { FC, ChangeEvent, ReactNode, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import CloseSVG from '^/assets/icons/close-new.svg';
import ArrowSVG from '^/assets/icons/contents-list/arrow.svg';
import PlusSVG from '^/assets/icons/contents-list/plus.svg';
import MagnifierSVG from '^/assets/icons/magnifier.svg';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { MediaQuery } from '^/constants/styles';
import { UseClick, UseL10n, useClick, useL10n, useRole } from '^/hooks';
import { PostAttachment, RemoveAttachment } from '^/store/duck/Attachments';
import { UpdateMarkerAttachmentsCount } from '^/store/duck/Contents';
import { PostESSAttachment, RemoveESSAttachment } from '^/store/duck/ESSAttachments';
import { ChangeImageViewerAttachment, ChangeImageViewerContent, OpenContentPagePopup } from '^/store/duck/Pages';
import * as T from '^/types';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { isAllowMarkerAttachOrDelete } from '^/utilities/role-permission-check';

import Text from './text';

const Root = styled.div({
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexDirection: 'column',
});

const ContentTitle = styled.span({
  fontSize: '12px',
  color: dsPalette.title.toString(),
});

const Photos = styled.div({
  width: '100%',

  marginTop: '10px',

  display: 'grid',
  gridTemplateColumns: 'repeat(4, 52.75px)',
  gridRowGap: '4.74px',
  gridColumnGap: '4.74px',

  [MediaQuery.MOBILE_L]: {
    gridTemplateColumns: 'repeat(4, 48.5px)',
    gridRowGap: '4px',
    gridColumnGap: '4px',
  },
  [MediaQuery.MOBILE_S]: {
    gridTemplateColumns: 'repeat(4, 43.5px)',
  },
});
const PhotoUploadButton = styled.label({
  width: '48px',
  height: '48px',

  border: `1px solid ${palette.ContentsList.inputBorder.toString()}`,
  borderRadius: '5px',

  cursor: 'pointer',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  ':hover': {
    backgroundColor: palette.ContentsList.inputBorder.toString(),

    '> svg path': {
      fill: `${palette.white.toString()} !important`,
    },
  },

  [MediaQuery.MOBILE_L]: {
    width: '46.5px',
    height: '46.5px',
  },
  [MediaQuery.MOBILE_S]: {
    width: '41.5px',
    height: '41.5px',
  },
});
const Photo = styled.div<{ src: string }>(({ src }) => ({
  position: 'relative',

  width: '50px',
  height: '50px',

  border: 0,
  borderRadius: '5px',

  background: `url(${src})`,
  backgroundPosition: 'center',
  backgroundSize: 'cover',

  '> span': {
    display: 'none',
  },

  ':hover > span': {
    display: 'unset',
  },

  [MediaQuery.MOBILE_L]: {
    width: '48.5px',
    height: '48.5px',
  },
  [MediaQuery.MOBILE_S]: {
    width: '43.5px',
    height: '43.5px',
  },
}));
const PhotoTools = styled.span({
  content: '\'\'',

  width: '100%',
  height: '100%',

  position: 'absolute',
  // eslint-disable-next-line no-magic-numbers
  backgroundColor: palette.black.alpha(0.6).toString(),
  borderRadius: '5px',

  '> svg': {
    cursor: 'pointer',

    opacity: 0.5,

    ':hover': {
      opacity: 1,
    },
  },
});
const MagnifierButton = styled(MagnifierSVG)({
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
});
const DeleteButton = styled(CloseSVG)({
  position: 'absolute',
  top: '5px',
  right: '5px',
});

const ViewMoreContainer = styled.div({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const ViewMoreButton =
  styled(ArrowSVG)<{ isViewMoreClicked: boolean }>(({ isViewMoreClicked }) => ({
    transform: isViewMoreClicked ? 'rotate(-180deg)' : undefined,
    cursor: 'pointer',

    position: 'absolute',
    bottom: '10.5px',
  }));

const maxPhotoRowsNumber: number = 3;

interface Props {
  readonly content: T.MarkerContent | T.ESSModelContent;
}

const ContentAttachments: FC<Props> = ({ content }) => {
  const photos: T.Attachment[] = useSelector((s: T.State) => {
    const attachments: T.ESSAttachmentsState['attachments'] | T.AttachmentsState['attachments'] =
      content.type === T.ContentType.ESS_MODEL ? s.ESSAttachments.attachments : s.Attachments.attachments;

    return Object.values(attachments.byId)
      .filter((attachment) => attachment.contentId === content.id);
  });
  const [isViewMoreClicked, onViewMoreClick]: UseClick = useClick(false);
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();
  const role: T.PermissionRole = useRole();

  const photosList: ReactNode = photos
    .slice(0, isViewMoreClicked ? photos.length : maxPhotoRowsNumber)
    .map((photo: T.Attachment) => {
      const onMagnifierClick: () => void = () => {
        dispatch(ChangeImageViewerAttachment({ attachmentId: photo.id }));
        dispatch(ChangeImageViewerContent({ contentId: photo.contentId }));
        dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.IMAGE }));
      };
      const onDeleteClick: () => void = () => {
        if (!isAllowMarkerAttachOrDelete(role)) {
          dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));

          return;
        }

        switch (content.type) {
          case T.ContentType.MARKER: {
            dispatch(RemoveAttachment({ attachmentId: photo.id }));
            dispatch(UpdateMarkerAttachmentsCount({ contentId: content.id, count: content.attachmentsCount - 1 }));
            break;
          }
          case T.ContentType.ESS_MODEL: {
            dispatch(RemoveESSAttachment({ attachmentId: photo.id }));
            break;
          }
          default: {
            exhaustiveCheck(content);
          }
        }
      };

      return (
        <Photo key={photo.id} src={photo.file.markerThumb?.url ?? photo.file.photoThumb?.url}>
          <PhotoTools>
            <MagnifierButton onClick={onMagnifierClick} />
            <DeleteButton onClick={onDeleteClick} />
          </PhotoTools>
        </Photo>
      );
    });

  const onPhotoInputChange: (e: ChangeEvent<HTMLInputElement>) => void = (e) => {
    if (!e.target.files?.length) {
      return;
    }
    if (!isAllowMarkerAttachOrDelete(role)) {
      dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));

      return;
    }

    const files: Array<File> = [...e.target.files];
    const isPhotoMax: boolean = (files.length + photos.length) >= maxPhotoRowsNumber;

    if (isPhotoMax && !isViewMoreClicked) {
      onViewMoreClick();
    }

    switch (content.type) {
      case T.ContentType.MARKER: {
        files.forEach((file: File) => dispatch(PostAttachment({
          contentId: content.id,
          file,
          attachmentType: T.AttachmentType.PHOTO,
        })));
        dispatch(UpdateMarkerAttachmentsCount({ contentId: content.id, count: content.attachmentsCount + 1 }));
        break;
      }
      case T.ContentType.ESS_MODEL: {
        files.forEach((file: File) => dispatch(PostESSAttachment({
          contentId: content.id,
          file,
          attachmentType: T.AttachmentType.PHOTO,
        })));
        break;
      }
      default: {
        exhaustiveCheck(content);
      }
    }
  };

  const viewMoreButton: ReactNode = photos.length > maxPhotoRowsNumber ? (
    <ViewMoreContainer>
      <ViewMoreButton isViewMoreClicked={isViewMoreClicked} onClick={onViewMoreClick} />
    </ViewMoreContainer>
  ) : undefined;

  return (
    <Root>
      <ContentTitle>{l10n(Text.photo)}</ContentTitle>
      <Photos>
        <PhotoUploadButton htmlFor='files'>
          <PlusSVG />
          <input
            type='file'
            id='files'
            accept='image/jpeg,image/png'
            multiple={true}
            style={{ display: 'none' }}
            onChange={onPhotoInputChange}
          />
        </PhotoUploadButton>
        {photosList}
      </Photos>
      {viewMoreButton}
    </Root>
  );
};

export default memo(ContentAttachments);
