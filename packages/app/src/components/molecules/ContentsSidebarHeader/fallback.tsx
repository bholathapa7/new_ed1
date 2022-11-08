import React, { FC } from 'react';

import ArrowSVG from '^/assets/icons/content-sidebar-header/arrow.svg';
import CalendarSVG from '^/assets/icons/content-sidebar-header/calendar.svg';
import { ErrorText, NOT_ALLOWED_CLASS_NAME, UseL10n, defaultToastErrorOption, useInitialToast, useL10n } from '^/hooks';
import * as T from '^/types';
import { ApplyOptionIfKorean, GetCommonFormat, formatWithOffset } from '^/utilities/date-format';
import { ArrowWrapper, CalendarTextSection, DateTitleWrapper, Root } from './';

export const Fallback: FC = () => {
  const [, lang]: UseL10n = useL10n();

  useInitialToast({
    type: T.Toast.ERROR,
    content: {
      title: ErrorText.contentsSidebarHeader.title,
      description: ErrorText.contentsSidebarHeader.description,
    },
    option: defaultToastErrorOption,
  });

  const YYYYMMDD: string = formatWithOffset(
    new Date().getTimezoneOffset(),
    new Date(),
    GetCommonFormat({ lang, hasDay: true }),
    ApplyOptionIfKorean(lang),
  );

  return (
    <Root isVisible={false} className={NOT_ALLOWED_CLASS_NAME}>
      <CalendarTextSection>
        <ArrowWrapper
          isDisabled={true}
          isRight={false}
        >
          <ArrowSVG />
        </ArrowWrapper>
        <DateTitleWrapper isVisible={false} >
          <span>
            {YYYYMMDD}
          </span>
          <CalendarSVG />
        </DateTitleWrapper>
        <ArrowWrapper
          isDisabled={true}
          isRight={true}
        >
          <ArrowSVG />
        </ArrowWrapper>
      </CalendarTextSection>
    </Root>
  );
};
