import { addMinutes, format } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';

import * as T from '^/types';

interface FormatWithOffsetOptions {
  locale?: Locale;
  // eslint-disable-next-line no-magic-numbers
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  firstWeekContainsDate?: number;
  useAdditionalWeekYearTokens?: boolean;
  useAdditionalDayOfYearTokens?: boolean;
}

/**
 * @desc Following is defined in type of date-fns
 */
type FormatWithOffset = (
  offset: number,
  date: Date,
  formatString: string,
  options?: FormatWithOffsetOptions,
) => string;
export const formatWithOffset: FormatWithOffset = (
  offset,
  date,
  formatString,
  options,
) => {
  const environmentOffset: number = new Date(date).getTimezoneOffset();

  return format(addMinutes(date, environmentOffset - offset), formatString, options);
};

/* eslint-disable no-magic-numbers */
export enum DateConstant {
  HOUR = 24,
  MINUTE = 60,
  SECOND = 60,
  MILLISECOND = 1e3,
}
/* eslint-enable no-magic-numbers */

/**
 * @desc (UTC <-> GMT) Increase or subtract by that time to avoid changing dates during conversion. (Aligned by 00 o'clock)
 */
export const makeConsistentUTCDateViaOffset: (date: Date, timezoneOffset: number) => Date = (date, timezoneOffset) =>
  new Date(
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - (DateConstant.MINUTE * DateConstant.MILLISECOND * timezoneOffset),
  );
/**
 * Frequently used formats
 * You can check en-US formats in this link
 * https://date-fns.org/v2.9.0/docs/format
 */
export enum Formats {
  /* Long localized date */
  PP = 'PP', // en: May 29, 1453
  PPP = 'PPP', // en: May 29th, 1453, ko: 2020년 2월 10일

  /* Long localized time */
  pp = 'pp', // en: 12:00:00 AM

  /* ISO day of week */
  iii = 'iii', // en: Mon, ko: 월
  iiii = 'iiii', // en: Monday, ko: 월요일

  YYYYMMDD = 'yyyy. MM. dd', // ko: 2020. 12. 23
  YYMMDD = 'yy. MM. dd', // 20. 04. 24
  YYYY_MM_DD = 'yyyy-MM-dd', // 2021-05-13
}

interface CommonFormat {
  [T.Language.KO_KR](hasDay: boolean): string;
  [T.Language.EN_US](hasDay: boolean): string;
}

const commonFormat: CommonFormat = {
  [T.Language.KO_KR]: (hasDay) => !hasDay ? Formats.YYYYMMDD : `${Formats.YYYYMMDD} (${Formats.iii})`,
  [T.Language.EN_US]: (hasDay) => !hasDay ? Formats.PP : `${Formats.iii}, ${Formats.PP}`,
};

export const GetCommonFormat: (params: {
  lang: T.Language;
  hasDay: boolean;
}) => string = ({ lang, hasDay }) => commonFormat[lang](hasDay);

export const ApplyOptionIfKorean: (
  lang?: T.Language, option?: FormatWithOffsetOptions,
) => FormatWithOffsetOptions = (
  lang = T.Language.KO_KR, option,
) => ({
  ...option,
  locale: lang === T.Language.KO_KR ? ko : enUS,
});

export const getFormattedDate: (
  timezoneOffset: number, customFormat: string,
) => (date: Date) => string = (
  timezoneOffset, customFormat,
) => (date) => formatWithOffset(timezoneOffset, date, customFormat);
