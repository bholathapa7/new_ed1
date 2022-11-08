import proj4 from 'proj4';

import * as T from '^/types';
import { getEPSGfromProjectionLabel } from './coordinate-util';

export const gcpsToGeoPoints: (gcps: T.GCP[], gcpCRS: T.CoordinateSystem) => Array<T.GeoPoint> | undefined = (gcps, gcpCRS) => gcps
  .map((gcp) => [gcp.easting, gcp.northing])
  .filter((coordinate) => coordinate.every((value) => !isNaN(value) && value !== 0))
  .map(([easting, northing]) => proj4(getEPSGfromProjectionLabel(T.ProjectionEnum[gcpCRS]), 'EPSG:4326').forward([easting, northing]));
