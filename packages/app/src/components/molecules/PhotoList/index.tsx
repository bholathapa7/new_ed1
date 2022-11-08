import { format } from 'date-fns';
import React, { FC, ReactNode, memo, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import PhotoUploadOnboardSvg from '^/assets/icons/photo/upload-onboard.svg';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { MediaQuery, responsiveStyle } from '^/constants/styles';
import { UseL10n, useL10n } from '^/hooks';
import { OpenContentPagePopup } from '^/store/duck/Pages';
import { SetCurrentPhotoId } from '^/store/duck/Photos';
import * as T from '^/types';
import { ApplyOptionIfKorean, Formats } from '^/utilities/date-format';
import Text from './text';


const Root = styled.div(({
  position: 'absolute',
  // prevent overlapping contentsTabbar shadows
  zIndex: 9,
  left: '60px',
  top: '50px',
  width: 'calc(100% - 60px)',
  height: 'calc(100% - 50px)',
  overflow: 'auto',
  backgroundColor: palette.white.toString(),
}));
Root.displayName = 'PhotoListRoot';

const PhotoOnboardingRoot = styled.div({
  position: 'absolute',
  left: '50%',
  top: 'calc(50% - 25px)',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
  color: dsPalette.typePrimary.toString(),
});
PhotoOnboardingRoot.displayName = 'PhotoOnboardingRoot';

const PhotoListWrapper = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gridColumnGap: '15px',
  gridRowGap: '15px',
  margin: '15px',

  [MediaQuery[T.Device.TABLET]]: { gridTemplateColumns: 'repeat(4, 1fr)' },
  [MediaQuery[T.Device.MOBILE_L]]: { gridTemplateColumns: 'repeat(3, 1fr)' },
});
PhotoListWrapper.displayName = 'PhotoListWrapper';

const PhotoListHeader = styled.div({
  boxSizing: 'border-box',
  width: '100%',
  padding: '0px 15px',
  height: '45px',
  lineHeight: '45px',
  fontSize: '13px',
  fontWeight: 'bold',
  borderTop: '1px solid #F4F4F4',
  transform: 'translateY(-1px)',
  color: dsPalette.typePrimary.toString(),
});
PhotoListHeader.displayName = 'PhotoListHeader';

const OnboardHeaderText = styled.div({
  fontSize: '35px',
  marginBottom: '14px',
  fontWeight: 'bold',
});
OnboardHeaderText.displayName = 'OnboardHeaderText';

const OnboardHeaderSubText = styled.div({
  fontSize: '15px',
  marginBottom: '46px',
});
OnboardHeaderSubText.displayName = 'OnboardHeaderSubText';

const OnboardDescription = styled.div({
  fontSize: '11px',
  lineHeight: '16px',
});
OnboardDescription.displayName = 'OnboardDescription';

const OnboardSvgWrapper = styled.div({ display: 'inline-block' });
OnboardSvgWrapper.displayName = 'OnboardSvgWrapper';

const PhotoListItem = styled.div<{ url: string }>(({ url }) => ({
  cursor: 'pointer',

  backgroundImage: `url('${url}')`,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  [MediaQuery[T.Device.DESKTOP]]: {
    ...responsiveStyle.photoListItem[T.Device.DESKTOP],
  },
  [MediaQuery[T.Device.TABLET]]: {
    ...responsiveStyle.photoListItem[T.Device.TABLET],
  },
  [MediaQuery[T.Device.MOBILE_L]]: {
    ...responsiveStyle.photoListItem[T.Device.MOBILE_L],
  },

  ':hover': {
    filter: 'brightness(0.6)',
  },
}));
PhotoListItem.displayName = 'PhotoListItem';


const PhotoList: FC = () => {
  const dispatch: Dispatch = useDispatch();
  const [l10n, lang]: UseL10n = useL10n();
  const photos: Array<T.Photo> = useSelector((s: T.State) => s.Photos.photos);
  const currentPhotoId: T.Photo['id'] | undefined = useSelector((s: T.State) => s.Photos.currentPhotoId);
  const photoTab: T.PhotoTabType = useSelector((s: T.State) => s.Photos.photoTab);
  const photosByDate: { [date in string]: Array<T.Photo> } = {};

  const openUploadPopup: () => void = useCallback(() => {
    dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.PHOTO_UPLOAD }));
  }, []) ;

  const photoOnboarding: ReactNode = useMemo(() => {
    if (photos.length !== 0) return null;

    return (
      <PhotoOnboardingRoot>
        <OnboardHeaderText>{l10n(Text.header.text)}</OnboardHeaderText>
        <OnboardHeaderSubText>{l10n(Text.header.subtext)}</OnboardHeaderSubText>
        <div onClick={openUploadPopup} style={{ cursor: 'pointer' }}>
          <OnboardSvgWrapper><PhotoUploadOnboardSvg /></OnboardSvgWrapper>
          <OnboardDescription>
            <div>{l10n(Text.description.clickUploadButton)}</div>
            <div>{l10n(Text.description.selectPhoto)}</div>
          </OnboardDescription>
        </div>
      </PhotoOnboardingRoot>
    );
  }, [photos.length]);

  photos.sort((a, b) => b.takenAt.getTime() - a.takenAt.getTime()).forEach((photo) => {
    const dateStr: string = (() => {
      if (photo.takenAt.getTime() === 0) return l10n(Text.noDate);

      return format(photo.takenAt, `${Formats.PPP} ${Formats.iiii}`, ApplyOptionIfKorean(lang));
    })();
    /* eslint-disable @typescript-eslint/strict-boolean-expressions */
    if (!photosByDate[dateStr]) photosByDate[dateStr] = [];

    photosByDate[dateStr].push(photo);
  });
  /**
   * @description not required to memoize.
   * `photoListItems` will be re-rendered when only `photos` changes.
   */
  const photoListsByDate: Array<ReactNode> = Object.entries(photosByDate).map(([dateString, currentDatePhotos]) => {
    const handlePhotoListItemClick: (photoId: T.Photo['id']) => () => void = (photoId) => () => {
      dispatch(SetCurrentPhotoId({ photoId }));
    };

    const photoListItems: Array<ReactNode> = currentDatePhotos.map(
      (photo) => <PhotoListItem key={photo.id} url={photo.thumbUrl} onClick={handlePhotoListItemClick(photo.id)} />,
    );

    return (
      <div key={dateString}>
        <PhotoListHeader>{dateString}</PhotoListHeader>
        <PhotoListWrapper>
          {photoListItems}
        </PhotoListWrapper>
      </div>
    );
  });

  return (() => {
    if (photoTab !== T.PhotoTabType.TIME || currentPhotoId) return null;

    return (
      <Root>
        {photoOnboarding}
        {photoListsByDate}
      </Root>
    );
  })();
};

export default memo(PhotoList);
