
import React, { FC, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { ConfirmButton } from '^/components/atoms/Buttons';
import Popup from '^/components/molecules/Popup';
import dsPalette from '^/constants/ds-palette';
import { UseL10n, useL10n } from '^/hooks';
import { CloseContentPagePopup } from '^/store/duck/Pages/Content';
import { DeletePhoto } from '^/store/duck/Photos';
import * as T from '^/types';
import Text from './text';


const Root = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '313px',
  padding: '31px 50px 35px 50px',
});

const Description = styled.h2({
  display: 'block',
  width: '100%',

  marginBottom: '33px',
  lineHeight: '24px',
  fontSize: '16px',
  fontWeight: 'normal',
  overflowWrap: 'break-word',
  color: dsPalette.title.toString(),
});


export interface Props {
  readonly zIndex: number;
}

const backgroundAlpha: number = 0.45;

const DeletePhotoPopup: FC<Props> = ({ zIndex }) => {
  const currentPhotoId: T.PhotosState['currentPhotoId'] = useSelector((s: T.State) => s.Photos.currentPhotoId);
  const [l10n]: UseL10n = useL10n();
  const dispatch: Dispatch = useDispatch();

  const warningType: T.ContentPagePopupType = T.ContentPagePopupType.DELETE_PHOTO;
  if (currentPhotoId === undefined) return null;

  const onClose: () => void = () => {
    dispatch(CloseContentPagePopup());
  };

  const handleConfirm: () => void = () => {
    dispatch(DeletePhoto({ photoId: currentPhotoId }));
  };
  const buttonText: string = l10n(Text.button.delete);

  return (
    <Popup
      title={l10n(Text.title)}
      alpha={backgroundAlpha}
      zIndex={zIndex}
      onCloseClick={onClose}
      warningType={warningType}
    >
      <Root>
        <Description>{l10n(Text.description.first)}</Description>
        <ConfirmButton onClick={handleConfirm} data-testid='warning-button'>{buttonText}</ConfirmButton>
      </Root>
    </Popup>
  );
};

export default memo(DeletePhotoPopup);
