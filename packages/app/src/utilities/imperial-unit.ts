import { Language, UnitType, UnitValue, ValidUnitType } from '^/types';
import { L10nDictionary } from './l10n';

export const VALUES_PER_METER: UnitValue<number> = {
  [UnitType.METRIC]: 1,
  [UnitType.IMPERIAL]: 3.28084,
};

export const UNIT_SYMBOL: UnitValue<string> = {
  [UnitType.METRIC]: 'm',
  [UnitType.IMPERIAL]: 'ft',
};

export const unitLabel: UnitValue<L10nDictionary> = {
  [UnitType.METRIC]: {
    [Language.KO_KR]: '미터 단위(Metric)',
    [Language.EN_US]: 'Metric Units',
  },
  [UnitType.IMPERIAL]: {
    [Language.KO_KR]: '제국 단위(Imperial)',
    [Language.EN_US]: 'Imperial Units',
  },
};

export const determineUnitType: (
  unit?: UnitType,
) => ValidUnitType = (
  unit,
) => (!unit || unit === UnitType.ANY) ? UnitType.METRIC : unit;

export const calculateDistance: (
  metricDistance: number, unit: ValidUnitType,
) => number = (
  metricDistance, unit,
) => (metricDistance * VALUES_PER_METER[unit]);

export const calculateArea: (
  metricArea: number, unit: ValidUnitType,
) => number = (
  metricArea, unit,
) => (metricArea * VALUES_PER_METER[unit] * VALUES_PER_METER[unit]);

const YARDS_PER_METER: number = 1.09361;

export const calculateVolume: (
  metricVolume: number, unit: ValidUnitType,
) => number = (
  metricVolume, unit,
) => {
  switch (unit) {
    case UnitType.IMPERIAL:
      return (metricVolume * YARDS_PER_METER * YARDS_PER_METER * YARDS_PER_METER);
    default:
      return (metricVolume * VALUES_PER_METER[unit] * VALUES_PER_METER[unit] * VALUES_PER_METER[unit]);
  }
};
