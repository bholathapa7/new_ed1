import * as Sentry from '@sentry/browser';
import { currentProjectSelector } from '^/hooks/useCurrentProject';
import * as T from '^/types';
import { Reducer } from 'redux';
import { Epic, combineEpics } from 'redux-observable';
import { Observable, queueScheduler, scheduled } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { catchError, concatAll, map, mergeAll, mergeMap, take } from 'rxjs/operators';
import {
  action as makeAction,
  props,
  union,
} from 'tsdux';
import { ofType } from 'tsdux-observable';
import { AuthHeader, makeAuthHeader, makeV2APIURL } from '../API';
import { ChangeAuthedUser } from '../Auth';
import { CloseContentPagePopup, OpenContentPagePopup } from '../Pages';

//Redux actions

export const GetPhotos = makeAction(
  'ddm/photos/GET_PHOTOS',
  props<{ readonly projectId: T.Project['id'] }>(),
);
export const FinishGetPhotos = makeAction('ddm/photos/FINISH_GET_PHOTOS');
export const UpdatePhotosInStore = makeAction(
  'ddm/photos/UPDATE_PHOTOS_IN_STORE',
  props<{ photos: Array<T.Photo> }>(),
);

export const UploadPhotos = makeAction(
  'ddm/photos/UPLOAD_PHOTOS',
  props<{ readonly files: Array<File> }>(),
);
export const FinishUploadPhotos = makeAction('ddm/photos/FINISH_UPLOAD_PHOTOS');
export const FinishPostPhoto = makeAction('ddm/photos/FINISH_POST_PHOTO');
export const DeletePhoto = makeAction(
  'ddm/photos/DELETE_PHOTO',
  props<{ readonly photoId: T.Photo['id'] }>(),
);

export const SetCurrentPhotoId = makeAction(
  'ddm/photos/SET_CURRENT_PHOTO_ID',
  props<{ readonly photoId?: T.Photo['id'] }>(),
);

export const SetPhotoTabType = makeAction(
  'ddm/photos/SET_PHOTO_TAB_TYPE',
  props<{ readonly tabType: T.PhotoTabType }>(),
);

export const SetUploadedPhotoCount = makeAction(
  'ddm/photos/SET_UPLOADED_PHOTO_COUNT',
  props<{ readonly count: number }>(),
);

export const Action = union([
  // API Actions
  GetPhotos,
  FinishGetPhotos,
  UploadPhotos,
  FinishPostPhoto,
  FinishUploadPhotos,
  DeletePhoto,
  // In-state Actions
  UpdatePhotosInStore,
  SetPhotoTabType,
  SetCurrentPhotoId,
  SetUploadedPhotoCount,
  // Out-duck Actions
  OpenContentPagePopup,
  CloseContentPagePopup,
]);

export type Action = typeof Action;

interface GetPhotosResponse {
  readonly data: Array<T.APIPhoto>;
}

const APIToPhoto: (rawPhoto: T.APIPhoto) => T.Photo = (rawPhoto) => ({
  ...rawPhoto,
  takenAt: new Date(rawPhoto.takenAt),
  createdAt: new Date(rawPhoto.createdAt),
  updatedAt: new Date(rawPhoto.updatedAt),
});


const getPhotosEpic: Epic<Action, any, T.State> = (action$, state$) => action$.pipe(
  ofType(GetPhotos),
  mergeMap(({ projectId }) => {
    const URL: string = makeV2APIURL('projects', projectId, 'photos');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) return [ChangeAuthedUser({})];

    return ajax.get(URL, header).pipe(
      map(({ response }): GetPhotosResponse => response),
      map(({ data }) => data.map(APIToPhoto)),
      mergeMap((photos) => [
        UpdatePhotosInStore({ photos }),
        FinishGetPhotos(),
      ]),
    );
  }),
  catchError((e) => {
    Sentry.captureException(e);

    return [FinishGetPhotos()];
  }),
);

