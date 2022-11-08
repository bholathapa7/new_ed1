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
import { catchError, map, mergeMap, takeUntil } from 'rxjs/operators';
import { FinishProps } from '../Utils';
import { AuthHeader, getRequestErrorType, jsonContentHeader, makeAuthHeader, makeV2APIURL } from './API';
import { updatePrimaryColor } from '^/constants/ds-palette';

interface GetPlanConfigResponse {
  readonly response: {
    readonly data?: {
      slug?: T.PlanConfig['slug'];
      companyName?: T.PlanConfig['companyName'];
      planConfig: Pick<T.PlanConfig, 'bgUrl' | 'logoUrl' | 'navbarLogoUrl' | 'primaryColor' | 'squareLogoUrl'> | null;
    } | null;
  } | null;
}

const APIToPlanConfig: (data: NonNullable<GetPlanConfigResponse['response']>['data']) => T.PlanConfig | undefined = (
  data,
) => {
  if (data === undefined || data === null) {
    return undefined;
  }

  const basePlanConfig: Partial<T.PlanConfig> = {
    slug: data.slug,
    companyName: data.companyName,
  };

  if (data.planConfig === null) {
    return basePlanConfig;
  }

  return {
    ...data.planConfig,
    slug: data.slug,
    companyName: data.companyName,
  };
};


export const GetPlanConfig = makeAction(
  'ddm/planConfig/GET_PLAN_CONFIG',
  props<{
    slug?: T.PlanConfig['slug'];
  }>(),
);
export const FinishGetPlanConfig = makeAction(
  'ddm/planConfig/FINISH_GET_PLAN_CONFIG',
  props<FinishProps>(),
);
export const CancelGetPlanConfig = makeAction(
  'ddm/planConfig/CANCEL_GET_PLAN_CONFIG',
);

export const ChangePlanConfig = makeAction(
  'ddm/planConfig/CHANGE_PLAN_CONFIG',
  props<{
    config?: T.PlanConfig;
  }>(),
);

export const ChangePrimaryColor = makeAction(
  'ddm/planConfig/CHANGE_PRIMARY_COLOR',
  props<{ color?: string }>(),
);


const Action = union([
  GetPlanConfig,
  FinishGetPlanConfig,
  CancelGetPlanConfig,

  ChangePlanConfig,
  ChangePrimaryColor,
]);

export type Action = typeof Action;


const defaultPlanConfig: T.PlanConfig = {
  slug: '',
  companyName: '',
  logoUrl: '',
  bgUrl: '',
  navbarLogoUrl: '',
  squareLogoUrl: '',
  primaryColor: undefined,
};

export const ESSPlanConfig: T.PlanConfig = {
  slug: process.env.ESS_FEATURE_SLUG,
  companyName: process.env.ESS_COMPANY_NAME,
  logoUrl: process.env.ESS_LOGO_URL,
  bgUrl: process.env.ESS_BG_URL,
  navbarLogoUrl: process.env.ESS_NAVBAR_LOGO_URL,
  squareLogoUrl: process.env.ESS_SQUARE_LOGO_URL,
  primaryColor: process.env.ESS_PRIMARY_COLOR,
};

const overridenSlug = !!process.env.SLUG ? process.env.SLUG : undefined;

// Redux-Observable Epics
const getPlanConfigEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetPlanConfig),
  mergeMap(({ slug }) => {
    const currentSlug = overridenSlug ?? slug;

    // No slug means this is a user without a customization.
    // Simply return the default plan config.
    if (!currentSlug) {
      return [
        ChangePlanConfig({ config: defaultPlanConfig }),
        FinishGetPlanConfig({}),
      ];
    }

    // ESS needs customization. Use the customization
    // whenever the subdomain matches.
    if (currentSlug === ESSPlanConfig.slug) {
      return [
        ChangePlanConfig({ config: ESSPlanConfig }),
        FinishGetPlanConfig({}),
      ];
    }

    const URL: string = makeV2APIURL('plans', 'custom-login', currentSlug);
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    return ajax.get(URL, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }: GetPlanConfigResponse) => response?.data),
      map(APIToPlanConfig),
      // This fallback makes sense because BE returns null
      // instead of throwing an error if there's no plan config.
      // Therefore, set the default plan config instead.
      map((configResponse) => {
        const config: T.PlanConfig = configResponse ?? defaultPlanConfig;

        // TODO-COLORS: Remove this line since it's only for testing.
        // It should only follow the response instead.
        const color = config.primaryColor ?? state$.value.PlanConfig?.config?.primaryColor;
        updatePrimaryColor(color);

        return ChangePlanConfig({ config: { ...config, primaryColor: color } });
      }),
      (res$) => concat(res$, [FinishGetPlanConfig({})]),
      catchError((ajaxError: AjaxError) => [
        FinishGetPlanConfig({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelGetPlanConfig),
        ),
      ),
    );
  }),
);

export const epic: Epic<Action, Action, T.State> = combineEpics(
  getPlanConfigEpic,
);

const initialState: T.PlanConfigState = {
  config: undefined,
  getPlanConfigStatus: T.APIStatus.IDLE,
};

const reducer: Reducer<T.PlanConfigState> = (state = initialState, action: Action) => {
  switch (action.type) {
    case GetPlanConfig.type:
      return {
        ...state,
        getPlanConfigStatus: T.APIStatus.PROGRESS,
      };
    case FinishGetPlanConfig.type:
      return {
        ...state,
        getPlanConfigStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        getPlanConfigError: action.error,
      };
    case CancelGetPlanConfig.type:
      return {
        ...state,
        getPlanConfigStatus: T.APIStatus.IDLE,
      };
    case ChangePlanConfig.type:
      return {
        ...state,
        config: action.config,
      };
    case ChangePrimaryColor.type:
      if (state.config === undefined) {
        return state;
      }

      return {
        ...state,
        config: {
          ...state.config,
          primaryColor: action.color,
        },
      };
    default:
      return state;
  }
};

export default reducer;
