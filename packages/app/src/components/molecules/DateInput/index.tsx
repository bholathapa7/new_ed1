import React, { FC, ReactNode, useRef, useState, MouseEvent, MutableRefObject } from 'react';
import styled, { CSSObject } from 'styled-components';

import CalendarSvg from '^/assets/icons/upload-popup/calendar.svg';
import { Calendar, CalendarDropdownProps, CalendarStyleProps, Props as CalendarProps, getDisabledTooltip } from '^/components/atoms/Calendar';
import { CalendarHeaderStyleProps, CalendarWithHeader } from '^/components/atoms/CalendarWithHeader';
import palette from '^/constants/palette';
import { UseL10n, UseState, useClickOutside, useL10n } from '^/hooks';
import * as T from '^/types';
import { ApplyOptionIfKorean, GetCommonFormat, formatWithOffset } from '^/utilities/date-format';
import { useSelector } from 'react-redux';
import Text from './text';

type availableCalendarPosition= 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT' | 'BOTTOM';

const calendarPositionMap: {
  [positionKey in availableCalendarPosition]: {
    [key in 'left' | 'right' | 'bottom' | 'top']: string | number | undefined}
} = {
  TOP_LEFT: {
    left: undefined,
    right: '190px',
    top: undefined ,
    bottom: 0,
  },
  TOP_RIGHT: {
    left: '190px',
    right: undefined,
    top: undefined,
    bottom: 0,
  },
  BOTTOM_LEFT: {
    left: undefined,
    right: '190px',
    top: 0,
    bottom: undefined,
  },
  BOTTOM_RIGHT: {
    left: '190px',
    right: undefined,
    top: 0,
    bottom: undefined,
  },
  BOTTOM: {
    left: '0px',
    right: undefined,
    top: '42px',
    bottom: undefined,
  },
};

const Input = styled.div<{
  hasError?: boolean;
  isCalendarClicked: boolean;
}>(({ hasError, isCalendarClicked }) => ({
  position: 'relative',
  boxSizing: 'border-box',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  width: '184px',
  height: '37px',

  paddingLeft: '11px',
  borderRadius: '5px',
  // eslint-disable-next-line no-magic-numbers
  backgroundColor: (hasError ? palette.UploadPopup.error.alpha(0.05) : palette.white).string(),
  border: `1px solid ${(hasError ? palette.UploadPopup.error : palette.dividerLight).toString()}`,

  cursor: 'pointer',

  '> p': {
    color: hasError ? palette.UploadPopup.error.toString() : undefined,
  },

  '> svg path': {
    fill: hasError ? palette.UploadPopup.error.toString() : isCalendarClicked ? 'var(--color-theme-primary)' : undefined,
  },
}));

const InputContent = styled.p({
  color: 'var(--color-theme-primary)',
  fontSize: '14px',
});

const Placeholder = styled.p({
  color: palette.dividerLight.toString(),
  fontSize: '13px',
});

const CalendarIcon = styled(CalendarSvg)({
  position: 'absolute',
  top: '50%',
  right: '12px',

  transform: 'translateY(-50%)',
});

const CalendarWrapper = styled.div<{
  customCalendarPosition?: availableCalendarPosition;
  customStyle?: CSSObject;
}>(({ customCalendarPosition, customStyle }) => ({
  position: 'absolute',
  /* eslint-disable @typescript-eslint/strict-boolean-expressions */
  left: customCalendarPosition ? calendarPositionMap[customCalendarPosition].left : '190px',
  right: customCalendarPosition ? calendarPositionMap[customCalendarPosition].right : undefined,
  top: customCalendarPosition ? calendarPositionMap[customCalendarPosition].top : 0,
  bottom: customCalendarPosition ? calendarPositionMap[customCalendarPosition].bottom : undefined,
  /* eslint-enable @typescript-eslint/strict-boolean-expressions */
  width: '195px',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  // eslint-disable-next-line no-magic-numbers
  backgroundColor: palette.white.alpha(0.9).toString(),
  backdropFilter: 'blur(50px)',
  boxShadow: '0 1px 8px 0 #00000033, 0 3px 4px 0 #0000002e, 0 3px 3px 0 #00000028',
  borderRadius: '9px',

  padding: '30px',

  cursor: 'initial',

  ...customStyle,
}));

const calendarRootStyle: CSSObject = {
  marginTop: '25px',
  fontSize: '12px',
};

const calendarCellStyle: CSSObject = {
  width: '22px',
  height: '22px',

  margin: '3.5px',
};

export const getCalendarDisabledCellStyle: (text: string | undefined) => NonNullable<CSSObject> = (text) => ({
  ':hover': text ? {
    '::after': {
      ...getDisabledTooltip(text),
    },
  } : undefined,
});

