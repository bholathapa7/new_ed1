import React, { FC } from 'react';

import UncheckSvg from '^/assets/icons/contents-list/uncheck.svg';
import { ContentIcon, FeatureWrapper, Root, SelectionBox, TitleWrapper } from '^/components/atoms/ContentsListItem';
import { CheckBox } from '^/components/atoms/ContentsListItemCheckbox';
import { Text, TextWrapper } from '^/components/atoms/EditableText';
import { NOT_ALLOWED_CLASS_NAME } from '^/hooks';
import * as T from '^/types';
import { getHasColor } from '^/utilities/annotation-content-util';

export const ContentsListItemFallback: FC<{ content: T.Content }> = ({ content }) => {
  const color: string | undefined = getHasColor(content.type) ? content.color.toString() : undefined;

  return (
    <Root
      className={NOT_ALLOWED_CLASS_NAME}
      id={`contentid-${content.id}`}
    >
      <SelectionBox>
        <CheckBox><UncheckSvg /></CheckBox>
        <ContentIcon contentType={content.type} color={color} />
        <TitleWrapper>
          <TextWrapper fromUI={T.EditableTextUI.CONTENT_TITLE} isTextEditable={false}>
            <Text fromUI={T.EditableTextUI.CONTENT_TITLE} hasText={true} isGenericName={false}>
              {content.title}
            </Text>
          </TextWrapper>
        </TitleWrapper>
        <FeatureWrapper />
      </SelectionBox>
    </Root>
  );
};
