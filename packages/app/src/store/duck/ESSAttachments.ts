import { LensGenerator, LensS } from '@typed-f/lens';
import { Location } from 'history';
import _ from 'lodash-es';
import { pathToRegexp } from 'path-to-regexp';
import { Reducer } from 'redux';
import { Epic, combineEpics } from 'redux-observable';
import { AjaxError, ajax } from 'rxjs/ajax';
import { catchError, filter, map, mergeMap, mergeMapTo, takeUntil } from 'rxjs/operators';
import { action as makeAction, props, union } from 'tsdux';
import { ofType } from 'tsdux-observable';

import { EPIC_RELOAD } from '^/constants/epic';
import routes from '^/constants/routes';

import { calculateHash } from '^/utilities/file-util';

import * as T from '^/types';
import { FinishProps } from '../Utils';

import { FileUploadProgress, FileUploadResponse, fileUpload, isFileUploadProgress } from '../rxjs/fileUpload';

import { AuthHeader, ShareHeader, getRequestErrorType, makeAuthHeader, makeShareHeader, makeV2APIURL } from './API';
import { ChangeAuthedUser } from './Auth';

// API related types
interface PostESSAttachmentBody {
  readonly file: File;
  readonly type: T.AttachmentType;
}

export const APIToESSAttachment: (rawAttachment: T.APIAttachment) => T.Attachment = (
  rawAttachment,
) => ({
  ...rawAttachment.attributes,
  id: Number(rawAttachment.id),
  createdAt: new Date(rawAttachment.attributes.createdAt),
  updatedAt: new Date(rawAttachment.attributes.updatedAt),
});

interface GetESSAttachmentsResponse {
  readonly data: Array<T.APIAttachment>;
}
interface PostESSAttachmentResponse {
  readonly data: T.APIAttachment;
}

//Redux actions
export const GetESSAttachments = makeAction(
  'ddm/attachments/GET_ESS_ATTACHMENTS',
  props<Readonly<{
    contentId: T.Content['id'];
  }>>(),
);
export const CancelGetESSAttachments = makeAction(
  'ddm/attachments/CANCESS_EL_GET_ATTACHMENTS',
  props<Readonly<{
    contentId: T.Content['id'];
  }>>(),
);
export const FinishGetESSAttachments = makeAction(
  'ddm/attachments/FINIESS_SH_GET_ATTACHMENTS',
  props<Readonly<{
    contentId: T.Content['id'];
  }> & FinishProps>(),
);

export const PostESSAttachment = makeAction(
  'ddm/attachments/POST_ESS_ATTACHMENT',
  props<Readonly<{
    contentId: T.Content['id'];
    file: PostESSAttachmentBody['file'];
    attachmentType: PostESSAttachmentBody['type'];
  }>>(),
);
export const CancelPostESSAttachment = makeAction(
  'ddm/attachments/CANCEL_POST_ESS_ATTACHMENT',
  props<Readonly<{
    contentId: T.Content['id'];
    hash: string;
  }>>(),
);
export const FinishPostESSAttachment = makeAction(
  'ddm/attachments/FINISH_POST_ESS_ATTACHMENT',
  props<Readonly<{
    contentId: T.Content['id'];
    hash: string;
  }> & FinishProps>(),
);

export const UpdateESSAttachmentUploadStatus = makeAction(
  'ddm/attachments/UPDATE_ESS_ATTACHMENT_UPLOAD_STATUS',
  props<Readonly<{
    contentId: T.Content['id'];
    hash: string;
    status: FileUploadProgress;
  }>>(),
);

export const AddESSAttachment = makeAction(
  'ddm/attachments/ADD_ESS_ATTACHMENT',
  props<Readonly<{
    attachment: T.Attachment;
  }>>(),
);
export const AddESSAttachments = makeAction(
  'ddm/attachments/ADD_ESS_ATTACHMENTS',
  props<Readonly<{
    attachments: Array<T.Attachment>;
  }>>(),
);

export const RemoveESSAttachment = makeAction(
  'ddm/attachments/REMOVE_ESS_ATTACHMENT',
  props<Readonly<{
    attachmentId: T.Attachment['id'];
  }>>(),
);
export const CancelRemoveESSAttachment = makeAction(
  'ddm/attachments/CANCEL_REMOVE_ESS_ATTACHMENT',
);
export const FinishRemoveESSAttachment = makeAction(
  'ddm/attachments/FINISH_REMOVE_ESS_ATTACHMENT',
  props<FinishProps>(),
);
export const InitializeESSAttatchment = makeAction(
  'ddm/attachments/INITIALIZE_ESS_ATTACHMENT',
);

