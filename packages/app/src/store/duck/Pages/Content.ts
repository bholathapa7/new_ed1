/* eslint-disable max-lines */
import { LensGenerator, LensS } from '@typed-f/lens';
import _ from 'lodash-es';
import { Reducer } from 'redux';
import { Epic, combineEpics } from 'redux-observable';
import { filter, mergeMap } from 'rxjs/operators';
import {
  action as makeAction,
  props,
  union,
} from 'tsdux';
import { ofType } from 'tsdux-observable';

import { defaultMapZoom } from '^/constants/defaultContent';
import { lastSelectedScreenSelector, typeGuardGroup, typeGuardPointCloud } from '^/hooks';
import { lastDSMOrMapContentSelector } from '^/hooks/useLastContent';
import { FinishProps } from '^/store/Utils';
import {
  FinishPatchContent,
  GetAreaSurface, GetLengthMetrics,
  PatchContent,
  RequestMarkerElevationInfo,
  RequestVolumeCalculation,
  contentsSelector,
  ChangeContents,
} from '^/store/duck/Contents';
import * as T from '^/types';
import { getCenterBoundary } from '^/utilities/map-util';
import { isAllowPrint, isRoleViewer } from '^/utilities/role-permission-check';
import { getRole, getSingleContentId, getViewableThreeDContentId } from '^/utilities/state-util';
import { Coordinate } from 'ol/coordinate';
import { ChangeEditingESSContent } from '../ESSContents';
import { ChangeSelectedESSModelId, GetESSModelCategories } from '../ESSModels';
import { createHasFeature, DEFAULT_USER_FEATURE_PERMISSION, HasFeature } from '^/utilities/withFeatureToggle';
import { authedUserSelector } from '^/hooks/useAuthedUser';
import { CategoryToTabMapper, ChangeSelectedGroupId } from '../Groups';
import { ChangeProjectConfig } from '../ProjectConfig';

export const tabToContent: { [P in T.ContentPageTabType]: Array<T.ContentType> } = {
  MAP: T.DSMorMapContentTypes,
  OVERLAY: T.OverlayContentTypes,
  MEASUREMENT: T.MeasurementContentTypes,
  PHOTO: [],
  ESS: T.ESSContentTypes,
};

export const contentToTab: { [ P in Exclude<T.ContentType, T.ContentType.GROUP>]: T.ContentPageTabType } = {
  [T.ContentType.MAP]: T.ContentPageTabType.MAP,
  [T.ContentType.DSM]: T.ContentPageTabType.MAP,
  [T.ContentType.POINTCLOUD]: T.ContentPageTabType.MAP,
  [T.ContentType.THREE_D_MESH]: T.ContentPageTabType.MAP,
  [T.ContentType.THREE_D_ORTHO]: T.ContentPageTabType.MAP,
  [T.ContentType.GCP_GROUP]: T.ContentPageTabType.MAP,
  [T.ContentType.BLUEPRINT_PDF]: T.ContentPageTabType.OVERLAY,
  [T.ContentType.BLUEPRINT_DXF]: T.ContentPageTabType.OVERLAY,
  [T.ContentType.BLUEPRINT_DWG]: T.ContentPageTabType.OVERLAY,
  [T.ContentType.DESIGN_DXF]: T.ContentPageTabType.OVERLAY,
  [T.ContentType.MARKER]: T.ContentPageTabType.MEASUREMENT,
  [T.ContentType.LENGTH]: T.ContentPageTabType.MEASUREMENT,
  [T.ContentType.AREA]: T.ContentPageTabType.MEASUREMENT,
  [T.ContentType.VOLUME]: T.ContentPageTabType.MEASUREMENT,
  [T.ContentType.ESS_MODEL]: T.ContentPageTabType.ESS,
  [T.ContentType.ESS_ARROW]: T.ContentPageTabType.ESS,
  [T.ContentType.ESS_POLYGON]: T.ContentPageTabType.ESS,
  [T.ContentType.ESS_POLYLINE]: T.ContentPageTabType.ESS,
  [T.ContentType.ESS_TEXT]: T.ContentPageTabType.ESS,
};

// Redux actions

export const ChangeProjectId = makeAction(
  'ddm/pages/CHANGE_PROJECT_ID',
  props<{
    readonly projectId?: T.Project['id'];
  }>(),
);

export const ChangeSidebarStatus = makeAction(
  'ddm/pages/CHANGE_SIDEBAR_STATUS',
  props<{
    readonly open: boolean;
  }>(),
);

export const ChangeIsTopBarShown = makeAction(
  'ddm/pages/CHANGE_TOPBAR_STATUS',
  props<{
    readonly isOpened: boolean;
  }>(),
);

export const ChangeTwoDDisplayMode = makeAction(
  'ddm/pages/CHANGE_TWO_D_DISPLAY_MODE',
  props<{
    readonly twoDDisplayMode: T.TwoDDisplayMode;
  }>(),
);

export const ChangeCurrentContentTypeFromAnnotationPicker = makeAction(
  'ddm/pages/CHANGE_CURRENT_CONTENT_TYPE_FROM_ANNOTATION_PICKER',
  props<{
    readonly currentContentTypeFromAnnotationPicker?: T.ContentsPageState['currentContentTypeFromAnnotationPicker'];
  }>(),
);

