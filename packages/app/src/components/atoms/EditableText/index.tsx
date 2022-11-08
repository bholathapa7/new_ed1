import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { FontFamily, MediaQuery } from '^/constants/styles';
import * as T from '^/types';
import React, { ChangeEventHandler, FC, KeyboardEventHandler, MouseEventHandler, MutableRefObject, ReactElement, ReactNode } from 'react';
import styled, { CSSObject } from 'styled-components';

import Tippy from '@tippyjs/react';
import { UseIsTextEllipsisActive, useIsTextEllipsisActive } from '^/hooks/useIsTextEllipsisActive';

type WithFromUI<U> = { fromUI: T.EditableTextUI } & U;

type StylesByUI = { [K in T.EditableTextUI]: {
  fontStyle: {
    fontSize: string;
    fontFamily?: string;
    color?: string;
  };
  textWrapperStyle?: CSSObject;
  textStyle?: CSSObject;
  inputStyle?: CSSObject;
}};

const stylesByUI: StylesByUI = {
  [T.EditableTextUI.INPUT_S]: {
    fontStyle: {
      fontSize: '12px',
    },
    textWrapperStyle: {
      left: 'unset',
      boxSizing: 'border-box',
      maxWidth: '133px',
      height: '24px',
      padding: '2px 4px 4px',
      borderRadius: '3px',
    },
    inputStyle: {
      boxSizing: 'border-box',
      width: '133px',
      height: '24px',
      padding: '2px 4px 4px',
      borderRadius: '3px',
    },
  },
  [T.EditableTextUI.INPUT_L]: {
    fontStyle: {
      fontSize: '12px',
    },
    textWrapperStyle: {
      left: 'unset',
      boxSizing: 'border-box',
      maxWidth: '167px',
      height: '22px',
      padding: '1px 4px 3.5px',
      borderRadius: '3.5px',
    },
    inputStyle: {
      boxSizing: 'border-box',
      width: '167px',
      height: '22px',
      padding: '1px 4px 3.5px',
      borderRadius: '3.5px',
    },
  },
  [T.EditableTextUI.GROUP_TITLE]: {
    fontStyle: {
      fontSize: '15px',
    },
    textWrapperStyle: {
      boxSizing: 'border-box',
      height: '32px',
    },
    inputStyle: {
      boxSizing: 'border-box',
      height: '32px',
    },
  },
  [T.EditableTextUI.CONTENT_TITLE]: {
    fontStyle: {
      fontSize: '14px',
    },
    textWrapperStyle: {
      boxSizing: 'border-box',
      height: '32px',
    },
    inputStyle: {
      boxSizing: 'border-box',
      height: '32px',
    },
  },
  [T.EditableTextUI.OL_CONTENT_TITLE]: {
    fontStyle: {
      fontSize: '10px',
    },
    textWrapperStyle: {
      boxSizing: 'border-box',
      height: '23px',
      padding: '4px',
    },
    inputStyle: {
      boxSizing: 'border-box',
      height: '23px',
      padding: '4px',
    },
  },
  [T.EditableTextUI.TOPBAR]: {
    fontStyle: {
      fontSize: '15px',
    },
    textWrapperStyle: {
      boxSizing: 'border-box',
      height: '24px',
      padding: '0 3.5px 2.5px',
    },
    inputStyle: {
      boxSizing: 'border-box',
      height: '24px',
      padding: '0 3.5px 2.5px',
    },
  },
  [T.EditableTextUI.MARKER_PINPOINTER_MAP]: {
    fontStyle: {
      fontFamily: `${FontFamily.ROBOTO}, ${FontFamily.NOTOSANS}`,
      fontSize: '11px',
    },
    textWrapperStyle: {
      width: 'auto',

      position: 'relative',

      boxSizing: 'border-box',
      height: '19px',
      marginLeft: '6px',
      marginRight: '8px',
      padding: '1px 0 0 0',
      top: '35%',
    },
    inputStyle: {
      width: 'auto',
      boxSizing: 'border-box',
      height: '19px',
      marginLeft: '6px',
      marginRight: '4px',

      padding: '3.5px 0 3.5px 2.5px',
    },
    textStyle: {
      lineHeight: '20px',
    },
  },
  [T.EditableTextUI.MARKER_PINPOINTER_SIDEBAR]: {
    fontStyle: {
      fontSize: '18px',
      fontFamily: `${FontFamily.ROBOTO}, ${FontFamily.NOTOSANS}`,
      color: 'var(--color-theme-primary-lighter)',

      [MediaQuery[T.Device.MOBILE_L]]: {
        fontSize: '14px',
      },
    },
    textWrapperStyle: {
      width: 'auto',

      position: 'relative',

      maxWidth: 'fit-content',

      boxSizing: 'border-box',
      height: '25px',
      marginLeft: '4.5px',
      marginRight: '4.5px',
      padding: '0 4.5px 0 4.5px',
      top: '50%',

      ':hover' : {
        backgroundColor: undefined,
      },
    },
    inputStyle: {
      width: '93.5%',
      boxSizing: 'border-box',
      height: '25px',
      marginLeft: '4.5px',
      marginRight: '4px',
      marginTop: '3px',

      padding: '0 4.5px 0 4.5px',
    },
    textStyle: {
      width: '130px',
      lineHeight: 1.5,
    },
  },
};


