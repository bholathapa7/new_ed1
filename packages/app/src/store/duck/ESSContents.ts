/* eslint-disable max-lines */
import Color from 'color';
import { Reducer } from 'redux';
import { Epic, combineEpics } from 'redux-observable';
import { concat } from 'rxjs';
import { AjaxError, ajax } from 'rxjs/ajax';
import {
  action as makeAction,
  props,
  union,
} from 'tsdux';
import { ofType } from 'tsdux-observable';

import { typeGuardESSContent, typeGuardESSModel, typeGuardGroup } from '^/hooks';
import * as T from '^/types';
import { catchError, map, mergeMap, takeUntil } from 'rxjs/operators';
import { FinishProps } from '../Utils';
import { AuthHeader, getRequestErrorType, jsonContentHeader, makeAuthHeader, makeV2APIURL } from './API';
import {
  APIToContent,
  AddContent,
  ChangeContents,
  RemoveContent,
  PostContentBody,
  CreateTemporaryGroupAndAddContent,
} from './Contents';
import { ChangeSelectedESSModelId } from './ESSModels';
import { ChangeContentsSidebarTab, ChangeCurrentContentTypeFromAnnotationPicker, contentToTab } from './Pages/Content';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { AddContentToTree, ChangeIsGroupAlreadyDeleted, ChangeSelectedGroupId, CheckAndRemoveGroup, RemoveContentFromTree } from './Groups';
import { getContentTitlesByType, getCurrentGroupId } from '^/utilities/content-util';
import { getCopiedContentTitle } from '^/utilities/annotation-content-util';

interface CreateESSContentResponse {
  readonly response: {
    readonly data: T.APIESSContent;
  };
}

interface PatchESSContentResponse {
  readonly response: {
    readonly data: T.APIESSContent;
  };
}

interface PartialESSContentGeneric<E extends T.ESSContent | T.APIESSContent> {
  readonly type: E['type'];
  readonly title?: E['title'];
  readonly info?: Partial<E['info']>;
  readonly config?: Partial<E['config']>;
  readonly color?: E['color'];
  readonly groupId?: E['groupId'];
}
type PartialESSModelContent = PartialESSContentGeneric<T.ESSModelContent>;
type PartialESSArrowContent = PartialESSContentGeneric<T.ESSArrowContent>;
type PartialESSPolygonContent = PartialESSContentGeneric<T.ESSPolygonContent>;
type PartialESSPolylineContent = PartialESSContentGeneric<T.ESSPolylineContent>;
type PartialESSTextContent = PartialESSContentGeneric<T.ESSTextContent>;
type PartialESSContent = PartialESSModelContent
  | PartialESSArrowContent
  | PartialESSPolygonContent
  | PartialESSPolylineContent
  | PartialESSTextContent
  | PartialESSContentGeneric<T.GroupContent>;

type PartialESSModelContentParams = PartialESSContentGeneric<T.APIESSModelContent> & {
  memo?: T.ESSModelContent['info']['description'];
};
type PartialESSArrowContentParams = PartialESSContentGeneric<T.ESSArrowContent>;
type PartialAPIESSParams = Overwrite<PartialESSModelContentParams | PartialESSArrowContentParams, {
  type: T.APIESSContentType;
  config?: {
    selectedAt?: string;
  };
}>;