export const ChangePreviousContentTypeFromAnnotationPicker = makeAction(
  'ddm/pages/CHANGE_PREVIOUS_CONTENT_TYPE_FROM_ANNOTATION_PICKER',
  props<{
    readonly previousContentTypeFromAnnotationPicker?: T.ContentsPageState['currentContentTypeFromAnnotationPicker'];
  }>(),
);

export const ChangeTwoDDisplayCenter = makeAction(
  'ddm/pages/CHANGE_TWO_D_DISPLAY_CENTER',
  props<{
    readonly twoDDisplayCenter: T.ContentsPageState['twoDDisplayCenter'];
  }>(),
);

export const ChangeTwoDDisplayZoom = makeAction(
  'ddm/pages/CHANGE_TWO_D_DISPLAY_ZOOM',
  props<{
    readonly twoDDisplayZoom: T.ContentsPageState['twoDDisplayZoom'];
  }>(),
);

export const ChangeThreeDTilesetBounds = makeAction(
  'ddm/pages/CHANGE_THREE_D_TILESET_BOUNDS',
  props<{
    readonly threeDTilesetBounds: T.ContentsPageState['threeDTilesetBounds'];
  }>(),
);

export const SetUpdateTwoDDisplayCenter = makeAction(
  'ddm/pages/SET_UPDATE_TWO_D_DISPLAY_CENTER',
  props<{
    readonly shouldUpdateTwoDDisplayCenter: T.ContentsPageState['shouldUpdateTwoDDisplayCenter'];
  }>(),
);

export const SetUpdateTwoDDisplayZoom = makeAction(
  'ddm/pages/SET_UPDATE_TWO_D_DISPLAY_ZOOM',
  props<{
    readonly shouldUpdateTwoDDisplayZoom: T.ContentsPageState['shouldUpdateTwoDDisplayZoom'];
  }>(),
);

export const ChangeRotation = makeAction(
  'ddm/pages/CHANGE_ROTATION',
  props<{
    readonly rotation: T.ContentsPageState['rotation'];
  }>(),
);

export const ChangeContentsSidebarTab = makeAction(
  'ddm/pages/CHANGE_CONTENTS_SIDEBAR_TAB',
  props<{
    readonly sidebarTab: T.ContentsPageState['sidebarTab'];
  }>(),
);

export const ChangePreviousContentsSidebarTab = makeAction(
  'ddm/pages/CHANGE_PREVIOUS_CONTENTS_SIDEBAR_TAB',
  props<{
    readonly sidebarTab?: T.ContentsPageState['sidebarTab'];
  }>(),
);

export const OpenContentPagePopup = makeAction(
  'ddm/pages/OPEN_CONTENT_PAGE_POPUP',
  props<{
    readonly popup: T.ContentPagePopupType;
    readonly contentId?: T.Content['id'];
  }>(),
);
export const CloseContentPagePopup = makeAction(
  'ddm/pages/CLOSE_CONTENT_PAGE_POPUP',
);

export const OpenContentPageMapPopup = makeAction(
  'ddm/pages/OPEN_CONTENT_PAGE_MAP_POPUP',
  props<{
    readonly popupType: T.ContentPagePopupOnMapType;
  }>(),
);
export const CloseContentPageMapPopup = makeAction(
  'ddm/pages/CLOSE_CONTENT_PAGE_MAP_POPUP',
);

export const OpenContentDeletingConfirmPopup = makeAction(
  'ddm/pages/OPEN_CONTENT_DELETING_CONFIRM_POPUP',
  props<{
    readonly popup: T.ContentPagePopupType;
    readonly contentId: T.Content['id'];
  }>(),
);

export const ChangeImageViewerContent = makeAction(
  'ddm/pages/CHANGE_IMAGE_VIEWER_CONTENT',
  props<{
    readonly contentId: T.Content['id'];
  }>(),
);

export const ChangeImageViewerAttachment = makeAction(
  'ddm/pages/CHANGE_IMAGE_VIEWER_ATTACHMENT',
  props<{
    readonly attachmentId: T.Attachment['id'];
  }>(),
);

export const ChangeCompare2 = makeAction(
  'ddm/pages/CHANGE_COMPARE_2',
  props<{
    readonly comparedContents: T.Compare2Contents;
  }>(),
);

export const ChangeIn3D = makeAction(
  'ddm/pages/CHANGE_IN_3_D',
  props<{
    readonly in3D: boolean;
  }>(),
);

export const ChangeIn3DPointCloud = makeAction(
  'ddm/pages/CHANGE_IN_3_D_POINT_CLOUD',
  props<{
    readonly in3DPointCloud: boolean;
  }>(),
);

export const ChangeIsOnWorkRadius = makeAction(
  'ddm/pages/CHANGE_IS_ON_WORK_RADIUS',
  props<{
    readonly isOnWorkRadius: boolean;
  }>(),
);

export const ChangeEditingContent = makeAction(
  'ddm/pages/CHANGE_EDITING_CONTENT',
  props<{
    readonly contentId?: T.Content['id'];
    readonly skipSelecting?: boolean;
    readonly skipSwitchTab?: boolean;
  }>(),
);

