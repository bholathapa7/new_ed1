/* eslint-disable max-lines */
import format from 'date-fns/format';
import { uniqBy as _uniqBy } from 'lodash-es';
import React, { FC, ReactNode, useEffect, useState, MouseEvent } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { useSelector } from 'react-redux';
import styled, { CSSObject } from 'styled-components';

import { CancelButton, ConfirmButton } from '^/components/atoms/Buttons';
import { Calendar, CalendarDropdownProps, CalendarStyleProps } from '^/components/atoms/Calendar';
import { ScreenPickerTab } from '^/components/atoms/ScreenPickerTab';
import { CANCELLABLE_CLASS_NAME } from '^/components/molecules/CreatingVolumeClickEventHandler';
import { ScreenList } from '^/components/molecules/ScreenList';
import { ScreenListWithInput } from '^/components/molecules/ScreenListWithInput';
import { SidebarHeaderTab } from '^/components/molecules/SidebarHeaderTab';
import { DateScreenList } from '^/components/organisms/DateScreenList';
import palette from '^/constants/palette';
import {
  UseGetDefaultScreenTitle, UseL10n, UseLastSelectedScreen, UseState,
  useGetDefaultScreenTitle, useL10n, useLastSelectedScreen,
} from '^/hooks';
import * as T from '^/types';
import { Formats } from '^/utilities/date-format';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { TEMP_SCREEN_ID, getFirstEmptyScreen } from '^/utilities/screen-util';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { DateScreenListWithInput } from '../DateScreenListWithInput';
import { Fallback } from './fallback';
import Text from './text';

const commonPopupCalendarStyle: Readonly<CSSObject> = {
  '-webkit-backdrop-filter': 'blur(30px)',
  backdropFilter: 'blur(30px)',
  boxShadow: '0 1px 8px 0 #00000033, 0 3px 4px 0 #0000002e, 0 2px 4px 0 #0000004a',
  overflow: 'hidden',
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  KhtmlUserSelect: 'none',
  MozUserSelect: 'none',
  MsUserSelect: 'none',
  userSelect: 'none',
};

/**
 * @warning `T.CalendarScreenSize.L` should only be used at ContentsSidebarHeader
 */
const getRootStyleBySize: (size: T.CalendarScreenSize, isButtonShown: boolean) => CSSObject = (size, isButtonShown) => {
  switch (size) {
    case T.CalendarScreenSize.S:
      return {
        width: '200px',
        height: isButtonShown ? '332px' : '264px',
        borderRadius: 4,
        ...commonPopupCalendarStyle,
      };
    case T.CalendarScreenSize.M:
      return {
        width: '250px',
        height: isButtonShown ? '470px' : '400px',
        borderRadius: 6,
        ...commonPopupCalendarStyle,
      };
    case T.CalendarScreenSize.L:
      return {
        width: '100%',
        height: '100%',
      };
    default:
      return exhaustiveCheck(size);
  }
};


const DropdownHeightBySize: { [K in T.CalendarScreenSize]: number } = {
  [T.CalendarScreenSize.S]: 23,
  [T.CalendarScreenSize.M]: 32,
  [T.CalendarScreenSize.L]: 32,
};

const flexColumn: CSSObject = {
  display: 'flex',
  flexDirection: 'column',
};

const CalendarStyle: { [K in T.CalendarScreenSize]: CalendarStyleProps['calendarStyle'] } = {
  [T.CalendarScreenSize.S]: {
    wrapperStyle: {
      borderBottom: `1px solid ${palette.CalendarScreen.divider.toString()}`,
    },
    rootStyle: {
      paddingBottom: '9px',
      textAlign: 'center',
    },
    cellStyle: { width: '19px', height: '19px', margin: '1px 2px', fontSize: '11px' },
  },
  [T.CalendarScreenSize.M]: {
    wrapperStyle: { borderBottom: `1px solid ${palette.CalendarScreen.divider.toString()}` },
    cellStyle: { width: '26px', height: '26px', margin: '1.85px 3.425px', fontSize: '12px' },
  },
  [T.CalendarScreenSize.L]: {
    wrapperStyle: { borderBottom: `1px solid ${palette.CalendarScreen.divider.toString()}` },
    cellStyle: { width: '26px', height: '26px', margin: '1.85px 3.425px', fontSize: '12px' },
  },
};

