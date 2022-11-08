import _ from 'lodash-es';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import { LAT_LON_FIX_FORMAT, Y_X_FIX_FORMAT } from '^/constants/defaultContent';
import { DeleteContent, contentsSelector } from '^/store/duck/Contents';
import { OpenContentDeletingConfirmPopup, OpenContentPagePopup } from '^/store/duck/Pages';
import * as T from '^/types';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { isAllowDeleteContent } from '^/utilities/role-permission-check';
import { useRole } from './useRole';

/**
 * @key Having a true value means query result includes contents with that attribute
 * @example
 * pinned: true => query results includes pinned ones too
 * processing: false => query results doesn't include processing ones
 */
export interface ContentsQueryFilter {
  pinned?: boolean; //default assumption: true
  processingOrFailed?: boolean; //default assuption: false
  selectedAt?: boolean; //default assuption: false
}

/* eslint-disable max-len */
export type QueryParam = T.ContentsQueryParam.TITLE | T.ContentsQueryParam.TYPE_AND_SCREENID | T.ContentsQueryParam.ID;
export type QueryContentWithId = (givenId: T.Content['id'], givenOptions?: ContentsQueryFilter) => T.Content | undefined;
export type QueryContentWithTitle = (givenTitle: T.Content['title'], givenOptions?: ContentsQueryFilter) => T.Content | undefined;
export type QueryContentWithTypeAndScreenId = (givenType: T.Content['type'], givenScreenId: T.Screen['id'], givenOptions?: Omit<ContentsQueryFilter, 'pinned'>) => T.Content | undefined;

export type Query = QueryContentWithTitle | QueryContentWithTypeAndScreenId | QueryContentWithId;

export function queryContent(contents: T.State['Contents']['contents'], queryParam: QueryParam): Query {
  const allContents: Array<T.Content> = contents.allIds.map((cid) => contents.byId[cid]);

  switch (queryParam) {
    case T.ContentsQueryParam.TITLE:
      return (givenTitle: T.Content['title'], givenOptions?: ContentsQueryFilter) => {
        for (const c of allContents) {
          if (c.title !== givenTitle) continue;

          if (!(Boolean(givenOptions?.processingOrFailed)) && contentsSelector.isProcessingOrFailedByContent(c)) continue;
          if (givenOptions?.pinned === false && c.screenId === undefined) continue;
          if (Boolean(givenOptions?.selectedAt) && c.config?.selectedAt === undefined) continue;

          return c;
        }

        return;
      };
    case T.ContentsQueryParam.TYPE_AND_SCREENID:
      return (givenType: T.Content['type'], givenScreenId: T.Screen['id'], givenOptions?: Omit<ContentsQueryFilter, 'pinned'>) => {
        for (const c of allContents) {
          if (c.type !== givenType) continue;
          if (c.screenId === undefined || c.screenId !== givenScreenId) continue;

          if (!(Boolean(givenOptions?.processingOrFailed)) && contentsSelector.isProcessingOrFailedByContent(c)) continue;
          if (Boolean(givenOptions?.selectedAt) && c.config?.selectedAt === undefined) continue;

          return c;
        }

        return;
      };
    case T.ContentsQueryParam.ID:
      return (givenId: T.Content['id'], givenOptions?: Omit<ContentsQueryFilter, 'pinned'>) => {
        for (const c of allContents) {
          if (c.id !== givenId) continue;

          if (!(Boolean(givenOptions?.processingOrFailed)) && contentsSelector.isProcessingOrFailedByContent(c)) continue;
          if (Boolean(givenOptions?.selectedAt) && c.config?.selectedAt === undefined) continue;

          return c;
        }

        return;
      };
    default:
      exhaustiveCheck(queryParam);
  }
}

