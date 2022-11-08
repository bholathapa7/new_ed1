/* eslint-disable max-lines */
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

import {
  FileMultipartUpload,
  FileMultipartUploadResponse,
  isFileMultipartUploadProgress,
} from '../rxjs/fileMultipartUpload';

import { FileUploadProgress, FileUploadResponse, fileUpload, isFileUploadProgress } from '../rxjs/fileUpload';

import {
  AuthHeader,
  ShareHeader,
  getRequestErrorType,
  makeAuthHeader,
  makeShareHeader,
  makeV2APIURL,
  jsonContentHeader,
} from './API';
import { ChangeAuthedUser } from './Auth';

// API related types
interface PostAttachmentBody {
  readonly file: File;
  readonly type: T.AttachmentType;
}

export interface PostAttachmentNewResponse {
  readonly url: string;
  readonly 'aws-id': string;
  readonly bucket: string;
  readonly region: string;
  readonly key: string;
}

export const APIToAttachment: (rawAttachment: T.APIAttachment) => T.Attachment = (
  rawAttachment,
) => ({
  ...rawAttachment.attributes,
  id: Number(rawAttachment.id),
  createdAt: new Date(rawAttachment.attributes.createdAt),
  updatedAt: new Date(rawAttachment.attributes.updatedAt),
});

interface GetAttachmentsResponse {
  readonly data: Array<T.APIAttachment>;
}
interface PostAttachmentResponse {
  readonly data: T.APIAttachment;
}

interface AttachmentCallbackBody {
  readonly key: string;
}

//Redux actions

export const GetAttachments = makeAction(
  'ddm/attachments/GET_ATTACHMENTS',
  props<Readonly<{
    contentId: T.Content['id'];
  }>>(),
);
export const CancelGetAttachments = makeAction(
  'ddm/attachments/CANCEL_GET_ATTACHMENTS',
  props<Readonly<{
    contentId: T.Content['id'];
  }>>(),
);
export const FinishGetAttachments = makeAction(
  'ddm/attachments/FINISH_GET_ATTACHMENTS',
  props<Readonly<{
    contentId: T.Content['id'];
  }> & FinishProps>(),
);

export const PostAttachment = makeAction(
  'ddm/attachments/POST_ATTACHMENT',
  props<Readonly<{
    contentId: T.Content['id'];
    file: PostAttachmentBody['file'];
    attachmentType: PostAttachmentBody['type'];
  }>>(),
);
export const CancelPostAttachment = makeAction(
  'ddm/attachments/CANCEL_POST_ATTACHMENT',
  props<Readonly<{
    contentId: T.Content['id'];
    hash: string;
  }>>(),
);
export const FinishPostAttachment = makeAction(
  'ddm/attachments/FINISH_POST_ATTACHMENT',
  props<Readonly<{
    contentId: T.Content['id'];
    hash: string;
  }> & FinishProps>(),
);

export const PostAttachmentNew = makeAction(
  'ddm/attachments/POST_ATTACHMENT_NEW',
  props<Readonly<{
    contentId: T.Content['id'];
    file: PostAttachmentBody['file'];
    attachmentType: PostAttachmentBody['type'];
    s3FileName?: string;
  }>>(),
);
export const CancelPostAttachmentNew = makeAction(
  'ddm/attachments/CANCEL_POST_ATTACHMENT_NEW',
  props<Readonly<{
    contentId: T.Content['id'];
    hash: string;
  }>>(),
);
export const FinishPostAttachmentNew = makeAction(
  'ddm/attachments/FINISH_POST_ATTACHMENT_NEW',
  props<Readonly<{
    contentId: T.Content['id'];
    hash: string;
  }> & FinishProps>(),
);

export const UpdateAttachmentUploadStatus = makeAction(
  'ddm/attachments/UPDATE_ATTACHMENT_UPLOAD_STATUS',
  props<Readonly<{
    contentId: T.Content['id'];
    hash: string;
    status: FileUploadProgress;
  }>>(),
);

export const AddAttachment = makeAction(
  'ddm/attachments/ADD_ATTACHMENT',
  props<Readonly<{
    attachment: T.Attachment;
  }>>(),
);
export const AddAttachments = makeAction(
  'ddm/attachments/ADD_ATTACHMENTS',
  props<Readonly<{
    attachments: Array<T.Attachment>;
  }>>(),
);

export const RemoveAttachment = makeAction(
  'ddm/attachments/REMOVE_ATTACHMENT',
  props<Readonly<{
    attachmentId: T.Attachment['id'];
  }>>(),
);
export const CancelRemoveAttachment = makeAction(
  'ddm/attachments/CANCEL_REMOVE_ATTACHMENT',
);
export const FinishRemoveAttachment = makeAction(
  'ddm/attachments/FINISH_REMOVE_ATTACHMENT',
  props<FinishProps>(),
);
export const InitializeAttatchment = makeAction(
  'ddm/attachments/INITIALZE_ATTACHMENT',
);

