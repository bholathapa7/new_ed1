import { defaultMapZoom } from '^/constants/defaultContent';
import { mockContents } from '^/store/Mock';
import * as T from '^/types';

import * as MU from './map-util';

/* eslint-disable no-magic-numbers */
describe('getCenterBoundary', () => {
  it('should return correct mean values', () => {
    const boundary0: T.MapBoundary = {
      minLon: 100,
      maxLon: 100.1,
      minLat: 38.3,
      maxLat: 38.5,
    };
    expect(MU.getCenterBoundary(boundary0)).toEqual([100.05, 38.4]);
    const boundary1: T.MapBoundary = {
      minLon: 100,
      maxLon: 200,
      minLat: 0,
      maxLat: 100,
    };
    expect(MU.getCenterBoundary(boundary1)).toEqual([150, 50]);
  });
});

describe('getZoom', () => {
  it('should return defaultMapZoom if no tms and default zoom is provided', () => {
    expect(MU.getZoom(undefined, 15)).toEqual(defaultMapZoom);
  });

  it('should return defaultZoom if no tms is provided', () => {
    const DEFAULT_ZOOM: number = 14;
    expect(MU.getZoom(undefined, 15, DEFAULT_ZOOM)).toEqual(DEFAULT_ZOOM);
  });
});

describe('getSquareOrBoundary', () => {
  const {
    minLon,
    minLat,
    maxLon,
    maxLat,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  }: T.MapBoundary = ((mockContents.contents.byId[13] as T.MapContent).info.tms!).boundaries[13];
  // You don't want to get other properties like minX, minY, ...
  const boundary: T.MapBoundary = {
    minLon,
    minLat,
    maxLon,
    maxLat,
  };
  it(`should give [
      [minLon, maxLat],
      [maxLon, minLat],
     ] if sqaure is out of range`, () => {
    const squareOutOfRange: [T.GeoPoint, T.GeoPoint] =
      [[minLon - 1, maxLat + 1], [maxLon + 1, minLat - 1]];
    expect(MU.getSquareOrBoundary(squareOutOfRange, boundary))
      .toEqual([[minLon, maxLat], [maxLon, minLat]]);
  });

  it('should give [squareMinXY, squareMaxXY] if square is in range', () => {
    const squareInRange: [T.GeoPoint, T.GeoPoint] =
      [
        [minLon + 0.00000000000000001, maxLat + 0.00000000000000001],
        [maxLon - 0.00000000000000001, minLat - 0.00000000000000001],
      ];
    expect(MU.getSquareOrBoundary(squareInRange, boundary))
      .toEqual(squareInRange);
  });
});

describe('getMidPoint', () => {
  it('should return correct mean', () => {
    const locs: Array<T.GeoPoint> = [[0, 0], [50, 50]];

    expect(MU.getMidPoint(locs)).toEqual([25, 25]);
  });

  it('should return a correct mean for multiple locs as well', () => {
    const locs: Array<T.GeoPoint> =
      [[-50, -50], [-100, -100], [0, 0], [50, 50], [100, 100], [0, 0]];

    expect(MU.getMidPoint(locs)).toEqual([0, 0]);
  });
});

describe('getClosestZoomLevel', () => {
  it('should give closest zoom level', () => {
    const tms: T.MapContent['info']['tms'] =
      (mockContents.contents.byId[13] as T.MapContent).info.tms;
    [[12, 9], [12, 8], [12, 4], [22, 44], [22, 24]].forEach(([expected, input]) => {
      expect(MU.getClosestZoomLevel(tms, input)).toEqual(expected);
    });
  });

  it('should give defaultMapZoom if there is no tms given', () => {
    expect(MU.getClosestZoomLevel(undefined, 15)).toEqual(defaultMapZoom);
  });
});
