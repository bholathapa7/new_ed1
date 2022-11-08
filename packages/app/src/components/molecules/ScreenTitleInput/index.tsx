import React, { KeyboardEvent, MouseEvent, ChangeEventHandler, FC, ReactNode, useEffect, useState } from 'react';
import styled, { CSSObject } from 'styled-components';

import CheckSVG from '^/assets/icons/editable-text/check.svg';
import WarningSVG from '^/assets/icons/editable-text/warning.svg';
import { EditableText, Props as EditableTextProps } from '^/components/atoms/EditableText';
import palette from '^/constants/palette';
import {
  QueryScreenWithTitleAndDate, UseEditableTextOutput, UseGetDefaultScreenTitle,
  UseState, useEditableText, useGetDefaultScreenTitle, useGetScreenOf,
} from '^/hooks';
import * as T from '^/types';
import { TEMP_SCREEN_ID } from '^/utilities/screen-util';


type StyleElementKey = 'root' | 'editableTextWrapper' | 'icon';
type StyleByUI = { [K in Props['size']]: CSSObject };
type StylesByUI = { [K in StyleElementKey]: StyleByUI };

const stylesByUI: StylesByUI = {
  root: {
    [T.CalendarScreenSize.S]: {
      boxSizing: 'border-box',

      height: '33px',

      padding: '5px 16.5px',
    },
    [T.CalendarScreenSize.M]: {
      boxSizing: 'border-box',

      height: '38px',

      padding: '7px 25px',
    },
  },

  editableTextWrapper: {
    [T.CalendarScreenSize.S]: {
      width: '133px',
      height: '24px',
    },
    [T.CalendarScreenSize.M]: {
      width: '167px',
      height: '24px',
    },
  },

  icon: {
    [T.CalendarScreenSize.S]: {},
    [T.CalendarScreenSize.M]: {},
  },
};

interface SizeProps {
  size: Props['size'];
}

const Root = styled.div<SizeProps>(({ size }) => ({
  position: 'relative',
  boxSizing: 'border-box',

  display: 'flex',
  justifyContent: 'space-between',

  backgroundColor: palette.white.toString(),
  borderBottom: `1px solid ${palette.CalendarScreen.divider.toString()}`,

  ...stylesByUI.root[size],
}));

const EditableTextWrapper = styled.div<SizeProps>(({ size }) => ({
  ...stylesByUI.editableTextWrapper[size],
}));

interface CheckProps {
  isChecked: boolean;
}

const CheckIcon = styled(CheckSVG)<CheckProps & SizeProps>(({ size, isChecked }: CheckProps & SizeProps) => ({
  cursor: 'pointer',

  '> g > path:nth-child(1)': isChecked ? {
    fill: 'var(--color-theme-primary)',
  } : undefined,
  '> g > path:nth-child(2)': isChecked ? {
    fill: palette.white.toString(),
  } : undefined,

  ':hover': !isChecked ? {
    '> g > path:nth-child(1)': {
      fill: 'var(--color-theme-primary)',
    },
    '> g > path:nth-child(2)': {
      fill: palette.white.toString(),
    },
  } : undefined,

  ...stylesByUI.icon[size],
}));

const WarningIcon = styled(WarningSVG)<SizeProps>(({ size }: SizeProps) => ({
  ...stylesByUI.icon[size],
}));


const SizeMap: { [K in Props['size']]: T.EditableTextUI } = ({
  [T.CalendarScreenSize.S]: T.EditableTextUI.INPUT_S,
  [T.CalendarScreenSize.M]: T.EditableTextUI.INPUT_L,
});

export interface Props {
  readonly size: Exclude<T.CalendarScreenSize, T.CalendarScreenSize.L>;
  readonly appearAt: T.Screen['appearAt'];
  readonly viewMode?: T.CalendarScreenTab;
  readonly title?: T.Screen['title'];
  readonly hasError?: boolean;
  readonly screenId?: T.Screen['id'];
  onTitleChange(title: string): void;
  onScreenPickerClose?(): void;
  onError?(hasError: boolean): void;
}

