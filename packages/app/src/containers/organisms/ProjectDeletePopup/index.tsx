import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { CloseProjectPagePopup } from '^/store/duck/Pages';
import { CancelDeleteProject, DeleteProject } from '^/store/duck/Projects';
import * as T from '^/types';

import route from '^/constants/routes';

import ProjectDeletePopup, { Props } from '^/components/organisms/ProjectDeletePopup';

type StatePropsKey = 'project' | 'deleteStatus';
type DispatchPropsKey = 'onClose' | 'onSubmit' | 'onSuccess' | 'resetAPIStatus';
export type OwnProps = Omit<Props, StatePropsKey | DispatchPropsKey>;
export type StateProps = Pick<Props, StatePropsKey>;
export type DispatchProps = Pick<Props, DispatchPropsKey>;

export const mapStateToProps: (
  state: Pick<T.State, 'Projects' | 'Pages'>,
) => StateProps = (
  { Projects, Pages },
) => ({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  project: Projects.projects.byId[Pages.Project.editingProjectId!],
  deleteStatus: Projects.deleteProjectStatus,
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onClose(): void {
    dispatch(CloseProjectPagePopup());
  },
  onSubmit(projectId: number, password: string): void {
    dispatch(DeleteProject({ projectId, password }));
  },
  onSuccess(): void {
    dispatch(CloseProjectPagePopup());
    dispatch(push(route.project.main));
  },
  resetAPIStatus(): void {
    dispatch(CancelDeleteProject());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDeletePopup);
