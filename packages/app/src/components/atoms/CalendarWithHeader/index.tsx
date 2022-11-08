import { isSameDay } from 'date-fns';
import React, { FC, ReactNode, memo, useEffect, useRef, useState, SetStateAction, MutableRefObject } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { useSelector } from 'react-redux';
import styled, { CSSObject } from 'styled-components';

import { Calendar, CalendarDropdownProps, CalendarStyleProps } from '^/components/atoms/Calendar';
import WrapperHoverable, { Props as WrapperHoverableProps } from '^/components/atoms/WrapperHoverable';

import { UseL10n, UseState, useClickOutside, useL10n } from '^/hooks';

import CalendarSVG from '^/assets/icons/content-sidebar-header/calendar.svg';
import CalendarDateEditSvg from '^/assets/icons/content-sidebar-header/edit.svg';
import CalendarListSvg from '^/assets/icons/content-sidebar-header/list.svg';

import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { FontFamily } from '^/constants/styles';
import * as T from '^/types';

import Text from './text';

import {
  ApplyOptionIfKorean,
  GetCommonFormat,
  formatWithOffset,
} from '^/utilities/date-format';
import { arePropsEqual } from '^/utilities/react-util';

import { SideBar } from '^/constants/zindex';

const SUBCALENDAR_DROPDOWN_ITEM_HEIGHT: number = 21;

export interface CalendarHeaderStyleProps {
  calendarHeaderStyle?: {
    headerRootStyle?: CSSObject;
    listableWrapperStyle?: CSSObject;
    listViewRootStyle?: CSSObject;
    dateListItemStyle?: CSSObject;
  };
}


const HeaderWrapper =
  styled.div<CalendarHeaderStyleProps & { isListMode: boolean }>(({ calendarHeaderStyle, isListMode }) => ({
    display: 'flex',
    width: 'calc(100% + 23px)',
    height: '26px',
    justifyContent: 'space-between',
    marginTop: '1px',
    marginBottom: isListMode ? '9px' : '19px',
    ...calendarHeaderStyle?.headerRootStyle,
  }));
const ListableWrapper =
  styled.div<CalendarHeaderStyleProps>(({ calendarHeaderStyle }) => ({
    height: '26px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    '> div': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '26px',
      height: '26px',
      marginRight: '5.5px',
      borderRadius: '4px',
      backgroundColor: palette.ContentsList.itemBackgroundGray.toString(),
      ':hover': {
        cursor: 'pointer',
        backgroundColor: palette.ContentsList.hoverGray.toString(),
      },
    },
    '> span': {
      height: '14px',
      fontSize: '14px',
      color: dsPalette.title.toString(),
    },
    ...calendarHeaderStyle?.listableWrapperStyle,
  }));

const DateChangableWrapper =
  styled.div<{ clicked: boolean }>(({ clicked }) => ({
    height: '26px',
    width: '26px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '4px',
    ':hover': {
      cursor: 'pointer',
      backgroundColor: palette.ContentsList.itemBackgroundGray.toString(),
    },
    '> svg > path': {
      fill: clicked ? 'var(--color-theme-primary)' : dsPalette.title.toString(),
    },
  }));

const ListViewRoot =
  styled.div({
    height: '224px',
    width: '100%',
  });

const DateListItem =
  styled.div<{ selected: boolean }>(({ selected }) => ({
    display: 'flex',
    alignItems: 'center',
    height: '44px',
    width: '100%',
    justifyContent: 'center',
    backgroundColor: selected ? palette.dropdown.dropdownHoverColor.toString() : 'transparent',
    '> span': {
      fontFamily: FontFamily.NOTOSANS,
      fontSize: '13px',
      fontWeight: 500,
      lineHeight: 1,
      color: palette.MapTopBar.title.toString(),
    },

    ':hover': {
      backgroundColor: palette.ContentsList.itemBackgroundGray.toString(),
      cursor: 'pointer',
    },
  }));

const DateListSpliter =
  styled.hr({
    height: '0px',
    borderTop: `1px solid ${palette.SideBar.ContentslistBackground.toString()}`,
  });

