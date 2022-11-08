/* eslint-disable max-lines */
import * as Sentry from '@sentry/browser';
import { LensGenerator, LensS } from '@typed-f/lens';
import axios, { AxiosResponse } from 'axios';
import Color from 'color';
import _ from 'lodash-es';
import { Coordinate } from 'ol/coordinate';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Reducer } from 'redux';
import { ActionsObservable, Epic, combineEpics } from 'redux-observable';
import { Observable, combineLatest, concat, from, zip } from 'rxjs';
import { AjaxError, AjaxResponse, ajax } from 'rxjs/ajax';
import {
  catchError,
  concatMap,
  filter,
  map, mapTo,
  mergeMap, mergeMapTo,
  shareReplay,
  take, takeUntil,
} from 'rxjs/operators';
import {
  action as makeAction,
  props,
  union,
} from 'tsdux';
import { ofType } from 'tsdux-observable';

import {
  DefaultDSM,
  DefaultDesignDXF,
  defaultBlueprintDWG,
  defaultBlueprintDXF,
  defaultBlueprintPDF,
  defaultDSM,
  defaultDesignDXF,
  defaultMap,
  defaultPointCloud,
  defaultMapZoom,
  defaultGroup,
} from '^/constants/defaultContent';
import {
  getCoordinateSystem,
  isCADContent,
  isLonLat,
  lastSelectedScreenSelector,
  typeGuardArea,
  typeGuardGroup,
  typeGuardLength,
  typeGuardPointCloud,
} from '^/hooks';
import { lastDSMOrMapContentSelector } from '^/hooks/useLastContent';
import * as T from '^/types';
import { getEPSGfromProjectionLabel } from '^/utilities/coordinate-util';
import { Formats, formatWithOffset } from '^/utilities/date-format';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { calculateHash } from '^/utilities/file-util';
import { isBoundaryViolated } from '^/utilities/math';
import { getSingleContentId, getViewableThreeDContentId } from '^/utilities/state-util';
import proj4 from 'proj4';
import {
  FinishProps,
} from '../../Utils';
import {
  AuthHeader,
  VersionHeader,
  actionsForEpicReload,
  getRequestErrorType,
  jsonContentHeader,
  makeAuthHeader,
  makeV2APIURL,
  makeVersionHeader,
  makeVolumeAPIURL,
  volumeServiceHostname,
  wwwFormUrlEncoded,
} from '../API';
import {
  FinishPostAttachment,
  FinishPostAttachmentNew,
  GetAttachments,
  PostAttachment,
  PostAttachmentNew,
} from '../Attachments';
import { ChangeAuthedUser } from '../Auth';
import { GetESSModelById } from '../ESSModels';
import {
  ChangeContentsSidebarTab,
  ChangeCurrentContentTypeFromAnnotationPicker,
  ChangeEditingContent,
  ChangeFirstVisitStatus,
  ChangeIn3D,
  ChangeTwoDDisplayCenter,
  ChangeTwoDDisplayZoom,
  ChangeSidebarStatus,
  CloseContentPageMapPopup,
  OpenContentPagePopup,
  TogglePrintView,
} from '../Pages/Content';
import { GetPhotos } from '../Photos';
import { PatchProjectConfig } from '../ProjectConfig';
import { GetCalendar, PatchProject } from '../Projects';
import { AddScreenInStore, PatchScreen, PostScreen } from '../Screens';
import { ContentOverwriteManagerInput, contentOverwriteManager } from './contentOverwriteManager';
import { ContentUploadManagerOutput, GetScreensIfNeeded, contentUploadManager } from './contentUploadManager';
import { createHasFeature, getFeaturePermissionFromSlug, HasFeature } from '^/utilities/withFeatureToggle';
import { getClosestZoomLevel } from '^/utilities/map-util';
import palette from '^/constants/palette';
import { ESS_DEFAULT_FONT_SIZE_INDEX, ESS_FONT_SIZES } from '^/constants/cesium';
import { getCurrentGroupId } from '^/utilities/content-util';
import {
  AddContentToTree, ChangeIsCreatingContentOnDeletedGroup, ChangeIsGroupAlreadyDeleted, ChangeSelectedGroupId, CheckAndRemoveGroup,
  RemoveContentFromTree, RemoveGroupChildren, TabToCategoryMapper,
} from '../Groups';
import { tempGroupName } from '^/constants/group';
import { currentProjectSelector } from '^/hooks/useCurrentProject';

// API related types
interface GroupParams {
  category?: T.ContentCategory;
}
export type PostContentArguments = 'title' | 'color' | 'type' | 'info' | 'screenId';
export type PostContentBody = Pick<T.APIContent, PostContentArguments> & GroupParams;
export interface RawPatchContent {
  readonly id: T.Content['id'];
  readonly title?: T.Content['title'];
  readonly color?: T.Content['color'];
  readonly info?: Partial<T.Content['info']>;
  readonly config?: Partial<T.Content['config']>;
  readonly appearAt?: T.Content['appearAt'];
  readonly pinEventAt?: T.Content['pinEventAt'];
  readonly screenId?: T.Content['screenId'];
}
export type PatchContentBody = Overwrite<
  Omit<RawPatchContent, 'id'>, {
    readonly color?: string;
    readonly info?: string;
    readonly config?: string;
  }
>;
export type UploadContentBody = Overwrite<
  PostContentBody, {
    readonly info: string;
    readonly appearAt?: string;
    readonly screenId?: T.Screen['id'];
    readonly groupId?: T.Content['groupId'];
  }
>;

const deserializeInfo: (
  type: T.ContentType, info: T.APIContent['info'],
) => T.Content['info'] = (
  type, info,
) => {
  switch (type) {
    case T.ContentType.MAP:
      return info as T.MapContent['info'];
    case T.ContentType.DSM:
      return info as T.DSMContent['info'];
    case T.ContentType.THREE_D_ORTHO:
      return info as T.ThreeDOrthoContent['info'];
    case T.ContentType.POINTCLOUD:
      return info as T.PointCloudContent['info'];
    case T.ContentType.THREE_D_MESH:
      return info as T.ThreeDMeshContent['info'];
    case T.ContentType.GCP_GROUP:
      return info as T.GCPGroupContent['info'];
    case T.ContentType.BLUEPRINT_PDF:
      return info as T.BlueprintPDFContent['info'];
    case T.ContentType.BLUEPRINT_DXF:
      return info as T.BlueprintDXFContent['info'];
    case T.ContentType.BLUEPRINT_DWG:
      return info as T.BlueprintDWGContent['info'];
    case T.ContentType.DESIGN_DXF:
      return info as T.DesignDXFContent['info'];
    case T.ContentType.MARKER:
      return info as T.MarkerContent['info'];
    case T.ContentType.LENGTH:
      return info as T.LengthContent['info'];
    case T.ContentType.AREA:
      return info as T.AreaContent['info'];
    case T.ContentType.VOLUME:
      return info as T.VolumeContent['info'];
    case T.ContentType.ESS_MODEL:
      return info as T.ESSModelContent['info'];
    case T.ContentType.ESS_ARROW:
      return info as T.ESSArrowContent['info'];
    case T.ContentType.ESS_POLYGON:
      return info as T.ESSArrowContent['info'];
    case T.ContentType.ESS_POLYLINE:
      return info as T.ESSArrowContent['info'];
    case T.ContentType.ESS_TEXT:
      return info as T.ESSTextContent['info'];
    case T.ContentType.GROUP:
      return info as T.GroupContent['info'];
    default:
      return exhaustiveCheck(type);
  }
};

const serializeInfo: (
  type: T.ContentType, info: T.Content['info'],
) => T.APIContent['info'] = (
  type, info,
) => {
  switch (type) {
    case T.ContentType.MAP:
      return info as T.APIMapContent['info'];
    case T.ContentType.DSM:
      return info as T.APIDSMContent['info'];
    case T.ContentType.THREE_D_ORTHO:
      return info as T.APIThreeDOrthoContent['info'];
    case T.ContentType.POINTCLOUD:
      return info as T.APIPointCloudContent['info'];
    case T.ContentType.THREE_D_MESH:
      return info as T.APIThreeDMeshContent['info'];
    case T.ContentType.GCP_GROUP:
      return info as T.GCPGroupContent['info'];

    case T.ContentType.BLUEPRINT_PDF:
      return info as T.APIBlueprintPDFContent['info'];
    case T.ContentType.BLUEPRINT_DXF:
      return info as T.APIBlueprintDXFContent['info'];
    case T.ContentType.BLUEPRINT_DWG:
      return info as T.APIBlueprintDWGContent['info'];
    case T.ContentType.DESIGN_DXF:
      return info as T.APIDesignDXFContent['info'];

    case T.ContentType.MARKER:
      return info as T.APIMarkerContent['info'];
    case T.ContentType.LENGTH:
      return info as T.APILengthContent['info'];
    case T.ContentType.AREA:
      return info as T.APIAreaContent['info'];
    case T.ContentType.VOLUME:
      return info as T.APIVolumeContent['info'];

    case T.ContentType.ESS_MODEL:
      return info as T.APIESSModelContent['info'];
    case T.ContentType.ESS_ARROW:
      return info as T.APIESSArrowContent['info'];
    case T.ContentType.ESS_POLYGON:
      return info as T.APIESSArrowContent['info'];
    case T.ContentType.ESS_POLYLINE:
      return info as T.APIESSArrowContent['info'];
    case T.ContentType.ESS_TEXT:
      return info as T.APIESSTextContent['info'];
    case T.ContentType.GROUP:
      return info as T.GroupContent['info'];

    default:
      return exhaustiveCheck(type);
  }
};

const deserializeConfig: (config: T.APIContent['config'], type: T.ContentType) => T.Content['config'] = (
  config, type,
) => {
  if (config === null) {
    return undefined;
  }

  switch (type) {
    case T.ContentType.ESS_ARROW:
    case T.ContentType.ESS_MODEL:
    case T.ContentType.ESS_POLYGON:
    case T.ContentType.ESS_POLYLINE:
    case T.ContentType.ESS_TEXT: {
      return {
        ...config,
        // As per discussion on the requirement,
        // ESS contents should always stay hidden by default when loading.
        selectedAt: undefined,
      };
    }
    default: {
      return {
        ...config,
        selectedAt: config.selectedAt ? new Date(config.selectedAt) : undefined,
      };
    }
  }
};

export const APIToContent: (rawContent: T.APIContent) => T.Content = (rawContent) => {
  const {
    id, projectId, title, color, attachmentsCount, createdAt, updatedAt, config, appearAt: rawAppearAt, pinEventAt, screenId,
    createdBy,
  }: T.APIContent = rawContent;

  // The raw date format returned from the API is ISOString,
  // so it can be parsed simply by using the Date constructor.
  const appearAt: Date | undefined = rawAppearAt ? new Date(rawAppearAt) : undefined;
  const base: Omit<T.BaseContent, 'type' | 'info'> = {
    id, projectId, title, attachmentsCount, createdBy,
    /**
     * @todo remove color from BaseContent in the future because
     * only MeasurementContent needs to have color
     * Right now this is a temporary fix to fill color with anything
     */
    appearAt,
    color: color === null || color === '' ? Color('#FFFFFF') : Color(color),
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    pinEventAt: pinEventAt ? new Date(pinEventAt) : undefined,
    screenId: screenId !== null ? screenId : undefined,
    groupId: rawContent.groupId === null ? undefined : rawContent.groupId,
  };

  switch (rawContent.type) {
    case T.ContentType.MAP:
      return {
        ...base,
        type: rawContent.type,
        category: rawContent.category,
        appearAt: appearAt || new Date(),
        info: deserializeInfo(rawContent.type, rawContent.info) as T.MapContent['info'],
        status: rawContent.status !== null ? rawContent.status : undefined,
        config: deserializeConfig(config, rawContent.type) as T.MapContent['config'],
      };

    case T.ContentType.BLUEPRINT_PDF:
      return {
        ...base,
        type: rawContent.type,
        category: rawContent.category,
        info: deserializeInfo(rawContent.type, rawContent.info) as T.BlueprintPDFContent['info'],
        status: rawContent.status !== null ? rawContent.status : undefined,
        config: deserializeConfig(config, rawContent.type) as T.BlueprintPDFContent['config'],
      };
    case T.ContentType.BLUEPRINT_DXF:
      return {
        ...base,
        type: rawContent.type,
        category: rawContent.category,
        info: deserializeInfo(rawContent.type, rawContent.info) as T.BlueprintDXFContent['info'],
        status: rawContent.status !== null ? rawContent.status : undefined,
        config: deserializeConfig(config, rawContent.type) as T.BlueprintDXFContent['config'],
      };
    case T.ContentType.BLUEPRINT_DWG:
      return {
        ...base,
        type: rawContent.type,
        category: rawContent.category,
        info: deserializeInfo(rawContent.type, rawContent.info) as T.BlueprintDWGContent['info'],
        status: rawContent.status !== null ? rawContent.status : undefined,
        config: deserializeConfig(config, rawContent.type) as T.BlueprintDWGContent['config'],
      };
    case T.ContentType.DESIGN_DXF:
      return {
        ...base,
        type: rawContent.type,
        category: rawContent.category,
        info: deserializeInfo(rawContent.type, rawContent.info) as T.DesignDXFContent['info'],
        status: rawContent.status !== null ? rawContent.status : undefined,
        config: deserializeConfig(config, rawContent.type) as T.DesignDXFContent['config'],
      };

    case T.ContentType.MARKER:
      return {
        ...base,
        type: rawContent.type,
        category: rawContent.category,
        info: deserializeInfo(rawContent.type, rawContent.info) as T.MarkerContent['info'],
        config: deserializeConfig(config, rawContent.type) as T.MarkerContent['config'],
      };
    case T.ContentType.LENGTH:
      return {
        ...base,
        type: rawContent.type,
        category: rawContent.category,
        info: deserializeInfo(rawContent.type, rawContent.info) as T.LengthContent['info'],
        config: deserializeConfig(config, rawContent.type) as T.LengthContent['config'],
      };
    case T.ContentType.AREA:
      return {
        ...base,
        type: rawContent.type,
        category: rawContent.category,
        info: deserializeInfo(rawContent.type, rawContent.info) as T.AreaContent['info'],
        config: deserializeConfig(config, rawContent.type) as T.AreaContent['config'],
      };
    case T.ContentType.VOLUME:
      return {
        ...base,
        type: rawContent.type,
        category: rawContent.category,
        info: deserializeInfo(rawContent.type, rawContent.info) as T.VolumeContent['info'],
        config: deserializeConfig(config, rawContent.type) as T.VolumeContent['config'],
      };
    case T.ContentType.DSM:
      const dsmInfo: T.DSMContent['info'] = {
        ...rawContent.info,
        minHeight: rawContent.minHeight,
        maxHeight: rawContent.maxHeight,
        elevation: rawContent.elevation,
      };

      return {
        ...base,
        appearAt: appearAt || new Date(),
        type: rawContent.type,
        category: rawContent.category,
        info: deserializeInfo(rawContent.type, dsmInfo) as T.DSMContent['info'],
        status: rawContent.status !== null ? rawContent.status : undefined,
        config: deserializeConfig(config, rawContent.type) as T.DSMContent['config'],
      };
    case T.ContentType.THREE_D_ORTHO:
      return {
        ...base,
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        appearAt: appearAt || new Date(),
        type: rawContent.type,
        category: rawContent.category,
        info: deserializeInfo(rawContent.type, rawContent.info) as T.ThreeDOrthoContent['info'],
        status: rawContent.status !== null ? rawContent.status : undefined,
        config: deserializeConfig(config, rawContent.type) as T.ThreeDOrthoContent['config'],
      };
    case T.ContentType.POINTCLOUD:
      const pointCloudInfo: T.PointCloudContent['info'] = {
        ...rawContent.info,
        // Some legacy contents might not have engine,
        // which should fall back to potree by default.
        engine: rawContent.info?.engine ?? T.PointCloudEngine.POTREE,
      };

      return {
        ...base,
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        appearAt: appearAt || new Date(),
        type: rawContent.type,
        category: rawContent.category,
        info: deserializeInfo(rawContent.type, pointCloudInfo) as T.PointCloudContent['info'],
        status: rawContent.status !== null ? rawContent.status : undefined,
        config: deserializeConfig(config, rawContent.type) as T.PointCloudContent['config'],
      };
    case T.ContentType.THREE_D_MESH:
      return {
        ...base,
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        appearAt: appearAt || new Date(),
        type: rawContent.type,
        category: rawContent.category,
        info: deserializeInfo(rawContent.type, rawContent.info) as T.ThreeDMeshContent['info'],
        status: rawContent.status !== null ? rawContent.status : undefined,
        config: deserializeConfig(config, rawContent.type) as T.ThreeDMeshContent['config'],
      };
    case T.ContentType.GCP_GROUP:
      return {
        ...base,
        type: rawContent.type,
        category: rawContent.category,
        info: deserializeInfo(rawContent.type, rawContent.info) as T.GCPGroupContent['info'],
        status: rawContent.status !== null ? rawContent.status : undefined,
        config: deserializeConfig(config, rawContent.type) as T.GCPGroupContent['config'],
      };

    case T.APIESSContentType.MODEL: {
      const { locations, ...restOfInfo }: T.APIESSModelContent['info'] = rawContent.info;
      const info: T.ESSModelContent['info'] = {
        ...restOfInfo,
        description: rawContent.memo,
        location: locations,
        // This property is not derived from anything BE,
        // since it only exists per content in the state.
        // And by requirement, it should be activated by default.
        isWorkRadiusVisEnabled: true,
      };

      return {
        ...base,
        type: T.ContentType.ESS_MODEL,
        category: T.ContentCategory.ESS,
        info: deserializeInfo(T.ContentType.ESS_MODEL, info) as T.ESSModelContent['info'],
        config: deserializeConfig(config, T.ContentType.ESS_MODEL),
      };
    }
    case T.APIESSContentType.ARROW:
      return {
        ...base,
        type: T.ContentType.ESS_ARROW,
        category: T.ContentCategory.ESS,
        info: deserializeInfo(T.ContentType.ESS_ARROW, rawContent.info) as T.ESSArrowContent['info'],
        config: deserializeConfig(config, T.ContentType.ESS_ARROW),
      };
    case T.APIESSContentType.POLYLINE:
      return {
        ...base,
        type: T.ContentType.ESS_POLYLINE,
        category: T.ContentCategory.ESS,
        info: deserializeInfo(T.ContentType.ESS_POLYLINE, rawContent.info) as T.ESSPolylineContent['info'],
        config: deserializeConfig(config, T.ContentType.ESS_POLYLINE),
      };
    case T.APIESSContentType.POLYGON:
      return {
        ...base,
        type: T.ContentType.ESS_POLYGON,
        category: T.ContentCategory.ESS,
        info: deserializeInfo(T.ContentType.ESS_POLYGON, rawContent.info) as T.ESSPolygonContent['info'],
        config: deserializeConfig(config, T.ContentType.ESS_POLYGON),
      };
    case T.APIESSContentType.TEXT: {
      const {
        locations,
        fontColor,
        fontSize,
        description,
      }: T.APIESSTextContent['info'] = rawContent.info;
      const info: T.ESSTextContent['info'] = {
        location: locations,
        fontColor: new Color(fontColor ?? palette.ESSWorkTool[T.ContentType.ESS_TEXT].fontColor.toString()),
        fontSize: fontSize ?? ESS_FONT_SIZES[ESS_DEFAULT_FONT_SIZE_INDEX],
        description,
      };

      return {
        ...base,
        type: T.ContentType.ESS_TEXT,
        category: T.ContentCategory.ESS,
        info: deserializeInfo(T.ContentType.ESS_TEXT, info) as T.ESSTextContent['info'],
        config: deserializeConfig(config, T.ContentType.ESS_TEXT),
      };
    }
    case T.ContentType.GROUP: {
      return {
        ...base,
        type: rawContent.type,
        category: rawContent.category,
        info: deserializeInfo(rawContent.type, rawContent.info) as T.GroupContent['info'],
        config: deserializeConfig(config, rawContent.type) as T.GroupContent['config'],
      };
    }
    default:
      exhaustiveCheck(rawContent);
  }
};

