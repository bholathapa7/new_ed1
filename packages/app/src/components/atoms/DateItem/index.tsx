import React, { FC } from 'react';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';
import { FontFamily } from '^/constants/styles';
import { UseL10n, useL10n } from '^/hooks';
import * as T from '^/types';
import { ApplyOptionIfKorean, GetCommonFormat, formatWithOffset } from '^/utilities/date-format';


const RootStyleBySize: { [K in T.CalendarScreenSize]: CSSObject } = ({
  [T.CalendarScreenSize.S]: ({
    padding: '10.5px 15.5px',

    fontSize: '12px',
  }),
  [T.CalendarScreenSize.M]: ({
    padding: '15px 25px',

    fontSize: '12px',
  }),
  [T.CalendarScreenSize.L]: ({
    padding: '12px 24px',

    fontSize: '13px',
  }),
});

interface RootWrapper {
  size: T.CalendarScreenSize;
  isClickable: boolean;
  isClicked: Props['isClicked'];
}

const Root = styled.div<RootWrapper>(({ size, isClickable, isClicked }) => ({
  backgroundColor: (isClicked ? palette.CalendarScreen.clicked : palette.white).toString(),

  color: palette.CalendarScreen.font.toString(),
  fontFamily: FontFamily.ROBOTO,
  fontWeight: 'bold',

  cursor: isClickable ? 'pointer' : undefined,

  ':hover': isClickable && !isClicked ? ({
    backgroundColor: palette.CalendarScreen.hover.toString(),
  }) : undefined,

  ...RootStyleBySize[size],
}));


export interface Props {
  readonly size: T.CalendarScreenSize;
  readonly isClicked?: boolean;
  readonly date: Date;
  onClick?(date: Date | string): void;
}

export const DateItem: FC<Props> = ({
  size, isClicked, date, onClick,
}) => {
  const [, lang]: UseL10n = useL10n();

  const isClickable: boolean = onClick !== undefined;
  const content: string = formatWithOffset(
    0, date, GetCommonFormat({ lang, hasDay: true }), ApplyOptionIfKorean(lang),
  );

  const handleClick: (() => void) | undefined = isClickable ? () => {
    onClick?.(date);
  } : undefined;

  return (
    <Root
      size={size}
      isClickable={isClickable}
      isClicked={isClicked}
      onClick={handleClick}
    >
      {content}
    </Root>
  );
};