export const ScreenTitleInput: FC<Props> = ({
  size, appearAt, title, hasError, viewMode, screenId,
  onTitleChange, onScreenPickerClose, onError,
}) => {
  const getDefaultScreenTitle: UseGetDefaultScreenTitle = useGetDefaultScreenTitle();
  const getScreenByTitleAndDate: QueryScreenWithTitleAndDate = useGetScreenOf(T.ScreensQueryParam.TITLE_AND_DATE);
  const [isEditing, setIsEditing]: UseState<Readonly<boolean>> = useState<Readonly<boolean>>(false);

  // In order to not always reset the title to a default value,
  // because user might have been editing it and then come back to editing,
  // use the title from the prop as the default.
  const defaultTitle: string = title ?? getDefaultScreenTitle(appearAt);

  const {
    editingText,
    setEditingText,
    ...otherProps
  }: UseEditableTextOutput = useEditableText({ defaultText: defaultTitle, isEditing, setIsEditing, handleTextSave });

  // Update the title with the callback instead of
  // watching the editingText change because
  // the first value will trigger changes, which is not needed.
  const handleTextChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const changedText: string = e.currentTarget.value;
    setEditingText(changedText);
    onTitleChange(changedText);
  };

  const editableTextProps: EditableTextProps = {
    ...otherProps,
    isTextEditing: isEditing,
    text: title,
    placeholderText: defaultTitle,
    fromUI: SizeMap[size],
    editingText, hasError,
    handleTextDivClick,
    handleTextKeyPress,
    handleTextChange,
  };

  useEffect(() => {
    if (title !== undefined) {
      setEditingText(title);
      onTitleChange(title);

      const nextHasError: boolean = getScreenByTitleAndDate(title.trim(), appearAt) !== undefined;
      onError?.(nextHasError);
    }

    // When a screen has been selected, do not prompt editing
    // since editing is only for new screen.
    setIsEditing(screenId === undefined || screenId === TEMP_SCREEN_ID);
  }, [appearAt, viewMode]);

  useEffect(() => {
    const trimmedEditingText: string = editingText.trim();

    if (trimmedEditingText.length) {
      onError?.(getScreenByTitleAndDate(editingText.trim(), appearAt) !== undefined);
    }
  }, [editingText]);

  function handleTextKeyPress(e: KeyboardEvent<HTMLDivElement>): void {
    if (e.key === 'Enter' && !hasError) {
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      handleTextSave?.();
      onScreenPickerClose?.();
    }
  }

  function handleTextDivClick(e: MouseEvent<HTMLDivElement>): void {
    e.stopPropagation();
    setIsEditing(true);

    const placeholder: string = title === undefined ? defaultTitle : title;
    setEditingText(placeholder);
    onTitleChange(placeholder);
  }

  function handleTextSave(): void {
    if (hasError) {
      const placeholder: string = title === undefined ? defaultTitle : title;
      setEditingText(placeholder);
      onTitleChange(placeholder);

      setIsEditing(false);

      return;
    }

    if (editingText.trim().length) {
      onTitleChange(editingText);
    } else {
      onTitleChange(defaultTitle);
    }

    setIsEditing(false);
  }

  function handleCheckIconClick(): void {
    onTitleChange(title === undefined ? defaultTitle : title);
    onScreenPickerClose?.();
  }

  const icon: ReactNode = hasError ? (
    <WarningIcon size={size} />
  ) : (
    <CheckIcon
      size={size}
      isChecked={title !== undefined}
      onClick={handleCheckIconClick}
    />
  );

  return (
    <Root size={size}>
      <EditableTextWrapper size={size}>
        <EditableText {...editableTextProps} />
      </EditableTextWrapper>
      {icon}
    </Root>
  );
};