export const ChangeAligningBlueprintContent = makeAction(
  'ddm/pages/CHANGE_ALIGNING_BLUEPRINT_CONTENT',
  props<{
    readonly aligningBlueprintId?: T.Content['id'];
  }>(),
);

export const ChangeAligningBlueprintScratchpad = makeAction(
  'ddm/pages/CHANGE_ALIGNING_BLUEPRINT_SCRACHPAD',
  props<{
    readonly data?: T.ContentsPageState['aligningBlueprintScratchpad'];
  }>(),
);

export const SubmitAligningBlueprintScratchpad = makeAction(
  'ddm/pages/SUBMIT_ALIGNING_BLUEPRINT_SCRACHPAD',
);

export const TogglePrintView = makeAction(
  'ddm/pages/TOGGLE_PRINT_VIEW',
  props<{
    readonly contentId?: T.Content['id'];
  }>(),
);

export const ChangePrintingContentId = makeAction(
  'ddm/pages/CHANGE_PRINTING_CONTENT_ID',
  props<{
    readonly contentId?: T.Content['id'];
  }>(),
);

export const ChangePrintingSquare = makeAction(
  'ddm/pages/CHANGE_PRINTING_SQUARE',
  props<{
    readonly printingSquare?: Coordinate[];
  }>(),
);

export const ChangePrintingAngle = makeAction(
  'ddm/pages/CHANGE_PRINTING_Angle',
  props<{
    readonly printingAngle?: number;
  }>(),
);

export const ChangeFirstVisitStatus = makeAction(
  'ddm/pages/CHANGE_FIRST_VISIT_STATUS',
  props<{
    readonly firstVisit?: boolean;
  }>(),
);

export const ChangeElevationExpansionStatus = makeAction(
  'ddm/pages/CHANGE_ELEVATION_EXPANSION_STATUS',
  props<{
    readonly open: boolean;
    readonly previousOpen?: boolean;
  }>(),
);

export const ChangeMapHorizontalTabStatus = makeAction(
  'ddm/pages/CHANGE_MAP_HORIZONTAL_TAB_STATUS',
  props<{
    readonly status: T.MapHorizontalTabStatus;
  }>(),
);

export const GetLonLatOn2D3DToggle = makeAction(
  'ddm/pages/GET_LON_LAT_ON_2D_3D_TOGGLE',
  props<{}>(),
);

export const FinishGetLonLatOn2D3DToggle = makeAction(
  'ddm/pages/FINISH_GET_LON_LAT_ON_2D_3D_TOGGLE',
  props<FinishProps>(),
);

export const ChangeCreatingVolume = makeAction(
  'ddm/pages/CHANGE_CREATING_VOLUME',
  props<{
    readonly info?: T.ContentsPageState['creatingVolumeInfo'];
  }>(),
);

export const ChangePreviewingDesignId = makeAction(
  'ddm/pages/CHANGE_PREVIEWING_DESIGN_ID',
  props<{
    readonly designId?: T.DesignDXFContent['id'];
  }>(),
);
export const SetMeasurementClickedFromMap = makeAction(
  'ddm/contents/SET_MEASUREMENT_CLICKED_FROM_MAP',
  props<{
    readonly value: boolean;
  }>(),
);
export const SetPreventAutoSelect = makeAction(
  'ddm/contents/SET_PREVENT_AUTO_SELECT',
  props<{
    readonly value: boolean;
  }>(),
);

export const ChangeIsInSourcePhotoUpload = makeAction(
  'ddm/contents/CHANGE_IS_IN_SOURCE_PHOTO_UPLOAD',
  props<{
    readonly isInSourcePhotoUpload: T.ContentsPageState['isInSourcePhotoUpload'];
  }>(),
);

export const ChangeIsInContentsHistoryLogTable = makeAction(
  'ddm/contents/CHANGE_IS_IN_CONTENTS_EVENT_LOG_TABLE',
  props<{
    readonly isInContentsEventLogTable: T.ContentsPageState['isInContentsEventLogTable'];
  }>(),
);

export const ChangeCreatingGCPGroupInfo = makeAction(
  'ddm/contents/CHANGE_CREATING_GCP_GROUP_INFO',
  props<{
    readonly gcpGroupInfo?: {
      readonly gcps: T.GCP[];
      readonly crs: T.ProjectionEnum;
    };
  }>(),
);

export const ChangeEditingGCPIndex = makeAction(
  'ddm/contents/CHANGE_EDTING_GCP_ID',
  props<{
    readonly editingGCPIndex?: number;
  }>(),
);

export const ChangeCurrentPointCloudEngine = makeAction(
  'ddm/pages/CHANGE_CURRENT_POINT_CLOUD_ENGINE',
  props<{
    readonly engine: T.PointCloudEngine;
  }>(),
);