export type DateInputStyle = CalendarDropdownProps & CalendarHeaderStyleProps & CalendarStyleProps & {
  calendarWithHeaderWrapperStyle?: {
    rootStyle?: CSSObject;
  };
};

export interface Props {
  readonly hasError?: boolean;
  readonly date: Date | undefined;
  readonly idx?: number;
  readonly screenId?: T.Screen['id'];
  readonly calendarType: CalendarProps['calendarType'];
  readonly defaultDate?: CalendarProps['defaultDate'];
  readonly enabledDates?: CalendarProps['enabledDates'];
  readonly disabledDates?: CalendarProps['disabledDates'];
  readonly disabledText?: string;
  readonly customCalendarPosition?: availableCalendarPosition;
  readonly withListView?: boolean;
  readonly customStyle?: DateInputStyle;
  readonly shouldCalendarCloseAfterSelectingDate?: boolean;
  setDate?(date: Date): void;
  setScreen?(screenId: T.Screen['id']): void;
}

export const DateInput: FC<Props> = ({
  hasError, date, defaultDate, calendarType, disabledDates, disabledText, enabledDates,
  setDate, customCalendarPosition, withListView, customStyle, shouldCalendarCloseAfterSelectingDate,
}) => {
  const [l10n, lang]: UseL10n = useL10n();
  const { Pages: { Common: { timezoneOffset } } }: T.State = useSelector((state: T.State) => state);

  const calendarRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const [isCalendarClicked, setIsCalendarClicked]: UseState<boolean> = useState<boolean>(false);

  useClickOutside({ ref: calendarRef, callback: () => {
    if (isCalendarClicked) {
      setIsCalendarClicked(false);
    }
  } });

  const onInputClick: (e: MouseEvent<HTMLDivElement>) => void = () => {
    setIsCalendarClicked((prevState: boolean) => !prevState);
  };

  const onCalendarClick: (e: MouseEvent<HTMLDivElement>) => void = (e) => {
    e.stopPropagation();
  };

  const onDayClick: (date: Date) => void = (selectedDate) => {
    if (setDate) setDate(selectedDate);
    if (shouldCalendarCloseAfterSelectingDate) setIsCalendarClicked(false);
  };

  const inputContent: ReactNode = date ? (
    <InputContent>{formatWithOffset(timezoneOffset, date, GetCommonFormat({ lang, hasDay: true }), ApplyOptionIfKorean(lang))}</InputContent>
  ) : (
    <Placeholder>{l10n(Text.selectDate)}</Placeholder>
  );

  const mainCalendarStyle: CalendarStyleProps = {
    calendarStyle: {
      ...customStyle?.calendarStyle,
      cellStyle: customStyle?.calendarStyle?.cellStyle ? customStyle.calendarStyle.cellStyle : calendarCellStyle,
      rootStyle: customStyle?.calendarStyle?.rootStyle ? customStyle.calendarStyle.rootStyle : calendarRootStyle,
    },
  };

  const calendar: ReactNode = (
    withListView ? (<CalendarWithHeader
      selectedDate={date}
      currentDate={defaultDate ? defaultDate : new Date()}
      enabledDates={enabledDates}
      disabledDates={disabledDates}
      calendarStyle={mainCalendarStyle.calendarStyle}
      mainCalendarType={calendarType}
      onMainCalendarDayClick={onDayClick}
      onSubCalendarDayClick={onDayClick}
      subCalendarTitle={{ title: 'asdfadsfa' }}
      isListable={true}
      dropdownStyle={customStyle?.dropdownStyle}
      calendarHeaderStyle={customStyle?.calendarHeaderStyle}
      isListModeDefault={true}
    />) :
      (<Calendar
        selectedDate={date}
        defaultDate={defaultDate}
        enabledDates={enabledDates}
        disabledDates={disabledDates}
        calendarStyle={{ ...mainCalendarStyle.calendarStyle, disabledCellStyle: getCalendarDisabledCellStyle(disabledText) }}
        calendarType={calendarType}
        onDayClick={onDayClick}
        dropdownStyle={customStyle?.dropdownStyle}
      />)
  );

  const realCalendar: ReactNode = isCalendarClicked ? (
    <CalendarWrapper
      onClick={onCalendarClick}
      customCalendarPosition={customCalendarPosition}
      customStyle={customStyle?.calendarWithHeaderWrapperStyle?.rootStyle}
    >
      {calendar}
    </CalendarWrapper>
  ) : undefined;

  return (
    <Input ref={calendarRef} hasError={hasError} isCalendarClicked={isCalendarClicked} onClick={onInputClick}>
      {inputContent}
      <CalendarIcon />
      {realCalendar}
    </Input>
  );
};