type WithScreen<U> = U & {
  readonly screen: T.Screen;
};

interface GetContentsResponse {
  readonly data: Array<T.APIContent>;
}
interface GetESSContentsResponse {
  readonly data: Array<T.APIESSModelContent | T.APIESSArrowContent>;
}
interface PostContentResponse {
  readonly data: T.APIContent;
}
interface PatchContentResponse {
  readonly data: T.APIContent;
}
interface UploadCompleteResponse {
  readonly data: Array<T.APIContent>;
}
interface RequestVolumeCalculationResponse {
  readonly fill: number;
  readonly cut: number;
  readonly volume: number;
  readonly basePlane: T.BasicCalcBasePlane;
  readonly elevation: number;
  readonly wmsInfo?: T.APIWMSInfo;
  readonly minMaxElevation?: {
    minHeight: number;
    maxHeight: number;
  };
}

interface RequestLengthElevationResponse {
  elevations: Array<T.LengthElevationData>;
}

interface GetAreaSurfaceResponse {
  surface: NonNullable<T.AreaContent['info']['surface']>;
}

//Redux actions

export const GetInitialContents = makeAction(
  'ddm/contents/GET_INITIAL_CONTENTS',
  props<{
    readonly projectId: T.Project['id'];
    readonly targetDate?: Date;
  }>(),
);
export const CancelGetInitialContents = makeAction(
  'ddm/contents/CANCEL_GET_INITIAL_CONTENTS',
);
export const FinishGetInitialContents = makeAction(
  'ddm/contents/FINISH_GET_INITIAL_CONTENTS',
  props<FinishProps>(),
);

export const GetContents = makeAction(
  'ddm/contents/GET_CONTENTS',
  props<{
    readonly targetDate: Date;
  }>(),
);
export const CancelGetContents = makeAction(
  'ddm/contents/CANCEL_GET_CONTENTS',
);
export const FinishGetContents = makeAction(
  'ddm/contents/FINISH_GET_CONTENTS',
  props<FinishProps>(),
);

export const PostContent = makeAction(
  'ddm/contents/POST_CONTENT',
  props<{
    readonly projectId: T.Content['projectId'];
    readonly content: PostContentBody;
  }>(),
);
export const CancelPostContent = makeAction(
  'ddm/contents/CANCEL_POST_CONTENT',
);
export const FinishPostContent = makeAction(
  'ddm/contents/FINISH_POST_CONTENT',
  props<FinishProps>(),
);

export const PatchContent = makeAction(
  'ddm/contents/PATCH_CONTENT',
  props<{
    readonly content: RawPatchContent;
    readonly isDBVCorSBVC?: boolean;
  }>(),
);
export const CancelPatchContent = makeAction(
  'ddm/contents/CANCEL_PATCH_CONTENT',
);
export const FinishPatchContent = makeAction(
  'ddm/contents/FINISH_PATCH_CONTENT',
  props<FinishProps>(),
);

export const DeleteContent = makeAction(
  'ddm/contents/DELETE_CONTENT',
  props<{
    readonly contentId: T.Content['id'];
  }>(),
);
export const CancelDeleteContent = makeAction(
  'ddm/contents/CANCEL_DELETE_CONTENT',
);
export const FinishDeleteContent = makeAction(
  'ddm/contents/FINISH_DELETE_CONTENT',
  props<FinishProps & { readonly contentId?: T.Content['id'] }>(),
);

export const ChangeContents = makeAction(
  'ddm/contents/CHANGE_CONTENTS',
  props<{
    readonly contents: Array<T.Content>;
  }>(),
);

export const ChangeUploadContent = makeAction(
  'ddm/contents/CHANGE_UPLOAD_CONTENT',
  props<{
    readonly content: T.UploadContent;
  }>(),
);
export const FinishUploadContent = makeAction(
  'ddm/contents/FINISH_UPLOAD_CONTENT',
  props<{
    contentId?: T.Content['id'];
  } & FinishProps>(),
);

export const DeleteUploadContent = makeAction(
  'ddm/contents/DELETE_UPLOAD_CONTENT',
  props<{
    contentId?: T.Content['id'];
  }>(),
);

export const AddContent = makeAction(
  'ddm/contents/ADD_CONTENT',
  props<{
    readonly content: T.Content;
  }>(),
);

export const RemoveContent = makeAction(
  'ddm/contents/REMOVE_CONTENT',
  props<{
    readonly contentId: T.Content['id'];
  }>(),
);

export const CreateAndEditMeasurement = makeAction(
  'ddm/contents/CREATE_AND_EDIT',
  props<{
    readonly data: Pick<T.MeasurementContent, PostContentArguments>;
  }>(),
);

export const TurnOn2DOrthoOnToday = makeAction(
  'ddm/contents/TURN_ON_2D_ORTHO_ON_TODAY',
);

export const TurnOn3DOnToday = makeAction(
  'ddm/contents/TURN_ON_3D_ON_TODAY',
);

export const UploadBlueprintPDF = makeAction(
  'ddm/contents/UPLOAD_BLUEPRINT',
  props<{
    readonly title: string;
    readonly file: File;
    readonly appearAt?: T.Content['appearAt'];
  }>(),
);
export const CancelUploadBlueprint = makeAction(
  'ddm/contents/CANCEL_UPLOAD_BLUEPRINT',
);

export const UploadBlueprintDXF = makeAction(
  'ddm/contents/UPLOAD_BLUEPRINT_DXF',
  props<{
    readonly title: string;
    readonly file: File;
    readonly coordinateSystem: T.CoordinateSystem;
    readonly appearAt?: T.Content['appearAt'];
  }>(),
);

export const UploadBlueprintDWG = makeAction(
  'ddm/contents/UPLOAD_BLUEPRINT_DWG',
  props<{
      readonly title: string;
      readonly file: File;
      readonly coordinateSystem: T.CoordinateSystem;
      readonly appearAt?: T.Content['appearAt'];
    }>(),
);

export const UploadDesign = makeAction(
  'ddm/contents/UPLOAD_DESIGN',
  props<{
    readonly title: string;
    readonly file: File;
    readonly coordinateSystem: T.CoordinateSystem;
    readonly appearAt?: T.Content['appearAt'];
  }>(),
);

export const CancelUploadDesign = makeAction(
  'ddm/contents/CANCEL_UPLOAD_DESIGN',
);

export const UploadOrthophoto = makeAction(
  'ddm/contents/UPLOAD_ORTHOPHOTO',
  props<WithScreen<{
    readonly file: File;
  }>>(),
);
export const CancelUploadOrthophoto = makeAction(
  'ddm/contents/CANCEL_UPLOAD_ORTHOPHOTO',
);

export const UploadDsm = makeAction(
  'ddm/contents/UPLOAD_DSM',
  props<WithScreen<{
    readonly file: File;
  }>>(),
);
export const CancelUploadDsm = makeAction(
  'ddm/contents/CANCEL_UPLOAD_DSM',
);

export const UploadLas = makeAction(
  'ddm/contents/UPLOAD_LAS',
  props<WithScreen<{
    readonly file: File;
  }>>(),
);
export const CancelUploadLas = makeAction(
  'ddm/contents/CANCEL_UPLOAD_LAS',
  props<{
    readonly contentId?: T.Content['id'];
  }>(),
);

interface UploadSourcePhotoProps {
  readonly files: Array<File>;
  readonly noOfStream?: number;
  readonly gcpGroupInfo?: T.GCPGroupContent['info'];
  readonly isMeshOption?: boolean;
}
export const UploadSourcePhoto = makeAction(
  'ddm/contents/UPLOAD_SOURCE_PHOTO',
  props<WithScreen<UploadSourcePhotoProps>>(),
);
export const CancelUploadSourcePhoto = makeAction(
  'ddm/contents/CANCEL_UPLOAD_SOURCE_PHOTO',
);

interface RequestVolumeCalculationProps {
  readonly contentId: T.VolumeContent['id'];
  readonly info?: T.CalculationInfo;
  readonly locations?: Array<Coordinate>;
}

export const RequestVolumeCalculation = makeAction(
  'ddm/contents/REQUEST_VOLUME_CALCULATION',
  props<RequestVolumeCalculationProps>(),
);
export const CancelRequestVolumeCalculation = makeAction(
  'ddm/contents/CANCEL_REQUEST_VOLUME_CALCULATION',
  props<{
    readonly contentId: T.Content['id'];
  }>(),
);
export const FinishRequestVolumeCalculation = makeAction(
  'ddm/contents/FINISH_REQUEST_VOLUME_CALCULATION',
  props<FinishProps & {
    readonly contentId: T.Content['id'];
  }>(),
);

export const RequestLengthElevation = makeAction(
  'ddm/contents/REQUEST_LENGTH_ELEVATION',
  props<{
    readonly contentId: T.Content['id'];
    readonly comparisonContentId: T.DSMContent['id'] | T.DesignDXFContent['id'];
    readonly updatedLoacations?: T.LengthContent['info']['locations'];
    readonly points?: number;
    readonly comparison: {title: string; color: string};
  }>(),
);
export const CancelRequestLengthElevation = makeAction(
  'ddm/contents/CANCEL_REQUEST_LENGTH_ELEVATION',
  props<{
    readonly contentId: T.Content['id'];
  }>(),
);
export const FinishRequestLengthElevation = makeAction(
  'ddm/contents/FINISH_REQUEST_LENGTH_ELEVATION',
  props<FinishProps & {
    readonly contentId: T.Content['id'];
  }>(),
);

export const RequestMarkerElevationInfo = makeAction(
  'ddm/contents/REQUEST_MARKER_ELEVATION_INFO',
  props<{
    readonly contentId: T.Content['id'];
  }>(),
);
export const FinishRequestMarkerElevationInfo = makeAction(
  'ddm/contents/FINISH_REQUEST_MARKER_ELEVATION_INFO',
  props<FinishProps & {
    readonly contentId: T.Content['id'];
  }>(),
);

interface PrintOverlayContentsInfo {
  id: number;
  info: {
    opacity: number;
  };
}
interface PrintMapBody {
  title: string;
  locations: NonNullable<T.ContentsPageState['printingSquare']>;
  angle: NonNullable<T.ContentsPageState['printingAngle']>;
  filename?: string;

  data: Array<{
    format: T.PrintFormat;
    sizes: Array<T.PrintSize>;
  }>;
  overlay_contents: {
    dxf: Array<PrintOverlayContentsInfo>;
  };
}
export const RunPrintMap = makeAction(
  'ddm/contents/RUN_PRINT_MAP',
  props<{
    readonly title: string;
    readonly printFiles: T.PrintFormatsAndSizes;
    readonly filename?: string;
  }>(),
);
export const CancelRunPrintMap = makeAction(
  'ddm/contents/CANCEL_RUN_PRINT_MAP',
);
export const FinishRunPrintMap = makeAction(
  'ddm/contents/FINISH_RUN_PRINT_MAP',
  props<FinishProps>(),
);

export const UpdateMeasurementLocations = makeAction(
  'ddm/contents/UPDATE_MEASUREMENT_LOCATIONS',
  props<{
    readonly locations: T.GeoPoint[];
    readonly id: T.MeasurementContent['id'];
  }>(),
);

export const SetOutdatedVolumes = makeAction(
  'ddm/contents/SET_OUTDATED_VOLUMES',
  props<{
    readonly outdatedVolumeIds: Array<T.VolumeContent['id']>;
  }>(),
);

export const UpdateMarkerAttachmentsCount = makeAction(
  'ddm/contents/UPDATE_MARKER_ATTACHMENTS_COUNT',
  props<{
    readonly contentId: T.Content['id'];
    readonly count: T.MarkerContent['attachmentsCount'];
  }>(),
);
export const UpdateElevationComparison = makeAction(
  'ddm/contents/UPDATE_ELEVATION_COMPARISON',
  props<{
    readonly contentId: T.Content['id'];
    readonly elevationIdx: number;
    readonly points?: Array<T.LengthElevationRawData>;
    readonly title?: string;
    readonly color?: string;
  }>(),
);
export const UpdateContentConfig = makeAction(
  'ddm/contents/UPDATE_CONTENT_CONFIG',
  props<{
    readonly contentId: T.Content['id'];
    readonly config: T.Content['config'];
  }>(),
);
export const UpdateContentsSelectedAtInStore = makeAction(
  'ddm/contents/UPDATE_CONTENTS_SELECTED_AT_IN_STORE',
  props<{
    readonly ids: Array<T.Content['id']>;
    readonly selectedAt: Date | undefined;
  }>(),
);
export const UpdateContentPinSettings = makeAction(
  'ddm/contents/UPDATE_CONTENT_PIN_SETTINGS',
  props<{
    readonly contentId: T.Content['id'];
    readonly screenId?: T.Screen['id'];
    readonly pinEventAt?: T.Content['pinEventAt'];
  }>(),
);
export const SetMarkerPinSelected = makeAction(
  'ddm/contents/SET_MARKER_PIN_SELECTED',
  props<{
    readonly contentId: T.Content['id'];
    readonly move: T.MarkerContent['info']['move'];
  }>(),
);
export const UpdateLengthAreaVolumeLocations = makeAction(
  'ddm/contents/UPDATE_LENGTH_AREA_VOLUME_LOCATIONS',
  props<{
    readonly contentId: T.Content['id'];
    readonly locations: T.LengthAreaVolumeContent['info']['locations'];
  }>(),
);

