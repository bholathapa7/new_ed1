import React, { Dispatch, FC, memo } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import { Action, CloseContentPagePopup, OpenContentPagePopup } from '^/store/duck/Pages/Content';

import * as T from '^/types';

import Text from './text';

import palette from '^/constants/palette';

import { UseL10n, useL10n } from '^/hooks';

import { CancelButton, ConfirmButton } from '^/components/atoms/Buttons';
import FaIcon from '^/components/atoms/FaIcon';

import Popup from '../Popup';

const Root = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  padding: '40px',
  width: '470px',
});

const ButtonWrapper = styled.div({
  display: 'flex',
  justifyContent: 'space-around',
  width: '60%',
});

const Description = styled.h2({
  display: 'block',
  width: '100%',

  textAlign: 'center',

  fontSize: '15px',
  lineHeight: 1.67,
  fontWeight: 'normal',
  color: palette.textBlack.toString(),
});

const ErrorIcon = styled(FaIcon)({
  color: palette.error.toString(),
  fontSize: '35px',
});

const ErrorContent = styled.div({
  paddingTop: '6px',
  height: '22px',
  fontSize: '15px',
  fontWeight: 500,
  fontStretch: 'normal',
  fontStyle: 'normal',
  lineHeight: 'normal',
  letterSpacing: 'normal',
  color: palette.textBlack.toString(),
});

const ErrorDescription = styled.div({
  paddingTop: '12px',
  paddingBottom: '27px',
  height: '21.5px',
  fontSize: '13px',
  lineHeight: 1.54,
  color: palette.textGray.toString(),
});

export interface Props {
  readonly zIndex: number;
}

const backgroundAlpha: number = 0.45;

const DXF2RasterProcessingFailPopup: FC<Props> = (props) => {
  const dispatch: Dispatch<Action> = useDispatch();
  const [l10n]: UseL10n = useL10n();

  const { zIndex }: Props = props;

  const onCloseClick: () => void = () => {
    dispatch(CloseContentPagePopup());
  };

  const onPreviousClick: () => void = () => {
    dispatch(OpenContentPagePopup({
      popup: T.ContentPagePopupType.DESIGN_UPLOAD,
    }));
  };

  return (
    <Popup
      title={l10n(Text.title)}
      alpha={backgroundAlpha}
      zIndex={zIndex}
      onCloseClick={onCloseClick}
    >
      <Root>
        <Description data-testid='dxf-to-raster-processing-fail-description'>
          <ErrorIcon faNames='exclamation-triangle' />
          <ErrorContent>
            {l10n(Text.errorContent)}
          </ErrorContent>
          <ErrorDescription>
            {l10n(Text.errorDescription)}
          </ErrorDescription>
        </Description>
        <ButtonWrapper>
          <CancelButton onClick={onPreviousClick}>
            {l10n(Text.previous)}
          </CancelButton>
          <ConfirmButton onClick={onCloseClick}>
            {l10n(Text.confirm)}
          </ConfirmButton>
        </ButtonWrapper>
      </Root>
    </Popup>
  );
};

export default memo(DXF2RasterProcessingFailPopup);