export function useGetContentOf(queryParam: T.ContentsQueryParam.TITLE): QueryContentWithTitle;
export function useGetContentOf(queryParam: T.ContentsQueryParam.TYPE_AND_SCREENID): QueryContentWithTypeAndScreenId;
export function useGetContentOf(queryParam: T.ContentsQueryParam.ID): QueryContentWithId;
export function useGetContentOf(queryParam: QueryParam): Query | undefined {
  const { Contents: { contents } }: T.State = useSelector((s: T.State) => s);

  return queryContent(contents, queryParam);
}

export type QueryIDParam = T.ContentsQueryParam.TITLE | T.ContentsQueryParam.TYPE_AND_SCREENID;

export type QueryIDWithTitle = (givenTitle: T.Content['title'], givenOptions?: ContentsQueryFilter) => T.Content['id'] | undefined;
export type QueryIDWithTypeAndScreenId = (givenType: T.Content['type'], givenScreenId: T.Screen['id'], givenOptions?: Omit<ContentsQueryFilter, 'pinned'>) => T.Content['id'] | undefined;

export type QueryID = QueryIDWithTitle | QueryIDWithTypeAndScreenId;

export function useGetContentIdOf(queryIDParam: T.ContentsQueryParam.TITLE): QueryIDWithTitle;
export function useGetContentIdOf(queryIDParam: T.ContentsQueryParam.TYPE_AND_SCREENID): QueryIDWithTypeAndScreenId;
export function useGetContentIdOf(queryIDParam: QueryIDParam): QueryID | undefined {
  const getContentOfTitle: QueryContentWithTitle = useGetContentOf(T.ContentsQueryParam.TITLE);
  const getContentOfType: QueryContentWithTypeAndScreenId = useGetContentOf(T.ContentsQueryParam.TYPE_AND_SCREENID);
  if (queryIDParam === T.ContentsQueryParam.TITLE) {
    return (givenTitle: T.Content['title'], givenOptions?: ContentsQueryFilter) => getContentOfTitle(givenTitle, givenOptions)?.id;
  } else if (queryIDParam === T.ContentsQueryParam.TYPE_AND_SCREENID) {
    return (givenType: T.Content['type'], givenScreenId: T.Screen['id'], givenOptions?: Omit<ContentsQueryFilter, 'pinned'>) =>
      getContentOfType(givenType, givenScreenId, givenOptions)?.id;
  }

  return;
}

export type QueryAllParam = T.ContentsQueryParam.TYPE | T.ContentsQueryParam.TYPE_AND_SCREENID | T.ContentsQueryParam.SCREEN;

export type QueryContentsWithType = (givenType: T.Content['type'], givenOptions?: ContentsQueryFilter) => Array<T.Content>;
export type QueryContentsWithScreenId = (givenScreenId: T.Screen['id'], givenOptions?: ContentsQueryFilter) => Array<T.Content>;
export type QueryContentsWithTypeAndScreenId = (givenType: T.Content['type'], givenScreenId: T.Screen['id'], givenOptions?: ContentsQueryFilter) => Array<T.Content>;

export type QueryAll = QueryContentsWithType | QueryContentsWithScreenId | QueryContentsWithTypeAndScreenId;