const DropdownStyle: { [K in T.CalendarScreenSize]: CalendarDropdownProps['dropdownStyle'] } = {
  [T.CalendarScreenSize.S]: {
    zIndex: 1,
    rootStyle: {
      width: '78px',
      paddingBottom: '10px',
      height: '23px',
      ':first-child': { paddingRight: 6 },
      ' button': {
        borderRadius: '4px !important',
        '> span': {
          fontSize: '12px !important',
        },
      },
    },
    dropdownWrapperStyle: {
      width: 'auto',
      padding: '0px 15px',
      justifyContent: 'center',
    },
  },
  [T.CalendarScreenSize.M]: {
    zIndex: 1,
    rootStyle: {
      width: '95px',
      paddingBottom: '19px',
      ':first-child': { paddingRight: 6 },
    },
    dropdownWrapperStyle: {
      width: 'auto',
      justifyContent: 'center',
    },
  },
  [T.CalendarScreenSize.L]: {
    zIndex: 1,
    rootStyle: {
      width: '112px',
      paddingBottom: '19px',
      ':first-child': { paddingRight: 6 },
    },
    dropdownWrapperStyle: {
      width: 'auto',
      justifyContent: 'center',
    },
  },
};

interface SizeProps {
  size: T.CalendarScreenSize;
}

interface ErrorProps {
  hasError: boolean;
}

export const Root = styled.div<SizeProps & { isButtonShown: boolean }>(({ size, isButtonShown }) => ({
  ...getRootStyleBySize(size, isButtonShown),
  ...flexColumn,
}));

export const InnerRoot = styled.div({
  ...flexColumn,
  width: '100%',
  flex: 1,
  overflow: 'hidden',
  backgroundColor: palette.white.toString(),
});
InnerRoot.displayName = 'ScreenPickerInnerRoot';

const getCalendarViewStyle: (size: T.CalendarScreenSize, isButtonShown: boolean) => CSSObject = (size, isButtonShown) => {
  switch (size) {
    case T.CalendarScreenSize.S:
      return {
        paddingTop: isButtonShown ? '0' : '10px',
      };
    case T.CalendarScreenSize.M:
    case T.CalendarScreenSize.L:
      return {
        paddingTop: isButtonShown ? '0' : '20px',
      };
    default:
      exhaustiveCheck(size);
  }
};

const CalendarView = styled.div.attrs<{ size: T.CalendarScreenSize }>(({ size }) => ({
  className: size === T.CalendarScreenSize.L ? CANCELLABLE_CLASS_NAME : '',
}))<{ size: T.CalendarScreenSize; isButtonShown: boolean }>(({ size, isButtonShown }) => ({
  flex: 1,
  ...flexColumn,

  textAlign: 'center',

  ...getCalendarViewStyle(size, isButtonShown),
}));
CalendarView.displayName = 'CalendarView';

const CalendarScreenList = styled.div({
  position: 'relative',
  flex: 1,
});
CalendarScreenList.displayName = 'CalendarScreenList';
/* To create scrollable area in Flex: 1 */
const CalendarScreenListInner = styled.div({
  position: 'absolute',
  left: '0',
  top: '0',
  width: '100%',
  height: '100%',
  overflowY: 'auto',
});
CalendarScreenListInner.displayName = 'CalendarScreenListInner';

export const ListView = styled.div.attrs<SizeProps>(({ size }) => ({
  className: size === T.CalendarScreenSize.L ? CANCELLABLE_CLASS_NAME : '',
}))<SizeProps>({
  flex: 1,
});
ListView.displayName = 'ListView';

