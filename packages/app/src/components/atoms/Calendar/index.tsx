/* eslint-disable max-lines */
import { isSameDay } from 'date-fns';
import _ from 'lodash-es';
import React, { FC, ReactNode, memo, useEffect, useState, TouchEvent, MouseEvent } from 'react';
import DayPicker, { DayModifiers, FunctionModifier } from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import { useSelector } from 'react-redux';
import styled, { CSSObject } from 'styled-components';

import DropdownCaretArrowSvg from '^/assets/icons/dropdown/dropdown-caret-arrow.svg';
import Dropdown, { DEFAULT_DROPDOWN_ITEM_HEIGHT, Option, StyleProps as DropdownStyleProps } from '^/components/atoms/Dropdown';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { FontFamily } from '^/constants/styles';
import { UseL10n, UseState, useL10n } from '^/hooks';
import * as T from '^/types';
import { makeConsistentUTCDateViaOffset } from '^/utilities/date-format';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { arePropsEqual } from '^/utilities/react-util';
import Text from './text';

const MAX_YEAR: number = 2100;
const MIN_YEAR: number = 2010;
const NUMBER_OF_MONTHS: number = 12;
const NOW: Date = new Date();

export const getDisabledTooltip: (text: string) => CSSObject = (text) => ({
  content: `\'${text}\'`,
  position: 'absolute',
  top: '21px',

  width: 'max-content',
  borderRadius: '3px',
  // eslint-disable-next-line no-magic-numbers
  backgroundColor: palette.black.alpha(0.6).toString(),
  backdropFilter: 'blur(3px)',
  padding: '5.5px 5px 4.3px 5px',

  zIndex: 600,

  color: palette.white.toString(),
  textAlign: 'left',
  fontSize: '10px',
  lineHeight: 1.3,
  whiteSpace: 'pre-line',
});

export interface CalendarStyleProps {
  calendarStyle?: {
    wrapperStyle?: CSSObject;
    rootStyle?: CSSObject;
    cellStyle?: CSSObject;
    hoveredCellStyle?: CSSObject;
    selectedCellStyle?: CSSObject;
    disabledCellStyle?: CSSObject;
  };
}

export interface CalendarDropdownProps {
  dropdownStyle?: DropdownStyleProps & {
    dropdownWrapperStyle?: CSSObject;
  };
}

const DropdownWrapper = styled.div<{ wrapperStyle?: CSSObject }>(({ wrapperStyle }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  ...wrapperStyle,
}));

const caretSvg: ReactNode = (
  <DropdownCaretArrowSvg />
);

const hoverSelector: string =
  `.DayPicker:not(.DayPicker--interactionDisabled)
   .DayPicker-Day:not(.DayPicker-Day--disabled):not(.DayPicker-Day--selected):not(.DayPicker-Day--outside):hover`;
/**
 * @desc If you don't know which you modify,
 * turn on the inspector mode on chrome, check it manually.
 * And original is designed as display-table, we cannot handle width, height.
 * Most of the styles are related to changing into display-flex.
 */
const DayPickerWrapper = styled.div<CalendarStyleProps>(({ calendarStyle }) => ({
  ...calendarStyle?.wrapperStyle,

  '&&&': {
    '.DayPicker': {
      ...calendarStyle?.rootStyle,
    },
    '.DayPicker-Day--outside': {
      backgroundColor: 'transparent !important',
    },
    '.DayPicker-wrapper': {
      paddingBottom: '0px',
    },
    '.DayPicker-Month': {
      margin: '0px',
      display: 'flex',
      flexDirection: 'column',
    },
    '.DayPicker-Caption': {
      display: 'none',
    },
    '.DayPicker-Weekdays, .DayPicker-WeekdaysRow': {
      display: 'flex',
      marginTop: '0px',
      width: '100%',
      justifyContent: 'space-between',
    },
    '.DayPicker-Body': {
      display: 'flex',
      flexDirection: 'column',
    },
    '.DayPicker-Week': {
      display: 'flex',
      justifyContent: 'space-between',
    },
    '.DayPicker-Day': {
      padding: '0px',
      width: '22px',
      height: '22px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: dsPalette.title.toString(),
      fontFamily: FontFamily.ROBOTO,
      ...calendarStyle?.cellStyle,
    },
    '.DayPicker-Weekday': {
      padding: '0px',
      width: '22px',
      height: '22px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: FontFamily.ROBOTO,
      color: palette.Calendar.weekday.toString(),
      fontWeight: 500,
      ...calendarStyle?.cellStyle,
    },
    '.DayPicker-Day--today': {
      color: dsPalette.title.toString(),
      fontWeight: 'normal',
    },
    '.DayPicker-Day--selected': {
      backgroundColor: 'var(--color-theme-primary)',
      color: palette.white.toString(),
      ...calendarStyle?.selectedCellStyle,
    },
    '.DayPicker-Day--disabled': {
      position: 'relative',
      color: palette.Calendar.disabled.toString(),

      ...calendarStyle?.disabledCellStyle,
    },
    [hoverSelector]: {
      backgroundColor: palette.Calendar.lightBlue.toString(),
      ...calendarStyle?.hoveredCellStyle,
    },
    abbr: {
      cursor: 'default',
    },
  },
}));

