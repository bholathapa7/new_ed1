import React, { FC, ReactNode } from 'react';
import styled, { CSSObject } from 'styled-components';

import CalendarSVG from '^/assets/icons/content-sidebar-header/calendar.svg';
import ListSVG from '^/assets/icons/content-sidebar-header/list.svg';
import palette from '^/constants/palette';
import * as T from '^/types';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';

const getBorderStyleByCondition: (condition?: boolean) => string | undefined = (cond) =>
  cond ? `thin solid ${palette.Calendar.disabled.toString()}` : undefined;


type StyleElementKey = 'root' | 'icon';
type StyleBySize = { [K in Props['size']]: CSSObject };
type StylesBySize = { [K in StyleElementKey]: StyleBySize };
const stylesBySize: StylesBySize = {
  root: {
    [T.CalendarScreenSize.S]: ({
      width: '100%',
      height: '24px',
    }),
    [T.CalendarScreenSize.M]: ({
      width: '100%',
      height: '30px',
    }),
    [T.CalendarScreenSize.L]: ({
      width: '100%',
      height: '30px',
    }),
  },
  icon: {
    [T.CalendarScreenSize.S]: ({
      transform: 'scale(0.785)',
    }),
    [T.CalendarScreenSize.M]: ({
      transform: 'scale(1)',
    }),
    [T.CalendarScreenSize.L]: ({
      transform: 'scale(1)',
    }),
  },
};

interface SizeProps {
  size: Props['size'];
  isSidebarHeader: boolean;
}

const Root = styled.div<SizeProps>(({ size, isSidebarHeader }) => ({
  display: 'flex',

  backgroundColor: palette.ContentsList.itemBackgroundGray.toString(),
  minHeight: '11px',

  borderTopLeftRadius: '6px',
  borderTopRightRadius: '6px',

  '> button:first-of-type': { borderLeft: isSidebarHeader ? 'none !important' : undefined },
  ...stylesBySize.root[size],
}));

const TabItem = styled.button<{
  isSelected: boolean;
} & SizeProps>(({ isSelected, size }) => ({
  display: 'flex',
  flexGrow: 1,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: (isSelected ? palette.white : palette.ContentsList.itemBackgroundGray).toString(),
  cursor: 'pointer',
  borderRadius: '6px 6px 0px 0px',
  '> svg': {
    '> path, > g': {
      fill: (isSelected ? 'var(--color-theme-primary)' : palette.dropdown.caretColor).toString(),
    },
    ...stylesBySize.icon[size],
  },
}), ({ isSelected, isSidebarHeader }) => (isSelected ? {
  borderLeft: getBorderStyleByCondition(isSidebarHeader),
  borderRight: getBorderStyleByCondition(isSidebarHeader),
  borderTop: getBorderStyleByCondition(isSidebarHeader),
} : {
  borderBottom: getBorderStyleByCondition(isSidebarHeader),
}));


const getSvgFromTabType: (tabType: T.CalendarScreenTab) => ReactNode = (tabType) => {
  switch (tabType) {
    case T.CalendarScreenTab.CALENDAR:
      return <CalendarSVG />;
    case T.CalendarScreenTab.LIST:
      return <ListSVG />;
    default:
      exhaustiveCheck(tabType);
  }
};

export interface Props {
  readonly viewMode: T.CalendarScreenTab;
  readonly size: T.CalendarScreenSize;
  readonly isSidebarHeader?: boolean;
  onTabClick(tab: T.CalendarScreenTab): void;
}

export const ScreenPickerTab: FC<Props> = ({ isSidebarHeader = false, onTabClick, viewMode, size }) => {
  const tabs: ReactNode = Object.values(T.CalendarScreenTab).map((tab, key) => {
    const isSelected: boolean = tab === viewMode;

    const onTabItemClick: () => void = () => {
      if (isSelected) return;
      onTabClick(tab);
    };

    return (
      <TabItem
        key={key}
        isSidebarHeader={isSidebarHeader}
        isSelected={isSelected}
        size={size}
        onClick={onTabItemClick}
      >
        {getSvgFromTabType(tab)}
      </TabItem>
    );
  });

  return (
    <Root size={size} isSidebarHeader={isSidebarHeader}>
      {tabs}
    </Root>
  );
};
