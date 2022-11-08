import React, { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { ConfirmButton } from '^/components/atoms/Buttons';
import Popup from '^/components/molecules/Popup';
import dsPalette from '^/constants/ds-palette';
import { UseL10n, useL10n } from '^/hooks';
import { CloseContentPagePopup } from '^/store/duck/Pages';
import Text from './text';

const Body = styled.div({
  textAlign: 'center',
  padding: '50px',
  paddingTop: '35px',
});
Body.displayName = 'Body';

const Description = styled.p({
  marginBottom: '35px',
  width: '100%',
  lineHeight: 1.5,
  fontSize: '16px',
  color: dsPalette.title.toString(),
});
Description.displayName = 'Description';

const ButtonWrapper = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export interface Props {
  readonly zIndex: number;
}

const BG_ALPHA: number = 0.45;

const PrintFailPopup: FC<Props> = ({ zIndex }) => {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();

  const onClose: () => void = useCallback(() => {
    dispatch(CloseContentPagePopup());
  }, []);

  return (
    <Popup
      alpha={BG_ALPHA}
      title={l10n(Text.title)}
      zIndex={zIndex}
      onCloseClick={onClose}
    >
      <Body>
        <Description>
          {l10n(Text.description.error)}
        </Description>
        <Description>
          {l10n(Text.description.solution)}
        </Description>
        <ButtonWrapper>
          <ConfirmButton onClick={onClose}>{l10n(Text.submit)}</ConfirmButton>
        </ButtonWrapper>
      </Body>
    </Popup>
  );
};

export default PrintFailPopup;
