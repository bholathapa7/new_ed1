import { createLocation } from 'history';
import createMockStore, { MockStoreCreator, MockStoreEnhanced } from 'redux-mock-store';
import { action as makeAction, payload, union } from 'tsdux';

import * as T from '^/types';

import * as M from '^/store/Mock';

const mockStoreCreator: MockStoreCreator<any> = createMockStore<any>();

/**
 * @author Joon-Mo Yang <jmyang@angelswing.io>
 * @desc mock context creator for common page state
 */

export function mockCommonContext() {
  const commonStore = {
    Pages: {
      Common: M.mockCommonPage,
    },
  };

  return {
    store: (mockStoreCreator as MockStoreCreator<typeof commonStore>)(commonStore),
  };
}


export const UpdateLanguage = makeAction(
  'test/UPDATE_LANGUAGE',
  payload<T.Language>(),
);

export const Auth = makeAction(
  'test/AUTH',
);
export const Unauth = makeAction(
  'test/UNAUTH',
);

const Action = union([
  UpdateLanguage,
  Auth,
  Unauth,
]);
export type DDMMockAction = typeof Action;


export type DDMMockStore = MockStoreEnhanced<T.State>;

export const initialMockState: T.State = {
  Attachments: M.mockAttachments,
  Auth: M.mockAuth,
  Contents: M.mockContents,
  Screens: M.mockScreens,
  Pages: M.mockPages,
  Permissions: M.mockPermissions,
  Projects: M.mockProjects,
  SharedContents: M.mockSharedContents,
  Users: M.mockUsers,
  UserConfig: M.mockUserConfig,
  PlanConfig: M.mockPlanConfig,
  ESSModels: M.mockESSModels,
  ESSContents: M.mockESSContents,
  ESSAttachments: M.mockESSAttachments,
  ProjectConfigPerUser: M.mockProjectConfigPerUser,
  Photos: M.mockPhotos,
  Groups: M.mockGroups,
  router: {
    location: createLocation(''),
    action: 'PUSH',
  },
};

export const createDDMMockStore: (
  initialLanguage: T.Language,
) => DDMMockStore = (
  initialLanguage,
) => {
  const initialState: T.State = {
    ...initialMockState,
    Pages: {
      ...M.mockPages,
      Common: {
        ...M.mockCommonPage,
        language: initialLanguage,
      },
    },
    Permissions: M.mockPermissions,
    Projects: M.mockProjects,
    SharedContents: M.mockSharedContents,
    Users: M.mockUsers,
    router: {
      location: createLocation(''),
      action: 'PUSH',
    },
    ProjectConfigPerUser: {
      config: undefined,
      patchProjectConfigStatus: T.APIStatus.IDLE,
    },
    PlanConfig: M.mockPlanConfig,
  };

  return mockStoreCreator((
    actions: Array<DDMMockAction>,
  ) => actions.reduce((state, action) => {
    switch (action.type) {
      case UpdateLanguage.type:
        return {
          ...state,
          Pages: {
            ...state.Pages,
            Common: {
              ...state.Pages.Common,
              language: action.payload,
            },
          },
        };
      case Auth.type:
        return {
          ...state,
          Auth: {
            ...state.Auth,
            authedUser: {
              id: state.Users.users.allIds[0],
              token: 'random-test-token',
            },
          },
        };
      case Unauth.type:
        return {
          ...state,
          Auth: {
            ...state.Auth,
            authedUser: undefined,
          },
        };
      default:
        return state;
    }
  }, initialState));
};

/**
 * @desc common `afterEach` hook for mount testing
 */
export function commonAfterEach(): void {
  // @ts-ignore
  jest.clearAllTimers();
  // @ts-ignore
  jest.resetAllMocks();
}