const dropdownProps: (
  itemHeight: number,
  style?: DropdownStyleProps,
) => DropdownStyleProps = (itemHeight, style) => ({
  zIndex: 0,
  rootStyle: {
    width: '94.5px',
    height: '32px',
    ...style?.rootStyle,
  },
  caretStyle: {
    color: 'var(--color-theme-primary)',
    fontSize: '12px',
    marginRight: '7px',
    ...style?.caretStyle,
  },
  mainButtonStyle: {
    borderRadius: '6px',
    backgroundColor: palette.transparent.toString(),
    border: 'solid 1px var(--color-theme-primary)',

    textAlign: 'center',
    fontWeight: 500,

    '> span': {
      color: 'var(--color-theme-primary)',
      fontSize: '13px',
    },
    ...style?.mainButtonStyle,
  },
  menuStyle: {
    marginTop: '4.2px',
    borderRadius: '6px',
    /* eslint-disable no-magic-numbers */
    boxShadow: `
        0 2px 8px 0 ${palette.black.alpha(0.18).toString()},
        0 2px 6px 0 ${palette.black.alpha(0.16).toString()},
        0 5px 10px 0 ${palette.black.alpha(0.14).toString()}
      `,
    /* eslint-enable no-magic-numbers */
    ...style?.menuStyle,
  },
  itemStyle: {
    color: dsPalette.title.toString(),
    fontSize: '13px',
    fontWeight: 500,
    justifyContent: 'center',
    height: `${itemHeight}px`,
    lineHeight: `${itemHeight}px`,
    ...style?.itemStyle,
  },
  verticalTrackStyle: {
    marginRight: '8px',
    ...style?.verticalTrackStyle,
  },
  verticalThumbStyle: {
    ...style?.verticalThumbStyle,
  },
});

interface YearAndMonth {
  year: number;
  month: number;
}

const initialzeDate: (
  type: T.CalendarType, enabledDates?: Array<Date>, defaultDate?: Date,
) => YearAndMonth = (
  type, enabledDates, defaultDate,
) => {
  if (defaultDate !== undefined) {
    return {
      year: defaultDate.getFullYear(),
      month: defaultDate.getMonth(),
    };
  }
  if (type === T.CalendarType.SELECTED_DATE && enabledDates && enabledDates.length > 0) {
    const lastDateFromEnabledDates: Date =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [...enabledDates].sort((a, b) => a.getTime() - b.getTime()).pop()!;

    return {
      year: lastDateFromEnabledDates.getFullYear(),
      month: lastDateFromEnabledDates.getMonth(),
    };
  }

  return {
    year: NOW.getFullYear(),
    month: NOW.getMonth(),
  };
};

const getYears: (
  type: T.CalendarType, enabledDates?: Array<Date>,
) => Array<number> = (type, enabledDates) => {
  switch (type) {
    case T.CalendarType.FROM_2010_UNTIL_TODAY:
      return _.range(MIN_YEAR, NOW.getFullYear() + 1);
    case T.CalendarType.FROM_TODAY_UNTIL_2100:
      return _.range(NOW.getFullYear(), MAX_YEAR + 1);
    case T.CalendarType.SELECTED_DATE:
      if (enabledDates && enabledDates.length > 0) {
        return _.uniq(enabledDates.map((item) => item.getFullYear())).sort((a, b) => a - b);
      } else {
        /**
         * @desc When enabledDate is undefined or length = 0,
         * The project has just been made or no content status
         * discuss later how we implement on this situation
         */
        return _.range(MIN_YEAR, NOW.getFullYear() + 1);
      }
    case T.CalendarType.FROM_2016_UNTIL_PLUS_4:
      // eslint-disable-next-line no-magic-numbers
      return _.range(2016, NOW.getFullYear() + 5);
    default:
      exhaustiveCheck(type);
  }
};

