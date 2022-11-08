import { sortBy } from 'lodash-es';
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

import * as T from '^/types';
import { catchError, map, mergeMap, take, takeUntil } from 'rxjs/operators';
import { FinishProps } from '../Utils';
import { AuthHeader, getRequestErrorType, jsonContentHeader, makeAuthHeader, makeV2APIURL } from './API';
import { ChangeCurrentContentTypeFromAnnotationPicker } from './Pages';

export const nameLanguageMapper: { [T.Language.EN_US]: 'nameEn'; [T.Language.KO_KR]: 'nameKo' } = {
  [T.Language.EN_US]: 'nameEn',
  [T.Language.KO_KR]: 'nameKo',
};

/**
 * Sort either the category or the instance of ESS by its name depending on the language,
 * since it would be easier for users to browse.
 */
const sortByLanguage: <K extends T.ESSModelInstance | T.ESSModelCategory>(
  members: Array<K>, language: T.Language,
) => Array<K> = (members, language) => sortBy(members, (member) => member[nameLanguageMapper[language]]);

interface GetAllESSModelsResponse {
  readonly response: {
    readonly data: T.ESSModelInstance[];
  };
}

interface GetESSModelResponse {
  readonly response: {
    readonly data: T.ESSModelInstance;
  };
}

interface GetESSModelCategoriesResponse {
  readonly response: {
    readonly data: T.ESSModelCategory[];
  };
}

export const GetESSModelsByCategory = makeAction(
  'ddm/ESSModels/GET_ESS_MODELS_BY_CATEGORY',
  props<{
    categoryId: T.ESSModelCategory['id'];
  }>(),
);
export const FinishGetESSModelsByCategory = makeAction(
  'ddm/ESSModels/FINISH_GET_ESS_MODELS_BY_CATEGORY',
  props<FinishProps>(),
);
export const CancelGetESSModelsByCategory = makeAction(
  'ddm/ESSModels/CANCEL_GET_ESS_MODELS_BY_CATEGORY',
);

export const GetESSModelById = makeAction(
  'ddm/ESSModels/GET_ESS_MODEL_BY_ID',
  props<{
    id: T.ESSModelInstance['id'];
  }>(),
);
export const FinishGetESSModelById = makeAction(
  'ddm/ESSModels/FINISH_GET_ESS_MODEL_BY_ID',
  props<FinishProps>(),
);
export const CancelGetESSModelById = makeAction(
  'ddm/ESSModels/CANCEL_GET_ESS_MODEL_BY_ID',
);

export const GetESSModelCategories = makeAction(
  'ddm/ESSModels/GET_ESS_MODEL_Categories',
);
export const FinishGetESSModelCategories = makeAction(
  'ddm/ESSModels/FINISH_GET_ESS_MODEL_CATEGORIES',
  props<FinishProps>(),
);
export const CancelGetESSModelCategories = makeAction(
  'ddm/ESSModels/CANCEL_GET_ESS_MODEL_CATEGORIES',
);

export const ChangeESSModels = makeAction(
  'ddm/ESSModels/CHANGE_ESS_MODELS',
  props<{
    byId?: T.ESSModelsState['byId'];
    byCategory?: T.ESSModelsState['byCategory'];
  }>(),
);

export const ChangeESSModel = makeAction(
  'ddm/ESSModels/CHANGE_ESS_MODEL',
  props<{
    instance: T.ESSModelInstance;
  }>(),
);
export const ChangeESSModelsByCategory = makeAction(
  'ddm/ESSModels/CHANGE_ESS_MODELS_BY_CATEGORY',
  props<{
    instances: T.ESSModelInstance[];
    categoryId: T.ESSModelCategory['id'];
  }>(),
);
export const ChangeESSModelCategories = makeAction(
  'ddm/ESSModels/CHANGE_ESS_MODEL_CATEGORIES',
  props<{
    categories: T.ESSModelCategory[];
  }>(),
);

export const ChangeSelectedESSCategoryId = makeAction(
  'ddm/ESSModels/CHANGE_SELECTED_ESS_CATEGORY_ID',
  props<{
    categoryId?: T.ESSModelCategory['id'];
  }>(),
);

