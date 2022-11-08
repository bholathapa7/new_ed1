import React, { FC, ReactNode, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { ConfirmButton, DeleteButton } from '^/components/atoms/Buttons';
import Popup from '^/components/molecules/Popup';
import dsPalette from '^/constants/ds-palette';
import { UseDeleteScreen, UseL10n, UseLastSelectedScreen, UseState, useDeleteScreen, useL10n, useLastSelectedScreen } from '^/hooks';
import { CloseContentPagePopup } from '^/store/duck/Pages/Content';
import * as T from '^/types';
import { ApplyOptionIfKorean, GetCommonFormat, formatWithOffset } from '^/utilities/date-format';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
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

const LongDeleteButton = styled(DeleteButton)({
  width: 'auto',
  whiteSpace: 'nowrap',
  padding: '0px 24px',
});

export interface Props {
  readonly zIndex: number;
  readonly type: T.ContentPagePopupType.OVERWRITE_SCREEN | T.ContentPagePopupType.DELETE_SCREEN;
}

const backgroundAlpha: number = 0.45;

export const WarningPopup: FC<Props> = ({ zIndex, type }) => {
  const timezoneOffset: T.CommonPageState['timezoneOffset'] = useSelector((state: T.State) => state.Pages.Common.timezoneOffset);
  const [l10n, lang]: UseL10n = useL10n();
  const [isConfirmed, setIsConfirmed]: UseState<boolean> = useState(false);
  const dispatch: Dispatch = useDispatch();
  const deleteScreen: UseDeleteScreen = useDeleteScreen();

  const lastSelectedScreen: UseLastSelectedScreen = useLastSelectedScreen();
  if (lastSelectedScreen === undefined) return null;

  const onClose: () => void = () => {
    dispatch(CloseContentPagePopup());
  };
  const handleWarning: () => void = () => {
    setIsConfirmed(true);
  };

  const handleConfirm: () => void = () => {
    switch (type) {
      case T.ContentPagePopupType.DELETE_SCREEN:
        deleteScreen(lastSelectedScreen.id);
        dispatch(CloseContentPagePopup());
        break;
      case T.ContentPagePopupType.OVERWRITE_SCREEN:
        deleteScreen(lastSelectedScreen.id);
        dispatch(CloseContentPagePopup());
        break;
      default:
        exhaustiveCheck(type);
    }
  };

  const confirmButton: ReactNode = !isConfirmed ? (
    <ConfirmButton onClick={handleWarning} data-testid='warning-button'>
      {l10n(Text.button.action[type])}
    </ConfirmButton>
  ) : (
    <LongDeleteButton onClick={handleConfirm} data-testid='confirm-button'>
      {l10n(Text.submit)}
    </LongDeleteButton>
  );

  const screenDate: ReactNode = (
    <strong>
      {formatWithOffset(timezoneOffset, lastSelectedScreen.appearAt, GetCommonFormat({ lang, hasDay: true }), ApplyOptionIfKorean(lang))}
    </strong>
  );

  const screenTitle: string = lastSelectedScreen.title;

  return (
    <Popup
      title={l10n(Text.title[type])}
      alpha={backgroundAlpha}
      zIndex={zIndex}
      onCloseClick={onClose}
      warningType={type}
    >
      <Root>
        <Description>
          {l10n(Text.description.first[type])}
          <br />
          "{screenDate}{` | ${screenTitle}`}"
          {l10n(Text.description.second[type])}
        </Description>
        {confirmButton}
      </Root>
    </Popup>
  );
};