export function useGetAllContentsOf(queryParam: T.ContentsQueryParam.TYPE): QueryContentsWithType;
export function useGetAllContentsOf(queryParam: T.ContentsQueryParam.SCREEN): QueryContentsWithScreenId;
export function useGetAllContentsOf(queryParam: T.ContentsQueryParam.TYPE_AND_SCREENID): QueryContentsWithTypeAndScreenId;
export function useGetAllContentsOf(queryParam: QueryAllParam): QueryAll | undefined {
  const { Contents: { contents } }: T.State = useSelector((s: T.State) => s);
  const allContents: Array<T.Content> = contents.allIds.map((cid) => contents.byId[cid]);

  if (queryParam === T.ContentsQueryParam.TYPE) {
    return (givenType: T.Content['type'], givenOptions?: ContentsQueryFilter) => {
      const filteredContents: Array<T.Content> = [];
      for (const c of allContents) {
        if (c.type !== givenType) continue;
        if (givenOptions?.pinned === false && c.screenId === undefined) continue;

        if (!(Boolean(givenOptions?.processingOrFailed)) && contentsSelector.isProcessingOrFailedByContent(c)) continue;
        if (Boolean(givenOptions?.selectedAt) && c.config?.selectedAt === undefined) continue;
        filteredContents.push(c);
      }

      return filteredContents;
    };
  } else if (queryParam === T.ContentsQueryParam.TYPE_AND_SCREENID) {
    return (givenType: T.Content['type'], givenScreenId: T.Screen['id'], givenOptions?: ContentsQueryFilter) => {
      const filteredContents: Array<T.Content> = [];
      for (const c of allContents) {
        if (c.type !== givenType) continue;
        if (!(Boolean(givenOptions?.processingOrFailed)) && contentsSelector.isProcessingOrFailedByContent(c)) continue;
        if (Boolean(givenOptions?.selectedAt) && c.config?.selectedAt === undefined) continue;
        if (givenOptions?.pinned === true && c.screenId === undefined) {
          filteredContents.push(c);
          continue;
        }
        if (c.screenId !== givenScreenId) continue;

        filteredContents.push(c);
      }

      return filteredContents;
    };
  } else if (queryParam === T.ContentsQueryParam.SCREEN) {
    return (givenScreenId: T.Screen['id'], givenOptions?: Omit<ContentsQueryFilter, 'pinned'>) => {
      const filteredContents: Array<T.Content> = [];
      for (const c of allContents) {
        if (c.screenId !== givenScreenId) continue;

        if (!(Boolean(givenOptions?.processingOrFailed)) && contentsSelector.isProcessingOrFailedByContent(c)) continue;
        if (Boolean(givenOptions?.selectedAt) && c.config?.selectedAt === undefined) continue;

        filteredContents.push(c);
      }

      return filteredContents;
    };
  }

  return;
}

export type UseDeleteContent = (contentId: T.Content['id'], contentType: T.ContentType) => void;
export const useDeleteContent: () => UseDeleteContent = () => {
  const dispatch: Dispatch = useDispatch();
  const role: T.PermissionRole = useRole();

  return (contentId: T.Content['id'], contentType: T.ContentType) => {
    if (!isAllowDeleteContent(role, contentType)) {
      dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));

      return;
    }

    dispatch(OpenContentDeletingConfirmPopup({
      popup: T.ContentPagePopupType.DELETE_CONFIRM,
      contentId,
    }));
  };
};

export function useDSMAvailableDates(): Array<Date> {
  const dsmContents: Array<T.DSMContent> = (useGetAllContentsOf(T.ContentsQueryParam.TYPE)(T.ContentType.DSM) as Array<T.DSMContent>)
    .filter((c: T.DSMContent) => c.appearAt.getTime() !== 0); // remove "getTime() !== 0" after 2.0 is deployed

  const DSMAvailableDates: Array<Date> = dsmContents
    .map((content) => content.appearAt.getTime())
    .sort((a, b) => a - b)
    .map((time) => new Date(time));

  return _.sortedUniqBy(DSMAvailableDates, (date) => date.getTime());
}

export interface OverwriteMapTabCondition {
  hasDSM: boolean;
  hasTwoDOrtho: boolean;
  hasPointCloud: boolean;
  hasThreeDOrtho: boolean;
  hasThreeDMesh: boolean;
}

export function getShouldOverwriteMapTab(popupType: T.AttachmentType, {
  hasDSM,
  hasTwoDOrtho,
  hasPointCloud,
  hasThreeDOrtho,
  hasThreeDMesh,
}: OverwriteMapTabCondition): boolean {
  const { SOURCE, DSM, ORTHO, POINTCLOUD }: typeof T.AttachmentType = T.AttachmentType;

  switch (popupType) {
    case SOURCE: return hasTwoDOrtho || hasDSM || hasPointCloud || hasThreeDOrtho || hasThreeDMesh;
    case DSM: return hasDSM;
    case ORTHO: return hasTwoDOrtho;
    case POINTCLOUD: return hasPointCloud;
    default: return false;
  }
}