const Action = union([
  ChangeProjectId,
  ChangeSidebarStatus,
  ChangeIsTopBarShown,
  ChangeIsOnWorkRadius,
  ChangeTwoDDisplayMode,
  ChangeCurrentContentTypeFromAnnotationPicker,
  ChangePreviousContentTypeFromAnnotationPicker,
  ChangeTwoDDisplayCenter,
  ChangeTwoDDisplayZoom,
  SetUpdateTwoDDisplayCenter,
  SetUpdateTwoDDisplayZoom,
  ChangeRotation,
  ChangeContentsSidebarTab,
  ChangePreviousContentsSidebarTab,
  OpenContentPagePopup,
  CloseContentPagePopup,
  OpenContentPageMapPopup,
  CloseContentPageMapPopup,
  OpenContentDeletingConfirmPopup,
  ChangeImageViewerContent,
  ChangeImageViewerAttachment,
  ChangeCompare2,
  ChangeIn3D,
  ChangeIn3DPointCloud,
  ChangeEditingContent,
  ChangeAligningBlueprintContent,
  ChangeAligningBlueprintScratchpad,
  SubmitAligningBlueprintScratchpad,
  ChangePrintingContentId,
  ChangePrintingSquare,
  ChangePrintingAngle,
  ChangeFirstVisitStatus,
  GetLonLatOn2D3DToggle,
  FinishGetLonLatOn2D3DToggle,
  ChangeCreatingVolume,
  ChangePreviewingDesignId,
  SetMeasurementClickedFromMap,
  SetPreventAutoSelect,
  ChangeIsInSourcePhotoUpload,
  ChangeIsInContentsHistoryLogTable,
  ChangeCreatingGCPGroupInfo,
  ChangeEditingGCPIndex,
  TogglePrintView,
  ChangeElevationExpansionStatus,
  ChangeMapHorizontalTabStatus,
  ChangeCurrentPointCloudEngine,

  // Out-duck actions
  PatchContent,
  FinishPatchContent,
  RequestVolumeCalculation,
  RequestMarkerElevationInfo,
  GetAreaSurface,
  GetLengthMetrics,
  GetESSModelCategories,
  ChangeEditingESSContent,
  ChangeSelectedESSModelId,
  ChangeSelectedGroupId,
  ChangeProjectConfig,
  ChangeContents,
  ChangeThreeDTilesetBounds,
]);
export type Action = typeof Action;


// Redux-Observable Epics
const changeEditingContentEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(ChangeEditingContent),
  mergeMap(({ contentId, skipSelecting, skipSwitchTab }) => {
    const projectId: T.Project['id'] | undefined = state$.value.Pages.Contents.projectId;

    if (projectId === undefined) {
      return [];
    }

    if (contentId === undefined) {
      return [
        ChangeAligningBlueprintContent({}),
      ];
    }

    if (!state$.value.Contents.contents.allIds.includes(contentId)) {
      return [
        ChangeEditingContent({}),
      ];
    }

    const content = state$.value.Contents.contents.byId[contentId];
    const tabFromContent = content.type === T.ContentType.GROUP ? undefined : contentToTab[content.type];

    // Existing measurement contents might not have
    // the initial metrics, so run this check the moment they select a content.
    const lengthActions: Action[] = content.type === T.ContentType.LENGTH &&
      state$.value.Contents.getLengthMetrics[content.id]?.status !== T.APIStatus.PROGRESS &&
      content.info.metrics === undefined ? [
        GetLengthMetrics({ id: content.id }),
      ] : [];

    const areaActions: Action[] = content.type === T.ContentType.AREA &&
      state$.value.Contents.getAreaSurface[content.id]?.status !== T.APIStatus.PROGRESS &&
      content.info.surface === undefined ? [
        GetAreaSurface({ contentId: content.id }),
      ] : [];

    const tabAction: Array<Action> = skipSwitchTab || tabFromContent === undefined
      ? []
      : [ChangeContentsSidebarTab({ sidebarTab: tabFromContent })];

    // Chances are the content is inside a collapsed group.
    // Open them so that user can see what is being selected.
    const group = typeGuardGroup(state$.value.Contents.contents.byId[content.groupId ?? NaN]);
    const groupAction: Array<Action> = group && !group.info.isOpened
      ? [PatchContent({ content: { id: group.id, info: { isOpened: true } } })]
      : [];

    const selectedGroupId = tabFromContent === undefined ? undefined : state$.value.Groups.selectedGroupIdByTab[tabFromContent];
    if (tabFromContent && selectedGroupId !== content.groupId) {
      groupAction.push(ChangeSelectedGroupId({ selectedGroupId: content.groupId, tab: CategoryToTabMapper[content.category] }));
    }

    const commonActions: Array<Action> = [
      ...groupAction,
      ...tabAction,
      ...lengthActions,
      ...areaActions,
    ];

    // Do not toggle the selectedAt below,
    // simply toggling the editing id and its side effects.
    if (skipSelecting) {
      return commonActions;
    }

    const isSelected: boolean = contentsSelector.isSelected(state$.value.Contents, state$.value.ProjectConfigPerUser)(contentId);

    if (isSelected) {
      return commonActions;
    } else {
      const oldConfig = state$.value.Contents.contents.byId[contentId].config;

      return [
        PatchContent({ content: { id: contentId, config: { ...oldConfig, selectedAt: new Date() } } }),
        ...commonActions,
      ];
    }
  }),
);

const togglePrintViewEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(TogglePrintView),
  mergeMap(({ contentId }) => {
    const contents: T.ContentsState = state$.value.Contents;
    const projectId: T.Project['id'] | undefined = state$.value.Pages.Contents.projectId;
    const project: T.Project | undefined = projectId ? state$.value.Projects.projects.byId[projectId] : undefined;
    const role: T.PermissionRole = project ? project.permissionRole : T.PermissionRole.VIEWER;

    const currentContentTypeFromAnnotationPicker: T.ContentsPageState['currentContentTypeFromAnnotationPicker'] =
      state$.value.Pages.Contents.currentContentTypeFromAnnotationPicker;
    const previousContentTypeFromAnnotationPicker: T.ContentsPageState['currentContentTypeFromAnnotationPicker'] =
      state$.value.Pages.Contents.previousContentTypeFromAnnotationPicker;

    const lastMapId: T.Content['id'] | undefined = lastDSMOrMapContentSelector(state$.value, T.ContentType.MAP, { needsSelectedAt: true })?.id;
    const tms: T.MapContent['info']['tms'] = lastMapId ? (contents.contents.byId[lastMapId] as T.MapContent).info.tms : undefined;
    const twoDDisplayCenter: T.GeoPoint | undefined = tms ? getCenterBoundary(tms.boundaries[defaultMapZoom]) : undefined;

    if (!lastMapId || !twoDDisplayCenter) {
      return [
        OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_SELECTED_MAP }),
        ChangeContentsSidebarTab({ sidebarTab: T.ContentPageTabType.MAP }),
      ];
    }

    if (!isAllowPrint(role)) return [OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION })];
    // Reset the printingSquare if the contentId is undefined
    if (contentId === undefined) {
      const backToContentPageActions: Array<Action> = [
        ChangePrintingContentId({}),
        ChangePrintingSquare({}),
        ChangePrintingAngle({}),
      ];

      const previousSidebarTab: T.ContentPageTabType | undefined = state$.value.Pages.Contents.previousSidebarTab;
      // change sidebarTab when user has seen before Print Page enter
      if (previousSidebarTab !== undefined) {
        backToContentPageActions.push(ChangeContentsSidebarTab({ sidebarTab: previousSidebarTab }));
        backToContentPageActions.push(ChangePreviousContentsSidebarTab({ sidebarTab: undefined }));
      }

      if (previousContentTypeFromAnnotationPicker !== undefined) {
        backToContentPageActions.push(ChangeCurrentContentTypeFromAnnotationPicker({
          currentContentTypeFromAnnotationPicker: previousContentTypeFromAnnotationPicker,
        }));
        backToContentPageActions.push(ChangePreviousContentTypeFromAnnotationPicker({ previousContentTypeFromAnnotationPicker: undefined }));
      }

      return backToContentPageActions;
    }

    return [
      ChangePrintingContentId({ contentId }),
      ChangePreviousContentTypeFromAnnotationPicker({ previousContentTypeFromAnnotationPicker: currentContentTypeFromAnnotationPicker }),
      ChangeCurrentContentTypeFromAnnotationPicker({}),
      ChangeTwoDDisplayZoom({ twoDDisplayZoom: defaultMapZoom }),
      ChangeTwoDDisplayCenter({ twoDDisplayCenter }),
      ChangeTwoDDisplayMode({ twoDDisplayMode: T.TwoDDisplayMode.NORMAL }),
      ChangeSidebarStatus({ open: true }),
      ChangePreviousContentsSidebarTab({ sidebarTab: state$.value.Pages.Contents.sidebarTab }),
      ChangeContentsSidebarTab({ sidebarTab: T.ContentPageTabType.OVERLAY }),
    ];
  }),
);

const changeIn3DEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(ChangeIn3D),
  mergeMap(({ in3D }) => {
    const editingContentId: number | undefined = state$.value.Pages.Contents.editingContentId;
    const isOverlayContentEditingContent: boolean = editingContentId !== undefined &&
      T.OverlayContentTypes.includes(state$.value.Contents.contents.byId[editingContentId].type);
    const actions: Action[] = [];
    if (isOverlayContentEditingContent) actions.push(ChangeEditingContent({}));

    if (in3D) {
      const { Contents, Pages, ProjectConfigPerUser }: T.State = state$.value;
      const threeDOrthoId: T.ThreeDOrthoContent['id'] | undefined
        = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.THREE_D_ORTHO);
      if (threeDOrthoId) {
        const threeDOrtho: T.ThreeDOrthoContent = state$.value.Contents.contents.byId[threeDOrthoId] as T.ThreeDOrthoContent;
        if (threeDOrtho.status !== T.ContentProcessingStatus.COMPLETED) {
          actions.push(ChangeIn3DPointCloud({ in3DPointCloud: true }));
        }
      }
    }

    return actions;
  }),
);

const submitBlueprintScratchpadEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(SubmitAligningBlueprintScratchpad),
  mergeMap(() => {
    const {
      Pages: { Contents: { aligningBlueprintId, aligningBlueprintScratchpad } },
      Contents,
    }: T.State = state$.value;

    if (aligningBlueprintId === undefined) {
      throw new Error('Submit blueprint scratchpad without values');
    }

    const oldContent: T.BlueprintPDFContent = Contents.contents.byId[aligningBlueprintId] as T.BlueprintPDFContent;
    const newContent: T.BlueprintPDFContent = ({
      ...oldContent,
      info: {
        ...oldContent.info,
        ...aligningBlueprintScratchpad,
      },
    });

    return [
      PatchContent({
        content: newContent,
      }),
      ChangeEditingContent({}),
    ];
  }),
);

const changeContentsSidebarTabEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(ChangeContentsSidebarTab),
  mergeMap(({ sidebarTab }) => {
    const s: T.State = state$.value;
    const baseActions: Array<Action> = (() => {
      // Since ESS horizontal tab should only be opened when it's on the ESS sidebar tab,
      // hide them whenever it's shown on other tabs.
      if (s.Pages.Contents.mapHorizontalTabStatus === T.MapHorizontalTabStatus.ESS) {
        return [
          ChangeMapHorizontalTabStatus({ status: T.MapHorizontalTabStatus.HIDDEN }),
        ];
      }

      return [];
    })();

    const lastSelectedScreen: T.Screen | undefined = lastSelectedScreenSelector(s);
    if (lastSelectedScreen === undefined) return [];

    switch (sidebarTab) {
      case T.ContentPageTabType.PHOTO: {
        const photoTabActions: Array<Action> = [ChangeTwoDDisplayMode({ twoDDisplayMode: T.TwoDDisplayMode.NORMAL })];
        const in3D: T.ContentsPageState['in3D'] = s.Pages.Contents.in3D;

        if (in3D) {
          photoTabActions.push(ChangeIn3D({ in3D: false }));
          /**
           * @memo Force toggle 2D Ortho on current Screen when previous view was 3D.
           * Same logic exists on `ContentListMapAndDsmItem` using `in3D` and `preventAutoSelect` but
           * that content will be unmounted during render Photo Map so it will not trigger Map Content.
           */

          const mapId: T.MapContent['id'] | undefined = getSingleContentId(
            state$.value.Contents, state$.value.Pages, state$.value.ProjectConfigPerUser, T.ContentType.MAP,
          );

          if (mapId !== undefined) {
            photoTabActions.push(PatchContent({
              content: {
                id: mapId,
                config: {
                  selectedAt: new Date(),
                },
              },
            }));
          }
        }

        return baseActions.concat(photoTabActions);
      }
      case T.ContentPageTabType.ESS: {
        const ESSBaseActions: Array<Action> = [];

        // This will toggle either 3D mesh or 3D ortho,
        // Depending on what is available.
        const viewableThreeDContentId: T.ThreeDMeshContent['id'] | T.ThreeDOrthoContent['id'] | undefined =
          getViewableThreeDContentId(s.Contents, s.Pages, s.ProjectConfigPerUser);
        if (!viewableThreeDContentId) return ESSBaseActions;

        // Only change the selected contents when necessary.
        const isThreeDContentSelected: boolean = contentsSelector.isSelected(
          s.Contents,
          s.ProjectConfigPerUser,
        )(viewableThreeDContentId);

        if (!isThreeDContentSelected) {
          ESSBaseActions.push(
            PatchContent({
              content: {
                id: viewableThreeDContentId,
                config: {
                  selectedAt: new Date(),
                },
              },
            }),
            // When editing content is changed, user would want to see
            // the tab the contents are in. In ESS case, it wants to switch to the ESS tab
            // while activating a content from Map tab (3d ortho/mesh). So, the map content has to be "edited"
            // (this is to toggle the ContentsListItemCheckbox) but the tab would still be in ESS tab.
            // This seems like a hack, the whole selected/checkbox flow needs to be refactored.
            ChangeEditingContent({ contentId: viewableThreeDContentId, skipSwitchTab: true }),
          );
        }

        // Users with a viewer role should not be able to see the ESS tab
        // because they shouldn't be abel to create new models.
        if (!isRoleViewer(getRole(state$.value.Projects, state$.value.Pages.Contents))) {
          ESSBaseActions.push(ChangeMapHorizontalTabStatus({ status: T.MapHorizontalTabStatus.ESS }));
        }

        return ESSBaseActions.concat([
          GetESSModelCategories(),
          ChangeCurrentContentTypeFromAnnotationPicker({ currentContentTypeFromAnnotationPicker: undefined }),
          ChangeIn3D({ in3D: true }),
          ChangeIn3DPointCloud({ in3DPointCloud: false }),
        ]);
      }
      default: {
        return baseActions;
      }
    }
  }),
);

/**
 * Due to how ESS models and the rest of the annotations are
 * both content-creating interactions and they can't coexist,
 * when one is active, the other has to be deactivated.
 */
const changeCurrentContentTypeFromAnnotationPickerEpic: Epic<Action, Action, T.State> = (
  action$,
) => action$.pipe(
  ofType(ChangeCurrentContentTypeFromAnnotationPicker),
  mergeMap(({ currentContentTypeFromAnnotationPicker }) => {
    if (currentContentTypeFromAnnotationPicker !== undefined) {
      return [ChangeSelectedESSModelId({})];
    }

    return [];
  }),
);

/**
 * When ESS-only features are available, user would still be able to
 * upload the sourcephoto. However, the view is switched to 2D for a while
 * to accomodate GCP visualization. This is done so that it goes back to 3D
 * once the upload is done.
 */
const changeIsInSourcePhotoUploadEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(ChangeIsInSourcePhotoUpload),
  mergeMap(({ isInSourcePhotoUpload }) => {
    const user: T.User | undefined = authedUserSelector(state$.value);
    const hasFeature: HasFeature = createHasFeature(user?.featurePermission ?? DEFAULT_USER_FEATURE_PERMISSION);

    return !isInSourcePhotoUpload && hasFeature(T.Feature.ESS)
      ? [ChangeIn3D({ in3D: true })]
      : [];
  }),
);

/**
 * Figure out what engine is the pointcloud on the current screen is
 * and update the visualization. Applies to both changing screens
 * and loading content page for the first time.
 */
const updateCurrentPointCloudEngineByScreenEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  filter((x) => x.type === ChangeProjectConfig.type || x.type === ChangeContents.type),
  mergeMap(() => {
    const lastSelectedScreenId = state$.value.ProjectConfigPerUser.config?.lastSelectedScreenId;
    if (lastSelectedScreenId === undefined) {
      return [ChangeCurrentPointCloudEngine({ engine: T.PointCloudEngine.POTREE })];
    }

    // Find the only point cloud content in the current screen.
    const pointCloudContentId = state$.value.Contents.contents.allIds
      .find((id) => {
        const content = state$.value.Contents.contents.byId[id];

        return content.screenId === lastSelectedScreenId
          && content.type === T.ContentType.POINTCLOUD;
      });

    const pointCloudContent = typeGuardPointCloud(state$.value.Contents.contents.byId[pointCloudContentId ?? NaN]);

    // Revert to the default if the screen doesn't have pointcloud content.
    return [
      ChangeCurrentPointCloudEngine({ engine: pointCloudContent?.info?.engine ?? T.PointCloudEngine.POTREE }),
    ];
  }),
);

export const contentPageEpic: Epic<Action, Action, T.State> = combineEpics(
  changeEditingContentEpic,
  togglePrintViewEpic,
  changeIn3DEpic,
  submitBlueprintScratchpadEpic,
  changeContentsSidebarTabEpic,
  changeCurrentContentTypeFromAnnotationPickerEpic,
  changeIsInSourcePhotoUploadEpic,
  updateCurrentPointCloudEngineByScreenEpic,
);

export const contentsPageStateLens: LensS<T.ContentsPageState, T.ContentsPageState> =
  new LensGenerator<T.ContentsPageState>().fromKeys();

