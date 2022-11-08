import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { OpenProjectPagePopup } from '^/store/duck/Pages/Project';
import * as T from '^/types';

import ProjectListTab, { Props } from '^/components/organisms/ProjectListTab';

import route from '^/constants/routes';

type StatePropKeys = 'projects' | 'timezoneOffset' | 'userId';
type DispatchPropKeys = 'onProjectClick' | 'onSettingClick' | 'openPopup';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: (
  state: Pick<T.State, 'Auth' | 'Projects' | 'Pages'>,
) => StateProps = (
  { Auth, Projects, Pages },
) => ({
  projects: Projects.projects.allIds.map((id) => Projects.projects.byId[id]),
  timezoneOffset: Pages.Common.timezoneOffset,
  userId: Auth.authedUser?.id,
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onProjectClick(project: T.Project): void {
    dispatch(push(route.content.createMain(project.id)));
  },
  onSettingClick(project: T.Project): void {
    dispatch(push(route.project.createManage(project.id)));
  },
  openPopup(popup: T.ProjectPagePopupType): void {
    dispatch(OpenProjectPagePopup({ popup }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectListTab);
