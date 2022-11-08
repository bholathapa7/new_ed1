import React, { FC, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { CSSObject } from 'styled-components';

import { SanitizedEditableText } from '^/components/atoms/SanitizedEditableText';

import { useContent } from '^/hooks';
import * as T from '^/types';
import {
  ESS_TEXT_EDITOR_ID,
  ESS_FONT_SIZES,
  ESS_DEFAULT_FONT_SIZE_INDEX,
  ESS_TEXT_ALPHA,
} from '^/constants/cesium';
import { PatchESSContent } from '^/store/duck/ESSContents';

export const CesiumESSTextEditor: FC = () => {
  const dispatch: Dispatch = useDispatch();
  const editingContentId: T.ContentsPageState['editingContentId'] = useSelector((s: T.State) => s.Pages.Contents.editingContentId);
  const content: T.ESSTextContent | undefined = useContent(
    editingContentId ?? NaN,
    (prev, next) => prev?.color.toString() === next?.color.toString() &&
      prev?.info.description === next?.info.description &&
      prev?.info.fontSize === next?.info.fontSize &&
      prev?.info.fontColor.toString() === next?.info.fontColor.toString() &&
      prev?.type !== next?.type
  );
  const text: string | undefined = useMemo(() => {
    if (!content || content.type !== T.ContentType.ESS_TEXT) {
      return;
    }

    return content.info.description;
  }, [content?.type, content?.info?.description]);

  const fontColor: string | undefined = useMemo(() => {
    if (!content || content.type !== T.ContentType.ESS_TEXT) {
      return;
    }

    return content.info.fontColor.toString();
  }, [content?.type, content?.info?.fontColor?.toString()]);

  const fontSize: number | undefined = useMemo(() => {
    if (!content || content.type !== T.ContentType.ESS_TEXT) {
      return;
    }

    return content.info.fontSize;
  }, [content?.type, content?.info?.fontSize]);

  const bgColor: string | undefined = useMemo(() => {
    if (!content || content.type !== T.ContentType.ESS_TEXT) {
      return;
    }

    if (content.color.alpha() === 0) {
      return content.color.toString();
    }

    return content.color.alpha(Math.min(content.color.alpha(), ESS_TEXT_ALPHA)).toString();
  }, [content?.type, content?.color?.toString()]);

  const customStyle: CSSObject = useMemo(() => ({
    display: 'none',
    fontSize: fontSize === undefined ? `${ESS_FONT_SIZES[ESS_DEFAULT_FONT_SIZE_INDEX]}px` : `${fontSize}px`,
    backgroundColor: bgColor,
    color: fontColor,
  }), [fontColor, fontSize, bgColor]);

  const onBlur: (editedText: string) => void = useCallback((editedText) => {
    if (content?.id === undefined) return;

    dispatch(PatchESSContent({
      content: {
        id: content?.id,
        info: { description: editedText },
      },
    }));
  }, [content?.id]);

  return (
    <SanitizedEditableText
      htmlId={ESS_TEXT_EDITOR_ID}
      text={text}
      customStyle={customStyle}
      onBlur={onBlur}
    />
  );
};
