import React, { FC } from 'react';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';
import { QueryScreenWithId, useGetScreenOf } from '^/hooks';
import * as T from '^/types';


const WrapperStyleBySize: { [K in T.CalendarScreenSize]: CSSObject } = ({
  [T.CalendarScreenSize.S]: ({
    padding: '10.5px 20.5px',
    fontSize: '12px',
  }),
  [T.CalendarScreenSize.M]: ({
    padding: '14px 30px',
    fontSize: '12px',
  }),
  [T.CalendarScreenSize.L]: ({
    padding: '12px 34px',
    fontSize: '13px',
  }),
});

interface WrapperProps {
  size: T.CalendarScreenSize;
  isClickable: boolean;
  isClicked: Props['isClicked'];
}

const Wrapper = styled.div<WrapperProps>(({ size, isClickable, isClicked }) => ({
  boxSizing: 'border-box',

  width: '100%',

  color: palette.CalendarScreen.font.toString(),
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflowX: 'hidden',

  backgroundColor: (isClicked ? palette.CalendarScreen.clicked : palette.white).toString(),
  cursor: isClickable ? 'pointer' : undefined,

  ':hover': isClickable && !isClicked ? ({
    backgroundColor: palette.CalendarScreen.hover.toString(),
  }) : undefined,

  ...WrapperStyleBySize[size],
}));
Wrapper.displayName = 'ScreenItemWrapper';


export interface Props {
  size: T.CalendarScreenSize;
  screenId: T.Screen['id'];
  isClicked?: boolean;
  onClick?(screen: T.Screen): void;
}

export const ScreenItem: FC<Props> = ({
  size, screenId, isClicked, onClick,
}) => {
  const getScreenOf: QueryScreenWithId = useGetScreenOf(T.ScreensQueryParam.ID);

  const screen: T.Screen | undefined = getScreenOf(screenId);

  if (screen === undefined) return null;

  const isClickable: boolean = onClick !== undefined;

  const handleClick: (() => void) | undefined = isClickable ? () => {
    onClick?.(screen);
  } : undefined;

  return (
    <Wrapper
      size={size}
      isClickable={isClickable}
      isClicked={isClicked}
      onClick={handleClick}
    >
      {screen.title}
    </Wrapper>
  );
};
