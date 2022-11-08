import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import WarningSVG from '^/assets/icons/editable-text/warning.svg';
import { EditableText, Props as EditableTextProps } from '^/components/atoms/EditableText';
import { CANCELLABLE_CLASS_NAME } from '^/components/molecules/CreatingVolumeClickEventHandler';
import palette from '^/constants/palette';
import {
  QueryScreenWithTitleAndDate, UseEditableTextOutput, UseL10n, UseLastSelectedScreen,
  UseState, useEditableText, useGetScreenOf, useL10n,
  useLastSelectedScreen, usePrevProps, useRole, useWindowSize,
} from '^/hooks';
import { OpenContentPagePopup } from '^/store/duck/Pages';
import { PatchScreen } from '^/store/duck/Screens';
import * as T from '^/types';
import { isAllowScreenTitleChange } from '^/utilities/role-permission-check';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { Fallback } from './fallback';
import Text from './text';


export const EditableScreenTextRoot = styled.div.attrs({
  className: CANCELLABLE_CLASS_NAME,
})<{ isSidebarShown: boolean }>(({ isSidebarShown }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: '365px',
  height: '24px',
  marginLeft: isSidebarShown ? '385px' : '18px',
  marginRight: '8px',
}));

const ErrorParagraph = styled.p({
  fontSize: 11,
  fontWeight: 500,
  fontStretch: 'normal',
  fontStyle: 'normal',
  lineHeight: 'normal',
  letterSpacing: 'normal',
  marginLeft: 3,
  color: palette.EditableText.errorText.toString(),
});

const WarningIcon = styled(WarningSVG)<{ isOverBreakpoint: boolean }>(({ isOverBreakpoint }) => ({
  // eslint-disable-next-line no-magic-numbers
  marginLeft: isOverBreakpoint ? 7 : undefined,
  marginTop: 0.5,
  transform: 'scale(0.75)',
  minWidth: 20,
  width: 20,
}));


const ERROR_MSG_RESPONSIVE_BREAKPOINT: number = 1100;

export const RawTopBarScreenTitle: FC = () => {
  const patchScreensStatus: T.APIStatus = useSelector((s: T.State) => s.Screens.patchScreensStatus);
  const isSidebarShown: T.ContentsPageState['showSidebar'] = useSelector((s: T.State) => s.Pages.Contents.showSidebar);

  const dispatch: Dispatch = useDispatch();

  const lastSelectedScreen: UseLastSelectedScreen = useLastSelectedScreen();
  const lastSelectedScreenText: string | undefined = lastSelectedScreen?.title !== undefined ? lastSelectedScreen.title : '';
  const checkDuplicateTitles: QueryScreenWithTitleAndDate = useGetScreenOf(T.ScreensQueryParam.TITLE_AND_DATE);

  const [l10n]: UseL10n = useL10n();
  const role: T.PermissionRole = useRole();
  const [hasError, setError]: UseState<Readonly<boolean>> = useState(false);
  const [isEditing, setIsEditing]: UseState<Readonly<boolean>> = useState(false);
  const [windowX]: Readonly<[number, number]> = useWindowSize();
  const prevEditing: boolean | undefined = usePrevProps(isEditing);

  const {
    editingText,
    setEditingText,
    ...otherProps
  }: UseEditableTextOutput = useEditableText({
    handleTextSave, defaultText: lastSelectedScreenText, isEditing, setIsEditing,
  });

  useEffect(() => {
    if (isEditing && !isAllowScreenTitleChange(role)) {
      dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));

      return;
    }
  }, [isEditing]);

  useEffect(() => {
    if (!lastSelectedScreen) return;

    const trimmedEditingText: string = editingText.trim();

    if (trimmedEditingText !== lastSelectedScreenText && checkDuplicateTitles(trimmedEditingText, lastSelectedScreen.appearAt)) setError(() => true);
    else setError(() => false);
  }, [editingText]);

  function handleTextSave(): void {
    if (!lastSelectedScreen) return;
    const trimmedEditingText: string = editingText.trim();

    if (hasError) {
      setError(() => false);
      setIsEditing(false);

      return;
    }

    if (trimmedEditingText.length && lastSelectedScreenText !== trimmedEditingText) {
      dispatch(PatchScreen({ screenId: lastSelectedScreen.id, title: editingText }));
    }
    setIsEditing(false);
  }

  const editableTextProps: EditableTextProps = {
    ...otherProps,
    isTextEditing: isEditing,
    editingText,
    hasError,
    fromUI: T.EditableTextUI.TOPBAR,
    placeholderText: lastSelectedScreenText,
    text: patchScreensStatus === T.APIStatus.PROGRESS && Boolean(prevEditing) ? editingText : lastSelectedScreenText,
    isTextEditable: true,
    isGenericName: false,
  };

  if (!lastSelectedScreen) return null;

  const isOverBreakpoint: boolean = ERROR_MSG_RESPONSIVE_BREAKPOINT < windowX;
  const errorMsg: ReactNode =
    hasError ?
      (<>
        <WarningIcon isOverBreakpoint={isOverBreakpoint} />
        {isOverBreakpoint ? <ErrorParagraph>{l10n(Text.error)}</ErrorParagraph> : null}
      </>) :
      null;

  return (
    <>
      <EditableScreenTextRoot isSidebarShown={isSidebarShown}>
        <EditableText {...editableTextProps} />
      </EditableScreenTextRoot>
      {errorMsg}
    </>
  );
};

export const TopBarScreenTitle: FC = withErrorBoundary(RawTopBarScreenTitle)(Fallback);
