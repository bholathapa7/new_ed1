import {
  ChangeEventHandler, Dispatch, KeyboardEventHandler, MouseEventHandler,
  MutableRefObject, SetStateAction, useCallback, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { UseState, useClickOutside } from '.';

export interface UseEditableTextParams {
  defaultText: string;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  hasError?: boolean;
  hasCustomUseClickOutside?: boolean;
  handleTextSave(): void;
}

export interface UseEditableTextOutput {
  textRef: MutableRefObject<HTMLParagraphElement | null>;
  editingTextRef: MutableRefObject<HTMLInputElement | null>;
  editingText: string;
  setEditingText: Dispatch<SetStateAction<string>>;
  handleTextChange: ChangeEventHandler;
  handleTextKeyPress: KeyboardEventHandler;
  handleTextInputClick: MouseEventHandler;
  handleTextDivClick: MouseEventHandler;
}

export function useEditableText({
  handleTextSave,
  defaultText,
  isEditing,
  setIsEditing,
  hasError = false,
  hasCustomUseClickOutside,
}: UseEditableTextParams): UseEditableTextOutput {
  const [editingText, setEditingText]: UseState<string> = useState<string>(defaultText);
  const textRef: MutableRefObject<HTMLParagraphElement | null> = useRef(null);
  const editingTextRef: MutableRefObject<HTMLInputElement | null> = useRef(null);

  useClickOutside<HTMLInputElement>({ ref: editingTextRef, callback: () => {
    if (isEditing && !hasCustomUseClickOutside) {
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      handleTextSave?.();
    }
  } });

  useLayoutEffect(() => {
    if (isEditing) {
      editingTextRef.current?.select();
    }
  }, [isEditing]);

  const handleTextChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => setEditingText(e.currentTarget.value), []);

  const handleTextKeyPress: KeyboardEventHandler = useCallback((e) => {
    if (e.key === 'Enter' && !hasError) {
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      handleTextSave?.();
    }
  }, [hasError, handleTextSave]);

  const handleTextInputClick: MouseEventHandler = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const handleTextDivClick: MouseEventHandler = useCallback((e) => {
    e.stopPropagation();
    setEditingText(defaultText);
    setIsEditing(true);
  }, [defaultText]);

  return useMemo(() => ({
    textRef,
    editingTextRef,
    editingText,
    setEditingText,
    handleTextChange,
    handleTextKeyPress,
    handleTextInputClick,
    handleTextDivClick,
  }), [textRef, editingTextRef, editingText, setEditingText, handleTextChange, handleTextKeyPress, handleTextInputClick, handleTextDivClick]);
}
