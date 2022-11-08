import React, { FC } from 'react';

import { NewScreen } from '^/components/organisms/ScreenPicker';
import * as T from '^/types';
import { ScreenList } from '../ScreenList';
import { ScreenTitleInput } from '../ScreenTitleInput';

export interface Props {
  readonly size: Exclude<T.CalendarScreenSize, T.CalendarScreenSize.L>;
  readonly appearAt?: Date;
  readonly viewMode?: T.CalendarScreenTab;
  readonly title?: T.Screen['title'];
  readonly clickedScreenId?: T.Screen['id'];
  readonly hasError?: boolean;
  readonly isListShown?: boolean;
  readonly screenId?: T.Screen['id'];
  onNewScreenChange(newScreen: NewScreen): void;
  onScreenClick?(screen: T.Screen): void;
  onClose?(): void;
  onError?(hasError: boolean): void;
}

export const ScreenListWithInput: FC<Props> = ({
  size, appearAt, title, clickedScreenId, hasError, viewMode, screenId,
  onNewScreenChange, onScreenClick, onClose, onError,

  isListShown = true,
}) => {
  if (appearAt === undefined) return null;
  if (!isListShown) return null;

  const handleTitleChange: (title: T.Screen['title']) => void = (changedTitle) => {
    onNewScreenChange({ title: changedTitle, appearAt });
  };

  return (
    <>
      <ScreenTitleInput
        size={size}
        appearAt={appearAt}
        title={title}
        hasError={hasError}
        viewMode={viewMode}
        screenId={screenId}
        onTitleChange={handleTitleChange}
        onScreenPickerClose={onClose}
        onError={onError}
      />
      <ScreenList
        size={size}
        appearAt={appearAt}
        clickedScreenId={clickedScreenId}
        onScreenClick={onScreenClick}
        onError={onError}
      />
    </>
  );
};