export const ChangeSelectedESSModelId = makeAction(
  'ddm/ESSModels/CHANGE_SELECTED_ESS_MODEL_ID',
  props<{
    id?: T.ESSModelInstance['id'];
  }>(),
);

const Action = union([
  GetESSModelsByCategory,
  FinishGetESSModelsByCategory,
  CancelGetESSModelsByCategory,

  GetESSModelById,
  FinishGetESSModelById,
  CancelGetESSModelById,

  GetESSModelCategories,
  FinishGetESSModelCategories,
  CancelGetESSModelCategories,

  ChangeESSModels,
  ChangeESSModel,
  ChangeESSModelsByCategory,
  ChangeESSModelCategories,

  ChangeSelectedESSCategoryId,
  ChangeSelectedESSModelId,

  // Out-duck actions
  ChangeCurrentContentTypeFromAnnotationPicker,
]);

export type Action = typeof Action;

// Redux-Observable Epics
const getESSModelCategoriesEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetESSModelCategories),
  mergeMap(() => {
    // No need to request twice.
    if (state$.value.ESSModels.categories) {
      return [];
    }

    const URL: string = makeV2APIURL('ess_model_categories');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    return ajax.get(URL, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }: GetESSModelCategoriesResponse) => response?.data),
      map((categories) => ChangeESSModelCategories({
        categories: sortByLanguage(categories, state$.value.Pages.Common.language),
      })),
      (res$) => concat(res$, [FinishGetESSModelCategories({})]),
      catchError((ajaxError: AjaxError) => [
        FinishGetESSModelCategories({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelGetESSModelCategories),
        ),
      ),
    );
  }),
);

const getESSModelByIdEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetESSModelById),
  mergeMap(({ id }) => {
    const URL: string = makeV2APIURL('ess_models', id);
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    return ajax.get(URL, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }: GetESSModelResponse) => response?.data),
      mergeMap((instance) => ([ChangeESSModel({ instance })])),
      (res$) => concat(res$, [FinishGetESSModelById({})]),
      catchError((ajaxError: AjaxError) => [
        FinishGetESSModelById({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelGetESSModelById),
        ),
      ),
    );
  }),
);

const getESSModelsByCategoryEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetESSModelsByCategory),
  mergeMap(({ categoryId }) => {
    // Update the selected category beforehand, because
    // user doesn't need to wait until the request is completed.
    // It should just show a loading UI instead.
    const baseActions: Action[] = [
      ChangeSelectedESSModelId({}),
      ChangeSelectedESSCategoryId({ categoryId }),
    ];

    // Skip the request if the category for this id has been loaded before.
    if (state$.value.ESSModels.byCategory?.[categoryId] !== undefined) {
      return baseActions;
    }

    const URL: string = makeV2APIURL('ess_model_categories', categoryId, 'ess_models');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    return concat(
      baseActions,
      ajax.get(URL, {
        ...header,
        ...jsonContentHeader,
      }).pipe(
        map(({ response }: GetAllESSModelsResponse) => response?.data),
        mergeMap((instances) => [
          ChangeESSModelsByCategory({
            categoryId,
            instances: sortByLanguage(instances, state$.value.Pages.Common.language),
          }),
        ]),
        (res$) => concat(res$, [FinishGetESSModelsByCategory({})]),
        catchError((ajaxError: AjaxError) => [
          FinishGetESSModelsByCategory({ error: getRequestErrorType(ajaxError) }),
        ]),
        takeUntil(
          action$.pipe(
            ofType(CancelGetESSModelsByCategory),
          ),
        ),
      ),
    );
  }),
);

/**
 * Typically user clicks a category and it loads the models.
 * When it's the first time load, no category clicks involved,
 * therefore the first category models should be loaded by default.
 */
const loadFirstESSCategoryModelsEpic: Epic<Action, Action, T.State> = (
  action$,
) => action$.pipe(
  ofType(ChangeESSModelCategories),
  take(1),
  mergeMap(({ categories }) => {
    if (categories.length === 0) {
      return [];
    }

    return [GetESSModelsByCategory({ categoryId: categories[0].id })];
  }),
);

