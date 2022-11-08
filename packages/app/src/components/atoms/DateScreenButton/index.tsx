import React, { ReactNode, FC } from 'react';
import { useSelector } from 'react-redux';
import styled, { CSSObject } from 'styled-components';

import CalendarSVG from '^/assets/icons/contents-list/calendar.svg';
import palette from '^/constants/palette';
import { FontFamily } from '^/constants/styles';
import { usePrevProps, UseGetDefaultScreenTitle, UseL10n, useGetDefaultScreenTitle, useL10n } from '^/hooks';
import * as T from '^/types';
import { Formats, formatWithOffset } from '^/utilities/date-format';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { TEMP_SCREEN_ID } from '^/utilities/screen-util';
import Text from './text';

export const getRootStyleByType: (type: T.DateScreenButton, hasError: boolean) => CSSObject = (type, hasError) => {
  switch (type) {
    case T.DateScreenButton.SBVC:
      return {
        width: '200px',
        padding: '10px',
        '> div': {
          fontSize: '12px',
          letterSpacing: '-0.8px',
          '> svg': {
            transform: 'scale(0.99)',
          },
        },
        borderRadius: '6px',
        backgroundColor: palette.ContentsList.itemBackgroundGray.toString(),
      };
    case T.DateScreenButton.SPLIT_VIEW:
      return {
        width: '210px',
        padding: '11px',
        borderRadius: '6px',
        // eslint-disable-next-line no-magic-numbers
        backgroundColor: palette.white.alpha(0.64).toString(),
        backdropFilter: 'blur(10px)',
      };
    case T.DateScreenButton.MAP_CONTENTS_UPLOAD:
      return {
        width: '100%',
        padding: '10px',
        borderRadius: '5px',
        border: `solid 1px ${hasError ? palette.UploadPopup.error.toString() : palette.UploadPopup.inputBorder.toString()}`,
        // eslint-disable-next-line no-magic-numbers
        backgroundColor: hasError ? palette.UploadPopup.error.alpha(0.05).toString() : undefined,
      };
    case T.DateScreenButton.DOWNLOAD:
      return {
        width: '225px',
        padding: '10px',
        borderRadius: '5px',
        border: `solid 1px ${palette.UploadPopup.inputBorder.toString()}`,
      };
    case T.DateScreenButton.SBVC_POPUP:
      return {
        width: '200px',
        padding: '11px',
        borderRadius: '5px',
        /* eslint-disable no-magic-numbers*/
        boxShadow: `
          0 1px 5px 0 ${palette.black.alpha(0.16).toString()},
          0 3px 4px 0 ${palette.black.alpha(0.16).toString()},
          0 2px 4px 0 ${palette.black.alpha(0.16).toString()}
        `,
        /* eslint-enable no-magic-numbers*/
        backgroundColor: palette.white.toString(),
      };
    default:
      exhaustiveCheck(type);
  }
};


interface ErrorProps {
  readonly hasError: boolean;
}

const Root = styled.div<ErrorProps & { buttonType: T.DateScreenButton }>(({ hasError, buttonType }) => ({
  display: 'flex',
  boxSizing: 'border-box',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  ...getRootStyleByType(buttonType, hasError),
}));

const SVGWrapper = styled.div<ErrorProps & { isClicked: boolean }>(({ hasError, isClicked }) => ({
  display: 'flex',
  alignItems: 'center',
  marginLeft: '10px',

  height: '15px',
  width: '15px',

  '> svg': {
    transform: 'scale(1.36)',
    '> g': {
      fill: (hasError ? palette.UploadPopup.error : isClicked ? 'var(--color-theme-primary)' : palette.dropdown.caretColor).toString(),
    },
  },
}));

const Title = styled.div<
  ErrorProps & {
    isPlaceholder: boolean;
    prevIsClicked: boolean | undefined;
  }
>(({ hasError, isPlaceholder, prevIsClicked }) => ({
  display: 'inline-block',
  fontSize: '14px',
  color: (() => {
    if (hasError) {
      return palette.UploadPopup.error;
    }
    return isPlaceholder && !prevIsClicked
      ? palette.UploadPopup.inputBorder
      : 'var(--color-theme-primary-lighter)';
  })().toString(),
  fontFamily: FontFamily.NOTOSANS,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  width: 'auto',
  height: '15px',
}));

const Date = styled.span({
  fontFamily: FontFamily.ROBOTO,
  fontWeight: 'bold',
  height: '15px',
  lineHeight: '16px',
  marginRight: '5px',
});


export interface Props {
  readonly hasError?: boolean;
  readonly screen?: T.Screen;
  readonly type: T.DateScreenButton;
  readonly isClicked: boolean;
  onClick(): void;
}

export const DateScreenButton: FC<Props> = ({
  screen, type, isClicked, onClick,
  hasError = false,
}) => {
  const timezoneOffset: T.CommonPageState['timezoneOffset'] = useSelector((state: T.State) => state.Pages.Common.timezoneOffset);

  const [l10n]: UseL10n = useL10n();
  const getDefaultScreenTitle: UseGetDefaultScreenTitle = useGetDefaultScreenTitle();

  const title: string = screen ? screen.title : l10n(Text.placeholder);
  const isPlaceholder: boolean = screen?.id === TEMP_SCREEN_ID && screen.title === getDefaultScreenTitle(screen.appearAt);
  const prevIsClicked: boolean | undefined = usePrevProps(isClicked);
  const YYYYMMDD: ReactNode = screen ? (
    <Date>
      {formatWithOffset(timezoneOffset, screen.appearAt, Formats.YYMMDD)}
    </Date>
  ) : (<></>);
  return (
    <Root hasError={hasError} buttonType={type} onClick={onClick}>
      <Title
        hasError={hasError}
        isPlaceholder={isPlaceholder}
        prevIsClicked={prevIsClicked}
      >
        {YYYYMMDD}
        {title}
      </Title>
      <SVGWrapper hasError={hasError} isClicked={isClicked}>
        <CalendarSVG />
      </SVGWrapper>
    </Root>
  );
};