export const shapeESSContentParams: (content: PartialESSContent) => PartialAPIESSParams = (content) => {
  switch (content.type) {
    case T.ContentType.ESS_MODEL: {
      return {
        type: T.APIESSContentType.MODEL,
        groupId: content.groupId,
        color: content.color?.toString(),
        title: content.title?.toString(),
        memo: content.info?.description?.toString(),
        info: content.info ? {
          locations: content.info?.location,
          heading: content.info?.heading,
          speed: content.info?.speed,
          modelId: content.info?.modelId,
          waypointId: content.info?.waypointId,
        } : undefined,
        config: content.config ? {
          selectedAt: content.config.selectedAt?.toISOString(),
        } : undefined,
      };
    }
    case T.ContentType.ESS_ARROW: {
      return {
        type: T.APIESSContentType.ARROW,
        groupId: content.groupId,
        color: content.color?.toString(),
        title: content.title?.toString(),
        info: content.info ? {
          locations: content.info?.locations,
        } : undefined,
        config: content.config ? {
          selectedAt: content.config.selectedAt?.toISOString(),
        } : undefined,
      };
    }
    case T.ContentType.ESS_POLYGON: {
      return {
        type: T.APIESSContentType.POLYGON,
        groupId: content.groupId,
        color: content.color?.toString(),
        title: content.title?.toString(),
        info: content.info ? {
          locations: content.info?.locations,
        } : undefined,
        config: content.config ? {
          selectedAt: content.config.selectedAt?.toISOString(),
        } : undefined,
      };
    }
    case T.ContentType.ESS_POLYLINE: {
      return {
        type: T.APIESSContentType.POLYLINE,
        groupId: content.groupId,
        color: content.color?.toString(),
        title: content.title?.toString(),
        info: content.info ? {
          locations: content.info?.locations,
        } : undefined,
        config: content.config ? {
          selectedAt: content.config.selectedAt?.toISOString(),
        } : undefined,
      };
    }
    case T.ContentType.ESS_TEXT: {
      return {
        type: T.APIESSContentType.TEXT,
        groupId: content.groupId,
        color: content.color?.toString(),
        title: content.title?.toString(),
        info: content.info ? {
          locations: content.info?.location,
          description: content.info?.description,
          fontSize: content.info?.fontSize,
          fontColor: content.info?.fontColor?.toString(),
        } : undefined,
        config: content.config ? {
          selectedAt: content.config.selectedAt?.toISOString(),
        } : undefined,
      };
    }
    case T.ContentType.GROUP: {
      return {
        type: T.APIESSContentType.GROUP,
        groupId: content.groupId,
        color: content.color?.toString(),
        title: content.title?.toString(),
        info: content.info ? {
          isOpened: content.info?.isOpened,
        } : undefined,
        config: content.config ? {
          selectedAt: content.config.selectedAt?.toISOString(),
        } : undefined,
      };
    }
    default: {
      throw new Error(`Invalid type: ${content}`);
    }
  }
};

export const GetESSContents = makeAction(
  'ddm/ESSContents/GET_ESS_CONTENTS',
  props<{
    projectId: number;
  }>(),
);
export const FinishGetESSContents = makeAction(
  'ddm/ESSContents/FINISH_GET_ESS_CONTENTS',
  props<FinishProps>(),
);
export const CancelGetESSContents = makeAction(
  'ddm/ESSContents/CANCEL_GET_ESS_CONTENTS',
);

export const CreateESSContent = makeAction(
  'ddm/ESSContents/CREATE_ESS_CONTENT',
  props<{
    content: PartialESSContent;
  }>(),
);
export const CopyESSContent = makeAction(
  'ddm/ESSContents/COPY_ESS_CONTENT',
  props<{
    content: PartialESSContent;
  }>(),
);
export const FinishCreateESSContent = makeAction(
  'ddm/ESSContents/FINISH_CREATE_ESS_CONTENT',
  props<FinishProps>(),
);
export const CancelCreateESSContent = makeAction(
  'ddm/ESSContents/CANCEL_CREATE_ESS_CONTENT',
);

export const CreateESSGroupContent = makeAction(
  'ddm/ESSContents/CREATE_ESS_GROUP_CONTENT',
  props<{
    group: PostContentBody;
  }>(),
);
export const CopyESSGroupContent = makeAction(
  'ddm/ESSContents/COPY_ESS_GROUP_CONTENT',
  props<{
    group: PostContentBody;
    ESSContent: T.ESSContent[];
  }>(),
);
export const FinishCreateESSGroupContent = makeAction(
  'ddm/ESSContents/FINISH_CREATE_ESS_GROUP_CONTENT',
  props<FinishProps>(),
);
export const CancelCreateESSGroupContent = makeAction(
  'ddm/ESSContents/CANCEL_CREATE_ESS_GROUP_CONTENT',
);