/**
 * Due to how ESS models and the rest of the annotations are
 * both content-creating interactions and they can't coexist,
 * when one is active, the other has to be deactivated.
 */
const changeSelectedESSModelIdEpic: Epic<Action, Action, T.State> = (
  action$,
) => action$.pipe(
  ofType(ChangeSelectedESSModelId),
  mergeMap(({ id }) => {
    if (id !== undefined) {
      return [ChangeCurrentContentTypeFromAnnotationPicker({})];
    }

    return [];
  }),
);

export const epic: Epic<Action, Action, T.State> = combineEpics(
  getESSModelsByCategoryEpic,
  getESSModelByIdEpic,
  getESSModelCategoriesEpic,
  loadFirstESSCategoryModelsEpic,
  changeSelectedESSModelIdEpic,
);

const initialState: T.ESSModelsState = {
  byId: {},
  byCategory: undefined,
  categories: undefined,
  selectedCategoryId: undefined,
  selectedModelId: undefined,
  getESSModelsByCategoryStatus: T.APIStatus.IDLE,
  getESSModelByIdStatus: T.APIStatus.IDLE,
  getESSModelCategoriesStatus: T.APIStatus.IDLE,
};

const reducer: Reducer<T.ESSModelsState> = (state = initialState, action: Action) => {
  switch (action.type) {
    case GetESSModelsByCategory.type:
      return {
        ...state,
        GetESSModelsByCategoryStatus: T.APIStatus.PROGRESS,
      };
    case FinishGetESSModelsByCategory.type:
      return {
        ...state,
        GetESSModelsByCategoryStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        GetESSModelsByCategoryError: action.error,
      };
    case CancelGetESSModelsByCategory.type:
      return {
        ...state,
        GetESSModelsByCategoryStatus: T.APIStatus.IDLE,
      };

    case GetESSModelById.type:
      return {
        ...state,
        GetESSModelByIdStatus: T.APIStatus.PROGRESS,
      };
    case FinishGetESSModelById.type:
      return {
        ...state,
        GetESSModelByIdStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        GetESSModelByIdError: action.error,
      };
    case CancelGetESSModelById.type:
      return {
        ...state,
        GetESSModelByIdStatus: T.APIStatus.IDLE,
      };

    case GetESSModelCategories.type:
      return {
        ...state,
        getESSModelCategoriesStatus: T.APIStatus.PROGRESS,
      };
    case FinishGetESSModelCategories.type:
      return {
        ...state,
        getESSModelCategoriesStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        getESSModelCategoriesError: action.error,
      };
    case CancelGetESSModelCategories.type:
      return {
        ...state,
        getESSModelCategoriesStatus: T.APIStatus.IDLE,
      };

    case ChangeESSModels.type:
      return {
        ...state,
        byCategory: action.byCategory ?? state.byCategory,
        byId: action.byId ?? state.byId,
      };
    case ChangeESSModel.type:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.instance.id]: action.instance,
        },
      };
    case ChangeESSModelsByCategory.type:
      const byId: NonNullable<T.ESSModelsState['byId']> = action.instances
        .reduce<NonNullable<T.ESSModelsState['byId']>>((acc, instance) => {
          if (acc[instance.id] === undefined) {
            acc[instance.id] = instance;
          }

          return acc;
        }, state.byId ?? {});

      return {
        ...state,
        byId,
        byCategory: {
          ...state.byCategory,
          [action.categoryId]: action.instances.map((instance) => instance.id),
        },
      };
    case ChangeESSModelCategories.type:
      return {
        ...state,
        categories: action.categories,
      };
    case ChangeSelectedESSCategoryId.type:
      return {
        ...state,
        selectedCategoryId: action.categoryId,
      };
    case ChangeSelectedESSModelId.type:
      return {
        ...state,
        selectedModelId: action.id,
      };
    default:
      return state;
  }
};

export default reducer;
