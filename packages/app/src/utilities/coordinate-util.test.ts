import * as T from '^/types';

import * as CU from './coordinate-util';

/* eslint-disable no-magic-numbers */

describe('getEPSGfromProjectionLabel', () => {
  it('should give EPSG values on correct projection input', () => {
    const epsg: string = CU.getEPSGfromProjectionLabel(T.ProjectionEnum.Bessel_EPSG_5174_EN);
    expect(epsg).toEqual('EPSG:5174');
    const epsg2: string = CU.getEPSGfromProjectionLabel(T.ProjectionEnum.GRS80_EPSG_5187_EN);
    expect(epsg2).toEqual('EPSG:5187');
  });
});

describe('getLongLatXYLabel', () => {
  [
    {
      explanation: 'should give [Latitude, Longitude] if isFull and there is no match',
      input: [undefined, true],
      output: ['Latitude', 'Longitude'],
    },
    {
      explanation: 'should give [Long, Lat] if not isFull and there is no match',
      input: [undefined, false],
      output: ['Lat', 'Long'],
    },
    {
      explanation: 'should give [Y, X] if isFull and there is a match',
      input: [T.ProjectionEnum.Bessel_EPSG_5173_EN, false],
      output: ['Y', 'X'],
    },
  ].forEach(({ explanation, input, output }: {
    explanation: string;
    input: [T.ProjectionEnum, boolean];
    output: [string, string];
  }) => {
    it(explanation, () => {
      const [proj, isFull]: [T.ProjectionEnum, boolean] = input;
      expect(CU.getLatLongYXLabel({
        proj, isFull,
      })).toEqual(output);
    });
  });
});

describe('getTiles', () => {
  it('should output tiles', () => {
    const tiles: Array<T.ExtentTileInfo> = CU.getTiles({ left: 300, right: 130, bottom: 450, top: 70 }, 16);
    expect(tiles).toEqual([{
      X: 32768,
      Y: 32767,
      Z: 16,
      left: -125,
      top: -226,
    }]);
  });
});

describe('getTileExtent', () => {
  it('should output tile extent', () => {
    const zoomLevel: number = 13;
    const tileExtent: CU.TileExtentInfo = CU.getTileExtent(zoomLevel, 500, 400);
    expect(tileExtent).toEqual({
      bottom: 18080720.418688733,
      left: -17596415.407473855,
      right: -17591523.437663604,
      top: 18085612.388498984,
      res: CU.Resolutions[zoomLevel],
    });
  });
});