export const PatchESSContent = makeAction(
  'ddm/ESSContents/PATCH_ESS_CONTENT',
  props<{
    content: Omit<PartialESSContent, 'type'> & {
      id: T.ESSContent['id'];
    };
    skipDBUpdate?: boolean;
  }>(),
);
export const FinishPatchESSContent = makeAction(
  'ddm/ESSContents/FINISH_PATCH_ESS_CONTENT',
  props<FinishProps>(),
);
export const CancelPatchESSContent = makeAction(
  'ddm/ESSContents/CANCEL_PATCH_ESS_CONTENT',
);

export const DeleteESSContent = makeAction(
  'ddm/ESSContents/DELETE_ESS_CONTENT',
  props<{
    id: T.ESSContent['id'];
  }>(),
);
export const FinishDeleteESSContent = makeAction(
  'ddm/ESSContents/FINISH_DELETE_ESS_CONTENT',
  props<FinishProps>(),
);
export const CancelDeleteESSContent = makeAction(
  'ddm/ESSContents/CANCEL_DELETE_ESS_CONTENT',
);

export const ChangeEditingESSContent = makeAction(
  'ddm/pages/CHANGE_EDITING_ESS_CONTENT',
  props<{
    readonly contentId?: T.ESSContent['id'];
  }>(),
);

export const ChangeESSModelContentWorkRadiusViz = makeAction(
  'ddm/pages/CHANGE_ESS_MODEL_CONTENT_WORK_RADIUS_VIZ',
  props<{
    readonly id: T.ESSContent['id'];
    readonly isWorkRadiusVisEnabled: boolean;
  }>(),
);

const Action = union([
  GetESSContents,
  FinishGetESSContents,
  CancelGetESSContents,

  CreateESSContent,
  CopyESSContent,
  FinishCreateESSContent,
  CancelCreateESSContent,

  CreateESSGroupContent,
  CopyESSGroupContent,
  FinishCreateESSGroupContent,
  CancelCreateESSGroupContent,

  PatchESSContent,
  FinishPatchESSContent,
  CancelPatchESSContent,

  DeleteESSContent,
  FinishDeleteESSContent,
  CancelDeleteESSContent,

  ChangeEditingESSContent,
  ChangeESSModelContentWorkRadiusViz,

  // Out-duck actions
  ChangeContents,
  AddContent,
  RemoveContent,
  ChangeContentsSidebarTab,
  ChangeSelectedESSModelId,
  ChangeCurrentContentTypeFromAnnotationPicker,
  AddContentToTree,
  RemoveContentFromTree,
  ChangeSelectedGroupId,
  CheckAndRemoveGroup,
  CreateTemporaryGroupAndAddContent,
  ChangeIsGroupAlreadyDeleted,
]);

export type Action = typeof Action;

