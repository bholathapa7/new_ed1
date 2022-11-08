import React, { FC } from 'react';
import { Dispatch } from 'redux';
import { useDispatch, useSelector } from 'react-redux';

import Popup from '^/components/molecules/Popup';
import styled, { CSSObject } from 'styled-components';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { ConfirmButton } from '^/components/atoms/Buttons';
import Text from './text';
import { useL10n, UseL10n } from '^/hooks';
import SendShareSvg from '^/assets/icons/popup/send-share.svg';
import {
  OpenContentPagePopup,
  CloseContentPagePopup,
  OpenProjectPagePopup,
  CloseProjectPagePopup,
} from '^/store/duck/Pages';
import * as T from '^/types';

const popupAlpha: number = 0.45;

const headerStyle: CSSObject = {
  padding: '30px 30px 0',

  '& > div:nth-of-type(2)': {
    '& > div:hover': {
      background: 'var(--color-theme-primary)',
      '& svg': {
        fill: palette.white.toString(),
      },
    },
  },
};

const Wrapper = styled.div({
  padding: '0 38px 31px 38px',
});

const SvgWrapper = styled.div({
  textAlign: 'center',
  marginBottom: '12px',
});

const SendShareIcon = styled(SendShareSvg)({
  fill: 'var(--color-theme-primary)',
  width: '30px',
  height: '30px',
});

const titleStyle: CSSObject = {
  fontWeight: 700,
  textAlign: 'center',
};

const Title = styled.div({
  fontSize: '20px',
  color: 'var(--color-theme-primary)',
  marginBottom: '10px',
  ...titleStyle,
});

const SubTitle = styled.div({
  fontSize: '15px',
  color: dsPalette.typePrimary.toString(),
  width: '303px',
  marginBottom: '22px',
  ...titleStyle,
});

const ButtonWrapper = styled.div({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '35px',

  '& > button': {
    width: 'auto',
    padding: '0 35px',
  },
});

interface Props {
  zIndex: number;
}

const ShareAlertPopup: FC<Props> = ({
  zIndex,
}) => {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();
  const isInContent: boolean = useSelector((state: T.State) => !state.Pages.Project.editingProjectId);

  const onClose = () => {
    dispatch(isInContent ? CloseContentPagePopup() : CloseProjectPagePopup());
  };

  const onSubmit = () => {
    dispatch(
      isInContent ? OpenContentPagePopup({
        popup: T.ContentPagePopupType.SHARE,
      }) : OpenProjectPagePopup({
        popup: T.ProjectPagePopupType.SHARE,
      })
    );
  };

  return (
    <Popup
      alpha={popupAlpha}
      zIndex={zIndex}
      onCloseClick={onClose}
      headerStyle={headerStyle}
      title={''}
    >
      <Wrapper>
        <SvgWrapper>
          <SendShareIcon />
        </SvgWrapper>
        <Title>{l10n(Text.title)}</Title>
        <SubTitle>{l10n(Text.subTitle)}</SubTitle>
        <ButtonWrapper>
          <ConfirmButton onClick={onSubmit}>
            {l10n(Text.moreShare)}
          </ConfirmButton>
        </ButtonWrapper>
      </Wrapper>
    </Popup>
  );
};

export default ShareAlertPopup;
