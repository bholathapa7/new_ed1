import * as T from '^/types';
import { L10nDictionary } from '^/utilities/l10n';

const { LATITUDE, LONGITUDE, EASTING, NORTHING, ALTITUDE }: typeof T.CoordinateTitle = T.CoordinateTitle;

export const DEFAULT_COORDINATE_TITLE_TEXT: { [K in T.CoordinateTitle]: L10nDictionary } = {
  [LATITUDE]: {
    [T.Language.KO_KR]: '위도',
    [T.Language.EN_US]: 'Latitude',
  },
  [LONGITUDE]: {
    [T.Language.KO_KR]: '경도',
    [T.Language.EN_US]: 'Longitude',
  },
  [EASTING]: {
    [T.Language.KO_KR]: '동경(x)',
    [T.Language.EN_US]: 'Easting(X)',
  },
  [NORTHING]: {
    [T.Language.KO_KR]: '북위(y)',
    [T.Language.EN_US]: 'Northing(Y)',
  },
  [ALTITUDE]: {
    [T.Language.KO_KR]: '고도',
    [T.Language.EN_US]: 'Elevation',
  },
};
