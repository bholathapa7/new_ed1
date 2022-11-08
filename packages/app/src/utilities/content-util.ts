import { isSameDay } from 'date-fns';
import { isLonLat, typeGuardGroup } from '^/hooks';
import { TabToCategoryMapper } from '^/store/duck/Groups';
import { getCenterBoundary, getMidPoint } from '^/utilities/map-util';

import * as T from '^/types';
import { L10nDictionary } from './l10n';
import proj4 from 'proj4';
import { getEPSGfromProjectionLabel } from './coordinate-util';
import { gcpsToGeoPoints } from './gcp-util';

export const isPinnable: (category: T.Content['category']) => boolean = (category) => category === T.ContentCategory.MEASUREMENT;
export const isContentPinned: (content: T.Content) => boolean = (content) => content.screenId === undefined;

/**
 * @todo: should be changed after guideline comes out
 */
export const contentTexts: { [K in T.ContentType]: L10nDictionary } = {
  [T.ContentType.AREA]: {
    [T.Language.KO_KR]: '면적',
    [T.Language.EN_US]: 'Area',
  },
  [T.ContentType.LENGTH]: {
    [T.Language.KO_KR]: '거리',
    [T.Language.EN_US]: 'Distance',
  },
  [T.ContentType.MARKER]: {
    [T.Language.KO_KR]: '위치',
    [T.Language.EN_US]: 'Location',
  },
  [T.ContentType.VOLUME]: {
    [T.Language.KO_KR]: '체적',
    [T.Language.EN_US]: 'Volume',
  },
  [T.ContentType.BLUEPRINT_PDF]: {
    [T.Language.KO_KR]: '도면 (.PDF)',
    [T.Language.EN_US]: 'PDF',
  },
  [T.ContentType.BLUEPRINT_DXF]: {
    [T.Language.KO_KR]: '도면 (.DXF)',
    [T.Language.EN_US]: 'DXF',
  },
  [T.ContentType.BLUEPRINT_DWG]: {
    [T.Language.KO_KR]: '도면 (.DWG)',
    [T.Language.EN_US]: 'DWG',
  },
  [T.ContentType.DESIGN_DXF]: {
    [T.Language.KO_KR]: '계획고 (.DXF)',
    [T.Language.EN_US]: 'DXF',
  },
  [T.ContentType.MAP]: {
    [T.Language.KO_KR]: '정사영상',
    [T.Language.EN_US]: '2D Orthomosaic',
  },
  [T.ContentType.DSM]: {
    [T.Language.KO_KR]: '수치표면모델',
    [T.Language.EN_US]: 'DSM',
  },
  [T.ContentType.POINTCLOUD]: {
    [T.Language.KO_KR]: '포인트 클라우드',
    [T.Language.EN_US]: 'Point Cloud',
  },
  [T.ContentType.THREE_D_ORTHO]: {
    [T.Language.KO_KR]: '3D 정사영상',
    [T.Language.EN_US]: '3D Orthomosaic',
  },
  [T.ContentType.THREE_D_MESH]: {
    [T.Language.KO_KR]: '3D 메쉬 모델',
    [T.Language.EN_US]: '3D Mesh Model',
  },
  [T.ContentType.GCP_GROUP]: {
    [T.Language.KO_KR]: '지상기준점',
    [T.Language.EN_US]: 'GCP',
  },
  [T.ContentType.ESS_MODEL]: {
    [T.Language.KO_KR]: '장비',
    [T.Language.EN_US]: 'Equipment',
  },
  [T.ContentType.ESS_ARROW]: {
    [T.Language.KO_KR]: '화살표',
    [T.Language.EN_US]: 'Arrow',
  },
  [T.ContentType.ESS_POLYGON]: {
    [T.Language.KO_KR]: '다각형',
    [T.Language.EN_US]: 'Polygon',
  },
  [T.ContentType.ESS_POLYLINE]: {
    [T.Language.KO_KR]: '선',
    [T.Language.EN_US]: 'Polyline',
  },
  [T.ContentType.ESS_TEXT]: {
    [T.Language.KO_KR]: '텍스트',
    [T.Language.EN_US]: 'Text',
  },
  [T.ContentType.GROUP]: {
    [T.Language.KO_KR]: '그룹 제목',
    [T.Language.EN_US]: 'Group Title',
  },
};

/**
 * @desc This function returns array of content titles about pinned, unpinned contents in specific date
 */
export const getMeasurementContentTitlesFromDate: (
  contents: T.ContentsState['contents']['byId'], date?: Date,
) => Array<string> = (contents, date) => Object
  .values(contents)
  .filter((content: T.Content) => T.MeasurementContentTypes.includes(content.type))
  .filter(({ appearAt }: T.MeasurementContent) => appearAt === undefined || (date !== undefined && isSameDay(appearAt, date)))
  .map(({ title }) => title);

