import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { ConfirmButton } from '^/components/atoms/Buttons';
import Popup from '^/components/molecules/Popup';
import dsPalette from '^/constants/ds-palette';
import { QueryContentWithId, UseL10n, useGetContentOf, useL10n } from '^/hooks';
import { CloseContentPagePopup } from '^/store/duck/Pages';
import * as T from '^/types';
import { contentTexts } from '^/utilities/content-util';
import Text from './text';

const Root = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  width: '313px',
  padding: '50px',
  paddingTop: '35px',
  paddingBottom: '35px',
  margin: '0 auto',
});

const Description = styled.h2({
  display: 'block',
  width: '100%',

  marginBottom: '35px',

  fontSize: '16px',
  lineHeight: 1.6,
  fontWeight: 'normal',
  color: dsPalette.title.toString(),
});

export interface Props {
  readonly zIndex: number;
}

const backgroundAlpha: number = 0.45;

const ProcessingFailedPopup: FC<Props> = ({ zIndex }) => {
  const [l10n]: UseL10n = useL10n();
  const dispatch: Dispatch = useDispatch();
  const contentId: T.Content['id'] | undefined = useSelector((state: T.State) => state.Pages.Contents.popup?.contentId);

  const getContentOfId: QueryContentWithId = useGetContentOf(T.ContentsQueryParam.ID);
  const content: T.Content | undefined = contentId === undefined ? undefined : getContentOfId(contentId, { processingOrFailed: true });
  if (content === undefined) return null;

  const contentTitle: T.Content['title'] = content.title;
  const isMapTabContents: boolean = T.MAP_TAB_CONTENTS.includes(content.type);

  const text: string = isMapTabContents ? l10n(contentTexts[content.type]) : contentTitle;

  const onCloseClick: () => void = () => dispatch(CloseContentPagePopup());

  return (
    <Popup
      title={`${text}${l10n(Text.title)}`}
      alpha={backgroundAlpha}
      zIndex={zIndex}
      onCloseClick={onCloseClick}
      warningType={T.ContentPagePopupType.PROCESSING_FAILED}
      headerStyle={{ width: '313px' }}
    >
      <Root>
        <Description>
          {`${l10n(Text.descriptionPrefix)}${text}${l10n(Text.description)}`}
        </Description>
        <ConfirmButton onClick={onCloseClick} data-testid='confirm-button'>
          {l10n(Text.submit)}
        </ConfirmButton>
      </Root>
    </Popup>
  );
};
export default ProcessingFailedPopup;