const Action = union([
  GetAttachments,
  CancelGetAttachments,
  FinishGetAttachments,

  PostAttachment,
  CancelPostAttachment,
  FinishPostAttachment,

  PostAttachmentNew,
  CancelPostAttachmentNew,
  FinishPostAttachmentNew,

  UpdateAttachmentUploadStatus,

  AddAttachment,
  AddAttachments,

  RemoveAttachment,
  CancelRemoveAttachment,
  FinishRemoveAttachment,

  InitializeAttatchment,
  // Out-duck actions
  ChangeAuthedUser,

  makeAction(EPIC_RELOAD),
]);
export type Action = typeof Action;


// Redux-Observable Epics
const getAttachmentsEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetAttachments),
  mergeMap(({ contentId }) => {
    const location: Location | null = state$.value.router.location;
    const URL: string = makeV2APIURL('contents', contentId, 'attachments');
    const isShared: boolean = pathToRegexp(routes.share.main).test(location.pathname);
    let header: AuthHeader | ShareHeader;

    if (isShared) {
      const temp: ShareHeader | undefined = makeShareHeader(state$.value.SharedContents);

      if (temp === undefined) {
        return [FinishGetAttachments({
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
      map(({ response }): GetAttachmentsResponse => response),
      map((response) => response.data),
      map((data) => data.map(APIToAttachment)),
      map((attachments) => AddAttachments({ attachments })),
      mergeMap((addAttachmentsAction) => [
        addAttachmentsAction,
        FinishGetAttachments({ contentId }),
      ]),
      catchError((ajaxError: AjaxError) => [
        FinishGetAttachments({
          contentId,
          error: getRequestErrorType(ajaxError),
        }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelGetAttachments),
          filter(({ contentId: cancelId }) => cancelId === contentId),
        ),
      ),
    );
  }),
);

const postAttachmentEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(PostAttachment),
  mergeMap(({ contentId, attachmentType, file }) => {
    const URL: string = makeV2APIURL('contents', contentId, 'attachments');
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
            UpdateAttachmentUploadStatus({
              contentId,
              hash,
              status: fileUploadResponse,
            }),
          ];
        } else {
          const response: PostAttachmentResponse =
            fileUploadResponse.response;

          return [
            AddAttachment({ attachment: APIToAttachment(response.data) }),
            FinishPostAttachment({ contentId, hash }),
          ];
        }
      }),
      catchError((ajaxError: AjaxError) => [
        FinishPostAttachment({
          contentId,
          hash,
          error: getRequestErrorType(ajaxError),
        }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelPostAttachment),
          filter(({ contentId: cancelId, hash: cancelHash }) => cancelId === contentId && cancelHash === hash),
        ),
      ),
    );
  }),
);

const postAttachmentNewEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(PostAttachmentNew),
  mergeMap(({ contentId, file, attachmentType, s3FileName }) => {
    const URL: string = makeV2APIURL(
      'contents',
      contentId,
      'attachments',
      `new?type=${attachmentType}`,
    );
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    const hash: string = calculateHash(file);

    const fileMultipartUpload: FileMultipartUpload = new FileMultipartUpload({
      file, header, s3FileName,
    });

    return ajax.get(URL, header).pipe(
      map(({ response }): PostAttachmentNewResponse => response),
      mergeMap<PostAttachmentNewResponse, any>((response) => fileMultipartUpload.create(response)),
      mergeMap<FileMultipartUploadResponse, any>((fileMultipartUploadResponse) => {
        if (isFileMultipartUploadProgress(fileMultipartUploadResponse)) {
          return [
            UpdateAttachmentUploadStatus({
              contentId,
              hash,
              status: fileMultipartUploadResponse,
            }),
          ];
        } else {
          const callbackBaseUrl: string = makeV2APIURL('contents', contentId, 'attachments', 'callback');
          const body: AttachmentCallbackBody = {
            key: fileMultipartUploadResponse,
          };

          return ajax.post(callbackBaseUrl, body, {
            ...header,
            ...jsonContentHeader,
          }).pipe(
            map(({ response }): T.APIAttachment => response.data),
            map(APIToAttachment),
            map((attachment) => ({ attachment })),
            map(AddAttachment),
            mergeMap((addAttachmentAction) => [
              addAttachmentAction,
              FinishPostAttachmentNew({
                contentId,
                hash,
              }),
            ]),
          );
        }
      }),
      catchError((error: AjaxError) => [
        FinishPostAttachmentNew({
          contentId,
          hash,
          error: getRequestErrorType(error),
        }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelPostAttachmentNew),
          filter(({ contentId: cancelId, hash: cancelHash }) => cancelId === contentId && cancelHash === hash),
          map((res) => {
            fileMultipartUpload.cancel();

            return res;
          }),
        ),
      ),
    );
  }),
);

const reloadEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.ofType(EPIC_RELOAD).pipe(
  mergeMap(() => {
    const {
      Attachments,
    }: T.State = state$.value;

    const cancelGetActions: Array<Action> = Object.keys(Attachments.getAttachmentsStatus)
      .map(Number)
      .map((contentId) => ({ contentId }))
      .map(CancelGetAttachments);
    const cancelPostActions: Array<Action> = Object.keys(Attachments.postAttachmentStatus)
      .map(Number)
      .reduce((acc, contentId) => [
        ...acc,
        ...Object.keys(Attachments.postAttachmentStatus[contentId])
          .map((hash) => CancelPostAttachment({ contentId, hash })),
      ], []);

    return [
      ...cancelGetActions,
      ...cancelPostActions,
    ];
  }),
);

const removeAttachmentEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(RemoveAttachment),
  mergeMap(({ attachmentId }) => {
    const URL: string = makeV2APIURL('attachments', attachmentId.toString());
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    return ajax.delete(URL, header).pipe(
      mergeMapTo([
        FinishRemoveAttachment({}),
      ]),
      catchError((ajaxError: AjaxError) => [
        FinishRemoveAttachment({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelRemoveAttachment),
        ),
      ),
    );
  }),
);

export const epic: Epic<Action, Action, T.State> = combineEpics(
  getAttachmentsEpic,
  postAttachmentEpic,
  postAttachmentNewEpic,
  reloadEpic,
  removeAttachmentEpic,
);

export const attachmentsStateLens: LensS<T.AttachmentsState, T.AttachmentsState> =
  new LensGenerator<T.AttachmentsState>().fromKeys();

type AttachmentsFocusLens<K extends keyof T.AttachmentsState> =
  LensS<T.AttachmentsState[K], T.AttachmentsState>;
export const postAttachmentStatusLens: AttachmentsFocusLens<'postAttachmentStatus'> =
  attachmentsStateLens.focusTo('postAttachmentStatus');
export const getAttachmentStatusLens: AttachmentsFocusLens<'getAttachmentsStatus'> =
  attachmentsStateLens.focusTo('getAttachmentsStatus');
export const attachmentsLens: AttachmentsFocusLens<'attachments'> =
  attachmentsStateLens.focusTo('attachments');

// Redux reducer
const initialState: T.AttachmentsState = {
  attachments: {
    byId: {},
    allIds: [],
  },
  getAttachmentsStatus: {},
  postAttachmentStatus: {},
};
const reducer: Reducer<T.AttachmentsState> = (
  state = initialState, action: Action,
) => {
  switch (action.type) {
    case GetAttachments.type:
      return getAttachmentStatusLens
        .focusTo(action.contentId)
        .set()(state)({
          status: T.APIStatus.PROGRESS,
        });
    case CancelGetAttachments.type:
      return getAttachmentStatusLens
        .map()(state)((getAttachmentsStatus) => _.omit(getAttachmentsStatus, action.contentId));
    case FinishGetAttachments.type:
      return getAttachmentStatusLens
        .focusTo(action.contentId)
        .set()(state)({
          status: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
          error: action.error,
        });

    case PostAttachment.type:
    case PostAttachmentNew.type:
      return postAttachmentStatusLens
        .focusTo(action.contentId)
        .focusTo(calculateHash(action.file))
        .set()(state)({
          total: action.file.size,
          progress: 0,
        });
    case CancelPostAttachment.type:
    case CancelPostAttachmentNew.type:
      return postAttachmentStatusLens
        .focusTo(action.contentId)
        .map()(state)((statusOfContent) => _.omit(statusOfContent, action.hash));
    case FinishPostAttachment.type:
    case FinishPostAttachmentNew.type:
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return postAttachmentStatusLens
        .focusTo(action.contentId)
        .focusTo(action.hash)
        .focusTo('error')
        .set()(state)(action.error);

    case UpdateAttachmentUploadStatus.type:
      return postAttachmentStatusLens
        .focusTo(action.contentId)
        .focusTo(action.hash)
        .focusTo('progress')
        .set()(state)(action.status.progress);

    case AddAttachment.type:
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

    case AddAttachments.type:
      const allAttachmentIds: Array<number> = action.attachments.map((item) => item.id);

      const stateWithNewById: T.AttachmentsState = attachmentsLens
        .focusTo('byId')
        .map()(state)((byId) => ({
          ...byId,
          ..._.zipObject(allAttachmentIds, action.attachments),
        }));

      return attachmentsLens
        .focusTo('allIds')
        .map()(stateWithNewById)((allIds) => _.orderBy(_.union(allAttachmentIds, allIds)));

    case RemoveAttachment.type:
      return attachmentsLens
        .map()(state)((attachments) => ({
          byId: _.omit(attachments.byId, action.attachmentId),
          allIds: _.without(attachments.allIds, action.attachmentId),
        }));
    case CancelRemoveAttachment.type:
      return {
        ...state,
        RemoveAttachmentStatus: T.APIStatus.IDLE,
      };
    case FinishRemoveAttachment.type:
      return {
        ...state,
        RemoveAttachmentStatus: action.error === undefined ?
          T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        RemoveAttachmentError: action.error,
      };
    case InitializeAttatchment.type:
      return {
        ...state,
        getAttachmentsStatus: {},
        postAttachmentStatus: {},
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
