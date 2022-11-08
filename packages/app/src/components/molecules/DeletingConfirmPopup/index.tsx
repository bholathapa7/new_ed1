import React, { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import BreakLineText from '^/components/atoms/BreakLineText';
import { ConfirmButton } from '^/components/atoms/Buttons';
import Popup from '^/components/molecules/Popup';
import palette from '^/constants/palette';
import { UseL10n, useL10n } from '^/hooks';
import { DeleteContent, contentsSelector } from '^/store/duck/Contents';
import { DeleteESSContent } from '^/store/duck/ESSContents';
import { ChangeEditingContent, CloseContentPagePopup } from '^/store/duck/Pages';
import * as T from '^/types';
import { contentTexts } from '^/utilities/content-util';
import { L10nDictionaryWithArray, changeWordsOrderOnLang } from '^/utilities/l10n';
import Text from './text';


const Root =
  styled.div({
    width: '313px',

    padding: '35px 50px 35px 50px',

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  });
Root.displayName = 'Body';

const Description =
  styled.p({
    marginBottom: '30px',

    width: '100%',

    textAlign: 'left',
    lineHeight: 1.6,
    fontSize: '15px',
    fontWeight: 500,
    color: palette.textBlack.toString(),
  });
Description.displayName = 'Description';


const BG_ALPHA: number = 0.63;

const getDescription: (params: {
  isProcessingOrFailed: boolean;
  contentType: T.Content['type'];
}) => L10nDictionaryWithArray = ({ isProcessingOrFailed, contentType }) => {
  if (isProcessingOrFailed) return Text.description.uploading;
  const isInMapTab: boolean = T.DSMorMapContentTypes.includes(contentType);
  if (isInMapTab) {
    return Text.description[contentType as T.DSMorMapContent['type']];
  }

  return Text.description.default;
};

export interface Props {
  readonly zIndex: number;
}

const DeletingConfirmPopup: FC<Props> = ({ zIndex }) => {
  const {
    Pages: { Contents: { deletingContentId: contentId } },
    Contents: { contents: { byId: contents } },
  }: T.State
    = useSelector((state: T.State) => state);
  const dispatch: Dispatch = useDispatch();
  const [l10n, lang]: UseL10n = useL10n();

  const content: T.Content | undefined = contentId !== undefined ? contents[contentId] : undefined;

  if (content === undefined) {
    throw new Error('try to delete content which does not exist');
  }

  const isProcessingOrFailed: boolean = contentsSelector.isProcessingOrFailedByContent(content);
  const title: string = changeWordsOrderOnLang(l10n(contentTexts[content.type]), l10n(Text.title.delete), lang);
  const description: Array<string> = l10n(getDescription({ isProcessingOrFailed, contentType: content.type }));

  const onCloseClick: () => void = () => {
    dispatch(CloseContentPagePopup());
  };
  const handleDelete: () => void = useCallback(() => {
    if (contentId === undefined) {
      return;
    }

    dispatch(ChangeEditingContent({}));
    dispatch(CloseContentPagePopup());

    switch (content.type) {
      case T.ContentType.ESS_MODEL:
      case T.ContentType.ESS_ARROW:
      case T.ContentType.ESS_POLYGON:
      case T.ContentType.ESS_POLYLINE:
      case T.ContentType.ESS_TEXT: {
        dispatch(DeleteESSContent({ id: contentId }));
        break;
      }
      default: {
        dispatch(DeleteContent({ contentId }));
      }
    }
  }, [contentId, content.type]);

  return (
    <Popup
      alpha={BG_ALPHA}
      title={title}
      zIndex={zIndex}
      hasBlur={true}
      onCloseClick={onCloseClick}
    >
      <Root>
        <Description>
          <BreakLineText>{description}</BreakLineText>
        </Description>
        <ConfirmButton onClick={handleDelete}>
          {l10n(Text.deleteButtonLabel)}
        </ConfirmButton>
      </Root>
    </Popup>
  );
};

export default DeletingConfirmPopup;