export const RunDXF2Raster = makeAction(
  'ddm/contents/RUN_DXF_2_RASTER',
  props<{
    readonly contentId: T.Content['id'];
  }>(),
);
export const CancelRunDXF2Raster = makeAction(
  'ddm/contents/CANCEL_RUN_DXF_2_RASTER',
);
export const FinishRunDXF2Raster = makeAction(
  'ddm/contents/FINISH_RUN_DXF_2_RASTER',
  props<FinishProps>(),
);

export const ResetContentsAPIStatusInStore = makeAction(
  'ddm/contents/RESET_CONTENTS_API_STATUS_IN_STORE',
  props<{}>(),
);

export const DownloadOverlay = makeAction(
  'ddm/contents/DOWNLOAD_OVERLAY_CONTENT',
  props<{
    readonly contentId: T.Content['id'];
  }>(),
);
export const CancelDownloadOverlay = makeAction(
  'ddm/contents/CANCEL_DOWNLOAD_OVERLAY_CONTENT',
);
export const FinishDownloadOverlay = makeAction(
  'ddm/contents/FINISH_DOWNLOAD_OVERLAY_CONTENT',
  props<FinishProps>(),
);

export const GetLengthMetrics = makeAction(
  'ddm/contents/GET_LENGTH_METRICS',
  props<{
    readonly id: T.AreaContent['id'];
  }>(),
);
export const FinishGetLengthMetrics = makeAction(
  'ddm/contents/FINISH_GET_LENGTH_METRICS',
  props<FinishProps & {
    readonly id: T.AreaContent['id'];
  }>(),
);
export const CancelGetLengthMetrics = makeAction(
  'ddm/contents/CANCEL_GET_LENGTH_METRICS',
  props<{
    readonly id: T.AreaContent['id'];
  }>(),
);
export const GetAreaSurface = makeAction(
  'ddm/contents/GET_AREA_SURFACE',
  props<{
    readonly contentId: T.AreaContent['id'];
  }>(),
);
export const FinishGetAreaSurface = makeAction(
  'ddm/contents/FINISH_GET_AREA_SURFACE',
  props<FinishProps & {
    readonly contentId: T.AreaContent['id'];
  }>(),
);
export const CancelGetAreaSurface = makeAction(
  'ddm/contents/CANCEL_GET_AREA_SURFACE',
  props<{
    readonly contentId: T.AreaContent['id'];
  }>(),
);

export const ChangeLasDownSamplingStatus = makeAction(
  'ddm/contents/CHANGE_LAS_DOWN_SAMPLING_STATUS',
  props<{
    readonly screenId: T.Screen['id'];
    readonly contentId: T.Content['id'];
    readonly status: T.LasDownSamplingStatus;
  }>(),
);

export const GetLasDownSamplingStatus = makeAction(
  'ddm/contents/GET_LAS_DOWN_SAMPLING_STATUS',
  props<{
    readonly id: T.PointCloudContent['id'];
  }>(),
);

export const GetContentDownloadables = makeAction(
  'ddm/contents/GET_CONTENT_DOWNLOADABLES',
  props<{
    readonly screenId: T.Screen['id'];
  }>(),
);

export const FinishGetContentDownloadables = makeAction(
  'ddm/contents/FINISH_GET_CONTENT_DOWNLOADABLES',
  props<FinishProps>(),
);

export const CancelGetContentDownloadables = makeAction(
  'ddm/contents/CANCEL_GET_CONTENT_DOWNLOADABLES',
);

export const ChangeContentDownloadables = makeAction(
  'ddm/contents/CHANGE_CONTENT_DOWNLOADABLES_SCREEN_ID',
  props<{
    readonly screenId: T.Screen['id'];
    readonly downloadables: Partial<Record<T.ResourceType, boolean>>;
  }>(),
);

export const RequestLasDownSampling = makeAction(
  'ddm/contents/REQUEST_LAS_DOWN_SAMPLING',
  props<{
    readonly screenId: T.Screen['id'];
  }>(),
);

export const FinishRequestLasDownSampling = makeAction(
  'ddm/contents/FINISH_REQUEST_LAS_DOWN_SAMPLING',
  props<FinishProps>(),
);

export const CancelRequestLasDownSampling = makeAction(
  'ddm/contents/CANCEL_REQUEST_LAS_DOWN_SAMPLING',
);

export const UpdateContents = makeAction(
  'ddm/contents/UPDATE_CONTENTS',
  props<{ readonly contents: T.Content[] }>(),
);

export const CreateTemporaryGroupAndAddContent = makeAction(
  'ddm/contents/CREATE_TEMPORARY_GROUP_AND_ADD_CONTENT',
  // This is typed to any because it was supposed to be typed to Action, but
  // it might cause a cyclic dependency error, since this is also a part of the action.
  // For now, since this action is an edge-case, it should be left this way.
  props<{ action: any }>(),
);

export const RequestLasReprocessing = makeAction(
  'ddm/contents/REQUEST_LAS_REPROCESSING',
  props<{
    readonly contentId: T.Content['id'];
  }>(),
);

export const StartRequestingLasReprocessing = makeAction(
  'ddm/contents/START_REQUESTING_LAS_REPROCESSING',
  props(),
);

export const FinishRequestLasReprocessing = makeAction(
  'ddm/contents/FINISH_REQUEST_LAS_REPROCESSING',
  props<FinishProps>(),
);

export const CancelRequestLasReprocessing = makeAction(
  'ddm/contents/CANCEL_REQUEST_LAS_REPROCESSING',
);


const Action = union([
  GetInitialContents,
  CancelGetInitialContents,
  FinishGetInitialContents,

  GetContents,
  CancelGetContents,
  FinishGetContents,

  PostContent,
  CancelPostContent,
  FinishPostContent,

  PatchContent,
  CancelPatchContent,
  FinishPatchContent,

  DeleteContent,
  CancelDeleteContent,
  FinishDeleteContent,

  DownloadOverlay,
  CancelDownloadOverlay,
  FinishDownloadOverlay,

  ChangeContents,

  AddContent,

  RemoveContent,

  CreateAndEditMeasurement,

  TurnOn2DOrthoOnToday,

  UploadBlueprintPDF,
  CancelUploadBlueprint,

  UploadBlueprintDXF,
  UploadBlueprintDWG,

  UploadDesign,
  CancelUploadDesign,

  UploadOrthophoto,
  CancelUploadOrthophoto,

  UploadDsm,
  CancelUploadDsm,

  UploadLas,
  CancelUploadLas,

  RunPrintMap,
  CancelRunPrintMap,
  FinishRunPrintMap,

  SetOutdatedVolumes,

  UpdateMarkerAttachmentsCount,
  UpdateElevationComparison,
  UpdateContentConfig,
  UpdateContentsSelectedAtInStore,
  UpdateContentPinSettings,
  UpdateLengthAreaVolumeLocations,

  SetMarkerPinSelected,

  RunDXF2Raster,
  CancelRunDXF2Raster,
  FinishRunDXF2Raster,

  RunPrintMap,
  CancelRunPrintMap,
  FinishRunPrintMap,
  ChangeSidebarStatus,
  OpenContentPagePopup,
  TogglePrintView,

  UploadSourcePhoto,
  CancelUploadSourcePhoto,

  RequestVolumeCalculation,
  CancelRequestVolumeCalculation,
  FinishRequestVolumeCalculation,

  RequestLengthElevation,
  CancelRequestLengthElevation,
  FinishRequestLengthElevation,

  RequestMarkerElevationInfo,
  FinishRequestMarkerElevationInfo,

  ChangeUploadContent,
  FinishUploadContent,
  DeleteUploadContent,

  ResetContentsAPIStatusInStore,

  GetLengthMetrics,
  FinishGetLengthMetrics,
  CancelGetLengthMetrics,

  GetAreaSurface,
  FinishGetAreaSurface,
  CancelGetAreaSurface,

  GetContentDownloadables,
  FinishGetContentDownloadables,
  CancelGetContentDownloadables,
  ChangeContentDownloadables,

  ChangeLasDownSamplingStatus,
  GetLasDownSamplingStatus,

  RequestLasDownSampling,
  FinishRequestLasDownSampling,
  CancelRequestLasDownSampling,

  UpdateContents,
  CreateTemporaryGroupAndAddContent,
  RequestLasReprocessing,
  StartRequestingLasReprocessing,
  FinishRequestLasReprocessing,
  CancelRequestLasReprocessing,

  // Out-duck actions
  ChangeAuthedUser,
  GetAttachments,
  PostAttachmentNew,
  PostAttachment,
  FinishPostAttachment,
  FinishPostAttachmentNew,
  ChangeEditingContent,
  CloseContentPageMapPopup,
  ChangeCurrentContentTypeFromAnnotationPicker,
  ChangeFirstVisitStatus,

  PatchProjectConfig,
  PatchProject,
  PatchScreen,

  GetCalendar,

  PostScreen,

  AddScreenInStore,

  ChangeContentsSidebarTab,
  GetESSModelById,

  ChangeIn3D,
  ChangeTwoDDisplayZoom,
  ChangeTwoDDisplayCenter,

  CheckAndRemoveGroup,
  RemoveGroupChildren,
  ChangeSelectedGroupId,
  AddContentToTree,
  RemoveContentFromTree,
  ChangeIsCreatingContentOnDeletedGroup,
  ChangeIsGroupAlreadyDeleted,
]);
export type Action = typeof Action;


// Redux-Observable Epics
const GetInitialContentsEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetInitialContents),
  mergeMap(({ projectId }) => {
    const contentURL: string = makeV2APIURL('projects', projectId, 'contents');
    const authHeader: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const versionHeader: VersionHeader = makeVersionHeader();

    if (authHeader === undefined) {
      return [ChangeAuthedUser({})];
    }

    /**
     * There's a racing condition issue with this action.
     * When user opens the content page the first time,
     * it does a request to get the user, and this action is performed afterwards.
     * When the user request is not done but the contents are done,
     * this gets called first, and it won't be able to retrieve the feature value from user.
     * Therefore, slug is used instead since it's always available. This is not a good practice,
     * there might be a design issue as well but once the permission
     * is fixed for ESS feature as well, this should no longer be an issue.
     */
    const hasFeature: HasFeature = createHasFeature(getFeaturePermissionFromSlug(state$.value.PlanConfig.config?.slug));

    const contents$: Observable<Array<T.Content>> = ajax.get(contentURL, { ...authHeader, ...versionHeader }).pipe(
      map(({ response }): GetContentsResponse => response),
      map(({ data }) => data.filter(({ type }) => ((type as string) !== T.ExcludedContentType.THERMAL)).map(APIToContent)),
      shareReplay(1),
    );

    const ESSContentURL: string = makeV2APIURL('projects', projectId, 'ess_contents');
    const ESSContents$: Observable<Array<T.ESSContent>> = ajax.get(ESSContentURL, { ...authHeader, ...versionHeader }).pipe(
      map(({ response }): GetESSContentsResponse => response),
      map(({ data }) => data.map((content) => APIToContent({ ...content, category: T.ContentCategory.ESS }) as T.ESSContent)),
      shareReplay(1),
    );

    // Since contents are now from both contents and ESS contents,
    // combine them here and only then shape the tree.
    const allContents$: Observable<Array<T.Content>> = combineLatest([contents$, ESSContents$]).pipe(
      map(([contents, ESSContents]) => contents.concat(ESSContents)));

    const changeContents$: Observable<Action> = allContents$.pipe(
      map((contents) => ({ contents })),
      map(ChangeContents),
    );

    // To reduce unnecessary request, the initial ESS contents
    // would be loading its own models first. The subsequently added models
    // will have the models loaded when users load the models by category
    // from the ESS models list
    const getInitialModels$: Observable<Action> = ESSContents$.pipe(
      mergeMap((contents) => {
        if (contents.length === 0) {
          return [];
        }

        const modelIdsFromContents: Set<NonNullable<T.ESSModelContent['info']>['modelId']> = new Set();
        contents.forEach((content) => {
          if (content.type === T.ContentType.ESS_MODEL) {
            modelIdsFromContents.add(content.info.modelId);
          }
        });

        return [...modelIdsFromContents].map((id) => GetESSModelById({ id }));
      }),
    );

    /**
     * @desc We can delete this action later
     */
    const changeFirstVisitStatus$: Observable<Action> = contents$.pipe(
      mapTo(ChangeFirstVisitStatus({ firstVisit: !hasFeature(T.Feature.ESS) })),
    );

    return concat(
      changeContents$,
      changeFirstVisitStatus$,
      getInitialModels$,
      [GetPhotos({ projectId })],
      [FinishGetInitialContents({})],
      [hasFeature(T.Feature.ESS) ? TurnOn3DOnToday() : TurnOn2DOrthoOnToday()],
    ).pipe(
      catchError<Action, any>((ajaxError: AjaxError) => [
        Sentry.captureException(ajaxError),
        FinishGetInitialContents({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelGetInitialContents),
        ),
      ),
    );
  }),
);

const postContentEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(PostContent),
  mergeMap(({ content: actionContent, projectId }) => {
    const URL: string = makeV2APIURL('projects', projectId, 'contents');
    const authHeader: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const versionHeader: VersionHeader = makeVersionHeader();

    if (authHeader === undefined) {
      return [ChangeAuthedUser({})];
    }

    const body: PostContentBody = actionContent;

    return ajax.post(URL, body, {
      ...authHeader,
      ...versionHeader,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }): PostContentResponse => response),
      map(({ data }) => data),
      map(APIToContent),
      map((content) => ({ content })),
      mergeMap(({ content }) => ([
        AddContent({ content }),
        AddContentToTree({ content, moveOption: T.MoveOption.FIRST }),
      ])),
      (res$) => concat<Action>(res$, [
        FinishPostContent({}),
      ]),
      catchError<Action, any>((ajaxError: AjaxError) => [
        FinishPostContent({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelPostContent),
        ),
      ),
    );
  }),
);

const patchContentEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(PatchContent),
  mergeMap(({ content: actionContent, isDBVCorSBVC }) => {
    const URL: string = makeV2APIURL('contents', actionContent.id);
    const authHeader: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const versionHeader: VersionHeader = makeVersionHeader();

    if (authHeader === undefined) {
      return [ChangeAuthedUser({})];
    }

    const oldContent: undefined | T.Content = state$.value.Contents.contents.byId[actionContent.id];

    if (oldContent === undefined) return [];

    /**
     * @TODO This is for volume content.
     * We need to dispatch separately in the future.
     */

    const newInfo: T.Content['info'] = { ...oldContent.info, ...actionContent.info } as T.Content['info'];

    let volumeConfig: T.VolumeContent['config'] | undefined;

    if (oldContent.type === T.ContentType.VOLUME) {
      // This check initially is to update volume when the calculation is there but there's no config.
      // See https://github.com/angelswing-team/angelswing-frontend/pull/1479.
      // The use case is when a volume with calculation is made by one user, then another user accesses it.
      // The code has to add the config for the other user.
      const isDsmInfoEmpty: boolean = (oldContent.config?.dsm === undefined &&
        oldContent.info.calculatedVolume.wmsInfo !== undefined &&
        oldContent.info.calculatedVolume.minMaxElevation !== undefined);

      const isDsmInfoOutdated: boolean = oldContent.config?.dsm !== undefined &&
        (oldContent.config.dsm.percents.survey?.maxCut !== oldContent.info.calculatedVolume.minMaxElevation?.maxHeight ||
        oldContent.config.dsm.percents.survey?.maxFill !== oldContent.info.calculatedVolume.minMaxElevation?.minHeight);

      if (isDBVCorSBVC || isDsmInfoEmpty || isDsmInfoOutdated) {
        if ((newInfo as T.VolumeContent['info']).calculatedVolume?.minMaxElevation) {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-non-null-assertion
          const elevation: T.CalculatedVolumeInfo['minMaxElevation'] = (newInfo as T.VolumeContent['info']).calculatedVolume.minMaxElevation!;
          const range: T.SurveyDoubleSlider = [0, 0, 0, 0];

          range[T.SurveyType.CUT_MAX] = Math.max(elevation.maxHeight, 0);
          range[T.SurveyType.CUT_MIN] = Math.max(elevation.minHeight, 0);

          if (elevation.minHeight > 0) {
            range[T.SurveyType.FILL_MIN] = 0;
            range[T.SurveyType.FILL_MAX] = 0;
          } else if (elevation.maxHeight >= 0 && elevation.minHeight < 0) {
            range[T.SurveyType.FILL_MIN] = 0;
            range[T.SurveyType.FILL_MAX] = -elevation.minHeight;
          } else {
            range[T.SurveyType.FILL_MIN] = -elevation.maxHeight;
            range[T.SurveyType.FILL_MAX] = -elevation.minHeight;
          }

          const survey: T.SurveyContent = {
            minLow: range[T.SurveyType.FILL_MIN],
            maxLow: range[T.SurveyType.FILL_MAX],
            minHigh: range[T.SurveyType.CUT_MIN],
            maxHigh: range[T.SurveyType.CUT_MAX],
            maxCut: elevation.maxHeight,
            maxFill: elevation.minHeight,
          };

          const isPreviousDsmOn: boolean | undefined = (({ ...actionContent, ...oldContent } as T.VolumeContent).config?.dsm?.isOn);
          volumeConfig = {
            type: T.ContentType.VOLUME,
            dsm: {
              isOn: isPreviousDsmOn === undefined ? true : isPreviousDsmOn,
              opacity: 70,
              percents: {
                min: 0,
                max: 0,
                survey,
              },
            },
          };
        } else {
          volumeConfig = {
            type: T.ContentType.VOLUME,
            dsm: undefined,
          };
        }
      }
    }

    const newContent: T.Content = {
      ...oldContent,
      ...actionContent,
      info: newInfo,
      config: {
        ...oldContent.config,
        ...actionContent.config,
        ...volumeConfig,
      },
    } as T.Content;

    const appearAt: Date | undefined = actionContent.appearAt;
    /**
     * @fixme this is a hotfix
     * Remove later when per-screen is implemented
     */
    const appearAtToServer: string | undefined = appearAt ? `${appearAt.getFullYear()}/${appearAt.getMonth() + 1}/${appearAt.getDate()}` : undefined;
    const body: Overwrite<
        PatchContentBody, {
          readonly appearAt?: string;
        }
      > = {
        pinEventAt: actionContent.pinEventAt,
        appearAt: appearAtToServer,
        title: actionContent.title,
        config: (
          newContent.config !== undefined ?
            JSON.stringify(newContent.config) : undefined
        ),
        color: (actionContent.color !== undefined ? actionContent.color.toString() : undefined),
        info: (
          actionContent.info !== undefined ?
            JSON.stringify(serializeInfo(oldContent.type, newContent.info)) :
            undefined
        ),
        screenId: actionContent.screenId,
      };

    Object.keys(body).forEach((key) => {
      if (body[key as keyof PatchContentBody] === undefined) {
        /**
         * @todo remove following `delete`
         */
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete body[key as keyof PatchContentBody];
      }
    });

    const lengthActions: Action[] = newContent.type === T.ContentType.LENGTH &&
      state$.value.Contents.getLengthMetrics[newContent.id]?.status !== T.APIStatus.PROGRESS &&
      newContent.info.metrics !== undefined ? [
        GetLengthMetrics({ id: newContent.id }),
      ] : [];

    const areaActions: Action[] = newContent.type === T.ContentType.AREA &&
      state$.value.Contents.getAreaSurface[newContent.id]?.status !== T.APIStatus.PROGRESS &&
      newContent.info.surface !== undefined ? [
        GetAreaSurface({ contentId: newContent.id }),
      ] : [];

    return concat(
      /**
       * @desc This action is used to give optimistic UX
       */
      [AddContent({ content: newContent })],
      ajax.patch(URL, body, {
        ...authHeader,
        ...versionHeader,
        ...jsonContentHeader,
      }).pipe(
        map(({ response }): PatchContentResponse => response),
        map(({ data }) => data),
        map(APIToContent),
        map((content) => ({
          content,
        })),
        map(AddContent),
      ),
      [
        ...lengthActions,
        ...areaActions,
        FinishPatchContent({}),
      ],
    ).pipe(
      catchError((ajaxError) => {
        const error = getRequestErrorType(ajaxError);
        const actions: Action[] = [
          FinishPatchContent({ error }),
        ];

        if (error === T.HTTPError.CLIENT_NOT_FOUND_ERROR) {
          return actions.concat([
            ChangeEditingContent({}),
            CheckAndRemoveGroup({ id: oldContent.id }),
            RemoveContent({ contentId: oldContent.id }),
          ]);
        }

        return actions.concat([
          AddContent({ content: oldContent }),
        ]);
      }),
      takeUntil(
        action$.pipe(
          ofType(CancelPatchContent),
        ),
      ),
    );
  }),
);

const deleteContentEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(DeleteContent),
  mergeMap(({ contentId }) => {
    const URL: string = makeV2APIURL('contents', contentId);
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    const contentType: T.ContentType = state$.value.Contents.contents.byId[contentId].type;
    const isMapOrDSM: boolean = T.ContentType.MAP === contentType || T.ContentType.DSM === contentType;

    const additionalActions: Array<Action> = [];

    /**
     * @desc when you delete Map or DSM, the 3d Ortho content should be delete.
     * @tip Not working when you have more than two DSMs or two Maps
     * in date which is appearAt of deleting content.
     */
    if (isMapOrDSM) {
      const threeDOrthoId: T.ThreeDOrthoContent['id'] | undefined =
        getSingleContentId(state$.value.Contents, state$.value.Pages, state$.value.ProjectConfigPerUser, T.ContentType.THREE_D_ORTHO);

      if (threeDOrthoId !== undefined) {
        additionalActions.push(RemoveContent({ contentId: threeDOrthoId }));
      }
    } else if (contentType === T.ContentType.GROUP) {
      additionalActions.push(RemoveGroupChildren({ id: contentId }));
      additionalActions.push(ChangeSelectedGroupId({ tab: state$.value.Pages.Contents.sidebarTab }));
    }

    return ajax.delete(URL, header).pipe(
      mergeMapTo([
        ChangeEditingContent({ contentId: undefined }),
        RemoveContentFromTree({ content: state$.value.Contents.contents.byId[contentId] }),
        RemoveContent({ contentId }),
        ...additionalActions,
        FinishDeleteContent({ contentId }),
      ]),
      catchError((ajaxError: AjaxError) => {
        const error = getRequestErrorType(ajaxError);
        const actions: Action[] = [
          FinishDeleteContent({ error, contentId }),
        ];

        if (error === T.HTTPError.CLIENT_NOT_FOUND_ERROR) {
          return actions.concat([
            CheckAndRemoveGroup({ id: contentId }),
            ChangeIsGroupAlreadyDeleted({ isGroupAlreadyDeleted: true }),
          ]);
        }

        return actions.concat([
          OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }),
        ]);
      }),
      takeUntil(
        action$.pipe(
          ofType(CancelDeleteContent),
        ),
      ),
    );
  }),
  catchError((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    Sentry.captureException(e);

    return [FinishDeleteContent({})];
  }),
);

const createAndEditMeasurementEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(CreateAndEditMeasurement),
  mergeMap(({ data: action }) => {
    const projectId: T.Project['id'] | undefined = state$.value.Pages.Contents.projectId;
    const lastSelectedScreenId: T.Screen['id'] | undefined = state$.value.ProjectConfigPerUser.config?.lastSelectedScreenId;

    if (projectId === undefined || lastSelectedScreenId === undefined) return [];

    const URL: string = makeV2APIURL('projects', projectId, 'contents');
    const authHeader: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const versionHeader: VersionHeader = makeVersionHeader();

    if (authHeader === undefined) return [ChangeAuthedUser({})];

    const postActions: Action[] = [];

    const tab = T.ContentPageTabType.MEASUREMENT;
    let groupId: T.GroupContent['id'] | undefined;
    try {
      groupId = getCurrentGroupId(state$.value, tab, lastSelectedScreenId);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);

      return [];
    }
    const groupAction: Action[] = [ChangeSelectedGroupId({ selectedGroupId: groupId, tab })];

    const groupContent: T.GroupContent | undefined = typeGuardGroup(state$.value.Contents.contents.byId[groupId ?? NaN]);
    if (groupContent !== undefined && !groupContent.info?.isOpened) {
      postActions.push(PatchContent({ content: { id: groupContent.id, info: { isOpened: true } } }));
    }

    const body: UploadContentBody = {
      ...action,
      groupId,
      screenId: groupContent?.screenId,
      type: action.type,
      color: action.color.toString(),
      info: JSON.stringify(action.info),
    };

    return ajax.post(URL, body, {
      ...authHeader,
      ...versionHeader,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }): PostContentResponse => response),
      map(({ data }) => data),
      map(APIToContent),
      mergeMap((content) => {
        /**
         * @todo content id is undefined right now
         */
        const contentId: T.Content['id'] = content.id;
        const lengthContentActions: Array<Action> = content.type === T.ContentType.LENGTH ? [
          PatchContent({ content: { id: content.id, config: { isElevationToggled: false, distanceType: T.DistanceType.POINT_TO_POINT } } }),
          GetLengthMetrics({ id: content.id }),
        ] : [];
        const markerContentActions: Array<Action> = content.type === T.ContentType.MARKER ? [
          RequestMarkerElevationInfo({ contentId }),
        ] : [];
        const areaContentActions: Array<Action> = content.type === T.ContentType.AREA ? [
          GetAreaSurface({ contentId: content.id }),
        ] : [];

        const volumeCalculationAction: Array<Action> = [];
        if (content.type === T.ContentType.VOLUME) {
          const volumeCalculationInformation: T.CalculationInfo = content.info.calculatedVolume.calculation;
          volumeCalculationAction.push(
            RequestVolumeCalculation({
              contentId,
              info: volumeCalculationInformation,
            }),
          );
        }

        return postActions.concat([
          AddContent({ content }),
          AddContentToTree({ content, moveOption: T.MoveOption.FIRST }),
          ChangeEditingContent({ contentId }),
          ...areaContentActions,
          ...lengthContentActions,
          ...markerContentActions,
          ...volumeCalculationAction,
          ...groupAction,
        ]);
      }),
      (res$) => concat(res$, [
        FinishPostContent({}),
        ChangeCurrentContentTypeFromAnnotationPicker({}),
        CloseContentPageMapPopup(),
      ]),
      catchError((ajaxError) => {
        const error = getRequestErrorType(ajaxError);

        const actions: Action[] = [
          FinishPostContent({ error }),
        ];

        if (error === T.HTTPError.CLIENT_NOT_ACCEPTED_ERROR && groupId !== undefined) {
          return actions.concat([
            CheckAndRemoveGroup({ id: groupId }),
            CreateTemporaryGroupAndAddContent({ action: CreateAndEditMeasurement({ data: action }) }),
          ]);
        }

        return actions;
      }),
      takeUntil(
        action$.pipe(
          ofType(CancelPostContent),
        ),
      ),
    );
  }),
);

const turnOn2DOrthoOnTodayEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(TurnOn2DOrthoOnToday),
  mergeMap(() => {
    const twoDOrthoId: T.MapContent['id'] | undefined = getSingleContentId(
      state$.value.Contents, state$.value.Pages, state$.value.ProjectConfigPerUser, T.ContentType.MAP,
    );
    if (twoDOrthoId === undefined) return [];

    const twoDOrthoContent: T.Content | undefined = state$.value.Contents.contents.byId[twoDOrthoId];

    if (twoDOrthoContent === undefined || Boolean(twoDOrthoContent.config?.selectedAt)) return [];

    return [
      PatchContent({ content: { id: twoDOrthoId, config: { selectedAt: new Date() } } }),
    ];
  }),
);

const turnOn3DOnTodayEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(TurnOn3DOnToday),
  mergeMap(() => {
    const threeDId: T.MapContent['id'] | undefined = getViewableThreeDContentId(
      state$.value.Contents, state$.value.Pages, state$.value.ProjectConfigPerUser,
    );
    const threeDContent: T.Content | undefined = state$.value.Contents.contents.byId[threeDId ?? NaN];
    if (threeDContent === undefined) {
      // eslint-disable-next-line no-console
      console.warn('No 3D content found for ESS, user has not uploaded one.');

      return [ChangeIn3D({ in3D: true })];
    }

    // When initializing 3d, zoom and center has to be set,
    // but the info is on the 2d map.
    const twoDOrthoId: T.MapContent['id'] | undefined = getSingleContentId(
      state$.value.Contents, state$.value.Pages, state$.value.ProjectConfigPerUser, T.ContentType.MAP,
    );
    const twoDOrthoContent: T.MapContent | undefined = state$.value.Contents.contents.byId[twoDOrthoId ?? NaN] as T.MapContent | undefined;
    if (twoDOrthoContent === undefined) {
      // eslint-disable-next-line no-console
      console.warn('No 2D content found for ESS, user has not uploaded one.');

      return [ChangeIn3D({ in3D: true })];
    }

    const closestZoom: number = getClosestZoomLevel(twoDOrthoContent.info.tms, defaultMapZoom);
    const boundaryForZoom: T.MapBoundary | undefined = twoDOrthoContent.info.tms?.boundaries[closestZoom];
    const lon: number = _.mean([boundaryForZoom?.minLon, boundaryForZoom?.maxLon]);
    const lat: number = _.mean([boundaryForZoom?.minLat, boundaryForZoom?.maxLat]);
    const baseActions: Action[] = [
      ChangeTwoDDisplayCenter({ twoDDisplayCenter: [lon, lat] }),
      ChangeTwoDDisplayZoom({ twoDDisplayZoom: defaultMapZoom }),
      ChangeIn3D({ in3D: true }),
    ];

    if (Boolean(threeDContent.config?.selectedAt)) {
      return baseActions;
    }

    return baseActions.concat([
      PatchContent({ content: { id: threeDContent.id, config: { selectedAt: new Date() } } }),
    ]);
  }),
);

const uploadBlueprintPDFEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(UploadBlueprintPDF),
  mergeMap(({ file, title, appearAt }) => {
    const projectId: T.Project['id'] | undefined = state$.value.Pages.Contents.projectId;

    if (projectId === undefined) {
      return [];
    }

    const URL: string = makeV2APIURL('projects', projectId, 'contents');
    const authHeader: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const versionHeader: VersionHeader = makeVersionHeader();

    if (authHeader === undefined) {
      return [ChangeAuthedUser({})];
    }

    const center: T.GeoPoint = state$.value.Pages.Contents.twoDDisplayCenter;
    // eslint-disable-next-line no-magic-numbers
    const geoPoint: [T.GeoPoint, T.GeoPoint] = [center, [center[0] + 0.01, center[1]]];

    const tab = T.ContentPageTabType.OVERLAY;
    let groupId: T.GroupContent['id'] | undefined;
    try {
      groupId = getCurrentGroupId(state$.value, tab);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);

      return [];
    }
    const groupAction: Action[] = [ChangeSelectedGroupId({ selectedGroupId: groupId, tab })];

    const blueprintPDFContent: Pick<T.BlueprintPDFContent, PostContentArguments> = defaultBlueprintPDF({ title, geoPoint });
    const body: UploadContentBody = {
      ...blueprintPDFContent,
      groupId,
      color: blueprintPDFContent.color.toString(),
      info: JSON.stringify(blueprintPDFContent.info),
      appearAt: appearAt ? formatWithOffset(
        state$.value.Pages.Common.timezoneOffset,
        appearAt,
        Formats.YYYY_MM_DD,
      ) : undefined,
    };

    return ajax.post(URL, body, {
      ...authHeader,
      ...versionHeader,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }): PostContentResponse => response),
      map(({ data }) => data),
      map(APIToContent),
      mergeMap((content) => {
        const contentId: number = content.id;
        const attachmentType: T.AttachmentType = T.AttachmentType.BLUEPRINT_PDF;

        const [addContent, changeUploadContent, openContentPagePopup, ,openOverlayTabIfNeeded]: ContentUploadManagerOutput =
          contentUploadManager<ActionsObservable<Action>>({
            action$, content, file, attachmentType: T.AttachmentType.BLUEPRINT_PDF,
          });

        return concat<Action>(
          groupAction,
          addContent, changeUploadContent, openContentPagePopup, openOverlayTabIfNeeded,
          // BlueprintPDF uses PostAttachment (not PostAttachmentNew),
          // therefore the completed popup should be handled manually.
          [PostAttachment({ contentId, file, attachmentType })],
          action$.pipe(
            ofType(FinishPostAttachment),
            filter(({ contentId: id }) => id === contentId),
            take(1),
            mapTo(FinishUploadContent({ contentId })),
          ),
        );
      }),
      catchError((ajaxError) => {
        const error = getRequestErrorType(ajaxError);

        const actions: Action[] = [
          FinishUploadContent({ error }),
        ];

        if (error === T.HTTPError.CLIENT_NOT_ACCEPTED_ERROR && groupId !== undefined) {
          return actions.concat([
            CheckAndRemoveGroup({ id: groupId }),
            CreateTemporaryGroupAndAddContent({
              action: UploadBlueprintPDF({ file, title, appearAt }),
            }),
          ]);
        }

        return actions;
      }),
      takeUntil(
        action$.pipe(
          ofType(CancelUploadBlueprint),
        ),
      ),
    );
  }),
);

const uploadBlueprintDXFEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(UploadBlueprintDXF),
  mergeMap(({ file, title, coordinateSystem, appearAt }) => {
    const projectId: T.Project['id'] | undefined = state$.value.Pages.Contents.projectId;

    if (projectId === undefined) {
      return [];
    }

    const URL: string = makeV2APIURL('projects', projectId, 'contents');
    const authHeader: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const versionHeader: VersionHeader = makeVersionHeader();

    if (authHeader === undefined) {
      return [ChangeAuthedUser({})];
    }

    const tab = T.ContentPageTabType.OVERLAY;
    let groupId: T.GroupContent['id'] | undefined;
    try {
      groupId = getCurrentGroupId(state$.value, tab);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);

      return [];
    }
    const groupAction: Action[] = [ChangeSelectedGroupId({ selectedGroupId: groupId, tab })];

    const defaultContent: Pick<T.BlueprintDXFContent, PostContentArguments> =
      defaultBlueprintDXF({ title, coordinateSystem: T.ProjectionEnum[coordinateSystem] });

    const body: UploadContentBody = {
      ...defaultContent,
      groupId,
      color: defaultContent.color.toString(),
      info: JSON.stringify(defaultContent.info),
      appearAt: appearAt ? formatWithOffset(
        state$.value.Pages.Common.timezoneOffset,
        appearAt,
        Formats.YYYY_MM_DD,
      ) : undefined,
    };

    return ajax.post(URL, body, {
      ...authHeader,
      ...versionHeader,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }): PostContentResponse => response),
      map(({ data }) => data),
      map(APIToContent),
      mergeMap((content) => {
        const contentId: number = content.id;

        return concat<Action>(
          groupAction,
          ...contentUploadManager<ActionsObservable<Action>>({
            action$, content, file, attachmentType: T.AttachmentType.BLUEPRINT_DXF,
          }),
          [FinishUploadContent({ contentId })],
        );
      }),
      catchError((ajaxError) => {
        const error = getRequestErrorType(ajaxError);

        const actions: Action[] = [
          FinishUploadContent({ error }),
        ];

        if (error === T.HTTPError.CLIENT_NOT_ACCEPTED_ERROR && groupId !== undefined) {
          return actions.concat([
            CheckAndRemoveGroup({ id: groupId }),
            CreateTemporaryGroupAndAddContent({
              action: UploadBlueprintDXF({ file, title, coordinateSystem, appearAt }),
            }),
          ]);
        }

        return actions;
      }),
      takeUntil(
        action$.pipe(
          ofType(CancelUploadBlueprint),
        ),
      ),
    );
  }),
);

const uploadBlueprintDWGEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(UploadBlueprintDWG),
  mergeMap(({ file, title, coordinateSystem, appearAt }) => {
    const projectId: T.Project['id'] | undefined = state$.value.Pages.Contents.projectId;

    if (projectId === undefined) {
      return [];
    }

    const URL: string = makeV2APIURL('projects', projectId, 'contents');
    const authHeader: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const versionHeader: VersionHeader = makeVersionHeader();

    if (authHeader === undefined) {
      return [ChangeAuthedUser({})];
    }

    const tab = T.ContentPageTabType.OVERLAY;
    let groupId: T.GroupContent['id'] | undefined;
    try {
      groupId = getCurrentGroupId(state$.value, tab);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);

      return [];
    }
    const groupAction: Action[] = [ChangeSelectedGroupId({ selectedGroupId: groupId, tab })];

    const defaultContent: Pick<T.BlueprintDWGContent, PostContentArguments> =
          defaultBlueprintDWG({ title, coordinateSystem: T.ProjectionEnum[coordinateSystem] });

    const body: UploadContentBody = {
      ...defaultContent,
      groupId,
      color: defaultContent.color.toString(),
      info: JSON.stringify(defaultContent.info),
      appearAt: appearAt ? formatWithOffset(
        state$.value.Pages.Common.timezoneOffset,
        appearAt,
        Formats.YYYY_MM_DD,
      ) : undefined,
    };

    return ajax.post(URL, body, {
      ...authHeader,
      ...versionHeader,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }): PostContentResponse => response),
      map(({ data }) => data),
      map(APIToContent),
      mergeMap((content) => {
        const contentId: number = content.id;

        return concat<Action>(
          groupAction,
          ...contentUploadManager<ActionsObservable<Action>>({
            action$, content, file, attachmentType: T.AttachmentType.BLUEPRINT_DWG,
          }),
          [FinishUploadContent({ contentId })],
        );
      }),
      catchError((ajaxError) => {
        const error = getRequestErrorType(ajaxError);

        const actions: Action[] = [
          FinishUploadContent({ error }),
        ];

        if (error === T.HTTPError.CLIENT_NOT_ACCEPTED_ERROR && groupId !== undefined) {
          return actions.concat([
            CheckAndRemoveGroup({ id: groupId }),
            CreateTemporaryGroupAndAddContent({
              action: UploadBlueprintDWG({ file, title, coordinateSystem, appearAt }),
            }),
          ]);
        }

        return actions;
      }),
      takeUntil(
        action$.pipe(
          ofType(CancelUploadBlueprint),
        ),
      ),
    );
  }),
);

const uploadDesignEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(UploadDesign),
  mergeMap(({ file, title, coordinateSystem, appearAt }) => {
    const projectId: T.Project['id'] | undefined = state$.value.Pages.Contents.projectId;

    if (projectId === undefined) {
      return [];
    }

    const URL: string = makeV2APIURL('projects', projectId, 'contents');
    const authHeader: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const versionHeader: VersionHeader = makeVersionHeader();

    if (authHeader === undefined) {
      return [ChangeAuthedUser({})];
    }

    const tab = T.ContentPageTabType.OVERLAY;
    let groupId: T.GroupContent['id'] | undefined;
    try {
      groupId = getCurrentGroupId(state$.value, tab);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);

      return [];
    }
    const groupAction: Action[] = [ChangeSelectedGroupId({ selectedGroupId: groupId, tab })];

    const defaultContent: DefaultDesignDXF = defaultDesignDXF({ title, coordinateSystem: T.ProjectionEnum[coordinateSystem] });
    const body: UploadContentBody = {
      ...defaultContent,
      groupId,
      color: defaultContent.color.toString(),
      info: JSON.stringify(defaultContent.info),
      appearAt: appearAt ? formatWithOffset(
        state$.value.Pages.Common.timezoneOffset,
        appearAt,
        Formats.YYYY_MM_DD,
      ) : undefined,
    };

    return ajax.post(URL, body, {
      ...authHeader,
      ...versionHeader,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }): PostContentResponse => response),
      map(({ data }) => data),
      map(APIToContent),
      mergeMap((content) => {
        const contentId: number = content.id;

        return concat<Action>(
          groupAction,
          ...contentUploadManager<ActionsObservable<Action>>({
            action$, content, file, attachmentType: T.AttachmentType.DESIGN_DXF,
          }),
          // For the time being, this is the only manual callback trigger from frontend
          // that is left after uploading while the rest of it is handled by backend's SUD.
          // Reason is due to the current UX limitation, but could be improved in the future.
          // https://angelswingteam.slack.com/archives/C01DZH1U9K5/p1604544612030500
          [RunDXF2Raster({ contentId })],
          action$.pipe(
            ofType(FinishRunDXF2Raster),
            take(1),
            mapTo(FinishUploadContent({ contentId })),
          ),
        );
      }),
      catchError((ajaxError) => {
        const error = getRequestErrorType(ajaxError);

        const actions: Action[] = [
          FinishUploadContent({ error }),
        ];

        if (error === T.HTTPError.CLIENT_NOT_ACCEPTED_ERROR && groupId !== undefined) {
          return actions.concat([
            CheckAndRemoveGroup({ id: groupId }),
            CreateTemporaryGroupAndAddContent({
              action: UploadDesign({ file, title, coordinateSystem, appearAt }),
            }),
          ]);
        }

        return actions;
      }),
      takeUntil(
        action$.pipe(
          ofType(CancelUploadDesign),
        ),
      ),
    );
  }),
);

const uploadOrthophotoEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(UploadOrthophoto),
  mergeMap(({ file, screen }) => {
    const projectId: T.Project['id'] | undefined = state$.value.Pages.Contents.projectId;

    if (projectId === undefined) {
      return [];
    }

    const URL: string = makeV2APIURL('projects', projectId, 'contents');
    const authHeader: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const versionHeader: VersionHeader = makeVersionHeader();

    if (authHeader === undefined) {
      return [ChangeAuthedUser({})];
    }

    const defaultMapContent: Pick<T.MapContent, PostContentArguments> = defaultMap();

    const body: UploadContentBody = {
      ...defaultMapContent,
      color: defaultMapContent.color.toString(),
      info: JSON.stringify(defaultMapContent.info),
    };
    const postAndUpload: ContentOverwriteManagerInput<ActionsObservable<Action>>['postAndUpload'] =
      (screenId?: number) => ajax.post(URL, { screenId, ...body }, {
        ...authHeader,
        ...versionHeader,
        ...jsonContentHeader,
      }).pipe(
        map(({ response }): PostContentResponse => response),
        map(({ data }) => data),
        map(APIToContent),
        mergeMap((content) => {
          const contentId: T.Content['id'] = content.id;

          return concat<Action>(
            ...contentUploadManager<ActionsObservable<Action>>({
              action$, content, file, attachmentType: T.AttachmentType.ORTHO,
            }),
            [FinishUploadContent({ contentId })],
          );
        }),
        takeUntil(
          action$.pipe(
            ofType(CancelUploadOrthophoto),
          ),
        ),
      );

    return contentOverwriteManager<ActionsObservable<Action>>({
      contents: state$.value.Contents.contents,
      attachmentType: T.AttachmentType.ORTHO,
      screen,
      action$,
      postAndUpload,
    });
  }),
);

interface FileObj {
  file: File;
  hash: string;
  s3FileName: string;
}
const uploadSourcePhotoEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(UploadSourcePhoto),
  mergeMap(({ files, gcpGroupInfo, noOfStream, screen, isMeshOption }) => {
    const projectId: T.Project['id'] | undefined = state$.value.Pages.Contents.projectId;

    if (projectId === undefined) {
      return [];
    }

    const url: string = makeV2APIURL('projects', projectId, 'contents');
    const authHeader: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const versionHeader: VersionHeader = makeVersionHeader();

    if (authHeader === undefined) {
      return [ChangeAuthedUser({})];
    }

    const padMaxLength: number = 4;
    const padPrefix: string = '0';
    const fileObjs: Array<FileObj> = files.map((f, index: number) => ({
      file: f,
      hash: calculateHash(f),
      s3FileName: `${(index + 1).toString().padStart(padMaxLength, padPrefix)}_${f.name}`,
    }));
    /**
     * @desc To keep files in the head of queue to be uploaded first,
     * we should spread files evenly into group instead of using splice method.
     */
    const groupNumber: number = noOfStream === undefined ? 1 : noOfStream;
    const fileGroups: Array<Array<FileObj>> = _.zip(
      ..._.chunk(fileObjs, groupNumber),
    ).map(
      (fileGroup) => fileGroup.filter((fileObj): fileObj is FileObj => fileObj !== undefined),
    );

    const defaultMapContent: Pick<T.MapContent, PostContentArguments> = defaultMap();

    const body: UploadContentBody = {
      ...defaultMapContent,
      color: defaultMapContent.color.toString(),
      info: JSON.stringify(defaultMapContent.info),
    };

    const postAndUpload: ContentOverwriteManagerInput<ActionsObservable<Action>>['postAndUpload'] =
      (screenId?: number) => ajax.post(url, { screenId, ...body }, {
        ...authHeader,
        ...versionHeader,
        ...jsonContentHeader,
      }).pipe(
        map(({ response }): PostContentResponse => response),
        map(({ data }) => data),
        map(APIToContent),
        mergeMap((content) => {
          const contentId: T.Content['id'] = content.id;
          const completeUrl: string = (() => {
            const defaultUrl: string = makeV2APIURL('contents', contentId, 'attachments', 'upload_complete');
            const spaQuery: string = '?is_spa=true';

            return isMeshOption ? `${defaultUrl}${spaQuery}` : defaultUrl;
          })() ;
          const attachmentType: T.AttachmentType = T.AttachmentType.SOURCE;

          const gcpGroupActions: Action[] = (() => {
            if (gcpGroupInfo !== undefined) {
              return [PostContent({
                projectId,
                content: {
                  type: T.ContentType.GCP_GROUP,
                  color: Color('#fff').toString(),
                  title: '',
                  info: gcpGroupInfo,
                  screenId: content.screenId !== undefined ? content.screenId : null,
                },
              })];
            }

            return [];
          })();

          return concat<Action>(
            [AddContent({ content })],
            GetScreensIfNeeded({ content, projectId }),
            [ChangeUploadContent({
              content: {
                id: contentId,
                type: attachmentType,
                file: _.map(fileObjs, ({ file, hash }) => ({ size: file.size, hash })),
                uploadedAt: new Date(),
                status: T.APIStatus.PROGRESS,
              },
            })],
            [OpenContentPagePopup({
              popup: T.ContentPagePopupType.PROGRESS_BAR, contentId,
            })],
            from(fileGroups).pipe(
              mergeMap((filesInGroup) => {
                const hashOfFilesInGroup: Array<string> = filesInGroup.map((fileObj) => fileObj.hash);

                return from(filesInGroup).pipe(
                  map((fileObj) => ({
                    contentId,
                    file: fileObj.file,
                    attachmentType,
                    s3FileName: fileObj.s3FileName,
                  })),
                  map(PostAttachmentNew),
                  concatMap((postAttachmentNewAction) => concat(
                    [postAttachmentNewAction],
                    action$.pipe(
                      ofType(FinishPostAttachmentNew),
                      filter((action) => hashOfFilesInGroup.indexOf(action.hash) > -1),
                      take(1),
                      mergeMapTo([]),
                    ),
                  )),
                );
              }),
            ),
            gcpGroupActions,
            ajax.post(completeUrl, {}, { ...authHeader, ...versionHeader }).pipe(
              map(({ response }): UploadCompleteResponse => response),
              map(({ data }): Array<T.APIContent> => data),
              map((contents) => contents.map(APIToContent)),
              mergeMap((contents) => [
                ...contents.map((rawContent) => AddContent({ content: rawContent })),
                FinishUploadContent({ contentId }),
              ]),
            ),
          );
        }),
        takeUntil(
          action$.pipe(
            ofType(CancelUploadSourcePhoto),
          ),
        ),
      );

    return contentOverwriteManager<ActionsObservable<Action>>({
      contents: state$.value.Contents.contents,
      attachmentType: T.AttachmentType.SOURCE,
      screen,
      action$,
      postAndUpload,
    });
  }),
);

const uploadDsmEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(UploadDsm),
  mergeMap(({ file, screen }) => {
    const projectId: T.Project['id'] | undefined = state$.value.Pages.Contents.projectId;

    if (projectId === undefined) {
      return [];
    }

    const URL: string = makeV2APIURL('projects', projectId, 'contents');
    const authHeader: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const versionHeader: VersionHeader = makeVersionHeader();

    if (authHeader === undefined) {
      return [ChangeAuthedUser({})];
    }

    const defaultDSMContent: DefaultDSM = defaultDSM();
    const body: UploadContentBody = {
      ...defaultDSMContent,
      color: defaultDSMContent.color.toString(),
      info: JSON.stringify(defaultDSMContent.info),
    };
    const postAndUpload: ContentOverwriteManagerInput<ActionsObservable<Action>>['postAndUpload'] =
      (screenId?: number) => ajax.post(URL, { screenId, ...body }, {
        ...authHeader,
        ...versionHeader,
        ...jsonContentHeader,
      }).pipe(
        map(({ response }): PostContentResponse => response),
        map(({ data }) => data),
        map(APIToContent),
        mergeMap((content) => {
          const { id: contentId }: T.Content = content;

          return concat<Action>(
            ...contentUploadManager<ActionsObservable<Action>>({
              action$, content, file, attachmentType: T.AttachmentType.DSM,
            }),
            [FinishUploadContent({ contentId })],
          );
        }),
      );

    return contentOverwriteManager<ActionsObservable<Action>>({
      contents: state$.value.Contents.contents,
      attachmentType: T.AttachmentType.DSM,
      screen,
      action$,
      postAndUpload,
    });
  }),
  takeUntil(
    action$.pipe(
      ofType(CancelUploadDsm),
    ),
  ),
);

