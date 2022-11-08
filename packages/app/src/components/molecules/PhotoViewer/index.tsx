import { format } from 'date-fns';
import React, { FC, memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import DeleteSvg from '^/assets/icons/delete.svg';
import PhotoViewerArrowSvg from '^/assets/icons/photo/viewer-arrow.svg';
import PhotoViewerBackSvg from '^/assets/icons/photo/viewer-back.svg';
import palette from '^/constants/palette';
import { UseL10n, useL10n } from '^/hooks';
import { OpenContentPagePopup } from '^/store/duck/Pages';
import { SetCurrentPhotoId } from '^/store/duck/Photos';
import * as T from '^/types';
import { ApplyOptionIfKorean, Formats } from '^/utilities/date-format';


const Root = styled.div(({
  position: 'fixed',
  // prevent overlapping contentsTabbar shadows
  zIndex: 241,
  left: '60px',
  top: '0',
  width: 'calc(100% - 60px)',
  height: '100%',
  overflow: 'hidden',
  backgroundColor: palette.white.toString(),
}));
Root.displayName = 'PhotoViewerRoot';

const PhotoViewerHeader = styled.div({
  position: 'relative',
  display: 'flex',
  height: '50px',

  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  borderBottom: `1px solid ${palette.Photo.border.toString()}`,

  fontSize: '13px',
});
PhotoViewerHeader.displayName = 'PhotoViewerHeader';

const PhotoCountText = styled.div({
  marginTop: '4px',
  fontSize: '11px',
  color: palette.Photo.photoCountText.toString(),
});

const PhotoViewerButton = styled.button<{ isLeft: boolean }>(({ isLeft }) => ({
  position: 'absolute',
  left: isLeft ? '16px' : undefined,
  right: !isLeft ? '16px' : undefined,
  top: '50%',
  width: '28px',
  height: '28px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  transform: 'translateY(-50%)',
  borderRadius: '5px',
  cursor: 'pointer',
  backgroundColor: 'transparent',
  ':hover': {
    backgroundColor: palette.Photo.backButtonBackground.toString(),
  },
}));

const PhotoViewerItem = styled.div<{ url: string }>(({ url }) => ({
  position: 'relative',
  backgroundImage: `url('${url}')`,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  height: '100%',
}));
PhotoViewerItem.displayName = 'PhotoViewerItem';

const ArrowSvgWrapper = styled.div<{ readonly isLeft: boolean }>(({ isLeft }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '30px',
  height: '30px',
  borderRadius: '4px',
  transform: isLeft ? 'rotate(180deg)' : undefined,
}));
ArrowSvgWrapper.displayName = 'ArrowSvgWrapper';

const PhotoViewerItemHandle = styled.div<{
  readonly isLeft: boolean;
  readonly isVisible: boolean;
}>(({ isLeft, isVisible }) => ({
  position: 'absolute',
  top: '0',
  left: isLeft ? '0' : undefined,
  right: isLeft ? undefined : '0',
  height: '100%',
  width: '160px',
  opacity: 0,

  display: isVisible ? 'flex' : 'none',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',

  ':hover': {
    opacity: 1,
  },
  ':hover div': {
    background: palette.Photo.viewerHandleBackground.toString(),
  },
}));
PhotoViewerItemHandle.displayName = 'PhotoViewerItemHandle';


const PhotoViewer: FC = () => {
  const dispatch: Dispatch = useDispatch();
  const [, lang]: UseL10n = useL10n();

  const photos: Array<T.Photo> = useSelector((s: T.State) => s.Photos.photos);
  const currentPhotoId: T.Photo['id'] | undefined = useSelector((s: T.State) => s.Photos.currentPhotoId);

  const currentPhotoInfo: { photo: T.Photo; index: number } | undefined = photos
    .map((photo, index) => ({ photo, index }))
    .find(({ photo }) => photo.id === currentPhotoId);

  const handleOnBack: () => void = useCallback(() => {
    dispatch(SetCurrentPhotoId({ photoId: undefined }));
  }, []);
  const handleOnDelete: () => void = useCallback(() => {
    dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.DELETE_PHOTO }));
  }, []);

  const handleViewerItemHandleClick: (photoIdx: number) => () => void = useCallback((photoIdx) => () => {
    const photoId: number | undefined = photos[photoIdx]?.id;

    dispatch(SetCurrentPhotoId({ photoId }));
  }, [photos]);

  return (() => {
    if (!currentPhotoInfo) return null;

    const dateStr: string = format(
      currentPhotoInfo.photo.takenAt,
      `${Formats.PPP} ${Formats.iiii} ${Formats.pp}`,
      ApplyOptionIfKorean(lang),
    );

    return (
      <Root>
        <PhotoViewerHeader>
          <PhotoViewerButton isLeft={true} onClick={handleOnBack}>
            <PhotoViewerBackSvg />
          </PhotoViewerButton>
          <PhotoViewerButton isLeft={false} onClick={handleOnDelete}>
            <DeleteSvg />
          </PhotoViewerButton>
          <div>{dateStr}</div>
          <PhotoCountText>{currentPhotoInfo.index + 1} / {photos.length}</PhotoCountText>
        </PhotoViewerHeader>
        <PhotoViewerItem url={currentPhotoInfo.photo.fullUrl}>
          <PhotoViewerItemHandle
            isLeft={true}
            isVisible={currentPhotoInfo.index !== 0 && photos.length !== 1}
            onClick={handleViewerItemHandleClick(currentPhotoInfo.index - 1)}
          >
            <ArrowSvgWrapper isLeft={true}><PhotoViewerArrowSvg /></ArrowSvgWrapper>
          </PhotoViewerItemHandle>
          <PhotoViewerItemHandle
            isLeft={false}
            isVisible={currentPhotoInfo.index + 1 !== photos.length}
            onClick={handleViewerItemHandleClick(currentPhotoInfo.index + 1)}
          >
            <ArrowSvgWrapper isLeft={false}><PhotoViewerArrowSvg /></ArrowSvgWrapper>
          </PhotoViewerItemHandle>
        </PhotoViewerItem>
      </Root>
    );
  })();
};

export default memo(PhotoViewer);
