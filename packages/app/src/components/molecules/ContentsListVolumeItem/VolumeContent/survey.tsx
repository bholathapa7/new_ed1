import React, { FC, ReactNode, useRef, useState, MutableRefObject } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { CalendarDropdownProps } from '^/components/atoms/Calendar';
import { CalendarHeaderStyleProps } from '^/components/atoms/CalendarWithHeader';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { FontFamily } from '^/constants/styles';
import { QueryContentsWithType, QueryIDWithTypeAndScreenId, QueryScreenWithContentId,
  UseL10n, UseState, useClickOutside, useGetAllContentsOf, useGetContentIdOf,
  useGetScreenOf, useL10n, useSortedAvailbleDsmScreens } from '^/hooks';
import { RequestVolumeCalculation } from '^/store/duck/Contents';
import * as T from '^/types';
import { DateScreenInput } from '../../DateScreenInput';
import Text from './text';

const DSM_CALENDAR_DROPDOWN_ITEM_HEIGHT: number = 21;

export const sbvcCalendarListViewStyle: CalendarHeaderStyleProps = {
  calendarHeaderStyle: {
    headerRootStyle: {
      width: undefined,
      marginTop: '0px',
      marginBottom: '0px',
      padding: '15px 15px 4.7px 15px',
    },
    listViewRootStyle: {
      height: '160.5px',
    },
    listableWrapperStyle: {
      '> div': {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '20px',
        height: '20px',
        marginRight: '5.5px',
        borderRadius: '4px',
        backgroundColor: palette.ContentsList.itemBackgroundGray.toString(),
        ':hover': {
          cursor: 'pointer',
          backgroundColor: palette.ContentsList.hoverGray.toString(),
        },
        '> svg': {
          transform: 'scale(0.71)',
        },
      },
      '> span': {
        fontSize: '11px',
        color: dsPalette.title.toString(),
        fontFamily: FontFamily.NOTOSANS,
      },
    },
    dateListItemStyle: {
      height: '31.3px',
      '> span': {
        fontFamily: FontFamily.NOTOSANS,
        fontSize: '11px',
        fontWeight: 500,
        lineHeight: 1,
        color: palette.MapTopBar.title.toString(),
      },
    },

  },
};

export const sbvcCalenderDropdownStyle: CalendarDropdownProps = {
  dropdownStyle: {
    dropdownWrapperStyle: {
      marginTop: '5.3px',
      width: undefined,
      padding: '0 15px',
    },
    zIndex: 0,
    rootStyle: {
      width: '67px',
      height: `${DSM_CALENDAR_DROPDOWN_ITEM_HEIGHT}px`,
      paddingBottom: '4px',
    },
    mainButtonStyle: {
      '> span': {
        color: 'var(--color-theme-primary)',
        lineHeight: '100%',
        fontSize: '9px',
      },
    },
    itemStyle: {
      fontSize: '9px',
      height: `${DSM_CALENDAR_DROPDOWN_ITEM_HEIGHT}px`,
      lineHeight: `${DSM_CALENDAR_DROPDOWN_ITEM_HEIGHT}px`,
      justifyContent: 'center',
    },
  },
};

const HeaderWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

const ComparisonWrapper = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
});

const DisableTextWrapper = styled.div({
  lineHeight: 1.55,
  fontSize: '11px',
});

const DateScreenLabel = styled.span({
  fontSize: '12px',
  color: dsPalette.title.toString(),
  lineHeight: 1.4,
});

interface Props {
  content: T.VolumeContent;
}

export const Survey: FC<Props> = ({ content, children }) => {
  const [l10n]: UseL10n = useL10n();
  const [calendarOpen, setCalendarOpen]: UseState<boolean> = useState(false);
  const calendarRef: MutableRefObject<HTMLDivElement | undefined> = useRef();
  const dispatch: Dispatch = useDispatch();

  const getScreenOfContentId: QueryScreenWithContentId = useGetScreenOf(T.ScreensQueryParam.CONTENT_ID);

  const getContentIdOf: QueryIDWithTypeAndScreenId = useGetContentIdOf(T.ContentsQueryParam.TYPE_AND_SCREENID);
  const getGetAllContentsOf: QueryContentsWithType = useGetAllContentsOf(T.ContentsQueryParam.TYPE);

  const pickableScreens: T.Screen[] = useSortedAvailbleDsmScreens();

  const isSbvcAvailable: boolean = getGetAllContentsOf(T.ContentType.DSM).length > 1;


  useClickOutside({ ref: calendarRef, callback: () => {
    if (calendarOpen) {
      setCalendarOpen(false);
    }
  } });

  const currentScreen: T.Screen | undefined = content.info.calculatedVolume.calculation.type === T.VolumeCalcMethod.SURVEY ?
    getScreenOfContentId(content.info.calculatedVolume.calculation.previousDsmId) : undefined;

  const onScreenClick: (screen: T.Screen) => void = (screen) => {
    setCalendarOpen(false);
    const dsmIdOfScreen: T.Content['id'] | undefined = getContentIdOf(T.ContentType.DSM, screen.id);
    if (dsmIdOfScreen === undefined) return;

    dispatch(RequestVolumeCalculation({
      contentId: content.id,
      info: {
        previousDsmId: dsmIdOfScreen,
        type: T.VolumeCalcMethod.SURVEY,
        volumeAlgorithm: T.BasicCalcBasePlane.CUSTOM,
        volumeElevation: 0,
      },
    }));
  };

  const screenButton: ReactNode = isSbvcAvailable ? (
    <ComparisonWrapper>
      <DateScreenLabel>{l10n(Text.title.compareWith)}</DateScreenLabel>
      <DateScreenInput
        buttonType={T.DateScreenButton.SBVC}
        screen={currentScreen}
        pickableScreens={pickableScreens}
        placement={T.ModalPlacement.BOTTOM}
        onScreenChange={onScreenClick}
      />
    </ComparisonWrapper>
  ) : (
    <DisableTextWrapper>
      {l10n(Text.disabled.sbvc)}
    </DisableTextWrapper>
  );

  return (
    <>
      <HeaderWrapper>
        {screenButton}
      </HeaderWrapper>
      {children}
    </>
  );
};

