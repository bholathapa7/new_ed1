import {
  DEFAULT_MEASUREMENT_TEXT,
  createDefaultArea,
  createDefaultLength,
  createDefaultMarker,
  createDefaultVolume,
} from '^/constants/defaultContent';
import palette from '^/constants/palette';
import { PostContentArguments } from '^/store/duck/Contents';
import * as T from '^/types';
import { Coordinate } from 'ol/coordinate';
import {
  getNotDuplicatePoints,
  getOrderedTitle,
} from './annotation-content-util';
import { l10n } from './l10n';

/* eslint-disable no-magic-numbers */
const defaultPosition: Coordinate = [123, 123];
const defaultLanguage: T.Language = T.Language.EN_US;
const usingNames: Array<string> = ['chicken', 'samgyeopsal'];
const defaultTargetMapContentId: number = 1234;

describe('defaultMarker', () => {
  it('should return a correct object', () => {
    const obj: Pick<T.MarkerContent, PostContentArguments> =
    /* eslint-disable no-magic-numbers */
      createDefaultMarker({
        language: T.Language.EN_US,
        targetMapContentId: defaultTargetMapContentId,
        location: defaultPosition,
        locations: [defaultPosition],
        usingNames,
      });
    expect(obj).toEqual({
      title: getOrderedTitle(l10n(DEFAULT_MEASUREMENT_TEXT.marker.title, defaultLanguage), usingNames),
      type: T.ContentType.MARKER,
      color: palette.measurements.marker,
      info: {
        description: '',
        location: defaultPosition,
        move: false,
        targetMapContentId: defaultTargetMapContentId,
      },
    });
  });
});

describe('defaultLength', () => {
  it('should return a correct object', () => {
    const obj: Pick<T.LengthContent, PostContentArguments> =
    createDefaultLength({
      language: defaultLanguage,
      targetMapContentId: defaultTargetMapContentId,
      locations: [defaultPosition],
      usingNames,
    });
    expect(obj).toEqual({
      title: getOrderedTitle(l10n(DEFAULT_MEASUREMENT_TEXT.length.title, defaultLanguage), usingNames),
      type: T.ContentType.LENGTH,
      color: palette.measurements.length,
      info: {
        locations: [defaultPosition],
        move: false,
        value: '',
      },
    });
  });
});

describe('defaultArea', () => {
  it('should return a correct object', () => {
    const obj: Pick<T.AreaContent, PostContentArguments> =
      createDefaultArea({
        language: defaultLanguage,
        locations: [defaultPosition],
        usingNames,
      });
    expect(obj).toEqual({
      title: getOrderedTitle(l10n(DEFAULT_MEASUREMENT_TEXT.area.title, defaultLanguage), usingNames),
      type: T.ContentType.AREA,
      color: palette.measurements.area,
      info: {
        locations: [defaultPosition],
        move: false,
        value: '',
      },
    });
  });
});

describe('defaultVolume', () => {
  it('should return a correct object', () => {
    const obj: Pick<T.VolumeContent, PostContentArguments> =
      createDefaultVolume({
        language: defaultLanguage,
        locations: [defaultPosition],
        targetMapContentId: defaultTargetMapContentId,
        usingNames,
      });
    expect(obj).toEqual({
      title: getOrderedTitle(l10n(DEFAULT_MEASUREMENT_TEXT.volume.title, defaultLanguage), usingNames),
      type: T.ContentType.VOLUME,
      color: palette.measurements.volume,
      info: {
        calculatedVolume: {
          calculation: {
            type: 'vc',
            volumeAlgorithm: 'triangulation',
            volumeElevation: 0,
          },
          cut: 0,
          fill: 0,
          total: 0,
        },
        locations: [defaultPosition],
        value: '',
      },
    });
  });
});

describe('getNotDuplicatePoints', () => {
  it('should return no duplicate points at the end', () => {
    const points: Array<Coordinate> = getNotDuplicatePoints(
      [[0, 4], [1, 1], [0, 0], [9999, 333], [123, 14], [333, 222], [333, 222]],
    );
    expect(points.length).toEqual(6);
  });
});