export const getContentTitlesByType: (
  contents: T.ContentsState['contents']['byId'], type: T.ESSContent['type'],
) => string[] = (contents, type) => Object
  .values(contents)
  .reduce<string[]>((names, content) => {
    if (content.type === type) {
      names.push(content.title);
    }

    return names;
  }, []);

/**
 * Gets the first occurence of a group given the category.
 * This is used when no group id is selected.
 * If screen id is provided, it will go through ALL contents from category
 * if there is none, only then use the first pinned group.
 * When no screen id provided, it will use the first pinned group regardless.
 *
 * @param category All categories that have groups, i.e. measurements, overlay, ess
 * @param screenId
 * @returns The group id. If undefined is returned, this means this project has zero groups.
 */
const getFirstGroupByCategory: (
  category: T.ContentCategory, screenId?: T.Screen['id'],
) => (state: T.State) => T.GroupContent['id'] | undefined = (
  category, screenId,
) => (state) => {
  let pinnedGroup: T.GroupContent['id'] | undefined;
  let unpinnedGroup: T.GroupContent['id'] | undefined;

  for (const id of state.Contents.contents.allIds) {
    const content: T.Content | undefined = state.Contents.contents.byId[id];
    if (content === undefined || content.type !== T.ContentType.GROUP || content.category !== category) {
      continue;
    }

    pinnedGroup = content.id;
    if (screenId === undefined) {
      break;
    }

    if (screenId === content.screenId) {
      unpinnedGroup = content.id;
      break;
    }
  }

  return unpinnedGroup ?? pinnedGroup;
};

export const getCurrentGroupId: (
  state: T.State,
  tab: T.ContentPageTabType,
  lastSelectedScreenId?: T.Screen['id'],
) => T.GroupContent['id'] = (
  state, tab, lastSelectedScreenId
) => {
  const selectedGroupId = state.Groups.selectedGroupIdByTab[tab];
  const groupContent = typeGuardGroup(state.Contents.contents.byId[selectedGroupId ?? NaN]);
  // There's a small chance that somehow the group does not exist.
  // If so, fallback to at least one group from the list below.
  if (groupContent !== undefined) {
    return groupContent.id;
  }

  const firstGroupId = getFirstGroupByCategory(TabToCategoryMapper[tab], lastSelectedScreenId)(state);
  if (firstGroupId === undefined) {
    throw new Error('Unable to get the first group: at least one group should exist in the project to create a content.');
  }

  return firstGroupId;
};

/**
 * Get center point of any content.
 */
export const getCenterPointByContent: (
  content: T.Content, projectProjection?: T.ProjectionEnum,
) => T.GeoPoint | undefined = (
  content, projectProjection
) => {
  switch (content.type) {
    case T.ContentType.BLUEPRINT_PDF:
      return getCenterBoundary({
        minLon: content.info.geoPoint[0][0],
        maxLon: content.info.geoPoint[1][0],
        minLat: content.info.geoPoint[0][1],
        maxLat: content.info.geoPoint[1][1],
      });
    case T.ContentType.BLUEPRINT_DXF:
    case T.ContentType.BLUEPRINT_DWG:
      if (content.info.tms?.center) {
        return [content.info.tms.center[0], content.info.tms.center[1]];
      }
      if (content?.info.tms?.bounds) {
        return getCenterBoundary({
          minLon: content.info.tms.bounds[T.MapBounds.MIN_LON],
          maxLon: content.info.tms.bounds[T.MapBounds.MAX_LON],
          minLat: content.info.tms.bounds[T.MapBounds.MIN_LAT],
          maxLat: content.info.tms.bounds[T.MapBounds.MAX_LAT],
        });
      }

      return undefined;
    case T.ContentType.ESS_MODEL:
    case T.ContentType.ESS_TEXT:
    case T.ContentType.MARKER:
      if (projectProjection !== undefined) {
        return isLonLat(content.info.location)
          ? content.info.location
          : proj4(getEPSGfromProjectionLabel(projectProjection), 'EPSG:4326').forward(content.info.location);
      }

      return undefined;
    case T.ContentType.ESS_ARROW:
    case T.ContentType.ESS_POLYGON:
    case T.ContentType.ESS_POLYLINE:
    case T.ContentType.LENGTH:
    case T.ContentType.AREA:
    case T.ContentType.VOLUME:
      return getMidPoint(content.info.locations);
    case T.ContentType.GCP_GROUP:
      const geoPoints: T.GeoPoint[] | undefined = gcpsToGeoPoints(content.info.gcps, content.info.crs);
      if (geoPoints !== undefined) {
        return getMidPoint(geoPoints);
      }

      return undefined;
    default:
      return undefined;
  }
};
