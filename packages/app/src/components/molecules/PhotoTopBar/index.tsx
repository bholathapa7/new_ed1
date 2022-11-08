
import React, { memo,FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import palette from '^/constants/palette';
import { responsiveStyle } from '^/constants/styles';
import { UseL10n, useL10n } from '^/hooks';
import { SetPhotoTabType } from '^/store/duck/Photos';
import * as T from '^/types';
import Text from './text';


const Root = styled.div({
  position: 'absolute',
  zIndex: 240,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  top: '0px',
  right: '0px',
  width: 'calc(100% - 60px)',
  height: `${responsiveStyle.topBar[T.Device.DESKTOP]?.height}`,
  backgroundColor: palette.white.toString(),
  borderBottom: palette.Photo.border.toString(),
});
Root.displayName = 'PhotoTopBarRoot';

const PhotoTabButtonWrapper = styled.div({
  display: 'flex',
  width: '150px',
  borderRadius: '7px',
  padding: '2px',
  background: palette.Photo.border.toString(),
});

const PhotoTabButton = styled.button<{ readonly isActive: boolean }>(({ isActive }) => ({
  flexGrow: 1,
  cursor: 'pointer',
  height: '30px',
  background: isActive ? palette.Photo.photoTabButtonBackground.toString() : 'none',
  borderRadius: '7px',
  border: 'none',
  outline: 'none',
  fontSize: '13px',
  color: palette.Photo.photoTabButtonText.toString(),
}));


export const PhotoTopBar: FC = memo(() => {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();
  const isPhotoTopBarShown: boolean = useSelector((s: T.State) => s.Pages.Contents.sidebarTab === T.ContentPageTabType.PHOTO);
  const photoTabType: T.PhotoTabType = useSelector((s: T.State) => s.Photos.photoTab);

  const onTabClick: (tabType: T.PhotoTabType) => () => void = (tabType) => () => {
    dispatch(SetPhotoTabType({ tabType }));
  };

  return isPhotoTopBarShown ? (
    <Root>
      <PhotoTabButtonWrapper>
        <PhotoTabButton
          onClick={onTabClick(T.PhotoTabType.MAP)}
          isActive={photoTabType === T.PhotoTabType.MAP}
        >
          {l10n(Text.map)}
        </PhotoTabButton>
        <PhotoTabButton
          onClick={onTabClick(T.PhotoTabType.TIME)}
          isActive={photoTabType === T.PhotoTabType.TIME}
        >
          {l10n(Text.time)}
        </PhotoTabButton>
      </PhotoTabButtonWrapper>
    </Root>
  ) : null;
});
