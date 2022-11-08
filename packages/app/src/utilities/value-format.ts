import _ from 'lodash-es';

export interface ValueFormatOptions {
  unit: string;
  digit?: number;
  gap?: number;
  prefix?: Array<string>;
  trimZero?: boolean;
}
interface InternalValueFormatOptions extends ValueFormatOptions {
  digit: number;
  gap: number;
  prefix: Array<string>;
  trimZero: boolean;
}

const defaultOptions: InternalValueFormatOptions = {
  digit: 2,
  unit: '',
  gap: 1000,
  prefix: ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
  trimZero: true,
};

const trimValue: (
  value: number, digit: number, trimZero: boolean,
) => string = (
  value, digit, trimZero,
) => {
  const rangedValue: string = value.toFixed(digit > 0 ? digit : 0);
  let trimed: string = digit > 0 && trimZero ? _.trimEnd(rangedValue, '0') : rangedValue;

  if (trimed[trimed.length - 1] === '.') {
    trimed = trimed.slice(0, -1);
  }

  return trimed;
};

const format: (
  value: number, options?: ValueFormatOptions,
) => string = (
  value, options = defaultOptions,
) => {
  const { unit, digit, gap, prefix, trimZero }: InternalValueFormatOptions = {
    ...defaultOptions,
    ...options,
  };

  if (value === 0) {
    if (unit === '') {
      return '0';
    }

    return `0 ${unit}`;
  }

  if (unit === '') {
    return trimValue(value, digit, trimZero);
  }

  const absValue: number = Math.abs(value);
  const exp: number = Math.min(
    Math.max(Math.floor(Math.log(absValue) / Math.log(gap)), 0),
    prefix.length,
  );
  const result: string = trimValue(value / Math.pow(gap, exp), digit, trimZero);

  return `${result} ${prefix[exp]}${unit}`;
};
export default format;