// Redux reducer
const initialState: T.ContentsPageState = {
  showSidebar: true,
  isTopbarShown: true,
  in3D: false,
  isOnWorkRadius: false,
  in3DPointCloud: false,
  currentPointCloudEngine: T.PointCloudEngine.POTREE,
  compare2: {},
  compare4: {},
  twoDDisplayMode: T.TwoDDisplayMode.NORMAL,
  isInSourcePhotoUpload: false,
  isInContentsEventLogTable: false,
  isMeasurementClickedFromMap: false,
  // TODO: Change following values to meaningful one.
  // eslint-disable-next-line no-magic-numbers
  twoDDisplayCenter: [127, 36],
  twoDDisplayZoom: 12,
  rotation: 0, // Defaults to 0 in openlayers
  sidebarTab: T.ContentPageTabType.MEASUREMENT,
  previousSidebarTab: undefined,
  imageViewerStatus: {
    contentId: 0,
    attachmentId: 0,
  },
  mapHorizontalTabStatus: T.MapHorizontalTabStatus.ELEVATION_PROFILE,
  getLonLatOn2D3DToggleStatus: T.APIStatus.IDLE,
  shouldUpdateTwoDDisplayZoom: false,
  shouldUpdateTwoDDisplayCenter: false,
};
const reducer: Reducer<T.ContentsPageState> = (
  state = initialState, action: Action,
) => {
  switch (action.type) {
    case ChangeProjectId.type:
      return {
        ...state,
        projectId: action.projectId,
      };

    case ChangeSidebarStatus.type:
      return {
        ...state,
        showSidebar: action.open,
      };

    case ChangeIsTopBarShown.type:
      return {
        ...state,
        isTopbarShown: action.isOpened,
      };

    case ChangeTwoDDisplayMode.type:
      return {
        ...state,
        twoDDisplayMode: action.twoDDisplayMode,
      };

    case ChangeCurrentContentTypeFromAnnotationPicker.type:
      return {
        ...state,
        currentContentTypeFromAnnotationPicker: action.currentContentTypeFromAnnotationPicker,
      };

    case ChangePreviousContentTypeFromAnnotationPicker.type:
      return {
        ...state,
        previousContentTypeFromAnnotationPicker: action.previousContentTypeFromAnnotationPicker,
      };

    case ChangeTwoDDisplayCenter.type:
      return {
        ...state,
        twoDDisplayCenter: action.twoDDisplayCenter,
      };
    case ChangeTwoDDisplayZoom.type:
      return {
        ...state,
        twoDDisplayZoom: action.twoDDisplayZoom,
      };
    case SetUpdateTwoDDisplayCenter.type:
      return {
        ...state,
        shouldUpdateTwoDDisplayCenter: action.shouldUpdateTwoDDisplayCenter,
      };
    case SetUpdateTwoDDisplayZoom.type:
      return {
        ...state,
        shouldUpdateTwoDDisplayZoom: action.shouldUpdateTwoDDisplayZoom,
      };
    case ChangeRotation.type:
      return {
        ...state,
        rotation: action.rotation,
      };
    case ChangeContentsSidebarTab.type:
      return {
        ...state,
        sidebarTab: action.sidebarTab,
      };
    case ChangePreviousContentsSidebarTab.type:
      return {
        ...state,
        previousSidebarTab: action.sidebarTab,
      };
    case OpenContentPagePopup.type:
      return {
        ...state,
        popup: {
          type: action.popup,
          contentId: action.contentId,
        },
      };
    case CloseContentPagePopup.type:
      return {
        ...state,
        popup: undefined,
      };
    case OpenContentPageMapPopup.type:
      return {
        ...state,
        mapPopup: {
          type: action.popupType,
        },
      };
    case CloseContentPageMapPopup.type:
      return {
        ...state,
        mapPopup: undefined,
      };
    case OpenContentDeletingConfirmPopup.type:
      return {
        ...state,
        popup: {
          type: action.popup,
        },
        deletingContentId: action.contentId,
      };

    case ChangeImageViewerContent.type:
      return contentsPageStateLens
        .focusTo('imageViewerStatus')
        .focusTo('contentId')
        .set()(state)(action.contentId);

    case ChangeImageViewerAttachment.type:
      return contentsPageStateLens
        .focusTo('imageViewerStatus')
        .focusTo('attachmentId')
        .set()(state)(action.attachmentId);

    case ChangeCompare2.type:
      return {
        ...state,
        compare2: action.comparedContents,
      };

    case ChangeIn3D.type:
      return {
        ...state,
        in3D: action.in3D,
      };

    case ChangeIn3DPointCloud.type:
      return {
        ...state,
        in3DPointCloud: action.in3DPointCloud,
      };
    case ChangeIsOnWorkRadius.type:
      return {
        ...state,
        isOnWorkRadius: action.isOnWorkRadius,
      };
    case ChangeEditingESSContent.type:
    case ChangeEditingContent.type:
      return {
        ...state,
        editingContentId: action.contentId,
      };

    case ChangeAligningBlueprintContent.type:
      return {
        ...state,
        aligningBlueprintId: action.aligningBlueprintId,
        aligningBlueprintScratchpad: action.aligningBlueprintId === undefined ? undefined : state.aligningBlueprintScratchpad,
      };

    case ChangeAligningBlueprintScratchpad.type:
      return contentsPageStateLens
        .focusTo('aligningBlueprintScratchpad')
        .map()(state)((scratchpad) => action.data === undefined ? undefined : {
          ...scratchpad,
          ...action.data,
        });

    case ChangePrintingContentId.type:
      return {
        ...state,
        printingContentId: action.contentId,
      };
    case ChangePrintingSquare.type:
      return {
        ...state,
        printingSquare: action.printingSquare,
      };
    case ChangePrintingAngle.type:
      return {
        ...state,
        printingAngle: action.printingAngle,
      };

    case ChangeMapHorizontalTabStatus.type:
      return {
        ...state,
        mapHorizontalTabStatus: action.status,
      };

    case ChangeFirstVisitStatus.type:
      return {
        ...state,
        isFirstVisit: action.firstVisit,
      };

    case GetLonLatOn2D3DToggle.type:
      return {
        ...state,
        getLonLatOn2D3DToggleStatus: T.APIStatus.PROGRESS,
      };

    case FinishGetLonLatOn2D3DToggle.type:
      return {
        ...state,
        getLonLatOn2D3DToggleStatus:
          action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
      };

    case ChangeCreatingVolume.type:
      return {
        ...state,
        creatingVolumeInfo: action.info !== undefined ? {
          ...state.creatingVolumeInfo,
          ...action.info,
        } : undefined,
      };

    case ChangePreviewingDesignId.type:
      return {
        ...state,
        previewingDesignId: action.designId,
      };

    case SetMeasurementClickedFromMap.type:
      return {
        ...state,
        isMeasurementClickedFromMap: action.value,
      };

    case SetPreventAutoSelect.type:
      return {
        ...state,
        isPreventAutoSelect: action.value,
      };

    case ChangeIsInSourcePhotoUpload.type:
      return {
        ...state,
        isInSourcePhotoUpload: action.isInSourcePhotoUpload,
      };
    case ChangeIsInContentsHistoryLogTable.type:
      return {
        ...state,
        isInContentsEventLogTable: action.isInContentsEventLogTable,
      };

    case ChangeCreatingGCPGroupInfo.type:
      return {
        ...state,
        creatingGCPGroupInfo: action.gcpGroupInfo,
      };
    case ChangeEditingGCPIndex.type:
      return {
        ...state,
        editingGCPIndex: action.editingGCPIndex,
      };
    case ChangeCurrentPointCloudEngine.type:
      return {
        ...state,
        currentPointCloudEngine: action.engine,
      };
    case ChangeThreeDTilesetBounds.type:
      return {
        ...state,
        threeDTilesetBounds: action.threeDTilesetBounds,
      };

    default:
      return state;
  }
};
export default reducer;
