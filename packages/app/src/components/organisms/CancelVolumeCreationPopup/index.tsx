import React, { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { ConfirmButton as RawConfirmButton } from '^/components/atoms/Buttons';
import Popup from '^/components/molecules/Popup';
import dsPalette from '^/constants/ds-palette';
import { MediaQuery } from '^/constants/styles';
import { UseL10n, useL10n } from '^/hooks';
import {
  ChangeCreatingVolume,
  ChangeCurrentContentTypeFromAnnotationPicker,
  CloseContentPageMapPopup,
  CloseContentPagePopup,
} from '^/store/duck/Pages/Content';
import * as T from '^/types';
import Text from './text';

const Body = styled.div({
  width: '400px',
  padding: '35px 50px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  '> p': {
    width: '100%',
    lineHeight: 1.5,
    color: dsPalette.title.toString(),
    fontSize: '16px',
    marginBottom: '35px',
  },

  [MediaQuery[T.Device.MOBILE_L]]: {
    width: '310px',
  },
});

const ConfirmButton = styled(RawConfirmButton)({
  width: '118px',
});

export interface Props {
  readonly zIndex: number;
}

export const CancelVolumeCreationPopup: FC<Props> = ({ zIndex }) => {
  const [l10n]: UseL10n = useL10n();
  const dispatch: Dispatch = useDispatch();
  const exitCommonFunc: () => void = useCallback(() => {
    dispatch(CloseContentPagePopup());

    dispatch(ChangeCreatingVolume({}));
    dispatch(CloseContentPageMapPopup());
    dispatch(ChangeCurrentContentTypeFromAnnotationPicker({}));
  }, []);

  const backgroundAlpha: number = 0.39;

  const onClose: () => void = () => {
    dispatch(CloseContentPagePopup());
  };

  return (
    <Popup
      title={l10n(Text.title)}
      onCloseClick={onClose}
      hasBlur={true}
      zIndex={zIndex}
      alpha={backgroundAlpha}
    >
      <Body>
        <p>
          {l10n(Text.content)}
        </p>
        <ConfirmButton onClick={exitCommonFunc}>
          {l10n(Text.confirm)}
        </ConfirmButton>
      </Body>
    </Popup >
  );
};

