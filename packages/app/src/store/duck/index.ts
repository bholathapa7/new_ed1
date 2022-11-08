import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { Reducer, combineReducers } from 'redux';
import { Epic, combineEpics } from 'redux-observable';

import { State } from '^/types';
import AttachmentsReducer, {
  Action as AttachmentAction, epic as AttachmentEpic,
} from './Attachments';
import AuthReducer, {
  Action as AuthAction, epic as AuthEpic,
} from './Auth';
import ContentsReducer, {
  Action as ContentsAction, epic as ContentsEpic,
} from './Contents';
import GroupReducer, {
  Action as GroupsAction, epic as GroupsEpic,
} from './Groups';
import ESSAttachmentsReducer, {
  Action as ESSAttachmentsAction, epic as ESSAttachmentsEpic,
} from './ESSAttachments';
import ESSContentsReducer, {
  Action as ESSContentsAction, epic as ESSContentsEpic,
} from './ESSContents';
import ESSModelsReducer, {
  Action as ESSModelsAction, epic as ESSModelsEpic,
} from './ESSModels';
import PagesReducer, {
  Action as PagesAction, rootEpic as PagesEpic,
} from './Pages';
import PermissionsReducer, {
  Action as PermissionsAction, epic as PermissionsEpic,
} from './Permissions';
import PhotosReducer, {
  Action as PhotosAction, epic as PhotosEpic,
} from './Photos';
import PlanConfigReducer, {
  Action as PlanConfigAction, epic as PlanConfigEpic,
} from './PlanConfig';
import ProjectConfigReducer, {
  Action as ProjectConfigAction, epic as ProjectConfigEpic,
} from './ProjectConfig';
import ProjectsReducer, {
  Action as ProjectsAction, epic as ProjectsEpic,
} from './Projects';
import SharedContentsReducer, {
  Action as SharedContentsAction, epic as SharedContentsEpic,
} from './SharedContents';
import UserConfigReducer, {
  Action as UserConfigAction, epic as UserConfigEpic,
} from './UserConfig';
import UsersReducer, {
  Action as UsersAction, epic as UsersEpic,
} from './Users';

/**
 * @todo implement screen API
 */
import ScreensReducer, {
  Action as ScreensAction, epic as ScreensEpic,
} from './Screens';

import {
  Action as PersistAction, epic as PersistEpic,
} from './persist';
import {
  Action as RouterAction, epic as RouterEpic,
} from './router';

export type RootAction =
  | AttachmentAction
  | AuthAction
  | ContentsAction
  | ScreensAction
  | PermissionsAction
  | ProjectsAction
  | SharedContentsAction
  | UsersAction
  | UserConfigAction
  | PlanConfigAction
  | ProjectConfigAction
  | PagesAction
  | PersistAction
  | RouterAction
  | PhotosAction
  | ESSModelsAction
  | ESSContentsAction
  | ESSAttachmentsAction
  | GroupsAction
  ;

export type RootEpic = Epic<RootAction, RootAction, State>;
export const rootEpic: RootEpic = combineEpics<RootEpic>(
  AttachmentEpic,
  AuthEpic,
  ContentsEpic,
  ScreensEpic,
  PermissionsEpic,
  ProjectsEpic,
  UsersEpic,
  UserConfigEpic,
  PlanConfigEpic,
  ProjectConfigEpic,
  PagesEpic,
  PersistEpic,
  RouterEpic,
  SharedContentsEpic,
  PhotosEpic,
  ESSModelsEpic,
  ESSContentsEpic,
  ESSAttachmentsEpic,
  GroupsEpic,
);

const createRootReducer: (history: History) => Reducer<State, RootAction> = (
  history,
) => combineReducers<State, RootAction>({
  Auth: AuthReducer,
  Contents: ContentsReducer,
  Attachments: AttachmentsReducer,
  Permissions: PermissionsReducer,
  Screens: ScreensReducer,
  Projects: ProjectsReducer,
  Users: UsersReducer,
  UserConfig: UserConfigReducer,
  PlanConfig: PlanConfigReducer,
  SharedContents: SharedContentsReducer,
  ProjectConfigPerUser: ProjectConfigReducer,
  Pages: PagesReducer,
  Photos: PhotosReducer,
  ESSModels: ESSModelsReducer,
  ESSContents: ESSContentsReducer,
  ESSAttachments: ESSAttachmentsReducer,
  Groups: GroupReducer,
  router: connectRouter(history),
});

export default createRootReducer;