const Description = styled.div<ErrorProps>(({ hasError }) => ({
  fontSize: '12px',
  padding: '11px 0px 9px 0px',
  whiteSpace: 'nowrap',
  fontWeight: 'bold',
  textAlign: 'center',

  ...(hasError ? ({
    color: palette.EditableText.errorText.toString(),
  }) : undefined),
}));
Description.displayName = 'Description';

const ButtonWrapper = styled.div({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '12px',
  padding: '0px 12px 12px 12px',

  '> button': {
    height: '23px',
    fontSize: '9px',
    borderRadius: '4px',
  },

  '> button + button': {
    marginLeft: '3px',
  },
});
ButtonWrapper.displayName = 'ButtonWrapper';


export interface NewScreen {
  title?: T.Screen['title'];
  appearAt: T.Screen['appearAt'];
}

export interface Props {
  readonly size: T.CalendarScreenSize;
  readonly defaultViewMode?: T.CalendarScreenTab;
  readonly calendarType?: T.CalendarType;
  readonly currentScreenId?: T.Screen['id'];
  readonly newScreen?: NewScreen;
  readonly pickableScreens?: T.Screen[];
  readonly disabledScreens?: T.Screen[];
  readonly isDefaultDateShown?: boolean;
  readonly isEditable?: boolean;
  onChange?(screen: T.Screen): void;
  onNewScreenChange?(screen: NewScreen): void;
  onSubmit?(): void;
  onDismiss?(): void;
  onViewmodeChange?(viewMode: T.CalendarScreenTab): void;
  onClose?(): void;
  onError?(hasError: boolean): void;
}