export const TextWrapper = styled.div<WithFromUI<{
  isTextEditable: boolean;
  isDisabled?: boolean;
}>>(({ isTextEditable, fromUI, isDisabled = false }) => ({
  position: 'absolute',

  left: 0,
  top: '50%',
  transform: 'translateY(-50%)',

  maxWidth: '100%',

  padding: '6px',

  borderRadius: '4px',

  cursor: isTextEditable ? 'text' : 'unset',

  ':hover': isTextEditable && !isDisabled ? {
    backgroundColor: palette.ContentsList.titleHoverGray.toString(),

    '> p': {
      color: dsPalette.title.toString(),
    },

    '> :after': {
      content: '\' \'',

      width: '100%',
      position: 'absolute',
      left: 0,
      bottom: '-0.4px',

      borderBottom: `thin solid ${dsPalette.title.toString()}`,
    },
  } : undefined,

  ...stylesByUI[fromUI]?.textWrapperStyle,
}));

export const Text = styled.p<WithFromUI<{ hasText: boolean; isGenericName: boolean; isDisabled?: boolean }>>({
  position: 'relative',
  lineHeight: 'normal',
}, ({ fromUI, hasText, isGenericName, isDisabled = false }) => ({
  color: (() => {
    if (isDisabled) return palette.disabledFont.toString();
    if (hasText) return dsPalette.title.toString();

    return palette.CalendarScreen.placeholder.toString();
  })(),

  ...stylesByUI[fromUI].fontStyle,

  ...(isGenericName ? {} : {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  }),

  ...stylesByUI[fromUI]?.textStyle,
}));

interface TextInputProps {
  hasError: boolean;
}

const TextInput = styled.input<WithFromUI<TextInputProps>>(({ hasError, fromUI }: WithFromUI<TextInputProps>) => ({
  ...stylesByUI[fromUI].fontStyle,

  width: '100%',

  padding: '6px',

  color: dsPalette.title.toString(),
  backgroundColor: palette.ContentsList.titleHoverGray.toString(),
  borderRadius: '4px',

  ...(hasError ? {
    color: palette.EditableText.errorText.toString(),
    backgroundColor: palette.EditableText.errorBackground.toString(),
  } : {}),

  ...stylesByUI[fromUI]?.inputStyle,
}));


const CONTENT_TITLE_MAX_LENGTH: number = 30;

export interface Props {
  readonly id?: string;
  readonly hasError?: boolean;
  readonly textRef?: MutableRefObject<HTMLParagraphElement | null>;
  readonly editingTextRef: MutableRefObject<HTMLInputElement | null>;
  readonly editingText: string;
  readonly placeholderText?: string;
  readonly text?: string;
  readonly isTextEditable?: boolean;
  readonly isTextEditing: boolean;
  readonly isGenericName?: boolean;
  readonly fromUI: T.EditableTextUI;
  readonly textTabIndex?: number;
  readonly isDisabled?: boolean;
  handleTextDivClick?: MouseEventHandler;
  handleTextKeyPress: KeyboardEventHandler;
  handleTextInputClick: MouseEventHandler;
  handleTextChange: ChangeEventHandler;
  handleKeyDown?: KeyboardEventHandler;
  handleFocus?(): void;
}

export const EditableText: FC<Props> = ({
  id,
  hasError = false,
  textRef,
  editingTextRef,
  editingText,
  text,
  placeholderText,
  handleTextInputClick,
  handleTextChange,
  handleTextKeyPress,
  handleTextDivClick,
  handleFocus,
  handleKeyDown,
  isTextEditable = true,
  isTextEditing,
  isGenericName = false,
  fromUI,
  textTabIndex,
  isDisabled = false,
}) => {
  const content: string = text !== undefined ? text : placeholderText !== undefined ? placeholderText : '';
  const [innerTextRef, isEllipsisActive]: UseIsTextEllipsisActive = useIsTextEllipsisActive(content);

  const plainText: ReactNode = (
    <TextWrapper
      id={id ? `${id}-text` : undefined}
      ref={textRef}
      tabIndex={textTabIndex}
      fromUI={fromUI}
      isTextEditable={isTextEditable}
      onClick={handleTextDivClick}
      onFocus={handleFocus}
      isDisabled={isDisabled}
    >
      <Text
        ref={innerTextRef}
        fromUI={fromUI}
        hasText={text !== undefined}
        isGenericName={isGenericName}
        isDisabled={isDisabled}
      >
        {content}
      </Text>
    </TextWrapper>
  );

  const plainTextTippyWrapper: ReactNode = T.TooltipAvailableEditableTextUI.includes(fromUI) ? (
    <Tippy
      offset={T.TIPPY_OFFSET}
      theme='angelsw'
      placement='bottom'
      arrow={false}
      content={content.length > CONTENT_TITLE_MAX_LENGTH ? `${content.substring(0, CONTENT_TITLE_MAX_LENGTH)}` : content}
      disabled={!isEllipsisActive}
    >
      {plainText as ReactElement<any>}
    </Tippy>
  ) : plainText;

  const editableText: ReactNode = isTextEditing ? (
    <TextInput
      id={id ? `${id}-input` : undefined}
      tabIndex={textTabIndex}
      ref={editingTextRef}
      maxLength={T.TooltipAvailableEditableTextUI.includes(fromUI) ? CONTENT_TITLE_MAX_LENGTH : undefined}
      fromUI={fromUI}
      value={editingText}
      placeholder={placeholderText}
      hasError={hasError}
      onClick={handleTextInputClick}
      onChange={handleTextChange}
      onKeyPress={handleTextKeyPress}
      onKeyDown={handleKeyDown}
    />
  ) : (
    plainTextTippyWrapper
  );

  return <>{editableText}</>;
};