const getMonthsFromYear: (
  calendarType: T.CalendarType, year: number, enabledDates?: Array<Date>,
) => Array<number> = (
  calendarType, year, enabledDates,
) => {
  switch (calendarType) {
    case T.CalendarType.FROM_2010_UNTIL_TODAY:
      return _.range(0, NUMBER_OF_MONTHS).filter((month) =>
        (year === NOW.getFullYear() && month <= NOW.getMonth()) ||
        (year !== NOW.getFullYear()));
    case T.CalendarType.FROM_TODAY_UNTIL_2100:
      return _.range(0, NUMBER_OF_MONTHS).filter((month) =>
        (year === NOW.getFullYear() && month >= NOW.getMonth()) ||
        (year > NOW.getFullYear()));
    case T.CalendarType.SELECTED_DATE:
      if (enabledDates && enabledDates.length > 0) {
        return _.uniq(enabledDates
          .filter((item) => item.getFullYear() === year)
          .map((item) => item.getMonth())
          .sort((a, b) => a - b),
        );
      } else {
        /**
         * @desc When enabledDate is undefined or length = 0,
         * The project has just been made or no content status
         * discuss later how we implement on this situation
         */
        return _.range(0, NUMBER_OF_MONTHS).filter((month) =>
          (year === NOW.getFullYear() && month <= NOW.getMonth()) ||
        (year !== NOW.getFullYear()));
      }
    case T.CalendarType.FROM_2016_UNTIL_PLUS_4:
      return _.range(0, NUMBER_OF_MONTHS);
    default:
      exhaustiveCheck(calendarType);
  }
};

export interface Props extends CalendarStyleProps, CalendarDropdownProps {
  calendarType: T.CalendarType;
  defaultDate?: Date;
  disabledDates?: Array<Date>;
  enabledDates?: Array<Date>;
  selectedDate?: Date;
  calendarDropdownWrapperFont?: string;
  dropdownItemHeight?: number;
  onDayClick?(day: Date): void;
  onDropdownChange?(year: number, month: number): void;
}

