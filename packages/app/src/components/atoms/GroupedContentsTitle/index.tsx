import React, { FC, memo, useCallback, useEffect, useMemo, useState, MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import route from '^/constants/routes';
import {
  UseEditableTextOutput,
  UseState,
  useEditableText,
  useIsRoleX,
  useLastSelectedScreen,
  useRouteIsMatching,
} from '^/hooks';
import { PatchContent } from '^/store/duck/Contents';
import { PatchESSContent } from '^/store/duck/ESSContents';
import { CategoryToTabMapper, ChangeIsCreatingNewGroup, ChangeSelectedGroupId } from '^/store/duck/Groups';
import * as T from '^/types';
import { isRoleViewer } from '^/utilities/role-permission-check';
import { EditableText, Props as EditableTextProps } from '../EditableText';

export interface Props {
  readonly group: T.GroupContent;
  readonly isEditing?: boolean;
  readonly isPinned: boolean;
  readonly initialText: string;
  readonly fromUI: T.EditableTextUI;
}

/**
 * @function GroupedContentsTitle
 * @description Inner callbacks should not be memoized because it should capture `editingText` value on every render.
 */
export const GroupedContentsTitle: FC<Props> = memo(({
  group,
  isEditing = false,
  initialText,
  fromUI,
}) => {
  const dispatch: Dispatch = useDispatch();

  const projectId: T.Project['id'] | undefined = useSelector((s: T.State) => s.ProjectConfigPerUser.config?.projectId);
  const isCreatingNewGroup: T.GroupsState['isCreatingNewGroup'] = useSelector((s: T.State) => s.Groups.isCreatingNewGroup);
  const isOnSharePage: boolean = useRouteIsMatching(route.share.main);
  const isViewer: boolean = useIsRoleX(isRoleViewer);
  const lastSelectedScreen: T.Screen | undefined = useLastSelectedScreen();

  const [isTitleEditing, setIsTitleEditing]: UseState<Readonly<boolean>> = useState<Readonly<boolean>>(isCreatingNewGroup);

  // When a group has just been created,
  // automatically select them so that users can immediately create contents to it.
  useEffect(() => {
    if (isCreatingNewGroup) {
      dispatch(ChangeSelectedGroupId({ selectedGroupId: group.id, tab: CategoryToTabMapper[group.category] }));
    }
  }, []);

  useEffect(() => () => {
    const lastTitleBeforeUnmount: string | undefined = editingTextRef.current?.value;
    if (lastTitleBeforeUnmount !== undefined && lastTitleBeforeUnmount !== group.title && lastTitleBeforeUnmount.trim().length) {
      if (lastSelectedScreen === undefined) return;

      updateGroupName();
    }
  }, []);

  const handleTitleSave: () => void = () => {
    if (!editingText.trim().length) {
      setIsTitleEditing(false);
      dispatch(ChangeIsCreatingNewGroup({ isCreatingNewGroup: false }));

      return;
    }

    if (group.title !== editingText) {
      updateGroupName();
    }

    setIsTitleEditing(false);
    dispatch(ChangeIsCreatingNewGroup({ isCreatingNewGroup: false }));
  };

  const {
    editingTextRef,
    editingText,
    setEditingText,
    textRef,
    ...otherProps
  }: UseEditableTextOutput = useEditableText({
    handleTextSave: handleTitleSave,
    defaultText: group.title,
    isEditing: isTitleEditing,
    setIsEditing: setIsTitleEditing,
  });

  const updateGroupName: () => void = useCallback(() => {
    if (lastSelectedScreen === undefined || projectId === undefined) return;

    switch (group.category) {
      case T.ContentCategory.ESS: {
        dispatch(PatchESSContent({ content: { id: group.id, title: editingText } }));
        break;
      }
      default: {
        dispatch(PatchContent({ content: { id: group.id, title: editingText } }));
        break;
      }
    }
  }, [projectId, lastSelectedScreen?.id, group.id, editingText, group.category]);

  const handleTextDivClick: ((e: MouseEvent<HTMLDivElement>) => void) | undefined = useCallback((e) => {
    if (isOnSharePage || isViewer) return;
    if (isEditing) {
      e.stopPropagation();
    }

    setEditingText(group.title);
    setIsTitleEditing(true);
  }, [isOnSharePage, isViewer, isEditing, group.title]);

  const editableTextProps: EditableTextProps = useMemo(() => ({
    ...otherProps,
    editingTextRef, editingText,
    textRef,
    isTextEditable: !isOnSharePage,
    isTextEditing: isTitleEditing,
    fromUI,
    text: initialText,
    isGenericName: false,
    handleTextDivClick,
  }), [otherProps, editingTextRef, editingText, textRef, isOnSharePage, isTitleEditing, fromUI, initialText, handleTextDivClick]);

  return (
    <EditableText {...editableTextProps}>
      {initialText}
    </EditableText>
  );
});