export type UseShouldOverwriteMapTab = (popupType: T.AttachmentType, selectedScreenId: T.Screen['id']) => boolean;
export function useShouldOverwriteMapTab(): UseShouldOverwriteMapTab {
  const getContent: QueryContentWithTypeAndScreenId = useGetContentOf(T.ContentsQueryParam.TYPE_AND_SCREENID);

  return (popupType, selectedScreenId) => {
    const [hasDSM, hasTwoDOrtho, hasPointCloud, hasThreeDOrtho, hasThreeDMesh]: Array<boolean> = [
      T.ContentType.DSM, T.ContentType.MAP, T.ContentType.POINTCLOUD,
      T.ContentType.THREE_D_ORTHO, T.ContentType.THREE_D_MESH, T.ContentType.ESS_MODEL, T.ContentType.ESS_ARROW,
    ].map((c) => Boolean(getContent(c, selectedScreenId)));

    return getShouldOverwriteMapTab(popupType, { hasDSM, hasTwoDOrtho, hasPointCloud, hasThreeDOrtho, hasThreeDMesh });
  };
}

export type UseDeleteMapTabContents = (popupType: T.AttachmentType, selectedScreenId: T.Screen['id']) => Promise<void>;
export function useDeleteMapTabContents(): UseDeleteMapTabContents {
  const dispatch: Dispatch = useDispatch();
  const getAllContentsOfScreen: QueryContentsWithScreenId = useGetAllContentsOf(T.ContentsQueryParam.SCREEN);

  return async (attachmentType: T.AttachmentType, selectedScreenId: T.Screen['id']) => {
    const { SOURCE, ORTHO, DSM, POINTCLOUD }: typeof T.AttachmentType = T.AttachmentType;
    const screenContents: Array<T.Content> = getAllContentsOfScreen(selectedScreenId);
    const mapTabContents: Array<T.MapTabContent> = screenContents.filter((c) => T.MAP_TAB_CONTENTS.includes(c.type)) as Array<T.MapTabContent>;
    const deletingTypeMap: T.AttachmentContentTypeMap = {
      [DSM]: T.ContentType.DSM,
      [ORTHO]: T.ContentType.MAP,
      [POINTCLOUD]: T.ContentType.POINTCLOUD,
    };
    if (attachmentType === SOURCE) {
      await Promise.all(mapTabContents.map(async (c) => dispatch(DeleteContent({ contentId: c.id }))));

      return;
    }
    const deletingContent: T.MapTabContent | undefined = mapTabContents.find((c) => c.type === deletingTypeMap[attachmentType]);
    if (deletingContent === undefined) return;
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await dispatch(DeleteContent({ contentId: deletingContent.id }));
  };
}

export function useMapContentsOfScreens(...screens: (T.Screen | undefined)[]): (T.MapContent | undefined)[] {
  const getContentOf: QueryContentWithTypeAndScreenId = useGetContentOf(T.ContentsQueryParam.TYPE_AND_SCREENID);
  const getMapContentOfScreen: (screen: T.Screen | undefined) => T.MapContent | undefined = (screen) => screen ?
    typeGuardMap(getContentOf(T.ContentType.MAP, screen.id)) : undefined;

  return screens.map(getMapContentOfScreen);
}

// Legacy coords that saved as lon lat (EPSG:4326) || ProjectionSystem is 4326
export function isLonLat(location: T.GeoPoint): boolean {
  const lonlatRegex: RegExp = new RegExp(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/, 'g');

  return [location[1], location[0]].join(', ').match(lonlatRegex) !== null;
}

export function addMarkerLocationPrecision(location: T.GeoPoint, isLonLatProject: boolean): string[] {
  return location.map((l) => l.toFixed(isLonLatProject ? LAT_LON_FIX_FORMAT : Y_X_FIX_FORMAT));
}

