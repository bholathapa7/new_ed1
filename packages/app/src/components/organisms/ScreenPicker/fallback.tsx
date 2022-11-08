import React, { FC, useCallback, MouseEvent, ReactNode } from 'react';

import { ScreenPickerTab } from '^/components/atoms/ScreenPickerTab';
import { SidebarHeaderTab } from '^/components/molecules/SidebarHeaderTab';
import { DateScreenList } from '^/components/organisms/DateScreenList';
import { ErrorText, NOT_ALLOWED_CLASS_NAME, defaultToastErrorOption, useInitialToast } from '^/hooks';
import * as T from '^/types';
import { InnerRoot, ListView, Props, Root } from './';


export const Fallback: FC<Props> = ({ size }) => {
  useInitialToast({
    type: T.Toast.ERROR,
    content: {
      title: ErrorText.screenPicker.title,
      description: ErrorText.screenPicker.description,
    },
    option: defaultToastErrorOption,
  });

  const emptyMethod: () => void = useCallback(() => {}, []);
  const handleClickCapture: (e: MouseEvent<HTMLDivElement>) => void = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const screenPickerTab: ReactNode = T.CalendarScreenSize.L === size ? (
    <SidebarHeaderTab
      onTabClick={emptyMethod}
      viewMode={T.CalendarScreenTab.LIST}
    />
  ) : (
    <ScreenPickerTab
      onTabClick={emptyMethod}
      viewMode={T.CalendarScreenTab.LIST}
      size={size}
    />
  );

  const dateScreenList: ReactNode = (
    <DateScreenList
      size={size}
      dates={[]}
      onScreenClick={emptyMethod}
      onClose={emptyMethod}
    />
  );

  return (
    <Root size={size} isButtonShown={false} onClickCapture={handleClickCapture} className={NOT_ALLOWED_CLASS_NAME}>
      {screenPickerTab}
      <InnerRoot>
        <ListView size={size}>
          {dateScreenList}
        </ListView>
      </InnerRoot>
    </Root>
  );
};