export const uploadPhotosEpic: Epic<Action, any, T.State> = (action$, state$) => action$.pipe(
  ofType(UploadPhotos),
  mergeMap(({ files }) => {
    const s: T.State = state$.value;
    const projectId: T.Project['id'] | undefined = currentProjectSelector(s)?.id;

    if (!projectId) return [];

    const URL: string = makeV2APIURL('projects', projectId, 'photos');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) return [ChangeAuthedUser({})];

    let finishedRequestCount: number = 0;
    let failedRequestCount: number = 0;

    const postPhotos$: Array<Observable<Action>> = files.map((file) => {
      const formData: FormData = new FormData();
      formData.append('image', file);

      return ajax.post(URL, formData, header).pipe(
        mergeMap(() => {
          finishedRequestCount++;

          return [SetUploadedPhotoCount({ count: finishedRequestCount + 1 }), FinishPostPhoto()];
        }),
        catchError((e) => {
          // eslint-disable-next-line no-console
          console.error(e);
          Sentry.captureException(e);

          finishedRequestCount++;
          failedRequestCount++;

          return [SetUploadedPhotoCount({ count: finishedRequestCount + 1 }), FinishPostPhoto()];
        }),
      );
    });

    const finishUploadPhotoAfterPostFinished$: Observable<Action> = action$.pipe(
      ofType(FinishPostPhoto),
      take(postPhotos$.length),
      mergeMap(() => {
        if (postPhotos$.length === finishedRequestCount) {
          if (failedRequestCount > 0) {
            return [
              GetPhotos({ projectId }),
              FinishUploadPhotos(),
              OpenContentPagePopup({ popup: T.ContentPagePopupType.PHOTO_UPLOAD_FAIL }),
            ];
          }

          return [
            GetPhotos({ projectId }),
            FinishUploadPhotos(),
            OpenContentPagePopup({ popup: T.ContentPagePopupType.PHOTO_UPLOAD_SUCCESS }),
          ];
        }

        return [];
      }),
    );

    return scheduled([
      ...postPhotos$,
      finishUploadPhotoAfterPostFinished$,
      [SetUploadedPhotoCount({ count: 1 })],
    ], queueScheduler).pipe(mergeAll());
  }),
);

const deletePhotoEpic: Epic<Action, any, T.State> = (action$, state$) => action$.pipe(
  ofType(DeletePhoto),
  mergeMap(({ photoId }) => {
    const s: T.State = state$.value;
    const photos: Array<T.Photo> = [...s.Photos.photos];
    const photoIdx: number = photos.findIndex((photo) => photo.id === photoId);

    const URL: string = makeV2APIURL('photos', photoId);
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    return scheduled([
      ajax.delete(URL, header).pipe(
        mergeMap(() => {
          const newPhotos: Array<T.Photo> = photos.filter((photo) => photo.id !== photoId);
          const actions: Array<Action> = [];
          if (newPhotos.length === 0) {
            actions.push(SetCurrentPhotoId({ photoId: undefined }));
          } else if (photoIdx !== 0 && photoIdx === newPhotos.length) {
            actions.push(SetCurrentPhotoId({ photoId: newPhotos[photoIdx - 1].id }));
          } else {
            actions.push(SetCurrentPhotoId({ photoId: newPhotos[photoIdx].id }));
          }

          actions.push(UpdatePhotosInStore({ photos: newPhotos }));
          actions.push(CloseContentPagePopup());

          return actions;
        }),
        catchError((e) => {
          Sentry.captureException(e);

          return [];
        }),
      ),
    ], queueScheduler).pipe(concatAll());
  }),
  catchError((e) => {
    Sentry.captureException(e);

    return [];
  }),
);

export const epic: Epic<Action, Action, T.State> = combineEpics(
  getPhotosEpic,
  uploadPhotosEpic,
  deletePhotoEpic,
);
// Redux reducer
const initialState: T.PhotosState = {
  photos: [],
  currentPhotoId: undefined,
  photoTab: T.PhotoTabType.TIME,
  uploadedPhotoCount: 0,
};

const reducer: Reducer<T.PhotosState> = (state = initialState, action: Action) => {
  switch (action.type) {
    case UpdatePhotosInStore.type:
      return {
        ...state,
        photos: action.photos,
      };
    case SetCurrentPhotoId.type:
      return {
        ...state,
        currentPhotoId: action.photoId,
      };
    case SetPhotoTabType.type:
      return {
        ...state,
        photoTab: action.tabType,
      };
    case SetUploadedPhotoCount.type:
      return {
        ...state,
        uploadedPhotoCount: action.count,
      };
    default:
      return state;
  }
};

export default reducer;