/**
 * Recursively get all the non-group ids in a list of ids.
 * Typically the root of the list should be from a list of root-level ids in a category.
 *
 * @param byId
 * @param idsByGroup
 * @param ids
 * @returns A list of ids, flattened.
 */
const getNonGroupIds: (
  byId: Record<T.Content['id'], T.Content>,
  idsByGroup: Record<T.GroupContent['id'], Array<T.Content['id']>>,
  ids: Array<T.Content['id']>
) => Array<T.Content['id']> = (
  byId, idsByGroup, ids
) => ids.reduce<Array<T.Content['id']>>((acc, id) => {
  const content = byId[id];
  if (content === undefined) return acc;

  if (content.type === T.ContentType.GROUP) {
    return acc.concat(
      getNonGroupIds(byId, idsByGroup, idsByGroup[id] ?? [])
    );
  }

  return acc.concat(id);
}, []);

export function getCurrentScreenContentIds(params: { state: T.State; isESSDisabled?: boolean }): Array<T.Content['id']> {
  const { ProjectConfigPerUser, Projects, Screens, Contents, Groups } = params.state;

  const projectConfig: T.ProjectConfig | undefined = ProjectConfigPerUser.config;
  if (!projectConfig || !projectConfig.lastSelectedScreenId) return [];

  const currentProject: T.Project = Projects.projects.byId[projectConfig.projectId];
  const currentScreen: T.Screen | undefined = Screens.screens.find((screen) => screen.id === projectConfig.lastSelectedScreenId);
  if (currentScreen === undefined || currentProject === undefined) return [];

  const categories = (() => {
    const allCategories = Object.keys(Groups.tree.rootIdsByCategory) as T.ContentCategory[];

    if (params.isESSDisabled) {
      return allCategories.filter((category) => category !== T.ContentCategory.ESS);
    }

    return allCategories;
  })();
  const byId = Contents.contents.byId;
  const { idsByGroup, rootIdsByCategory } = Groups.tree;

  return categories
    .reduce<Array<T.Content['id']>>((acc, category) => {
      const { pinned, unpinned } = rootIdsByCategory[category];

      return acc
        .concat(getNonGroupIds(byId, idsByGroup, pinned))
        .concat(getNonGroupIds(byId, idsByGroup, unpinned[currentScreen.id] ?? []));
    }, []);
}

export function useGetCurrentScreenContentIds(params: { isESSDisabled?: boolean } = {}): Array<T.Content['id']> {
  return useSelector((state: T.State) => getCurrentScreenContentIds({ state, isESSDisabled: params.isESSDisabled }));
}