export const Calendar: FC<Props> = memo(({
  calendarType, enabledDates, disabledDates, defaultDate, selectedDate,
  calendarStyle, dropdownStyle, calendarDropdownWrapperFont, dropdownItemHeight,
  onDayClick, onDropdownChange,
}) => {
  const timezoneOffset: T.CommonPageState['timezoneOffset'] = useSelector((state: T.State) => state.Pages.Common.timezoneOffset);

  const initDate: YearAndMonth = initialzeDate(calendarType, enabledDates, defaultDate);

  const [l10n, language]: UseL10n = useL10n();
  const [dropdownYear, setDropdownYear]: UseState<number> =
    useState<number>(initDate.year);
  const [dropdownMonth, setDropdownMonth]: UseState<number> =
    useState<number>(initDate.month);
  const [currentDate, setCurrentDate]: UseState<Date> =
    useState<Date>(new Date(initDate.year, initDate.month));
  const [monthDropdownList, setMonthDropdownList]: UseState<Array<Option>> =
    useState<Array<Option>>(
      getMonthsFromYear(calendarType, dropdownYear, enabledDates).map((month) => ({
        leftText: `${l10n(Text.month)[month]}`,
        value: month,
      })),
    );

  const itemHeight: number = dropdownItemHeight === undefined ? DEFAULT_DROPDOWN_ITEM_HEIGHT : dropdownItemHeight;

  useEffect(() => {
    if (selectedDate && selectedDate.getFullYear() !== dropdownYear) {
      yearDropdownChangeFunc(selectedDate.getFullYear());
    } else if (selectedDate && selectedDate.getMonth() !== dropdownMonth) {
      monthDropdownChangeFunc(selectedDate.getMonth());
    }
  }, [selectedDate]);

  const yearDropdownList: Array<Option> =
    getYears(calendarType, enabledDates).map((item) => ({
      leftText: `${item}${l10n(Text.year)}`,
      value: item,
    }));

  const disabledDatesModifier: () => { disabled: FunctionModifier | undefined } = () => {
    switch (calendarType) {
      case T.CalendarType.SELECTED_DATE:
        if (enabledDates && enabledDates.length > 0) {
          return {
            disabled: (date: Date) => !enabledDates.some((item) => item.toDateString() === date.toDateString()),
          };
        } else {
        /**
         * @desc When enabledDate is undefined or length = 0,
         * The project has just been made or no content status
         * discuss later how we implement on this situation
         */
          return {
            disabled: (date: Date) => date.getTime() > 0,
          };
        }
      case T.CalendarType.FROM_TODAY_UNTIL_2100:
        return {
          disabled: (date: Date) => date.getTime() < NOW.getTime() && date.getFullYear() <= MAX_YEAR,
        };
      case T.CalendarType.FROM_2010_UNTIL_TODAY:
        return {
          disabled: (date: Date) => date.getTime() > NOW.getTime() && date.getFullYear() >= MIN_YEAR,
        };
      case T.CalendarType.FROM_2016_UNTIL_PLUS_4:
        return {
          disabled: undefined,
        };
      default:
        exhaustiveCheck(calendarType);
    }
  };

  const handleDayClick: (
    day: Date, modifiers: DayModifiers, e: MouseEvent<HTMLDivElement>,
  ) => void = (
    day, modifiers,
  ) => {
    if (modifiers.disabled) {
      return;
    }
    /**
     * @desc react-day-picker returns Tue Jul 04 2017 **12:00:00** GMT+0300 (MSK)
     * We have to refine the time
     * This will make time 'YYYY/MM/DD 00:00:00 UTC'.
     */
    if (selectedDate && isSameDay(selectedDate, day)) return;
    const refinedDate: Date = makeConsistentUTCDateViaOffset(day, timezoneOffset);
    onDayClick?.(refinedDate);
  };

  const handleDayTouchEnd: (
    day: Date, modifiers: DayModifiers, e: TouchEvent<HTMLDivElement>,
  ) => void = (
    day, modifiers, e,
  ) => {
    handleDayClick(day, modifiers, (e as unknown) as MouseEvent<HTMLDivElement>);
  };

  const yearDropdownChangeFunc: (value: number) => void = (yearValue) => {
    const monthsFromYear: Array<number> = getMonthsFromYear(calendarType, yearValue, enabledDates);
    const monthValue: number = monthsFromYear[0];

    setDropdownYear(yearValue);
    setDropdownMonth(monthValue);

    setCurrentDate(new Date(yearValue, monthValue));
    setMonthDropdownList(monthsFromYear.map((month) => ({
      leftText: `${l10n(Text.month)[month]}`,
      value: month,
    })));

    onDropdownChange?.(yearValue, monthValue);
  };

  const monthDropdownChangeFunc: (value: number) => void = (value) => {
    setDropdownMonth(value);
    setCurrentDate(new Date(currentDate.getFullYear(), value));

    onDropdownChange?.(currentDate.getFullYear(), value);
  };

  const handleYearDropdownClick: (option: Option, index: number) => void = (option) => {
    yearDropdownChangeFunc(option.value as number);
  };

  const handleMonthDropdownClick: (option: Option, index: number) => void = (option) => {
    monthDropdownChangeFunc(option.value as number);
  };

  return (
    <>
      <DropdownWrapper wrapperStyle={dropdownStyle?.dropdownWrapperStyle}>
        <Dropdown
          value={dropdownYear}
          zIndex={1}
          fontSize={calendarDropdownWrapperFont}
          placeHolder={''}
          options={yearDropdownList}
          onClick={handleYearDropdownClick}
          height={'200px'}
          menuItemHeight={`${itemHeight}`}
          caretSVG={caretSvg}
          {...dropdownProps(itemHeight, dropdownStyle)}
        />
        <Dropdown
          value={dropdownMonth}
          zIndex={1}
          fontSize={calendarDropdownWrapperFont}
          placeHolder={''}
          options={monthDropdownList}
          onClick={handleMonthDropdownClick}
          height={'200px'}
          menuItemHeight={`${itemHeight}`}
          caretSVG={caretSvg}
          {...dropdownProps(itemHeight, dropdownStyle)}
        />
      </DropdownWrapper>
      <DayPickerWrapper
        calendarStyle={calendarStyle}
      >
        <DayPicker
          month={currentDate}
          canChangeMonth={false}
          disabledDays={disabledDates}
          onDayClick={handleDayClick}
          onDayTouchEnd={handleDayTouchEnd}
          locale={language}
          weekdaysShort={Text.weekdaysShort[language]}
          weekdaysLong={Text.weekdaysLong[language]}
          selectedDays={selectedDate}
          modifiers={disabledDatesModifier()}
        />
      </DayPickerWrapper>
    </>
  );
}, arePropsEqual);