// Redux-Observable Epics
const createESSContentEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(CreateESSContent),
  mergeMap(({ content }) => {
    ga('send', 'event', {
      eventCategory: 'content-create',
      ...(() => {
        if (content.type === T.ContentType.ESS_MODEL) {
          return ({
            eventAction: 'ess-model-list-create',
            eventLabel: `ess-content-model-${content.info?.modelId}`,
          });
        }

        return ({
          eventAction: 'ess-worktool-create',
          eventLabel: `ess-content-${content.type}`,
        });
      })(),
    });

    const projectId: number | undefined = state$.value.Pages.Contents.projectId;

    if (projectId === undefined) return [];

    const URL: string = makeV2APIURL('projects', projectId, 'ess_contents');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    const tab = T.ContentPageTabType.ESS;
    let groupId: T.GroupContent['id'] | undefined;
    try {
      groupId = getCurrentGroupId(state$.value, tab);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);

      return [];
    }
    const groupAction: Action[] = [ChangeSelectedGroupId({ selectedGroupId: groupId, tab })];
    const groupContent: T.GroupContent | undefined = typeGuardGroup(state$.value.Contents.contents.byId[groupId ?? NaN]);
    if (groupContent !== undefined && !groupContent.info?.isOpened) {
      groupAction.push(PatchESSContent({ content: { id: groupContent.id, info: { isOpened: true } } }));
    }

    const body: PartialAPIESSParams = shapeESSContentParams({ ...content, groupId });

    return ajax.post(URL, body, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }: CreateESSContentResponse) => response?.data),
      map(APIToContent),
      mergeMap((newContent: T.ESSContent) => {
        const newESSContent: T.ESSContent = { ...newContent, category: T.ContentCategory.ESS };
        return groupAction.concat([
          AddContent({ content: newESSContent }),
          AddContentToTree({ content: newESSContent, moveOption: T.MoveOption.FIRST }),
          ChangeEditingESSContent({ contentId: newContent.id }),
          ChangeSelectedESSModelId({}),
          ChangeCurrentContentTypeFromAnnotationPicker({}),
        ]);
      }),
      (res$) => concat(res$, [FinishCreateESSContent({})]),
      catchError((ajaxError) => {
        const error = getRequestErrorType(ajaxError);

        const actions: Action[] = [
          FinishCreateESSContent({ error }),
        ];

        if (error === T.HTTPError.CLIENT_NOT_ACCEPTED_ERROR && groupId !== undefined) {
          return actions.concat([
            CheckAndRemoveGroup({ id: groupId }),
            CreateTemporaryGroupAndAddContent({
              action: CreateESSContent({ content }),
            }),
          ]);
        }

        return actions;
      }),
      takeUntil(
        action$.pipe(
          ofType(CancelCreateESSContent),
        ),
      ),
    );
  }),
);

const copyESSContentEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(CopyESSContent),
  mergeMap(({ content }) => {
    ga('send', 'event', {
      eventCategory: 'content-create',
      ...(() => {
        if (content.type === T.ContentType.ESS_MODEL) {
          return ({
            eventAction: 'ess-model-list-copy',
            eventLabel: `ess-content-model-${content.info?.modelId}`,
          });
        }

        return ({
          eventAction: 'ess-worktool-copy',
          eventLabel: `ess-content-${content.type}`,
        });
      })(),
    });

    const projectId: number | undefined = state$.value.Pages.Contents.projectId;

    if (projectId === undefined) return [];

    const URL: string = makeV2APIURL('projects', projectId, 'ess_contents');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    let groupId: T.GroupContent['id'] | undefined;
    try {
      groupId = getCurrentGroupId(state$.value, T.ContentPageTabType.ESS);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);

      return [];
    }
    const groupAction: Action[] = [ChangeSelectedGroupId({ selectedGroupId: groupId, tab: T.ContentPageTabType.ESS })];

    const body: PartialAPIESSParams = shapeESSContentParams({ ...content });
    return ajax.post(URL, body, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }: CreateESSContentResponse) => response?.data),
      map(APIToContent),
      mergeMap((newContent: T.ESSContent) => {
        const newESSContent: T.ESSContent = { ...newContent, category: T.ContentCategory.ESS };
        return groupAction.concat([
          AddContent({ content: newESSContent }),
          AddContentToTree({ content: newESSContent, moveOption: T.MoveOption.FIRST }),
          ChangeSelectedESSModelId({}),
          ChangeCurrentContentTypeFromAnnotationPicker({}),
        ]);
      }),
      (res$) => concat(res$, [FinishCreateESSContent({})]),
      catchError((ajaxError) => {
        const error = getRequestErrorType(ajaxError);

        const actions: Action[] = [
          FinishCreateESSContent({ error }),
        ];

        if (error === T.HTTPError.CLIENT_NOT_ACCEPTED_ERROR && groupId !== undefined) {
          return actions.concat([
            CheckAndRemoveGroup({ id: groupId }),
            CreateTemporaryGroupAndAddContent({
              action: CreateESSContent({ content }),
            }),
          ]);
        }

        return actions;
      }),
      takeUntil(
        action$.pipe(
          ofType(CancelCreateESSContent),
        ),
      ),
    );
  }),
);

const createESSGroupContentEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(CreateESSGroupContent),
  mergeMap(({ group }) => {
    const projectId: number | undefined = state$.value.Pages.Contents.projectId;
    if (projectId === undefined) return [];

    const URL: string = makeV2APIURL('projects', projectId, 'ess_contents');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const { screenId, category, ...body } = group;

    return ajax.post(URL, body, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }: CreateESSContentResponse) => response?.data),
      map(APIToContent),
      mergeMap((newContent: T.ESSContent) => {
        const newESSContent: T.ESSContent = { ...newContent, category: T.ContentCategory.ESS };
        return [
          AddContent({ content: newESSContent }),
          AddContentToTree({ content: newESSContent, moveOption: T.MoveOption.FIRST }),
          ChangeSelectedGroupId({ selectedGroupId: newESSContent.id, tab: T.ContentPageTabType.ESS }),
        ];
      }),
      (res$) => concat(res$, [FinishCreateESSContent({})]),
      catchError((ajaxError: AjaxError) => [
        FinishCreateESSContent({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelCreateESSContent),
        ),
      ),
    );
  }),
);

const copyESSGroupContentEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(CopyESSGroupContent),
  mergeMap(({ group, ESSContent }) => {
    const projectId: number | undefined = state$.value.Pages.Contents.projectId;
    if (projectId === undefined) return [];

    const URL: string = makeV2APIURL('projects', projectId, 'ess_contents');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const { screenId, category, ...body } = group;

    const titles = getContentTitlesByType(state$.value.Contents.contents.byId, T.ContentType.ESS_MODEL);

    return ajax.post(URL, body, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }: CreateESSContentResponse) => response?.data),
      map(APIToContent),
      mergeMap((newContent: T.ESSContent) => {
        const newESSContent: T.ESSContent = { ...newContent, category: T.ContentCategory.ESS };

        const CreateESSContentActions = ESSContent.map((content) => {
          const copiedESSContent = {
            ...content,
            title: getCopiedContentTitle(content.title, titles),
            groupId: newContent.id,
          };
          return CopyESSContent({ content: copiedESSContent });
        });
        return [
          AddContent({ content: newESSContent }),
          AddContentToTree({ content: newESSContent, moveOption: T.MoveOption.FIRST }),
          ChangeSelectedGroupId({ selectedGroupId: newESSContent.id, tab: T.ContentPageTabType.ESS }),
          ...CreateESSContentActions,
        ];
      }),
      (res$) => concat(res$, [FinishCreateESSContent({})]),
      catchError((ajaxError: AjaxError) => [
        FinishCreateESSContent({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelCreateESSContent),
        ),
      ),
    );
  }),
);

const patchESSContentEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(PatchESSContent),
  mergeMap(({ content, skipDBUpdate }) => {
    const originalContent: T.ESSContent | undefined = typeGuardESSContent(state$.value.Contents.contents.byId[content.id]);
    if (!originalContent) return [];

    // Update the store first so that the interface gets updated
    // without having to wait until the response is received from BE.
    const updatedContent: T.ESSContent = (() => {
      const clonedContent = {
        ...originalContent,
        color: content.color ? new Color(content.color.toString()) : originalContent.color,
        title: content.title ?? originalContent.title,
        config: content.config ? {
          type: originalContent.type,
          selectedAt: content.config?.selectedAt ? new Date(content.config.selectedAt.toISOString()) : undefined,
        } : originalContent.config,
      } as T.ESSContent;

      if (!content.info) {
        return clonedContent;
      }

      switch (clonedContent.type) {
        case T.ContentType.ESS_ARROW:
        case T.ContentType.ESS_POLYGON:
        case T.ContentType.ESS_POLYLINE:
        case T.ContentType.ESS_MODEL:
        case T.ContentType.GROUP: {
          return {
            ...clonedContent,
            info: {
              ...clonedContent.info,
              ...content.info,
            },
          } as T.ESSContent;
        }
        case T.ContentType.ESS_TEXT: {
          const info = content.info as T.ESSTextContent['info'];

          return {
            ...clonedContent,
            info: {
              ...clonedContent.info,
              ...content.info,
              // For some reason, the fontColor is not updating properly.
              // It has to be recreated in this way so that the color is updated.
              fontColor: info.fontColor
                ? new Color(info.fontColor.toString())
                : clonedContent.info.fontColor,
            },
          };
        }
        default: {
          exhaustiveCheck(clonedContent);
        }
      }
    })();

    const URL: string = makeV2APIURL('ess_contents', content.id);
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const body: PartialAPIESSParams = shapeESSContentParams(updatedContent);

    const actions: Action[] = [AddContent({ content: updatedContent })];

    if (skipDBUpdate) {
      return actions;
    }

    return concat(
      actions,
      ajax.patch(URL, body, {
        ...header,
        ...jsonContentHeader,
      }).pipe(
        map(({ response }: PatchESSContentResponse) => response?.data),
        map(APIToContent),
        map((respContent: T.ESSContent) => {
          // This switch case is needed because
          // AddContent accepts any content that typically is saved from the content response from BE,
          // but there are properties that only exists on client-side. Therefore, when updating the response
          // from BE, use the value from the updated content instead of rewriting from DB.
          switch (respContent.type) {
            case T.ContentType.ESS_MODEL: {
              if (updatedContent.type !== T.ContentType.ESS_MODEL) {
                throw new Error('Updated content and response from the content mismatched.');
              }

              return AddContent({
                content: {
                  ...respContent,
                  category: T.ContentCategory.ESS,
                  info: {
                    ...respContent.info,
                    isWorkRadiusVisEnabled: updatedContent.info.isWorkRadiusVisEnabled,
                  },
                  config: updatedContent.config,
                },
              });
            }
            case T.ContentType.GROUP: {
              const groupConfig = updatedContent.config as T.GroupContent['config'];

              return AddContent({
                content: {
                  ...respContent,
                  category: T.ContentCategory.ESS,
                  config: groupConfig,
                },
              });
            }
            default: {
              return AddContent({
                content: {
                  ...respContent,
                  category: T.ContentCategory.ESS,
                  config: updatedContent.config,
                },
              });
            }
          }
        }),
        (res$) => concat(res$, [FinishPatchESSContent({})]),
        catchError((ajaxError) => {
          const error = getRequestErrorType(ajaxError);
          const errorActions: Action[] = [
            FinishPatchESSContent({ error }),
          ];

          if (error === T.HTTPError.CLIENT_NOT_FOUND_ERROR) {
            return errorActions.concat([
              ChangeEditingESSContent({}),
              CheckAndRemoveGroup({ id: originalContent.id }),
              RemoveContent({ contentId: originalContent.id }),
            ]);
          }

          return errorActions.concat([
            AddContent({ content: originalContent }),
          ]);
        }),
        takeUntil(
          action$.pipe(
            ofType(CancelPatchESSContent),
          ),
        ),
      ),
    );
  }),
);

const deleteESSContentEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(DeleteESSContent),
  mergeMap(({ id }) => {
    const URL: string = makeV2APIURL('ess_contents', id);
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    return ajax.delete(URL, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      mergeMap(() => [
        ChangeEditingESSContent({}),
        ChangeCurrentContentTypeFromAnnotationPicker({}),
        RemoveContent({ contentId: id }),
        RemoveContentFromTree({ content: state$.value.Contents.contents.byId[id] }),
      ]),
      (res$) => concat(res$, [FinishDeleteESSContent({})]),
      catchError((ajaxError) => {
        const error = getRequestErrorType(ajaxError);

        const actions: Action[] = [
          FinishDeleteESSContent({ error }),
        ];

        if (error === T.HTTPError.CLIENT_NOT_ACCEPTED_ERROR) {
          return actions.concat([
            CheckAndRemoveGroup({ id }),
            ChangeIsGroupAlreadyDeleted({ isGroupAlreadyDeleted: true }),
          ]);
        }

        return actions;
      }),
      takeUntil(
        action$.pipe(
          ofType(CancelDeleteESSContent),
        ),
      ),
    );
  }),
);

const changeEditingESSContentEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(ChangeEditingESSContent),
  mergeMap(({ contentId }) => {
    const content: T.Content | undefined = state$.value.Contents.contents.byId[contentId ?? NaN];
    if (contentId === undefined) return [];

    const group = typeGuardGroup(state$.value.Contents.contents.byId[content.groupId ?? NaN]);
    const groupAction: Array<Action> = group && !group.info.isOpened
      ? [PatchESSContent({ content: { id: group.id, info: { isOpened: true } } })]
      : [];

    const tabAction: Array<Action> = content?.type !== T.ContentType.GROUP
      ? [ChangeContentsSidebarTab({ sidebarTab: contentToTab[content.type] })]
      : [];


    const commonActions: Array<Action> = [
      ...tabAction,
      ...groupAction,
    ];

    const isSelected: boolean = Boolean(content.config?.selectedAt);

    if (isSelected) {
      return commonActions;
    } else {
      return [
        PatchESSContent({
          content: {
            id: contentId,
            config: { selectedAt: new Date() },
          },
          skipDBUpdate: true,
        }),
        ...commonActions,
      ];
    }
  }),
);

const changeESSModelContentWorkRadiusVizEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(ChangeESSModelContentWorkRadiusViz),
  mergeMap(({ id, isWorkRadiusVisEnabled }) => {
    if (id === undefined) return [];

    const content: T.ESSModelContent | undefined = typeGuardESSModel(state$.value.Contents.contents.byId[id]);
    if (content === undefined) return [];

    return [
      AddContent({
        content: {
          ...content,
          info: {
            ...content.info,
            isWorkRadiusVisEnabled,
          },
        },
      }),
    ];
  }),
);

export const epic: Epic<Action, Action, T.State> = combineEpics(
  createESSContentEpic,
  copyESSContentEpic,
  patchESSContentEpic,
  deleteESSContentEpic,
  changeEditingESSContentEpic,
  changeESSModelContentWorkRadiusVizEpic,
  createESSGroupContentEpic,
  copyESSGroupContentEpic,
);

const initialState: T.ESSContentsState = {
  createESSContentStatus: T.APIStatus.IDLE,
  createESSGroupContentStatus: T.APIStatus.IDLE,
  patchESSContentStatus: T.APIStatus.IDLE,
  deleteESSContentStatus: T.APIStatus.IDLE,
};

const reducer: Reducer<T.ESSContentsState> = (state = initialState, action: Action) => {
  switch (action.type) {
    case CreateESSContent.type:
      return {
        ...state,
        createESSContentStatus: T.APIStatus.PROGRESS,
      };
    case FinishCreateESSContent.type:
      return {
        ...state,
        createESSContentStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        createESSContentError: action.error,
      };
    case CancelCreateESSContent.type:
      return {
        ...state,
        createESSContentStatus: T.APIStatus.IDLE,
      };

    case CreateESSGroupContent.type:
      return {
        ...state,
        createESSGroupContentStatus: T.APIStatus.PROGRESS,
      };
    case FinishCreateESSGroupContent.type:
      return {
        ...state,
        createESSGroupContentStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        createESSGroupContentError: action.error,
      };
    case CancelCreateESSGroupContent.type:
      return {
        ...state,
        createESSGroupContentStatus: T.APIStatus.IDLE,
      };

    case PatchESSContent.type:
      return {
        ...state,
        patchESSContentStatus: T.APIStatus.PROGRESS,
      };
    case FinishPatchESSContent.type:
      return {
        ...state,
        patchESSContentStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        patchESSContentError: action.error,
      };
    case CancelPatchESSContent.type:
      return {
        ...state,
        PatchESSContentStatus: T.APIStatus.IDLE,
      };

    case DeleteESSContent.type:
      return {
        ...state,
        deleteESSContentStatus: T.APIStatus.PROGRESS,
      };
    case FinishDeleteESSContent.type:
      return {
        ...state,
        deleteESSContentStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        deleteESSContentError: action.error,
      };
    case CancelDeleteESSContent.type:
      return {
        ...state,
        deleteESSContentStatus: T.APIStatus.IDLE,
      };

    default:
      return state;
  }
};

export default reducer;
