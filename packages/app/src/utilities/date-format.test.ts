import { formatWithOffset } from './date-format';

/* eslint-disable no-magic-numbers */

const formatDateForTest: (date: Date) => Array<string> = (date) =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((d, i) => i >= 1 && d.toString().length === 1 ? `0${d.toString()}` : d.toString());

describe('formatWithOffSet', () => {
  let date: Date;
  const dayMins: number = 24 * 60 * 2;

  beforeEach(() => {
    date = new Date();
  });

  it('should output today if there is no offset given', () => {
    const datetime: string = formatWithOffset(0, date, 'yyMMdd');
    const [y, m, d]: Array<string> = formatDateForTest(date);
    expect(datetime).toBe(`${y.substr(2)}${m}${d}`);
  });

  it('should output a past date if there is a significant positive offset given', () => {
    const datetime: string = formatWithOffset(dayMins, date, 'yyMMdd');
    expect(date.getTime() > new Date(datetime).getTime());
  });

  it('should output a future date if there is a negative offset given', () => {
    const datetime: string = formatWithOffset(-dayMins, date, 'yyMMdd');
    expect(date.getTime() < new Date(datetime).getTime());
  });

  it('should be able to output some foramt like yyMMdd', () => {
    const datetime: string = formatWithOffset(0, date, 'yyMMdd');
    expect(datetime.length).toBe(6);
  });

  it('should be able to output some format like yy.MM.dd', () => {
    const datetime: string = formatWithOffset(0, date, 'yy.MM.dd');
    expect(datetime.split('.').length).toBe(3);
  });

  it('should be able to output some format like yy/MM/dd', () => {
    const datetime: string = formatWithOffset(0, date, 'yy/MM/dd');
    expect(datetime.split('/').length).toBe(3);
  });
});