const ContentsTransferCalendarWrapper =
  styled.div({
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    width: '167px',
    left: '281px',
    top: '50px',
    borderRadius: '6px',
    backdropFilter: 'blur(30px)',
    /* eslint-disable no-magic-numbers */
    backgroundColor: palette.white.alpha(0.76).toString(),
    boxShadow: `
      0 1px 8px 0 ${palette.black.alpha(0.2).toString()},
      0 3px 4px 0 ${palette.black.alpha(0.18).toString()},
      0 2px 4px 0 ${palette.black.alpha(0.29).toString()}
    `,
    /* eslint-enable no-magic-numbers */
    paddingBottom: '10px',
    zIndex: SideBar.SUB_CALENDAR,
  });

const CalendarTitle =
  styled.div<{ color?: string }>(({ color }) => ({
    display: 'flex',
    alignItems: 'center',

    marginBottom: '7.5px',
    marginTop: '10px',
    width: '136px',
    height: '14px',
    fontSize: '9.5px',
    fontWeight: 600,
    color: color ? color : palette.ContentsList.title.toString(),
  }));

const TooltipBalloonStyle: CSSObject = {
  left: '-47.5px',
  bottom: '-24px',
};

const TooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipBalloonStyle: TooltipBalloonStyle,
  tooltipWrapperStyle: {
    position: 'relative',
  },
};

const subCalendarCellStyle: CSSObject = {
  width: '16px',
  height: '16px',
  margin: '1.85px 3.425px',
  fontSize: '9.5px',
};

const subDropdownStyle: CalendarDropdownProps = {
  dropdownStyle: {
    zIndex: 0,
    rootStyle: {
      width: '67px',
      height: `${SUBCALENDAR_DROPDOWN_ITEM_HEIGHT}px`,
    },
    caretStyle: {
      color: 'var(--color-theme-primary)',
      fontSize: '12px',
      marginRight: '7px',
    },
    mainButtonStyle: {
      borderRadius: '6px',
      backgroundColor: 'transparent',
      border: 'solid thin var(--color-theme-primary)',

      textAlign: 'center',
      fontWeight: 500,

      '> span': {
        color: 'var(--color-theme-primary)',
        fontSize: '9px',
      },
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
    },
    itemStyle: {
      color: dsPalette.title.toString(),
      fontSize: '9px',
      fontWeight: 500,
      paddingLeft: '0px',
      paddingRight: '0px',
      height: `${SUBCALENDAR_DROPDOWN_ITEM_HEIGHT}px`,
      lineHeight: `${SUBCALENDAR_DROPDOWN_ITEM_HEIGHT}px`,
      justifyContent: 'center',
    },
    verticalTrackStyle: {
      marginRight: '0px',
    },
    verticalThumbStyle: {},
    dropdownWrapperStyle: {
      width: '136px',
      marginBottom: '9.15px',
    },
  },
};

export interface CalendarTitle {
  title: string;
  color?: string;
}

export interface Props extends CalendarStyleProps, CalendarHeaderStyleProps, CalendarDropdownProps {
  mainCalendarType: T.CalendarType;
  currentDate: Date;
  disabledDates?: Array<Date>;
  enabledDates?: Array<Date>;
  selectedDate?: Date;
  subCalendarTitle: CalendarTitle;
  isListable?: boolean;
  areContentsDateChangable?: boolean;
  dropdownItemHeight?: number;
  isListModeDefault?: boolean;
  preventListView?: boolean;
  onMainCalendarDayClick?(day: Date): void;
  onSubCalendarDayClick?(day: Date): void;
  setSubCalendarTitle?(value: SetStateAction<CalendarTitle>): void;
  setPreventListView?(value: SetStateAction<boolean>): void;

}

