import React, { FC } from 'react';
import { Dispatch } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';

import Popup from '^/components/molecules/Popup';
import styled, { CSSObject } from 'styled-components';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { CancelButton, ConfirmButton as RawConfirmButton } from '^/components/atoms/Buttons';
import Text from './text';
import { useL10n, UseL10n } from '^/hooks';
import SendShareSvg from '^/assets/icons/popup/send-share.svg';
import {
  OpenProjectPagePopup,
  CloseProjectPagePopup,
} from '^/store/duck/Pages';
import route from '^/constants/routes';
import * as T from '^/types';

const popupAlpha: number = 0.45;

const headerStyle: CSSObject = {
  padding: '30px 30px 0',

  '& > div:nth-of-type(2)': {
    '& > div:hover': {
      background: dsPalette.themePrimary.toString(),
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
  fill: dsPalette.themePrimary.toString(),
  width: '30px',
  height: '30px',
});

const titleStyle: CSSObject = {
  fontWeight: 700,
  textAlign: 'center',
};

const Title = styled.div({
  fontSize: '20px',
  color: dsPalette.themePrimary.toString(),
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
    padding: '0 20px',
  },
});

const ConfirmButton = styled(RawConfirmButton)({
  width: '125px',
});

const InviteButton = styled(CancelButton)({
  width: '125px',
  marginRight: '9px',
  color: dsPalette.typePrimary.toString(),
});

interface Props {
  zIndex: number;
}

const InviteAlertPopup: FC<Props> = ({
  zIndex,
}) => {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();

  const projectId: number | undefined = useSelector((state: T.State) =>
    state.Projects.projects.allIds[state.Projects.projects.allIds.length - 1]
  );

  const onClose = () => {
    dispatch(CloseProjectPagePopup());
  };

  const onInvite = () => {
    dispatch(
      OpenProjectPagePopup({
        popup: T.ProjectPagePopupType.INVITE,
      })
    );
  };

  const onSubmit = () => {
    if (projectId === undefined) return;

    dispatch(push(route.content.createMain(projectId)));
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
          <InviteButton onClick={onInvite}>
            {l10n(Text.moreShare)}
          </InviteButton>
          <ConfirmButton onClick={onSubmit}>
            {l10n(Text.openProject)}
          </ConfirmButton>
        </ButtonWrapper>
      </Wrapper>
    </Popup>
  );
};

export default InviteAlertPopup;
