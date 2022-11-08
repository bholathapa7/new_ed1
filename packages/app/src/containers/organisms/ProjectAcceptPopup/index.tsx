import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import routes from '^/constants/routes';
import { CloseProjectPagePopup } from '^/store/duck/Pages';
import { AcceptStatus, State } from '^/types';

import ProjectAcceptPopup, { Props } from '^/components/organisms/ProjectAcceptPopup';

type StatePropsKey = 'projects';
type DispatchPropsKey = 'onClose' | 'onDecide';
export type OwnProps = Omit<Props, StatePropsKey | DispatchPropsKey>;
export type StateProps = Pick<Props, StatePropsKey>;
export type DispatchProps = Pick<Props, DispatchPropsKey>;

export const mapStateToProps: (
  state: Pick<State, 'Projects'>,
) => StateProps = (
  { Projects },
) => ({
  projects: Projects.projects.allIds
    .map((id) => Projects.projects.byId[id])
    .filter(({ permissionStatus }) => permissionStatus === AcceptStatus.PENDING),
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onClose(): void {
    dispatch(CloseProjectPagePopup());
  },
  onDecide(projectId: number): void {
    dispatch(push(routes.content.createMain(projectId)));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectAcceptPopup);