const Action = union([
  GetESSAttachments,
  CancelGetESSAttachments,
  FinishGetESSAttachments,

  PostESSAttachment,
  CancelPostESSAttachment,
  FinishPostESSAttachment,

  UpdateESSAttachmentUploadStatus,

  AddESSAttachment,
  AddESSAttachments,

  RemoveESSAttachment,
  CancelRemoveESSAttachment,
  FinishRemoveESSAttachment,

  InitializeESSAttatchment,
  // Out-duck actions
  ChangeAuthedUser,

  makeAction(EPIC_RELOAD),
]);
export type Action = typeof Action;

// Redux-Observable Epics
const getESSAttachmentsEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetESSAttachments),
  mergeMap(({ contentId }) => {
    const location: Location | null = state$.value.router.location;
    const URL: string = makeV2APIURL('ess_contents', contentId, 'ess_attachments');
    const isShared: boolean = pathToRegexp(routes.share.main).test(location.pathname);
    let header: AuthHeader | ShareHeader;

    if (isShared) {
      const temp: ShareHeader | undefined = makeShareHeader(state$.value.SharedContents);

      if (temp === undefined) {
        return [FinishGetESSAttachments({
          contentId,
          error: T.HTTPError.UNKNOWN_ERROR,
        })];
      }

      header = temp;
    } else {
      const temp: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

      if (temp === undefined) {
        return [ChangeAuthedUser({})];
      }

      header = temp;
    }

    return ajax.get(URL, header).pipe(
      map(({ response }): GetESSAttachmentsResponse => response),
      map((response) => response.data),
      map((data) => data.map(APIToESSAttachment)),
      map((attachments) => AddESSAttachments({ attachments })),
      mergeMap((addESSAttachmentsAction) => [
        addESSAttachmentsAction,
        FinishGetESSAttachments({ contentId }),
      ]),
      catchError((ajaxError: AjaxError) => [
        FinishGetESSAttachments({
          contentId,
          error: getRequestErrorType(ajaxError),
        }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelGetESSAttachments),
          filter(({ contentId: cancelId }) => cancelId === contentId),
        ),
      ),
    );
  }),
);

const postESSAttachmentEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(PostESSAttachment),
  mergeMap(({ contentId, attachmentType, file }) => {
    const URL: string = makeV2APIURL('ess_contents', contentId, 'ess_attachments');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    const formData: FormData = new FormData();
    formData.append('type', attachmentType);
    formData.append('file', file);

    const hash: string = calculateHash(file);

    return fileUpload(URL, formData, header).pipe(
      mergeMap<FileUploadResponse, any>((fileUploadResponse) => {
        if (isFileUploadProgress(fileUploadResponse)) {
          return [
            UpdateESSAttachmentUploadStatus({
              contentId,
              hash,
              status: fileUploadResponse,
            }),
          ];
        } else {
          const response: PostESSAttachmentResponse =
            fileUploadResponse.response;

          return [
            AddESSAttachment({ attachment: APIToESSAttachment(response.data) }),
            FinishPostESSAttachment({ contentId, hash }),
          ];
        }
      }),
      catchError((ajaxError: AjaxError) => [
        FinishPostESSAttachment({
          contentId,
          hash,
          error: getRequestErrorType(ajaxError),
        }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelPostESSAttachment),
          filter(({ contentId: cancelId, hash: cancelHash }) => cancelId === contentId && cancelHash === hash),
        ),
      ),
    );
  }),
);

const reloadESSEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.ofType(EPIC_RELOAD).pipe(
  mergeMap(() => {
    const {
      ESSAttachments,
    }: T.State = state$.value;

    const cancelGetActions: Array<Action> = Object.keys(ESSAttachments.getESSAttachmentsStatus)
      .map(Number)
      .map((contentId) => ({ contentId }))
      .map(CancelGetESSAttachments);
    const cancelPostActions: Array<Action> = Object.keys(ESSAttachments.postESSAttachmentStatus)
      .map(Number)
      .reduce((acc, contentId) => [
        ...acc,
        ...Object.keys(ESSAttachments.postESSAttachmentStatus[contentId])
          .map((hash) => CancelPostESSAttachment({ contentId, hash })),
      ], []);

    return [
      ...cancelGetActions,
      ...cancelPostActions,
    ];
  }),
);

const removeESSAttachmentEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(RemoveESSAttachment),
  mergeMap(({ attachmentId }) => {
    const URL: string = makeV2APIURL('ess_attachments', attachmentId.toString());
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    return ajax.delete(URL, header).pipe(
      mergeMapTo([
        FinishRemoveESSAttachment({}),
      ]),
      catchError((ajaxError: AjaxError) => [
        FinishRemoveESSAttachment({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelRemoveESSAttachment),
        ),
      ),
    );
  }),
);