export function typeGuardMap(c: T.Content | undefined): T.MapContent | undefined { return isMap(c) ? c : undefined; }
export function typeGuardDSM(c: T.Content | undefined): T.DSMContent | undefined { return isDSM(c) ? c : undefined; }
export function typeGuardArea(c: T.Content | undefined): T.AreaContent | undefined { return isArea(c) ? c : undefined; }
export function typeGuardLength(c: T.Content | undefined): T.LengthContent | undefined { return isLength(c) ? c : undefined; }
export function typeGuardMarker(c: T.Content | undefined): T.MarkerContent | undefined { return isMarker(c) ? c : undefined; }
export function typeGuardVolume(c: T.Content | undefined): T.VolumeContent | undefined { return isVolume(c) ? c : undefined; }
export function typeGuardDesignDXF(c: T.Content | undefined): T.DesignDXFContent | undefined { return isDesignDXF(c) ? c : undefined; }
export function typeGuardPointCloud(c: T.Content | undefined): T.PointCloudContent | undefined { return isPointcloud(c) ? c : undefined; }
export function typeGuardThreeDOrtho(c: T.Content | undefined): T.ThreeDOrthoContent | undefined { return isThreeDOrtho(c) ? c : undefined; }
export function typeGuardThreeDMesh(c: T.Content | undefined): T.ThreeDMeshContent | undefined { return isThreeDMesh(c) ? c : undefined; }
export function typeGuardBlueprintDXF(c: T.Content | undefined): T.BlueprintDXFContent | undefined { return isBlueprintDXF(c) ? c : undefined; }
export function typeGuardBlueprintDWG(c: T.Content | undefined): T.BlueprintDWGContent | undefined { return isBlueprintDWG(c) ? c : undefined; }
export function typeGuardBlueprintPDF(c: T.Content | undefined): T.BlueprintPDFContent | undefined { return isBlueprintPDF(c) ? c : undefined; }
export function typeGuardCADContent(c: T.Content | undefined): T.CADContent | undefined { return isCADContent(c) ? c : undefined; }
export function typeGuardGCPGroup(c: T.Content | undefined): T.GCPGroupContent | undefined { return isGCPGroup(c) ? c : undefined; }
export function typeGuardGroup(c: T.Content | undefined): T.GroupContent | undefined { return isGroup(c) ? c : undefined; }
export function typeGuardESSModel(c: T.Content | undefined): T.ESSModelContent | undefined { return isESSModel(c) ? c : undefined; }
export function typeGuardESSArrow(c: T.Content | undefined): T.ESSArrowContent | undefined { return isESSArrow(c) ? c : undefined; }
export function typeGuardESSPolyline(c: T.Content | undefined): T.ESSPolylineContent | undefined { return isESSPolyline(c) ? c : undefined; }
export function typeGuardESSPolygon(c: T.Content | undefined): T.ESSPolygonContent | undefined { return isESSPolygon(c) ? c : undefined; }
export function typeGuardESSText(c: T.Content | undefined): T.ESSTextContent | undefined { return isESSText(c) ? c : undefined; }
export function typeGuardESSContent(c: T.Content | undefined): T.ESSContent | undefined { return isESSContent(c) ? c: undefined; }

function isMap(c: T.Content | undefined): c is T.MapContent { return c !== undefined && (c.type === T.ContentType.MAP); }
function isDSM(c: T.Content | undefined): c is T.DSMContent { return c !== undefined && (c.type === T.ContentType.DSM); }
function isArea(c: T.Content | undefined): c is T.AreaContent { return c !== undefined && c.type === T.ContentType.AREA; }
function isLength(c: T.Content | undefined): c is T.LengthContent { return c !== undefined && c.type === T.ContentType.LENGTH; }
export function isMarker(c: T.Content | undefined): c is T.MarkerContent { return c !== undefined && c.type === T.ContentType.MARKER; }
function isVolume(c: T.Content | undefined): c is T.VolumeContent { return c !== undefined && c.type === T.ContentType.VOLUME; }
function isDesignDXF(c: T.Content | undefined): c is T.DesignDXFContent { return c !== undefined && c.type === T.ContentType.DESIGN_DXF; }
function isPointcloud(c: T.Content | undefined): c is T.PointCloudContent { return c !== undefined && c.type === T.ContentType.POINTCLOUD; }
function isThreeDOrtho(c: T.Content | undefined): c is T.ThreeDOrthoContent { return c !== undefined && c.type === T.ContentType.THREE_D_ORTHO; }
function isThreeDMesh(c: T.Content | undefined): c is T.ThreeDMeshContent { return c !== undefined && c.type === T.ContentType.THREE_D_MESH; }
export function isBlueprintDXF(c: T.Content | undefined): c is T.BlueprintDXFContent { return c !== undefined && c.type === T.ContentType.BLUEPRINT_DXF; }
export function isBlueprintDWG(c: T.Content | undefined): c is T.BlueprintDWGContent { return c !== undefined && c.type === T.ContentType.BLUEPRINT_DWG; }
export function isCADContent(c: T.Content | undefined): c is T.CADContent { return c !== undefined && (c.type === T.ContentType.BLUEPRINT_DXF || c.type === T.ContentType.BLUEPRINT_DWG); }
function isBlueprintPDF(c: T.Content | undefined): c is T.BlueprintPDFContent { return c !== undefined && c.type === T.ContentType.BLUEPRINT_PDF; }
function isGCPGroup(c: T.Content | undefined): c is T.GCPGroupContent { return c !== undefined && c.type === T.ContentType.GCP_GROUP; }
function isGroup(c: T.Content | undefined): c is T.GroupContent { return c !== undefined && c.type === T.ContentType.GROUP; }
function isESSModel(c: T.Content | undefined): c is T.ESSModelContent { return c !== undefined && c.type === T.ContentType.ESS_MODEL; }
function isESSArrow(c: T.Content | undefined): c is T.ESSArrowContent { return c !== undefined && c.type === T.ContentType.ESS_ARROW; }
function isESSPolygon(c: T.Content | undefined): c is T.ESSPolygonContent { return c !== undefined && c.type === T.ContentType.ESS_POLYGON; }
function isESSPolyline(c: T.Content | undefined): c is T.ESSPolylineContent { return c !== undefined && c.type === T.ContentType.ESS_POLYLINE; }
function isESSText(c: T.Content | undefined): c is T.ESSTextContent { return c !== undefined && c.type === T.ContentType.ESS_TEXT; }
export function isESSContent(c: T.Content | undefined): c is T.ESSContent {
  return isESSArrow(c) || isESSPolygon(c) || isESSPolyline(c) || isESSModel(c) || isESSText(c) || isGroup(c);
}

