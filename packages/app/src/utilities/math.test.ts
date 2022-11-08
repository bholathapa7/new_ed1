/* eslint-disable no-magic-numbers */
import {
  convertPercentToRanged,
  convertRangedToPercent,
} from './math';

describe('convertPercentToRanged', () => {
  it('should return a ranged value that is smaller than or equals to max value and is larger than or equals to min value', () => {
    expect(convertPercentToRanged(0, 50, 130)).toBeGreaterThanOrEqual(50);
    expect(convertPercentToRanged(0, 50, 130)).toBeLessThanOrEqual(130);

    expect(convertPercentToRanged(0.2, -600, -300)).toBeGreaterThanOrEqual(-600);
    expect(convertPercentToRanged(0.2, -600, -300)).toBeLessThanOrEqual(-300);

    expect(convertPercentToRanged(0.5, 140, 230)).toBeGreaterThanOrEqual(140);
    expect(convertPercentToRanged(0.5, 140, 230)).toBeLessThanOrEqual(230);

    expect(convertPercentToRanged(1, 10, 5023)).toBeGreaterThanOrEqual(10);
    expect(convertPercentToRanged(1, 10, 5023)).toBeLessThanOrEqual(5023);
  });
});

describe('convertRangedToPercent', () => {
  it('should return a percent value that is smaller than or equals to 1 and is larger than or equals to 0', () => {
    expect(convertRangedToPercent(70, 20, 90)).toBeGreaterThanOrEqual(0);
    expect(convertRangedToPercent(70, 20, 90)).toBeLessThanOrEqual(1);

    expect(convertRangedToPercent(-100, -140, -50)).toBeGreaterThanOrEqual(0);
    expect(convertRangedToPercent(-100, -140, -50)).toBeLessThanOrEqual(1);

    expect(convertRangedToPercent(0, 0, 260)).toBeGreaterThanOrEqual(0);
    expect(convertRangedToPercent(0, 0, 260)).toBeLessThanOrEqual(1);

    expect(convertRangedToPercent(3000, 2400, 3000)).toBeGreaterThanOrEqual(0);
    expect(convertRangedToPercent(3000, 2400, 3000)).toBeLessThanOrEqual(1);
  });
});