export const epic: Epic<Action, Action, T.State> = combineEpics(
  getESSAttachmentsEpic,
  postESSAttachmentEpic,
  reloadESSEpic,
  removeESSAttachmentEpic,
);

export const attachmentsStateLens: LensS<T.ESSAttachmentsState, T.ESSAttachmentsState> =
  new LensGenerator<T.ESSAttachmentsState>().fromKeys();

type AttachmentsFocusLens<K extends keyof T.ESSAttachmentsState> =
  LensS<T.ESSAttachmentsState[K], T.ESSAttachmentsState>;
export const postESSAttachmentStatusLens: AttachmentsFocusLens<'postESSAttachmentStatus'> =
  attachmentsStateLens.focusTo('postESSAttachmentStatus');
export const getESSAttachmentStatusLens: AttachmentsFocusLens<'getESSAttachmentsStatus'> =
  attachmentsStateLens.focusTo('getESSAttachmentsStatus');
export const attachmentsLens: AttachmentsFocusLens<'attachments'> =
  attachmentsStateLens.focusTo('attachments');

// Redux reducer
const initialState: T.ESSAttachmentsState = {
  attachments: {
    byId: {},
    allIds: [],
  },
  getESSAttachmentsStatus: {},
  postESSAttachmentStatus: {},
};
const reducer: Reducer<T.ESSAttachmentsState> = (
  state = initialState, action: Action,
) => {
  switch (action.type) {
    case GetESSAttachments.type:
      return getESSAttachmentStatusLens
        .focusTo(action.contentId)
        .set()(state)({
          status: T.APIStatus.PROGRESS,
        });
    case CancelGetESSAttachments.type:
      return getESSAttachmentStatusLens
        .map()(state)((getESSAttachmentsStatus) => _.omit(getESSAttachmentsStatus, action.contentId));
    case FinishGetESSAttachments.type:
      return getESSAttachmentStatusLens
        .focusTo(action.contentId)
        .set()(state)({
          status: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
          error: action.error,
        });

    case PostESSAttachment.type:
      return postESSAttachmentStatusLens
        .focusTo(action.contentId)
        .focusTo(calculateHash(action.file))
        .set()(state)({
          total: action.file.size,
          progress: 0,
        });
    case CancelPostESSAttachment.type:
      return postESSAttachmentStatusLens
        .focusTo(action.contentId)
        .map()(state)((statusOfContent) => _.omit(statusOfContent, action.hash));
    case FinishPostESSAttachment.type:
      return postESSAttachmentStatusLens
        .focusTo(action.contentId)
        .focusTo(action.hash)
        .focusTo('error')
        .set()(state)(action.error);

    case UpdateESSAttachmentUploadStatus.type:
      return postESSAttachmentStatusLens
        .focusTo(action.contentId)
        .focusTo(action.hash)
        .focusTo('progress')
        .set()(state)(action.status.progress);

    case AddESSAttachment.type:
      /**
       * @fixme This one looks bit complex... :(
       * Maybe adding some default lens to array will be helpful.
       */
      return attachmentsLens
        .focusTo('allIds')
        .map()(
          attachmentsLens
            .focusTo('byId')
            .focusTo(action.attachment.id)
            .set()(state)(action.attachment),
        )((allIds) => _.orderBy(_.union([action.attachment.id], allIds)));

    case AddESSAttachments.type:
      const allAttachmentIds: Array<number> = action.attachments.map((item) => item.id);

      const stateWithNewById: T.ESSAttachmentsState = attachmentsLens
        .focusTo('byId')
        .map()(state)((byId) => ({
          ...byId,
          ..._.zipObject(allAttachmentIds, action.attachments),
        }));

      return attachmentsLens
        .focusTo('allIds')
        .map()(stateWithNewById)((allIds) => _.orderBy(_.union(allAttachmentIds, allIds)));

    case RemoveESSAttachment.type:
      return attachmentsLens
        .map()(state)((attachments) => ({
          byId: _.omit(attachments.byId, action.attachmentId),
          allIds: _.without(attachments.allIds, action.attachmentId),
        }));
    case CancelRemoveESSAttachment.type:
      return {
        ...state,
        removeESSAttachmentStatus: T.APIStatus.IDLE,
      };
    case FinishRemoveESSAttachment.type:
      return {
        ...state,
        removeESSAttachmentStatus: action.error === undefined ?
          T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        removeESSAttachmentError: action.error,
      };
    case InitializeESSAttatchment.type:
      return {
        ...state,
        getESSAttachmentsStatus: {},
        postESSAttachmentStatus: {},
        attachments: {
          byId: {},
          allIds: [],
        },
      };
    default:
      return state;
  }
};

export default reducer;