export function typeGuardMaps(cs: Array<T.Content>): Array<T.MapContent> { return isMaps(cs) ? cs : []; }
export function typeGuardDSMs(cs: Array<T.Content>): Array<T.DSMContent> { return isDSMs(cs) ? cs : []; }
export function typeGuardAreas(cs: Array<T.Content>): Array<T.AreaContent> { return isAreas(cs) ? cs : []; }
export function typeGuardLengths(cs: Array<T.Content>): Array<T.LengthContent> { return isLengths(cs) ? cs : []; }
export function typeGuardMarkers(cs: Array<T.Content>): Array<T.MarkerContent> { return isMarkers(cs) ? cs : []; }
export function typeGuardVolumes(cs: Array<T.Content>): Array<T.VolumeContent> { return isVolumes(cs) ? cs : []; }
export function typeGuardDesignDXFs(cs: Array<T.Content>): Array<T.DesignDXFContent> { return isDesignDXFs(cs) ? cs : []; }
export function typeGuardPointClouds(cs: Array<T.Content>): Array<T.PointCloudContent> { return isPointclouds(cs) ? cs : []; }
export function typeGuardThreeDOrthos(cs: Array<T.Content>): Array<T.ThreeDOrthoContent> { return isThreeDOrthos(cs) ? cs : []; }
export function typeGuardBlueprintDXFs(cs: Array<T.Content>): Array<T.BlueprintDXFContent> { return isBlueprintDXFs(cs) ? cs : []; }
export function typeGuardBlueprintDWGs(cs: Array<T.Content>): Array<T.BlueprintDWGContent> { return isBlueprintDWGs(cs) ? cs : []; }
export function typeGuardBlueprintPDFs(cs: Array<T.Content>): Array<T.BlueprintPDFContent> { return isBlueprintPDFs(cs) ? cs : []; }
export function typeGuardCADContents(cs: Array<T.Content>): Array<T.CADContent> { return isCADContents(cs) ? cs : []; }
export function typeGuardThreeDMeshs(cs: Array<T.Content>): Array<T.ThreeDMeshContent> { return isThreeDMeshs(cs) ? cs : []; }
export function typeGuardGCPGroups(cs: Array<T.Content>): Array<T.GCPGroupContent> { return isGCPGroupContents(cs) ? cs : []; }
export function typeGuardESSModels(cs: Array<T.Content>): Array<T.ESSModelContent> | undefined { return isESSModelContents(cs) ? cs : undefined; }
export function typeGuardESSArrowContents(cs: Array<T.Content>): Array<T.ESSArrowContent> | undefined { return isESSArrowContents(cs) ? cs : undefined; }