const dxf2RasterEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(RunDXF2Raster),
  mergeMap(({ contentId }) => {
    const projectId: T.Content['projectId'] | undefined = state$.value.Pages.Contents.projectId;

    if (projectId === undefined) {
      return [];
    }

    const URL: string = makeV2APIURL('contents', contentId, 'run_dxf2raster');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    return ajax.post(URL, {}, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      mergeMap(() => [FinishRunDXF2Raster({})]),
      catchError<Action, any>((ajaxError: AjaxError) => [
        FinishRunDXF2Raster({ error: getRequestErrorType(ajaxError) }),
        OpenContentPagePopup({ popup: T.ContentPagePopupType.DXF2RASTER_PROCESSING_FAIL }),
        RemoveContent({ contentId }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelRunDXF2Raster),
        ),
      ),
    );
  }),
);

const uploadLasEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(UploadLas),
  mergeMap(({ file, screen }) => {
    const projectId: T.Project['id'] | undefined = state$.value.Pages.Contents.projectId;

    if (projectId === undefined) {
      return [];
    }

    const URL: string = makeV2APIURL('projects', projectId, 'contents');
    const authHeader: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const versionHeader: VersionHeader = makeVersionHeader();

    if (authHeader === undefined) {
      return [ChangeAuthedUser({})];
    }

    const defaultPoincloudContent: Pick<T.PointCloudContent, PostContentArguments>
      = defaultPointCloud();
    const body: UploadContentBody = {
      ...defaultPoincloudContent,
      color: defaultPoincloudContent.color.toString(),
      info: JSON.stringify(defaultPoincloudContent.info),
    };

    const postAndUpload: (screenId?: number) => Observable<Action> = (screenId) => ajax.post(URL, { screenId, ...body }, {
      ...authHeader,
      ...versionHeader,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }): PostContentResponse => response),
      map(({ data }) => data),
      map(APIToContent),
      mergeMap((content) => {
        const { id: contentId }: T.Content = content;

        return concat<Action>(
          ...contentUploadManager<ActionsObservable<Action>>({
            action$, content, file, attachmentType: T.AttachmentType.POINTCLOUD,
          }),
          [FinishUploadContent({ contentId })],
        );
      }),
    );

    return contentOverwriteManager<ActionsObservable<Action>>({
      contents: state$.value.Contents.contents,
      attachmentType: T.AttachmentType.POINTCLOUD,
      screen,
      action$,
      postAndUpload,
    });
  }),
);

const requestVolumeCalculationEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(RequestVolumeCalculation),
  mergeMap(({ contentId, info: calculationInfo, locations: newLocations }) => {
    const { Auth, Contents, Pages, ProjectConfigPerUser, PlanConfig }: T.State = state$.value;
    const header: AuthHeader | undefined = makeAuthHeader(Auth, PlanConfig.config?.slug);

    const rawContent: T.VolumeContent = Contents.contents.byId[contentId] as T.VolumeContent;
    const content: T.VolumeContent = {
      ...rawContent,
      info: {
        ...rawContent.info,
        locations: newLocations ? newLocations : rawContent.info.locations,
      },
    };
    const info: T.CalculationInfo = calculationInfo !== undefined ? calculationInfo : content.info.calculatedVolume.calculation;
    const baseDsmId: number | undefined = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.DSM);

    if (header === undefined) {
      return [
        ChangeAuthedUser({}),
        ...exitRequestVolumeCalculation({
          type: T.HTTPError.CLIENT_AUTH_ERROR,
          calculationInfo: info,
        }),
      ];
    }

    if (info === undefined || content === undefined || content.type !== T.ContentType.VOLUME || baseDsmId === undefined) {
      return [...exitRequestVolumeCalculation({
        type: T.HTTPError.CLIENT_ERROR,
        calculationInfo: info,
      })];
    }

    function exitRequestVolumeCalculation(param: {
      type: T.HTTPError;
      calculationInfo: T.CalculationInfo;
      isDesignBoundaryViolated?: boolean;
    }): Array<Action> {
      return [
        PatchContent({
          content: {
            id: contentId,
            config: {
              type: T.ContentType.VOLUME,
              dsm: undefined,
            },
            info: {
              ...content.info,
              isBoundaryViolated: param.isDesignBoundaryViolated,
              calculatedVolume: {
                calculation: param.calculationInfo,
                minMaxElevation: undefined,
                wmsInfo: undefined,
                fill: 0, cut: 0, total: 0,
              },
            },
          },
        }),
        FinishRequestVolumeCalculation({
          contentId,
          error: param.type,
        }),
      ];
    }

    // WKT Polygon needs end point as same with first point
    const locations: Array<[number, number]> = content.info.locations as Array<[number, number]>;
    const unduplicatedLocations: Array<[number, number]> = locations.filter((val) =>
      !_.isEqual(val, locations[0]));
    unduplicatedLocations.unshift(locations[0]);
    unduplicatedLocations.push(locations[0]);
    const locationPoints: string = unduplicatedLocations
      .map((point) => fromLonLat(point))
      .map(([x, y]) => `${x} ${y}`)
      .join(',');
    const wkt: string = `POLYGON ((${locationPoints}))`;

    let body: object = {};
    const url: string = `https://${volumeServiceHostname}/${info.type}/${baseDsmId}`;

    // eslint-disable-next-line default-case
    switch (info.type) {
      case T.VolumeCalcMethod.SURVEY:
        body = {
          previousDsmId: info.previousDsmId,
          volumeContentId: content.id,
          locationsUpdatedAt: new Date().toISOString(),
          wkt,
          basePlane: T.BasicCalcBasePlane.CUSTOM,
          elevation: 0,
        };
        break;
      case T.VolumeCalcMethod.BASIC:
        body = {
          wkt,
          basePlane: info.volumeAlgorithm,
          elevation: info.volumeElevation,
        };
        break;
      case T.VolumeCalcMethod.DESIGN:
        body = {
          designDxfId: info.designDxfId,
          volumeContentId: content.id,
          locationsUpdatedAt: new Date().toISOString(),
          wkt,
          basePlane: T.BasicCalcBasePlane.CUSTOM,
          elevation: 0,
        };
        if (isBoundaryViolated(content.info.locations, Contents.contents.byId[info.designDxfId] as T.DesignDXFContent)) {
          return [...exitRequestVolumeCalculation({
            type: T.HTTPError.CLIENT_ERROR,
            calculationInfo: info,
            isDesignBoundaryViolated: true,
          })];
        }
    }


    return ajax({
      url, body, method: 'POST', withCredentials: false,
      headers: {
        ...header,
        ...(
          [T.VolumeCalcMethod.SURVEY, T.VolumeCalcMethod.DESIGN].includes(info.type) ?
            wwwFormUrlEncoded : jsonContentHeader
        ),
      },
    }).pipe(
      map(({ response }): RequestVolumeCalculationResponse => response),
      map(({
        fill, cut, wmsInfo, minMaxElevation, volume: total,
      }) => ({
        fill, cut, wmsInfo, minMaxElevation, total,
        calculation: info,
      })),
      map((calculatedVolume) => ({ calculatedVolume })),
      map((_info) => ({
        id: content.id,
        info: _info,
      })),
      map((newContent) => PatchContent({
        content: {
          ...newContent,
          info: {
            ...newContent.info,
            isBoundaryViolated: undefined,
            locations: content.info.locations,
          },
        },
        isDBVCorSBVC: [T.VolumeCalcMethod.DESIGN, T.VolumeCalcMethod.SURVEY].includes(info.type),
      })),
      (res$) => concat(
        res$,
        action$.pipe(
          ofType(FinishPatchContent),
          take(1),
          mergeMapTo([
            FinishRequestVolumeCalculation({ contentId: content.id }),
          ]),
        ),
      ),
      catchError<Action, any>((ajaxError: AjaxError) => concat(
        // If error, set the volume result to be Zero, and then finish
        [
          PatchContent({
            content: {
              id: content.id,
              config: {
                type: T.ContentType.VOLUME,
                dsm: undefined,
              },
              info: {
                ...content.info,
                isBoundaryViolated: undefined,
                /**
                 * @desc Save error status on content. Contents.requestVolumeCalculation[id].
                 */
                calculatedVolume: {
                  calculation: info,
                  fill: 0, cut: 0, total: 0,
                },
              },
            },
          }),
        ],
        action$.pipe(
          ofType(FinishPatchContent),
          take(1),
          mergeMapTo([
            FinishRequestVolumeCalculation({
              contentId: content.id,
              error: getRequestErrorType(ajaxError),
            }),
          ]),
        ),
      )),
      takeUntil(
        action$.pipe(
          ofType(CancelRequestVolumeCalculation),
          filter(({ contentId: cancelContentId }) => content.id === cancelContentId),
        ),
      ),
    );
  }),
);

const requestLengthElevationEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(RequestLengthElevation),
  mergeMap(({ contentId, comparisonContentId, comparison }) => {
    const {
      Auth,
      Contents,
      PlanConfig,
    }: T.State = state$.value;
    const header: AuthHeader | undefined = makeAuthHeader(Auth, PlanConfig.config?.slug);

    if (header === undefined) {
      return [
        ChangeAuthedUser({}),
        FinishRequestLengthElevation({
          contentId,
          error: T.HTTPError.CLIENT_AUTH_ERROR,
        }),
      ];
    }

    const content: T.Content | undefined = Contents.contents.byId[contentId];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const profile_type: string = Contents.contents.byId[comparisonContentId].type === T.ContentType.DSM ?
      T.ContentType.DSM : T.ContentType.DESIGN_DXF.split('_')[0];

    if (content.type !== T.ContentType.LENGTH) {
      return [
        FinishRequestLengthElevation({
          contentId,
          error: T.HTTPError.CLIENT_ERROR,
        }),
      ];
    }
    const URL: string = `https://${volumeServiceHostname}/elev-prof/${comparisonContentId}`;
    const locationPoints: string = content.info.locations
      .map(([x, y]) => `${x} ${y}`)
      .join(',');
    const wkt: string = `LINESTRING (${locationPoints})`;

    const body: object = { wkt, profile_type };

    return ajax.post(URL, body, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }): RequestLengthElevationResponse => response),
      map(({ elevations: responseElevation }) => responseElevation
        .map(({ lon, lat, dist, alt }: T.LengthElevationData) => [
          Number(lon),
          Number(lat),
          Number(dist),
          Number(alt),
        ]),
      ),
      mergeMap((responseElevation: Array<T.LengthElevationRawData>) =>
        [PatchContent({
          content: {
            id: content.id,
            config: {
              ...content.config,
              isElevationToggled: true,
            },
            info: {
              ...content.info,
              // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
              elevations: (content.info.elevations || []).concat({ comparisonContentId, points: responseElevation, comparison }),
            },
          },
        })],
      ),
      (res$) => concat(
        res$,
        action$.pipe(
          ofType(FinishPatchContent),
          take(1),
          mergeMapTo([
            FinishRequestLengthElevation({ contentId }),
          ]),
        ),
      ),
      takeUntil(
        action$.pipe(
          ofType(CancelRequestLengthElevation),
          filter(({ contentId: cancelContentId }) => contentId === cancelContentId),
        ),
      ),
      catchError<Action, any>((ajaxError: AjaxError) => [
        FinishRequestLengthElevation({ contentId, error: getRequestErrorType(ajaxError) }),
      ]),
    );
  }),
);

/**
 * @desc to update elevation information of a Marker content via ScratchPad
 */
const requestMarkerElevationInfoEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(RequestMarkerElevationInfo),
  mergeMap(({ contentId }) => {
    const { Auth, Contents, Pages, Projects, ProjectConfigPerUser, PlanConfig }: T.State = state$.value;
    const projectProjection: T.ProjectionEnum = getCoordinateSystem({ Projects, Pages });
    const header: AuthHeader | undefined = makeAuthHeader(Auth, PlanConfig.config?.slug);

    const dsmId: T.DSMContent['id'] | undefined = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.DSM);

    if (dsmId === undefined) {
      return [FinishRequestMarkerElevationInfo({ contentId })];
    }

    if (header === undefined) {
      return concat([
        FinishRequestMarkerElevationInfo({
          contentId,
          error: T.HTTPError.CLIENT_AUTH_ERROR,
        }),
      ]);
    }

    const content: T.Content | undefined = Contents.contents.byId[contentId];

    if (content === undefined ||
      content.type !== T.ContentType.MARKER) {
      return [
        FinishRequestMarkerElevationInfo({
          contentId,
          error: T.HTTPError.CLIENT_ERROR,
        }),
      ];
    }

    const [lon, lat]: Coordinate = isLonLat(content.info.location) ?
      content.info.location :
      proj4(getEPSGfromProjectionLabel(projectProjection), 'EPSG:4326').forward(content.info.location);
    const URL: string = `https://${volumeServiceHostname}/elev/${dsmId}?` + `lon=${lon}&lat=${lat}`;

    return ajax.get(URL, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }): T.ElevationInfo => response),
      mergeMap(({ value, unit }) => [
        PatchContent({
          content: {
            id: contentId,
            info: {
              elevationInfo: { value, unit },
            },
          },
        }),
        FinishRequestMarkerElevationInfo({ contentId }),
      ]),
      catchError<Action, any>((ajaxError: AjaxError) => [
        PatchContent({
          content: {
            id: contentId,
            info: {
              elevationInfo: { value: 0 },
            },
          },
        }),
        FinishRequestMarkerElevationInfo({
          contentId,
          error: getRequestErrorType(ajaxError),
        }),
      ]),
    );
  }),
);

/**
 * When a measurement's location is updated,
 * depending on its type, there's an extra task needed to be done.
 * This epic covers that.
 */
const updateMeasurementLocationsEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(UpdateMeasurementLocations),
  mergeMap(({ locations, id }) => {
    const content: T.Content = state$.value.Contents.contents.byId[id];

    switch (content.type) {
      case T.ContentType.MARKER: {
        return concat(
          [PatchContent({
            content: {
              id,
              info: {
                location: locations[0],
              },
            },
          })],
          // RequestMarkerElevationInfo epic has to wait until
          // the content is patched with the new location,
          // otherwise it'd request the previous location.
          action$.pipe(
            ofType(FinishPatchContent),
            take(1),
            mapTo(RequestMarkerElevationInfo({
              contentId: id,
            })),
          ),
        );
      }
      case T.ContentType.LENGTH: {
        return content.info.elevations
          ? [UpdateLengthAreaVolumeLocations({
            contentId: id,
            locations,
          })]
          : [PatchContent({
            content: {
              id,
              info: { locations },
            },
          })];
      }
      case T.ContentType.AREA: {
        return [PatchContent({
          content: {
            id,
            info: { locations },
          },
        })];
      }
      case T.ContentType.VOLUME: {
        return [
          PatchContent({
            content: {
              id,
              info: { locations },
            },
          }),
          RequestVolumeCalculation({
            contentId: id,
            locations,
          }),
        ];
      }
      default: {
        throw new Error(`Incorrect type: ${content.type}`);
      }
    }
  }),
);

const printMapEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(RunPrintMap),
  mergeMap(({ title, printFiles, filename }) => {
    const { Pages }: T.State = state$.value;
    const contentId: T.Content['id'] | undefined = lastDSMOrMapContentSelector(state$.value, T.ContentType.MAP)?.id;
    const printingSquare: Coordinate[] | undefined = Pages.Contents.printingSquare;
    const printingAngle: number | undefined = Pages.Contents.printingAngle;

    const contentAllIds: T.ContentsState['contents']['allIds'] = state$.value.Contents.contents.allIds;
    const contentById: T.ContentsState['contents']['byId'] = state$.value.Contents.contents.byId;

    if (printingSquare === undefined || printingAngle === undefined || contentId === undefined) return [];

    const overlayContents: PrintMapBody['overlay_contents'] = {
      dxf: contentAllIds
        .map((cId) => contentById[cId])
        .filter((content) =>
          isCADContent(content) && content.config?.selectedAt !== undefined,
        )
        .map((content: T.CADContent) => ({
          id: content.id,
          info: {
            opacity: content.info?.opacity !== undefined ? content.info?.opacity : 1,
          },
        })),
    };

    type FormatSizes = {
      [K in T.PrintFormat]: Array<T.PrintSize>;
    };

    const formatSizes: FormatSizes = {
      [T.PrintFormat.JPG]: [],
    };

    printFiles.forEach(({ format, size }) => {
      formatSizes[format].push(size);
    });

    const data: PrintMapBody['data'] = Object.keys(formatSizes).map((format: T.PrintFormat) => ({ format, sizes: _.uniq(formatSizes[format]) }));

    const requestBody: PrintMapBody = {
      title,
      filename,
      data,
      // Angle needs to be negated because
      // BE will need to undo the rotation so that
      // the printed area will be at 0°.
      angle: -printingAngle,
      locations: printingSquare.map((c) => toLonLat(c)),
      overlay_contents: overlayContents,
    };

    const URL: string = makeV2APIURL('contents', contentId, 'run_print_map');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    return ajax.post(URL, JSON.stringify(requestBody), {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      mergeMapTo([
        TogglePrintView({}),
        OpenContentPagePopup({ popup: T.ContentPagePopupType.PRINT_SUCCESS }),
        FinishRunPrintMap({}),
      ]),
      catchError<Action, any>((ajaxError: AjaxError) => [
        FinishRunPrintMap({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelRunPrintMap),
        ),
      ),
    );
  }),
);

const downloadOverlayEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(DownloadOverlay),
  map(async ({ contentId }) => {
    const URL: string = makeV2APIURL('contents', contentId, 'download_overlay');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) return [ChangeAuthedUser({})];

    try {
      const result: AxiosResponse<string> = await axios.get(URL, { headers: header });
      window.open(result.data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      Sentry.captureException(e);
    }

    return;
  }),
  map(() => FinishDownloadOverlay({})),
);

const getLengthMetricsEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetLengthMetrics),
  mergeMap(({ id }) => {
    const content: T.LengthContent | undefined = typeGuardLength(state$.value.Contents.contents.byId[id]);

    if (content === undefined || content.type !== T.ContentType.LENGTH) return [];

    const dsmId: T.Screen['id'] | undefined
      = getSingleContentId(state$.value.Contents, state$.value.Pages, state$.value.ProjectConfigPerUser, T.ContentType.DSM);

    if (dsmId === undefined) {
      return [
        PatchContent({ content: { id, info: { metrics: undefined } } }),
        FinishGetLengthMetrics({ id }),
      ];
    }

    const URL: string = makeVolumeAPIURL('contents', dsmId, 'length');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const makeLengthMetricsRequest: (type: string) => Observable<AjaxResponse> = (type) => ajax.post(URL, {
      type,
      points: content.info.locations,
    }, {
      ...header,
      ...jsonContentHeader,
    });

    return concat(
      [PatchContent({ content: { id, info: { metrics: undefined } } })],
      zip(makeLengthMetricsRequest('surface'), makeLengthMetricsRequest('point'))
        .pipe(
          map((
            [{ response: surface }, { response: pointToPoint }]:
              [{ response: T.LengthSurfaceResponse }, { response: T.LengthPointToPointResponse }],
          ) => ({
            surface: surface.distances.reduce((t, n) => t + n, 0),
            pointToPoint: pointToPoint.distances.reduce((t, n) => t + n, 0),
          })),
          map((metrics) => PatchContent({ content: { id, info: { metrics } } })),
          (res$) => concat(res$, [
            FinishGetLengthMetrics({ id }),
          ]),
          catchError((ajaxError: AjaxError) => [
            PatchContent({ content: { id, info: { metrics: undefined } } }),
            FinishGetLengthMetrics({ error: getRequestErrorType(ajaxError), id }),
          ]),
          takeUntil(
            action$.pipe(
              ofType(CancelGetLengthMetrics),
              filter(({ id: cancelContentId }) => cancelContentId === id),
            ),
          ),
        ),
    );
  }),
);

const getAreaSurfaceEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetAreaSurface),
  mergeMap(({ contentId }) => {
    const content: T.AreaContent | undefined = typeGuardArea(state$.value.Contents.contents.byId[contentId]);

    if (content === undefined || content.type !== T.ContentType.AREA) return [];

    const dsmId: T.Screen['id'] | undefined
      = getSingleContentId(state$.value.Contents, state$.value.Pages, state$.value.ProjectConfigPerUser, T.ContentType.DSM);

    if (dsmId === undefined) {
      return [
        PatchContent({ content: { id: contentId, info: { surface: undefined } } }),
        FinishGetAreaSurface({ contentId }),
      ];
    }

    const URL: string = makeVolumeAPIURL('contents', dsmId);
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    return concat(
      [PatchContent({ content: { id: contentId, info: { surface: undefined } } })],
      ajax.post(URL, {
        type: 'surface',
        locations: content.info.locations,
      }, {
        ...header,
        ...jsonContentHeader,
      }).pipe(
        map(({ response }): GetAreaSurfaceResponse => response),
        map((response) => response.surface),
        map((surface) => PatchContent({ content: { id: contentId, info: { surface } } })),
        (res$) => concat(res$, [
          FinishGetAreaSurface({ contentId }),
        ]),
        catchError((ajaxError: AjaxError) => [
          PatchContent({ content: { id: contentId, info: { surface: undefined } } }),
          FinishGetAreaSurface({ error: getRequestErrorType(ajaxError), contentId }),
        ]),
        takeUntil(
          action$.pipe(
            ofType(CancelGetAreaSurface),
            filter(({ contentId: cancelContentId }) => cancelContentId === contentId),
          ),
        ),
      ),
    );
  }),
);

const getContentDownloadablesEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetContentDownloadables),
  mergeMap(({ screenId }) => {
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    const URL: string = makeV2APIURL('screens', screenId, 'downloadables');

    return ajax.get(URL, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }) => response.data),
      mergeMap((downloadables: Partial<Record<T.ResourceType, boolean>>) => {
        const actions: Action[] = [
          ChangeContentDownloadables({ screenId, downloadables }),
          FinishGetContentDownloadables({}),
        ];

        // Only redefine the status when there's a need
        // to request las downsampling. Otherwise, keep it as-is.
        const lasDownSamplingStatus = state$.value.Contents.lasDownSamplingStatus[screenId];
        if (
          lasDownSamplingStatus?.status === T.LasDownSamplingStatus.COMPLETED
          || lasDownSamplingStatus?.status === T.LasDownSamplingStatus.PROCESSING
        ) {
          return actions;
        }

        const screen: T.Screen | undefined = state$.value.Screens.screens.find((s) => s.id === screenId);
        if (!screen) {
          throw new Error(`Screen not found: ${screenId}`);
        }

        const pointCloudContent: T.PointCloudContent | undefined = (() => {
          const mapContentIds = state$.value.Groups.tree
            .rootIdsByCategory[T.ContentCategory.MAP]
            .unpinned[screenId] ?? [];

          let mapContentIdsCount: number = mapContentIds.length;
          let pointCloudContentInScreen: T.PointCloudContent | undefined;

          while (mapContentIdsCount--) {
            const screenContentId: T.Content['id'] = mapContentIds[mapContentIdsCount];
            const content: T.PointCloudContent | undefined = typeGuardPointCloud(
              state$.value.Contents.contents.byId[screenContentId]
            );

            if (!!content && !contentsSelector.isProcessingOrFailed(state$.value.Contents)(content?.id)) {
              pointCloudContentInScreen = content;
              break;
            }
          }

          return pointCloudContentInScreen;
        })();

        // A screen might not have las content,
        // so no point in updating the las content downsampling status.
        if (!pointCloudContent) {
          return actions;
        }

        const hasDownSampledLas: boolean = Boolean(
          downloadables[T.ResourceType.POINT_CLOUD_COMPRESSED_100]
          && downloadables[T.ResourceType.POINT_CLOUD_COMPRESSED_25]
          && downloadables[T.ResourceType.POINT_CLOUD_COMPRESSED_4]
        );

        return actions.concat([
          ChangeLasDownSamplingStatus({
            screenId: screen.id,
            contentId: pointCloudContent.id,
            status: hasDownSampledLas
              ? T.LasDownSamplingStatus.COMPLETED
              : pointCloudContent.info?.downsample_status ?? T.LasDownSamplingStatus.NOT_GENERATED,
          }),
        ]);
      }),
      catchError<Action, any>((ajaxError: AjaxError) => [
        FinishGetContentDownloadables({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelGetContentDownloadables),
        ),
      ),
    );
  }),
);

const requestLasDownSamplingEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(RequestLasDownSampling),
  mergeMap(({ screenId }) => {
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    // Prevent from requesting las downsampling when
    // it's already been generated or no info found.
    const lasDownSamplingStatus = state$.value.Contents.lasDownSamplingStatus[screenId];
    if (lasDownSamplingStatus === undefined || lasDownSamplingStatus.status !== T.LasDownSamplingStatus.NOT_GENERATED) {
      return [];
    }

    const URL: string = makeV2APIURL('contents', lasDownSamplingStatus.contentId, 'run_lasdownsample');
    return ajax.post(URL, {}, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      mergeMapTo([
        ChangeLasDownSamplingStatus({
          screenId,
          contentId: lasDownSamplingStatus.contentId,
          status: T.LasDownSamplingStatus.PROCESSING,
        }),
        FinishRequestLasDownSampling({}),
      ]),
      catchError<Action, any>((ajaxError: AjaxError) => [
        FinishRequestLasDownSampling({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelRequestLasDownSampling),
        ),
      ),
    );
  }),
);

/**
 * Add a content to a temporary group.
 * The only use case when this happens is when a user adds a content
 * to a group that is already being deleted by the user.
 * This was done to avoid user creating the content from scratch again.
 */
const createTemporaryGroupAndAddContentEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(CreateTemporaryGroupAndAddContent),
  mergeMap(({ action }) => {
    const s = state$.value;
    const hasPinnedGroups = s.Pages.Contents.sidebarTab === T.ContentPageTabType.MEASUREMENT;
    const lastSelectedScreenId = hasPinnedGroups ? lastSelectedScreenSelector(s)?.id : undefined;
    const category = TabToCategoryMapper[s.Pages.Contents.sidebarTab];
    const lang = s.Pages.Common.language;
    const tempGroupNameByLang = tempGroupName[lang];

    // Get any first Temp Group occurrence in either pinned or unpinned list.
    const temporaryGroupId = s.Contents.contents.allIds.find((id) => {
      const content = s.Contents.contents.byId[id];

      if (
        content === undefined
        || content.type !== T.ContentType.GROUP
        || content.category !== category
        || content.title !== tempGroupNameByLang
      ) return false;

      return hasPinnedGroups
        ? content.screenId === undefined || content.screenId === lastSelectedScreenId
        : true;
    });

    if (temporaryGroupId) {
      return [
        // Make sure that the temporary group is selected
        // because it is used as the groupId reference before creating a content.
        ChangeSelectedGroupId({ selectedGroupId: temporaryGroupId, tab: s.Pages.Contents.sidebarTab }),
        action,
        ChangeIsCreatingContentOnDeletedGroup({ isCreatingContentOnDeletedGroup: true }),
      ];
    }

    // Since the group does not exist,
    // create a new Temporary Group as the group to contain this failed new content.
    const currentProject = currentProjectSelector(s);
    if (currentProject === undefined) return [];

    const contentsURL = category === T.ContentCategory.ESS ? 'ess_contents' : 'contents';
    const URL = makeV2APIURL('projects', currentProject.id, contentsURL);
    const authHeader = makeAuthHeader(s.Auth, s.PlanConfig.config?.slug);
    const versionHeader = makeVersionHeader();

    if (authHeader === undefined) {
      return [ChangeAuthedUser({})];
    }

    const group = defaultGroup({ title: tempGroupNameByLang });
    const tempGroupBody = {
      ...group,
      category,
      screenId: lastSelectedScreenId === undefined ? null : lastSelectedScreenId,
      color: group.color.toString(),
    };

    return ajax.post(URL, tempGroupBody, {
      ...authHeader,
      ...versionHeader,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }): PostContentResponse => response),
      map(({ data }) => data),
      map(APIToContent),
      map((content) => ({ ...content, category })),
      mergeMap((content: T.Content) => [
        AddContent({ content }),
        AddContentToTree({ content, moveOption: T.MoveOption.FIRST }),

        // Make sure that the new temporary group is selected
        // because it is used as the groupId reference before creating a content.
        ChangeSelectedGroupId({ selectedGroupId: content.id, tab: s.Pages.Contents.sidebarTab }),
        action,
        ChangeIsCreatingContentOnDeletedGroup({ isCreatingContentOnDeletedGroup: true }),
      ]),
    );
  }),
);

export const requestLasReprocessingEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(RequestLasReprocessing),
  mergeMap(({ contentId }) => {
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    const URL: string = makeV2APIURL('contents', contentId, 'run_pointcloud_cesium');
    const request$ = ajax.post(URL, {}, {
      ...header,
      ...jsonContentHeader,
    });

    return concat(
      [StartRequestingLasReprocessing({})],
      request$.pipe(
        mergeMap(() => {
          const originalContent = typeGuardPointCloud(state$.value.Contents.contents.byId[contentId]);
          if (originalContent === undefined) return [];

          return [
            AddContent({
              content: {
                ...originalContent,
                status: T.ContentProcessingStatus.PROCESSING,
                info: {
                  ...originalContent.info,
                  engine: T.PointCloudEngine.CESIUM,
                },
              },
            }),
            FinishRequestLasReprocessing({}),
          ];
        }),
        catchError<Action, any>((ajaxError: AjaxError) => [
          FinishRequestLasReprocessing({ error: getRequestErrorType(ajaxError) }),
        ]),
        takeUntil(
          action$.pipe(
            ofType(CancelRequestLasDownSampling),
          ),
        ),
      )
    );
  }),
);

export const epic: Epic<Action, Action, T.State> = combineEpics(
  GetInitialContentsEpic,
  postContentEpic,
  patchContentEpic,
  deleteContentEpic,
  downloadOverlayEpic,
  createAndEditMeasurementEpic,
  turnOn2DOrthoOnTodayEpic,
  turnOn3DOnTodayEpic,
  uploadBlueprintPDFEpic,
  uploadBlueprintDXFEpic,
  uploadBlueprintDWGEpic,
  uploadDesignEpic,
  uploadOrthophotoEpic,
  uploadSourcePhotoEpic,
  uploadLasEpic,
  uploadDsmEpic,
  dxf2RasterEpic,
  printMapEpic,
  requestVolumeCalculationEpic,
  requestLengthElevationEpic,
  requestMarkerElevationInfoEpic,
  updateMeasurementLocationsEpic,
  getLengthMetricsEpic,
  getAreaSurfaceEpic,
  requestLasDownSamplingEpic,
  getContentDownloadablesEpic,
  createTemporaryGroupAndAddContentEpic,
  requestLasReprocessingEpic,
  actionsForEpicReload<Action>(
    CancelGetInitialContents(),
    CancelPostContent(),
    CancelPatchContent(),
    CancelDeleteContent(),
    CancelUploadBlueprint(),
    CancelUploadOrthophoto(),
    CancelUploadDsm(),
    CancelUploadDesign(),
    CancelUploadSourcePhoto(),
    CancelRunPrintMap(),
    CancelUploadLas({}),
    DeleteUploadContent({}),
  ),
);

/**
 * @fixme
 * Following selector type is too long
 */
export const contentsSelector = {
  isSelected(
    Contents: T.ContentsState,
    ProjectConfigPerUser: T.ProjectConfigPerUserState,
  ): (contentId?: T.Content['id']) => boolean {
    return (contentId) => {
      if (contentId === undefined || ProjectConfigPerUser.config?.lastSelectedScreenId === undefined) return false;

      const content: T.Content = Contents.contents.byId[contentId];
      if (!content) return false;

      return Boolean(content.config?.selectedAt);
    };
  },
  selectedAt(
    state: T.ContentsState,
  ): (contentId?: T.Content['id']) => Date | undefined {
    return (contentId) => contentId === undefined ? undefined : state.contents.byId[contentId].config?.selectedAt;
  },
  isUploading(
    state: T.ContentsState,
  ): (
    contentId?: T.Content['id'],
  ) => boolean {
    return (contentId) =>
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      contentId !== undefined && state.uploadContents[contentId] ?
        state.uploadContents[contentId].status === T.APIStatus.PROGRESS : false
    ;
  },
  isProcessingOrFailed(
    state: T.ContentsState,
  ): (
    contentId?: T.Content['id'],
  ) => boolean {
    return (contentId) => {
      if (contentId === undefined) {
        return false;
      }

      const content: T.Content = state.contents.byId[contentId];

      if (content === undefined) {
        return false;
      }

      return contentsSelector.isProcessingOrFailedByContent(content);
    };
  },
  isProcessingOrFailedByContent(
    content: T.Content,
  ): boolean {
    const isProcessible: boolean = T.ProcessibleContentTypes.includes(content.type);

    return isProcessible ? (
      (content as T.ProcessibleContent).status !== T.ContentProcessingStatus.COMPLETED
    ) : false;
  },
  isProcessing(
    content: T.Content,
  ): boolean {
    const isProcessible: boolean = T.ProcessibleContentTypes.includes(content.type);

    return isProcessible ? (
      (content as T.ProcessibleContent).status === T.ContentProcessingStatus.PROCESSING
      || (content as T.ProcessibleContent).status === T.ContentProcessingStatus.READY
    ) : false;
  },
  isFailed(
    content: T.Content,
  ): boolean {
    const isProcessible: boolean = T.ProcessibleContentTypes.includes(content.type);

    return isProcessible ? (
      (content as T.ProcessibleContent).status === T.ContentProcessingStatus.FAILED
    ) : false;
  },
};

