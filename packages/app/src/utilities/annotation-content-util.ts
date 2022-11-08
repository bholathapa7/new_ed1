import * as _ from 'lodash-es';
import { Coordinate } from 'ol/coordinate';

import { CONTENT_NUMBER_GAP, CONTENT_TITLE_PREFIX, START_CONTENT_NUMBER, START_MEASUREMENT_NUMBER } from '^/constants/defaultContent';
import { L10nFn } from '^/hooks';
import * as T from '^/types';
import { contentTexts } from './content-util';

export const getOrderedTitle: (name: T.Content['title'], usingNames: Array<T.Content['title']>) => T.Content['title'] = (
  name, usingNames,
) => {
  const postfix: Array<number> = usingNames
    // Contents must start with the exact name
    .filter((n) => n.includes(name) && n.indexOf(name) === 0)
    // Only retrieve anything else after the name to increment the number.
    .map((n) => n.replace(name, '').match(/\s*\d*$/))
    .map((m) => m === null ? START_MEASUREMENT_NUMBER : Number(m[0]));
  const usingOrdered: Array<number> = _.uniq(postfix);
  const maxOrder: number | undefined = _.max(usingOrdered);

  /*
   * I tried to start newOrder from 1 and not display 1 in a way.
   * However, if the user changes to 1 directly, it starts from 0 because it needs to branch.
   */
  let newOrder: number = START_MEASUREMENT_NUMBER;
  while (maxOrder !== undefined && newOrder <= maxOrder && usingOrdered.includes(newOrder)) {
    if (newOrder === START_MEASUREMENT_NUMBER) {
      newOrder++;
    }

    newOrder++;
  }

  return usingOrdered.length && newOrder > START_MEASUREMENT_NUMBER ? `${name} ${newOrder}` : name;
};

export const getCopiedContentTitle: (
  selectedContentTitle: T.Content['title'],
  usingContentTitles: Array<T.Content['title']>
) => T.Content['title'] = (
  selectedContentTitle,
  usingContentTitles,
) => {
  const postfixOfContentsWithSameType: Array<number> = usingContentTitles
    .filter((title) => title.includes(selectedContentTitle) && title.indexOf(selectedContentTitle) === 0)
    .map((title) => {
      const postfix = title.replace(selectedContentTitle, '');
      const parsedNum = Number(postfix.match(/\(([^)]+)\)/)?.pop()) ?? START_CONTENT_NUMBER;
      return parsedNum;
    })
    .filter((num) => !isNaN(num))
    .sort((a, b) => a - b);
  const nextContentNum: number = postfixOfContentsWithSameType.length
    ? postfixOfContentsWithSameType[postfixOfContentsWithSameType.length - 1] + CONTENT_NUMBER_GAP
    : START_CONTENT_NUMBER + CONTENT_NUMBER_GAP;

  return `${selectedContentTitle}${CONTENT_TITLE_PREFIX}(${nextContentNum})`;
};

export const getNotDuplicatePoints: (locations: Array<Coordinate>) => Array<Coordinate> = (
  locations,
) => {
  const refinedLocations: Array<Coordinate> = [];
  locations
    .map((p) => p.toString())
    .forEach((hash, i) => {
      const lastPoint: Coordinate | undefined = _.last(refinedLocations);
      if (lastPoint && lastPoint.toString() === hash) {
        return;
      }
      refinedLocations.push(locations[i]);
    });

  return refinedLocations;
};

export const getContentTitle: (content: T.Content, l10n: L10nFn) => T.Content['title'] = (content, l10n) => {
  switch (content.type) {
    case T.ContentType.MAP:
    case T.ContentType.DSM:
    case T.ContentType.POINTCLOUD:
    case T.ContentType.THREE_D_ORTHO:
    case T.ContentType.GCP_GROUP:
    case T.ContentType.THREE_D_MESH:
      return l10n(contentTexts[content.type]);

    default:
      return content.title;
  }
};

export const getHasColor: (contentType: T.ContentType) => boolean = (
  contentType,
) => [
  T.ContentType.MARKER,
  T.ContentType.LENGTH,
  T.ContentType.AREA,
  T.ContentType.VOLUME,
  T.ContentType.ESS_ARROW,
  T.ContentType.ESS_POLYLINE,
  T.ContentType.ESS_POLYGON,
].includes(contentType);
