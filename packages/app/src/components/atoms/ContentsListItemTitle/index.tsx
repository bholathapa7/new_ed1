import React, { FC, useCallback, useEffect, useState, MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';

import route from '^/constants/routes';
import {
  UseEditableTextOutput, UseL10n, UseShouldContentDisabled, UseState,
  useEditableText, useIsRoleX, useL10n, useRouteIsMatching, useShouldContentDisabled, isESSContent,
} from '^/hooks';
import { PatchContent } from '^/store/duck/Contents';
import { PatchESSContent } from '^/store/duck/ESSContents';
import * as T from '^/types';
import { getContentTitle } from '^/utilities/annotation-content-util';
import { isRoleViewer } from '^/utilities/role-permission-check';
import { EditableText, Props as EditableTextProps } from '../EditableText';

export interface Props {
  readonly content: T.Content;
  readonly isEditing?: boolean;
  readonly fromUI: T.EditableTextUI;
}

export const ContentsListItemTitle: FC<Props> = ({
  content, isEditing = false, fromUI,
}) => {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();
  const isOnSharePage: boolean = useRouteIsMatching(route.share.main);
  const isViewer: boolean = useIsRoleX(isRoleViewer);
  const shouldContentDisabled: UseShouldContentDisabled = useShouldContentDisabled(content.type);

  const [isTitleEditing, setIsTitleEditing]: UseState<Readonly<boolean>> = useState<Readonly<boolean>>(false);

  const title: string = getContentTitle(content, l10n);
  const isTitleEditable: boolean = !T.DSMorMapContentTypes.includes(content.type);

  const updateTitle: (newTitle: string) => void = useCallback((newTitle) => {
    if (isESSContent(content)) {
      dispatch(PatchESSContent({ content: { id: content.id, title: newTitle } }));
    } else {
      dispatch(PatchContent({ content: { id: content.id, title: newTitle } }));
    }
  }, [content.type]);

  useEffect(() => () => {
    const lastTitleBeforeUnmount: string | undefined = editingTextRef.current?.value;
    if (lastTitleBeforeUnmount !== undefined && lastTitleBeforeUnmount !== content.title && lastTitleBeforeUnmount.trim().length) {
      updateTitle(lastTitleBeforeUnmount);
    }
  }, [updateTitle]);

  const handleTitleSave: () => void = () => {
    if (!editingText.trim().length) {
      setIsTitleEditing(false);

      return;
    }

    if (content.title !== editingText) {
      updateTitle(editingText);
    }
    setIsTitleEditing(false);
  };

  const handleTextDivClick: ((e: MouseEvent<HTMLDivElement>) => void) | undefined =
    !shouldContentDisabled && isTitleEditable && !isOnSharePage && !isViewer ? (e) => {
      if (isEditing) {
        e.stopPropagation();
      }

      setEditingText(content.title);
      setIsTitleEditing(true);
    } : undefined;

  const {
    editingTextRef,
    editingText,
    setEditingText,
    ...otherProps
  }: UseEditableTextOutput = useEditableText({
    handleTextSave: handleTitleSave,
    defaultText: content.title,
    isEditing: isTitleEditing,
    setIsEditing: setIsTitleEditing,
  });

  const editableTextProps: EditableTextProps = {
    ...otherProps,
    editingTextRef, editingText,
    isTextEditable: isTitleEditable,
    isTextEditing: isTitleEditing,
    fromUI,
    text: title,
    isGenericName: T.DSMorMapContentTypes.includes(content.type),
    handleTextDivClick,
    isDisabled: shouldContentDisabled,
  };

  return (
    <EditableText {...editableTextProps}>
      {title}
    </EditableText>
  );
};