export const RawScreenPicker: FC<Props> = ({
  size,
  currentScreenId,
  newScreen,
  pickableScreens,
  disabledScreens,
  onSubmit,
  onDismiss,
  onChange,
  onNewScreenChange,
  onViewmodeChange,
  onClose,
  onError,

  defaultViewMode = T.CalendarScreenTab.LIST,
  calendarType = T.CalendarType.SELECTED_DATE,
  isEditable = false,
  isDefaultDateShown = true,
}) => {
  const [l10n]: UseL10n = useL10n();

  const {
    Screens: {
      screens,
    },
  }: T.State = useSelector((state: T.State) => state);

  const lastSelectedScreen: UseLastSelectedScreen = useLastSelectedScreen();

  const defaultDate: T.Screen['appearAt'] | undefined = isDefaultDateShown ? (
    currentScreenId === TEMP_SCREEN_ID ? new Date() : lastSelectedScreen?.appearAt
  ) : undefined;

  const [currentDate, setCurrentDate]: UseState<Date | undefined> = useState<Date | undefined>(defaultDate);
  const [viewMode, setViewMode]: UseState<Readonly<T.CalendarScreenTab>> = useState<Readonly<T.CalendarScreenTab>>(defaultViewMode);
  const [isListShown, setIsListShown]: UseState<Readonly<boolean>> = useState<Readonly<boolean>>(true);
  const [hasError, setHasError]: UseState<Readonly<boolean>> = useState<Readonly<boolean>>(false);
  const getDefaultScreenTitle: UseGetDefaultScreenTitle = useGetDefaultScreenTitle();

  const disabledScreenIds: T.Screen['id'][] | undefined = disabledScreens?.map((screen) => screen.id);
  const rawEnabledScreens: T.Screen[] = pickableScreens !== undefined ? pickableScreens : screens;
  const enabledScreens: T.Screen[] =
    disabledScreenIds !== undefined ? rawEnabledScreens.filter((screen) => !disabledScreenIds.includes(screen.id)) : rawEnabledScreens;
  const enabledDates: Array<Date> = _uniqBy(enabledScreens, (screen) => format(screen.appearAt, Formats.YYYYMMDD))
    .map((screen) => screen.appearAt).sort((a, b) => b.valueOf() - a.valueOf());
  const disabledDates: T.Screen['appearAt'][] | undefined
    = disabledScreens !== undefined ? _uniqBy(disabledScreens.map((screen) => screen.appearAt), (date) => format(date, Formats.YYYYMMDD)) : undefined;

  const isButtonShown: boolean = Boolean(onSubmit) && Boolean(onDismiss);
  const isScreenClickable: boolean = Boolean(onChange);

  useEffect(() => {
    if (currentScreenId === undefined || currentScreenId === TEMP_SCREEN_ID) {
      // When user already selects an empty new screen from a different date,
      // do not reset to the default date. Instead, set to the new screen date.
      if (newScreen?.appearAt) {
        setCurrentDate(newScreen.appearAt);
      }

      return;
    }
    const isCurrentScreenDisabled: boolean = enabledScreens.find((s) => s.id === currentScreenId) === undefined;

    const firstAppearAtOrNew: Date = enabledScreens[0] !== undefined ? enabledScreens[0].appearAt : new Date();

    setCurrentDate(isCurrentScreenDisabled ? firstAppearAtOrNew : lastSelectedScreen?.appearAt);
  }, [lastSelectedScreen?.id]);

  useEffect(() => {
    if (!isDefaultDateShown) {
      return;
    }

    if (currentScreenId === TEMP_SCREEN_ID) {
      return;
    }

    setCurrentDate(lastSelectedScreen?.appearAt);
  }, [lastSelectedScreen?.appearAt]);

  useEffect(() => {
    setIsListShown(true);
  }, [currentDate]);

  useEffect(() => {
    onError?.(hasError);
  }, [hasError]);

  const handleDateChange: (day: Date) => void = (day) => {
    setCurrentDate(day);

    const firstEmptyScreen: T.Screen | undefined = getFirstEmptyScreen(enabledScreens, day);
    if (firstEmptyScreen) {
      onChange?.(firstEmptyScreen);
    } else {
      onNewScreenChange?.({ title: getDefaultScreenTitle(day), appearAt: day });
    }
  };

  const handleDropdownChange: (year: number, month: number) => void = (dropdownYear, dropdownMonth) => {
    if (currentDate === undefined || !lastSelectedScreen) return;

    const currentYear: number = lastSelectedScreen.appearAt.getFullYear();
    const currentMonth: number = lastSelectedScreen.appearAt.getMonth();

    const isSame: boolean = dropdownYear === currentYear && dropdownMonth === currentMonth;

    setIsListShown(isSame);

    if (isSame) {
      setCurrentDate(lastSelectedScreen.appearAt);
      handleDateChange(lastSelectedScreen.appearAt);
    }

    if (!isSame && T.CalendarScreenSize.L === size && isScreenClickable) {
      const autoSelectedScreen: T.Screen | undefined =
        enabledScreens.find((_screen) => _screen.appearAt.getFullYear() === dropdownYear && _screen.appearAt.getMonth() === dropdownMonth);

      if (autoSelectedScreen !== undefined) {
        onChange?.(autoSelectedScreen);
      }
    }
  };

  const handleTabClick: (tab: T.CalendarScreenTab) => void = (tab) => {
    if (tab === viewMode) return;

    setViewMode(() => tab);
    onViewmodeChange?.(tab);
  };

  const handleSubmit: (e: MouseEvent<HTMLButtonElement>) => void = () => {
    onSubmit?.();
  };
  const handleDismiss: (e: MouseEvent<HTMLButtonElement>) => void = () => {
    onDismiss?.();
  };
  const handleNewScreenTitleChange: (newScreen: NewScreen) => void = (screen) => {
    onNewScreenChange?.(screen);
  };

  const handleError: (hasError: boolean) => void = (changedHasError) => {
    setHasError(changedHasError);
  };

  const helpText: ReactNode = isButtonShown ? (
    <Description hasError={hasError}>{hasError ? l10n(Text.errorText) : l10n(Text.helpText)}</Description>
  ) : undefined;

  const screenList: ReactNode = isEditable ? (
    size !== T.CalendarScreenSize.L ? (
      <CalendarScreenList>
        <CalendarScreenListInner>
          <Scrollbars>
            <ScreenListWithInput
              size={size}
              title={newScreen?.title}
              appearAt={currentDate}
              clickedScreenId={currentScreenId}
              viewMode={viewMode}
              hasError={hasError}
              isListShown={isListShown}
              screenId={currentScreenId}
              onScreenClick={onChange}
              onNewScreenChange={handleNewScreenTitleChange}
              onClose={onClose}
              onError={handleError}
            />
          </Scrollbars>
        </CalendarScreenListInner>
      </CalendarScreenList>
    ) : undefined
  ) : (
    <CalendarScreenList>
      <CalendarScreenListInner>
        <Scrollbars>
          <ScreenList
            size={size}
            appearAt={currentDate}
            clickedScreenId={currentScreenId}
            isListShown={isListShown}
            onScreenClick={onChange}
            onClose={onClose}
          />
        </Scrollbars>
      </CalendarScreenListInner>
    </CalendarScreenList>
  );

  const dateScreenList: ReactNode = isEditable ? (
    size !== T.CalendarScreenSize.L ? (
      <DateScreenListWithInput
        size={size}
        dates={enabledDates}
        currentDate={currentDate}
        newScreen={newScreen}
        clickedScreenId={currentScreenId}
        hasError={hasError}
        onNewScreenChange={handleNewScreenTitleChange}
        onScreenSelect={onChange}
        onDateChange={handleDateChange}
        onClose={onClose}
        onError={handleError}
      />
    ) : undefined
  ) : (
    <DateScreenList
      size={size}
      dates={enabledDates}
      clickedScreenId={currentScreenId}
      onScreenClick={onChange}
      onClose={onClose}
    />
  );

  const screenPickerView: ReactNode = viewMode === T.CalendarScreenTab.CALENDAR ? (
    <CalendarView size={size} isButtonShown={isButtonShown}>
      <Calendar
        calendarType={calendarType}
        enabledDates={enabledDates}
        disabledDates={disabledDates}
        defaultDate={defaultDate}
        calendarStyle={CalendarStyle[size]}
        dropdownStyle={DropdownStyle[size]}
        dropdownItemHeight={DropdownHeightBySize[size]}
        selectedDate={currentDate}
        onDayClick={handleDateChange}
        onDropdownChange={handleDropdownChange}
      />
      {screenList}
    </CalendarView>
  ) : (
    <ListView size={size}>
      {dateScreenList}
    </ListView>
  );

  const buttons: ReactNode = !hasError && isButtonShown && (isScreenClickable || newScreen?.title !== undefined) ? (
    <ButtonWrapper>
      <CancelButton onClick={handleDismiss}>{l10n(Text.cancel)}</CancelButton>
      <ConfirmButton onClick={handleSubmit}>{l10n(Text.confirm)}</ConfirmButton>
    </ButtonWrapper>
  ) : undefined;

  const screenPickerTab: ReactNode = T.CalendarScreenSize.L === size ? (
    <SidebarHeaderTab
      onTabClick={handleTabClick}
      viewMode={viewMode}
    />
  ) : (
    <ScreenPickerTab
      onTabClick={handleTabClick}
      viewMode={viewMode}
      size={size}
    />
  );

  return (
    <Root size={size} isButtonShown={isButtonShown}>
      {screenPickerTab}
      <InnerRoot>
        {helpText}
        {screenPickerView}
        {buttons}
      </InnerRoot>
    </Root>
  );
};

export const ScreenPicker: FC<Props> = withErrorBoundary(RawScreenPicker)(Fallback);