function isMaps(cs: Array<T.Content>): cs is Array<T.MapContent> { return cs.every((c) => c.type === T.ContentType.MAP); }
function isDSMs(cs: Array<T.Content>): cs is Array<T.DSMContent> { return cs.every((c) => c.type === T.ContentType.DSM); }
function isAreas(cs: Array<T.Content>): cs is Array<T.AreaContent> { return cs.every((c) => c.type === T.ContentType.AREA); }
function isLengths(cs: Array<T.Content>): cs is Array<T.LengthContent> { return cs.every((c) => c.type === T.ContentType.LENGTH); }
function isMarkers(cs: Array<T.Content>): cs is Array<T.MarkerContent> { return cs.every((c) => c.type === T.ContentType.MARKER); }
function isVolumes(cs: Array<T.Content>): cs is Array<T.VolumeContent> { return cs.every((c) => c.type === T.ContentType.VOLUME); }
function isDesignDXFs(cs: Array<T.Content>): cs is Array<T.DesignDXFContent> { return cs.every((c) => c.type === T.ContentType.DESIGN_DXF); }
function isPointclouds(cs: Array<T.Content>): cs is Array<T.PointCloudContent> { return cs.every((c) => c.type === T.ContentType.POINTCLOUD); }
function isThreeDOrthos(cs: Array<T.Content>): cs is Array<T.ThreeDOrthoContent> { return cs.every((c) => c.type === T.ContentType.THREE_D_ORTHO); }
function isBlueprintDXFs(cs: Array<T.Content>): cs is Array<T.BlueprintDXFContent> { return cs.every((c) => c.type === T.ContentType.BLUEPRINT_DXF); }
function isBlueprintDWGs(cs: Array<T.Content>): cs is Array<T.BlueprintDWGContent> { return cs.every((c) => c.type === T.ContentType.BLUEPRINT_DWG); }
function isBlueprintPDFs(cs: Array<T.Content>): cs is Array<T.BlueprintPDFContent> { return cs.every((c) => c.type === T.ContentType.BLUEPRINT_PDF); }
function isCADContents(cs: Array<T.Content>): cs is Array<T.CADContent> { return cs.every((c) => (c.type === T.ContentType.BLUEPRINT_DXF || c.type === T.ContentType.BLUEPRINT_DWG)); }
function isThreeDMeshs(cs: Array<T.Content>): cs is Array<T.ThreeDMeshContent> { return cs.every((c) => c.type === T.ContentType.THREE_D_MESH); }
function isGCPGroupContents(cs: Array<T.Content>): cs is Array<T.GCPGroupContent> { return cs.every((c) => c.type === T.ContentType.GCP_GROUP); }
function isESSModelContents(cs: Array<T.Content>): cs is Array<T.ESSModelContent> { return cs.every((c) => c.type === T.ContentType.ESS_MODEL); }
function isESSArrowContents(cs: Array<T.Content>): cs is Array<T.ESSArrowContent> { return cs.every((c) => c.type === T.ContentType.ESS_ARROW); }

export function typeGuardMeasurementContent(c: T.Content | undefined): T.MeasurementContent | undefined { return isMeasurementContent(c) ? c : undefined; }
function isMeasurementContent(c: T.Content | undefined): c is T.MeasurementContent { return c !== undefined && T.MeasurementContentTypes.includes(c.type); }
export function typeGuardOverlayContent(c: T.Content | undefined): T.OverLayContent | undefined { return isOverlayContent(c) ? c : undefined; }
function isOverlayContent(c: T.Content | undefined): c is T.OverLayContent { return c !== undefined && T.OverlayContentTypes.includes(c.type); }
