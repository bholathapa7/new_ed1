import _ from 'lodash-es';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { PatchPermission, UpdateConfirmDeletePermission } from '^/store/duck/Permissions';
import {
  Permission,
  PermissionRole,
  Project,
  ProjectPagePopupType,
  RestrictedUser,
  State,
} from '^/types';

import ProjectPermissionTable, { Props } from '^/components/organisms/ProjectPermissionTable';
import { OpenProjectPagePopup } from '^/store/duck/Pages';

type StatePropKeys = 'authedId' | 'authedRole' | 'permissions' | 'featurePermission';
type DispatchPropKeys = 'onDelete' | 'onPermissionChange' | 'onFeaturePermissionChange';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: (
  state: Pick<State, 'Auth' | 'Projects' | 'Permissions' | 'Users' | 'Pages'>,
) => StateProps = (
  { Auth, Projects, Permissions, Users, Pages },
) => {
  const currentProjectId: Project['id'] | undefined = Pages.Project.editingProjectId;
  if (currentProjectId !== undefined) {
    const rawPermission: Array<Permission> =
    _.values(Permissions.permissions.byId)
      .filter(
        (value) => value.projectId === currentProjectId,
      );
    return {
      authedId: (Auth.authedUser !== undefined ? Auth.authedUser.id : undefined),
      authedRole: Projects.projects.byId[currentProjectId].permissionRole,
      permissions: rawPermission.map((value): [RestrictedUser, Permission] => [
        Users.users.byId[value.userId],
        value,
      ]),
      featurePermission: Users.users.byId,
    };
  } else {
    return {
      authedRole: PermissionRole.VIEWER,
      permissions: [],
      featurePermission: {},
    };
  }
};

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onDelete(id: Permission['id'], hasPermission: boolean): void {
    if (!hasPermission) {
      dispatch(OpenProjectPagePopup({ popup: ProjectPagePopupType.NO_PERMISSION }));

      return;
    }

    dispatch(UpdateConfirmDeletePermission({ id }));
    dispatch(OpenProjectPagePopup({ popup: ProjectPagePopupType.CONFIRM_DELETE_PERMISSION }));
  },
  onPermissionChange(id: Permission['id'], role: PermissionRole, hasPermission: boolean): void {
    if (!hasPermission) {
      dispatch(OpenProjectPagePopup({ popup: ProjectPagePopupType.NO_PERMISSION }));
      return;
    }
    dispatch(PatchPermission({ id, role }));
  },
  onFeaturePermissionChange(id: Permission['id'], role: PermissionRole, isESS: boolean, hasPermission: boolean): void {
    if (!hasPermission) {
      dispatch(OpenProjectPagePopup({ popup: ProjectPagePopupType.NO_PERMISSION }));
      return;
    }
    dispatch(PatchPermission({ id, role, feature_ess: isESS }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectPermissionTable);