export const CalendarWithHeader: FC<Props> = memo(({
  mainCalendarType, currentDate, enabledDates, dropdownStyle,
  isListable, areContentsDateChangable, subCalendarTitle,
  onMainCalendarDayClick, preventListView,
  calendarStyle, calendarHeaderStyle, dropdownItemHeight, isListModeDefault, setSubCalendarTitle, setPreventListView,
}) => {
  const timezoneOffset: T.CommonPageState['timezoneOffset'] = useSelector((state: T.State) => state.Pages.Common.timezoneOffset);

  const subCalendarRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const [l10n, lang]: UseL10n = useL10n();
  const [listMode, setListMode]: UseState<boolean> = useState<boolean>(Boolean(isListModeDefault));
  const [isTransferContentsCalendarOpened, setIsTransferContentsCalendarOpened]: UseState<boolean> = useState(false);

  useClickOutside({
    ref: subCalendarRef,
    callback: () => {
      if (isTransferContentsCalendarOpened) {
        setIsTransferContentsCalendarOpened(false);

        if (setSubCalendarTitle === undefined) return;
        setSubCalendarTitle({
          title: l10n(Text.title.default),
        });
      }
    },
  });

  useEffect(() => {
    if (subCalendarTitle.color !== palette.ContentsList.error.toString()) return;
    setIsTransferContentsCalendarOpened(true);
  }, [subCalendarTitle]);

  const handleModeChangeClick: () => void = () => {
    setListMode((prev) => !prev);
    if (setPreventListView === undefined) return;
    setPreventListView((prev) => !prev);
  };

  const handleDateChangeCalendarClick: () => void = () => {
    setIsTransferContentsCalendarOpened((prev) => !prev);
  };

  const subCalendar: ReactNode = isTransferContentsCalendarOpened ? (
    <ContentsTransferCalendarWrapper>
      <CalendarTitle color={subCalendarTitle.color}>
        {subCalendarTitle.title}
      </CalendarTitle>
      <Calendar
        calendarType={T.CalendarType.FROM_2016_UNTIL_PLUS_4}
        // onDayClick={onSubCalendarDayClick}
        defaultDate={currentDate}
        calendarStyle={{ cellStyle: subCalendarCellStyle }}
        dropdownStyle={subDropdownStyle.dropdownStyle}
        dropdownItemHeight={SUBCALENDAR_DROPDOWN_ITEM_HEIGHT}
      />
    </ContentsTransferCalendarWrapper>
  ) : undefined;

  const dateChangableElement: ReactNode = areContentsDateChangable ? (
    <div ref={subCalendarRef}>
      <WrapperHoverable
        title={l10n(Text.dateChange)}
        customStyle={TooltipCustomStyle}
      >
        <DateChangableWrapper
          onClick={handleDateChangeCalendarClick}
          clicked={isTransferContentsCalendarOpened}
        >
          <CalendarDateEditSvg />
        </DateChangableWrapper>
      </WrapperHoverable>
      {subCalendar}
    </div>
  ) : undefined;

  const listableMenu: ReactNode = isListable ? (
    <HeaderWrapper isListMode={listMode && !preventListView} calendarHeaderStyle={calendarHeaderStyle}>
      <ListableWrapper calendarHeaderStyle={calendarHeaderStyle}>
        <div onClick={handleModeChangeClick}>
          {listMode && !preventListView ? <CalendarSVG /> : <CalendarListSvg />}
        </div>
        <span>
          {listMode && !preventListView ? l10n(Text.calendarMode) : l10n(Text.listMode)}
        </span>
      </ListableWrapper>
      {dateChangableElement}
    </HeaderWrapper>
  ) : undefined;

  const dateToList: (date: Date, index: number, array: Array<Date>) => ReactNode = (date, index, array) => {
    const YYYYMMDD: string = formatWithOffset(
      timezoneOffset, date, GetCommonFormat({ lang, hasDay: true }), ApplyOptionIfKorean(lang),
    );
    const selected: boolean = isSameDay(currentDate, date);
    const handleDateClick: () => void = () => {
      // onMainCalendarDayClick(refinedDate);
    };

    return (
      <>
        <DateListItem selected={selected} onClick={handleDateClick} style={calendarHeaderStyle?.dateListItemStyle}>
          <span>
            {YYYYMMDD}
          </span>
        </DateListItem>
        {index !== array.length - 1 ? <DateListSpliter /> : undefined}
      </>
    );
  };

  const calendar: ReactNode = !preventListView && listMode && enabledDates ? (
    <ListViewRoot style={calendarHeaderStyle?.listViewRootStyle}>
      <Scrollbars>
        {enabledDates.slice().sort((a, b) => b.valueOf() - a.valueOf()).map(dateToList)}
      </Scrollbars>
    </ListViewRoot>
  ) : (
    <Calendar
      calendarType={mainCalendarType}
      enabledDates={enabledDates}
      defaultDate={currentDate}
      onDayClick={onMainCalendarDayClick}
      calendarStyle={calendarStyle}
      dropdownStyle={dropdownStyle}
      selectedDate={new Date(currentDate)}
      dropdownItemHeight={dropdownItemHeight}
    />
  );

  return (
    <>
      {listableMenu}
      {calendar}
    </>
  );
}, arePropsEqual);