export const contentsStateLens: LensS<T.ContentsState, T.ContentsState> =
  new LensGenerator<T.ContentsState>().fromKeys();

type ContentsFocusLens<K extends keyof T.ContentsState> =
  LensS<T.ContentsState[K], T.ContentsState>;
const contentsLens: ContentsFocusLens<'contents'> =
  contentsStateLens.focusTo('contents');
const requestVolumeCalculationLens: ContentsFocusLens<'requestVolumeCalculation'> =
  contentsStateLens.focusTo('requestVolumeCalculation');
const requestLengthElevationLens: ContentsFocusLens<'requestLengthElevationInfo'> =
  contentsStateLens.focusTo('requestLengthElevationInfo');
const requestMarkerElevationInfoLens: ContentsFocusLens<'requestMarkerElevationInfo'> =
  contentsStateLens.focusTo('requestMarkerElevationInfo');
const getLengthMetricsLens: ContentsFocusLens<'getLengthMetrics'> =
  contentsStateLens.focusTo('getLengthMetrics');
const getAreaSurfaceLens: ContentsFocusLens<'getAreaSurface'> =
  contentsStateLens.focusTo('getAreaSurface');

// Redux reducer
const initialState: T.ContentsState = {
  contents: {
    byId: {},
    allIds: [],
  },
  measurement: {},
  uploadContents: {},
  outdatedVolumeIds: [],
  getContentsStatus: T.APIStatus.IDLE,
  getInitialContentsStatus: T.APIStatus.IDLE,
  postContentStatus: T.APIStatus.IDLE,
  deleteContentStatus: T.APIStatus.IDLE,
  patchContentStatus: T.APIStatus.IDLE,
  printMapStatus: T.APIStatus.IDLE,
  dxf2RasterStatus: T.APIStatus.IDLE,
  requestVolumeCalculation: {},
  requestMarkerElevationInfo: {},
  requestLengthElevationInfo: {},
  getLengthMetrics: {},
  getAreaSurface: {},

  requestLasDownSamplingStatus: T.APIStatus.IDLE,
  getContentDownloadablesStatus: T.APIStatus.IDLE,
  lasDownSamplingStatus: {},
  contentDownloadables: {},
  requestLasReprocessingStatus: T.APIStatus.IDLE,
};
const reducer: Reducer<T.ContentsState> = (
  state = initialState, action: Action,
) => {
  switch (action.type) {
    case GetInitialContents.type:
      return {
        ...state,
        getInitialContentsStatus: T.APIStatus.PROGRESS,
      };
    case CancelGetInitialContents.type:
      return {
        ...state,
        getInitialContentsStatus: T.APIStatus.IDLE,
      };
    case FinishGetInitialContents.type:
      return {
        ...state,
        getInitialContentsStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        getInitialContentsError: action.error,
      };
    case GetContents.type:
      return {
        ...state,
        getContentsStatus: T.APIStatus.PROGRESS,
      };
    case CancelGetContents.type:
      return {
        ...state,
        getContentsStatus: T.APIStatus.IDLE,
      };
    case FinishGetContents.type:
      return {
        ...state,
        getContentsStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        getContentsError: action.error,
      };
    case PostContent.type:
      return {
        ...state,
        postContentStatus: T.APIStatus.PROGRESS,
      };
    case CancelPostContent.type:
      return {
        ...state,
        postContentStatus: T.APIStatus.IDLE,
      };
    case FinishPostContent.type:
      return {
        ...state,
        postContentStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        postContentError: action.error,
      };
    case PatchContent.type:
      return {
        ...state,
        patchContentStatus: T.APIStatus.PROGRESS,
      };
    case CancelPatchContent.type:
      return {
        ...state,
        patchContentStatus: T.APIStatus.IDLE,
      };
    case FinishPatchContent.type:
      return {
        ...state,
        patchContentStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        patchContentError: action.error,
      };
    case DeleteContent.type:
      return {
        ...state,
        deleteContentStatus: T.APIStatus.PROGRESS,
      };
    case CancelDeleteContent.type:
      return {
        ...state,
        deleteContentStatus: T.APIStatus.IDLE,
      };
    case FinishDeleteContent.type:
      return {
        ...state,
        deleteContentStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        deleteContentError: action.error,
      };
    case ChangeContents.type:
      return contentsLens
        .map()(state)(() => {
          const allIds: Array<number> = action.contents.map(({ id }) => id);

          return {
            byId: _.zipObject(allIds, action.contents),
            allIds,
          };
        });

    case ChangeUploadContent.type:
      return {
        ...state,
        uploadContents: {
          ...state.uploadContents,
          [action.content.id]: action.content,
        },
      };

    case DeleteUploadContent.type:
      return {
        ...state,
        uploadContents: action.contentId ? _.omit(state.uploadContents, action.contentId) : {},
      };

    case AddContent.type:
      return contentsLens
        .map()(state)(({ byId, allIds }) => ({
          byId: {
            ...byId,
            [action.content.id]: action.content,
          },
          // NOTE: The order of the IDs are important
          // to determine the order of the contents in the tree.
          // Therefore, don't sort it.
          allIds: allIds.includes(action.content.id) ? allIds : allIds.concat([action.content.id]),
        }));
    case RemoveContent.type:
      return contentsLens
        .map()(state)(({ byId, allIds }) => ({
          byId: _.omit(byId, action.contentId),
          allIds: _.without(allIds, action.contentId),
        }));

    case CreateAndEditMeasurement.type:
      return {
        ...state,
        postContentStatus: T.APIStatus.PROGRESS,
      };

    case UploadSourcePhoto.type:
      return {
        ...state,
      };

    case UploadBlueprintPDF.type:
      return {
        ...state,
        blueprintUploadStatus: T.APIStatus.PROGRESS,
      };
    case CancelUploadBlueprint.type:
      return {
        ...state,
        blueprintUploadStatus: T.APIStatus.IDLE,
      };

    case UploadDesign.type:
      return {
        ...state,
        designUploadStatus: T.APIStatus.PROGRESS,
      };
    case CancelUploadDesign.type:
      return {
        ...state,
        designUploadStatus: T.APIStatus.IDLE,
      };

    case FinishUploadContent.type:
      if (action.contentId === undefined) {
        return state;
      }

      return {
        ...state,
        uploadContents: {
          ...state.uploadContents,
          [action.contentId]: {
            ...state.uploadContents[action.contentId],
            error: action.error,
            status: action.error === undefined ?
              T.APIStatus.SUCCESS : T.APIStatus.ERROR,
          },
        },
      };

    case UploadBlueprintDXF.type:
      return {
        ...state,
        blueprintUploadStatus: T.APIStatus.PROGRESS,
      };

    case UploadBlueprintDWG.type:
      return {
        ...state,
        blueprintUploadStatus: T.APIStatus.PROGRESS,
      };

    case UploadOrthophoto.type:
      return {
        ...state,
        orthoUploadStatus: T.APIStatus.PROGRESS,
      };
    case CancelUploadOrthophoto.type:
      return {
        ...state,
        orthoUploadStatus: T.APIStatus.IDLE,
      };

    case UploadDsm.type:
      return {
        ...state,
        dsmUploadStatus: T.APIStatus.PROGRESS,
      };
    case CancelUploadDsm.type:
      return {
        ...state,
        dsmUploadStatus: T.APIStatus.IDLE,
      };

    case CancelUploadLas.type:
      return {
        ...state,
        uploadContents: action.contentId ? {
          ...state.uploadContents,
          [action.contentId]: {
            ...state.uploadContents[action.contentId],
            status: T.APIStatus.IDLE,
          },
        } : {},
      };

    case RunPrintMap.type:
      return {
        ...state,
        printMapStatus: T.APIStatus.PROGRESS,
      };
    case CancelRunPrintMap.type:
      return {
        ...state,
        printMapStatus: T.APIStatus.IDLE,
      };
    case FinishRunPrintMap.type:
      return {
        ...state,
        printMapStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        printMapError: action.error,
      };

    case RunDXF2Raster.type:
      return {
        ...state,
        dxf2RasterStatus: T.APIStatus.PROGRESS,
      };
    case CancelRunDXF2Raster.type:
      return {
        ...state,
        dxf2RasterStatus: T.APIStatus.IDLE,
      };
    case FinishRunDXF2Raster.type:
      return {
        ...state,
        dxf2RasterStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        dxf2RasterError: action.error,
      };

    case SetOutdatedVolumes.type:
      return {
        ...state,
        outdatedVolumeIds: action.outdatedVolumeIds,
      };
    case UpdateMarkerAttachmentsCount.type:
      return {
        ...state,
        contents: {
          ...state.contents,
          byId: {
            ...state.contents.byId,
            [action.contentId]: {
              ...state.contents.byId[action.contentId],
              attachmentsCount: action.count,
            },
          },
        },
      };
    case UpdateContentConfig.type:
      return {
        ...state,
        contents: {
          ...state.contents,
          byId: {
            ...state.contents.byId,
            [action.contentId]: {
              ...state.contents.byId[action.contentId],
              config: action.config,
            } as T.Content,
          },
        },
      };
    case UpdateContentsSelectedAtInStore.type:
      const targetContents: Array<T.Content> = Object.values(state.contents.byId).filter((content) => action.ids.includes(content.id));
      const newById: { [id: number]: T.Content } = {};

      targetContents.forEach((content) => {
        const newContent: any = {
          ...content,
          config: {
            ...content.config,
            selectedAt: action.selectedAt,
          },
        };
        newById[content.id] = newContent;
      });

      return {
        ...state,
        contents: {
          ...state.contents,
          byId: {
            ...state.contents.byId,
            ...newById,
          },
        },
      };
    case UpdateContentPinSettings.type:
      return {
        ...state,
        contents: {
          ...state.contents,
          byId: {
            ...state.contents.byId,
            [action.contentId]: {
              ...state.contents.byId[action.contentId],
              screenId: action.screenId,
              pinEventAt: action.pinEventAt,
            } as T.PinnableContent,
          },
        },
      };
    case UpdateLengthAreaVolumeLocations.type:
      return {
        ...state,
        contents: {
          ...state.contents,
          byId: {
            ...state.contents.byId,
            [action.contentId]: {
              ...state.contents.byId[action.contentId],
              info: {
                ...state.contents.byId[action.contentId].info,
                locations: action.locations,
              },
            } as T.LengthAreaVolumeContent,
          },
        },
      };
    case SetMarkerPinSelected.type:
      return {
        ...state,
        contents: {
          ...state.contents,
          byId: {
            ...state.contents.byId,
            [action.contentId]: {
              ...state.contents.byId[action.contentId],
              info: {
                ...state.contents.byId[action.contentId].info,
                move: action.move,
              },
            } as T.Content,
          },
        },
      };

    case RequestVolumeCalculation.type:
      return requestVolumeCalculationLens
        .focusTo(action.contentId)
        .focusTo('status')
        .set()(state)(T.APIStatus.PROGRESS);
    case CancelRequestVolumeCalculation.type:
      return requestVolumeCalculationLens
        .map()(state)((requestVolumeCalculation) => _.omit(requestVolumeCalculation, action.contentId));
    case FinishRequestVolumeCalculation.type:
      return requestVolumeCalculationLens
        .focusTo(action.contentId)
        .set()(state)({
          status: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
          error: action.error,
        });

    case RequestMarkerElevationInfo.type:
      return requestMarkerElevationInfoLens
        .focusTo(action.contentId)
        .set()(state)({
          status: T.APIStatus.PROGRESS,
          error: undefined,
        });
    case FinishRequestMarkerElevationInfo.type:
      return requestMarkerElevationInfoLens
        .focusTo(action.contentId)
        .set()(state)({
          status: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
          error: action.error,
        });

    case RequestLengthElevation.type:
      return requestLengthElevationLens
        .focusTo(action.contentId)
        .focusTo('status')
        .set()(state)(T.APIStatus.PROGRESS);
    case CancelRequestLengthElevation.type:
      return requestLengthElevationLens
        .map()(state)((requestLengthElevation) => _.omit(requestLengthElevation, action.contentId));
    case FinishRequestLengthElevation.type:
      return requestLengthElevationLens
        .focusTo(action.contentId)
        .set()(state)({
          status: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
          error: action.error,
        });

    case GetAreaSurface.type:
      return getAreaSurfaceLens
        .focusTo(action.contentId)
        .focusTo('status')
        .set()(state)(T.APIStatus.PROGRESS);
    case FinishGetAreaSurface.type:
      return getAreaSurfaceLens
        .focusTo(action.contentId)
        .set()(state)({
          status: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
          error: action.error,
        });
    case CancelGetAreaSurface.type:
      return getAreaSurfaceLens
        .map()(state)((getAreaSurface) => _.omit(getAreaSurface, action.contentId));

    case ResetContentsAPIStatusInStore.type:
      return {
        ...state,
        getContentsStatus: T.APIStatus.IDLE,
        getInitialContentsStatus: T.APIStatus.IDLE,
        postContentStatus: T.APIStatus.IDLE,
        deleteContentStatus: T.APIStatus.IDLE,
        patchContentStatus: T.APIStatus.IDLE,
        dsm2tilesStatus: T.APIStatus.IDLE,
        printMapStatus: T.APIStatus.IDLE,
        dxf2RasterStatus: T.APIStatus.IDLE,
      };

    case GetLengthMetrics.type:
      return getLengthMetricsLens
        .focusTo(action.id)
        .focusTo('status')
        .set()(state)(T.APIStatus.PROGRESS);
    case FinishGetLengthMetrics.type:
      return getLengthMetricsLens
        .focusTo(action.id)
        .set()(state)({
          status: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
          error: action.error,
        });
    case CancelGetLengthMetrics.type:
      return getLengthMetricsLens
        .map()(state)((getLengthMetrics) => _.omit(getLengthMetrics, action.id));

    case RequestLasDownSampling.type:
      return {
        ...state,
        requestLasDownSamplingStatus: T.APIStatus.PROGRESS,
      };

    case FinishRequestLasDownSampling.type:
      return {
        ...state,
        requestLasDownSamplingStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        requestLasDownSamplingError: action.error,
      };

    case CancelRequestLasDownSampling.type:
      return {
        ...state,
        requestLasDownSamplingStatus: T.APIStatus.IDLE,
        requestLasDownSamplingError: undefined,
      };

    case GetContentDownloadables.type:
      return {
        ...state,
        getContentDownloadablesStatus: T.APIStatus.PROGRESS,
      };

    case FinishGetContentDownloadables.type:
      return {
        ...state,
        getContentDownloadablesStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        getContentDownloadablesError: action.error,
      };

    case CancelGetContentDownloadables.type:
      return {
        ...state,
        getContentDownloadablesStatus: T.APIStatus.IDLE,
        getContentDownloadablesError: undefined,
      };

    case ChangeLasDownSamplingStatus.type:
      return {
        ...state,
        lasDownSamplingStatus: {
          ...state.lasDownSamplingStatus,
          [action.screenId]: {
            contentId: action.contentId,
            status: action.status,
          },
        },
      };

    case ChangeContentDownloadables.type:
      return {
        ...state,
        contentDownloadables: {
          ...state.contentDownloadables,
          [action.screenId]: action.downloadables,
        },
      };

    case UpdateContents.type:
      return contentsLens
        .map()(state)(({ byId, allIds }) => {
          const updatedById = action.contents
            .reduce<Record<T.Content['id'], T.Content>>((acc, content) => {
              acc[content.id] = content;

              return acc;
            }, {});

          return {
            byId: {
              ...byId,
              ...updatedById,
            },
            allIds,
          };
        });
    case StartRequestingLasReprocessing.type: {
      return {
        ...state,
        requestLasReprocessingStatus: T.APIStatus.PROGRESS,
      };
    }

    case FinishRequestLasReprocessing.type:
      return {
        ...state,
        requestLasReprocessingStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        requestLasReprocessingError: action.error,
      };

    case CancelRequestLasReprocessing.type:
      return {
        ...state,
        requestLasReprocessingStatus: T.APIStatus.IDLE,
        requestLasReprocessingError: undefined,
      };

    default:
      return state;
  }
};

export default reducer;
