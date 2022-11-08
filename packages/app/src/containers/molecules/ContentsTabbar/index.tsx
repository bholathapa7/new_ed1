import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import route from '^/constants/routes';

import { ChangeContentsSidebarTab, OpenContentPagePopup, SetPreventAutoSelect } from '^/store/duck/Pages';
import * as T from '^/types';

import ContentsTabbar, { Props } from '^/components/molecules/ContentsTabbar';
import { isAllowToUpload } from '^/utilities/role-permission-check';
import { getViewableThreeDContentId } from '^/utilities/state-util';
import { DEFAULT_USER_FEATURE_PERMISSION } from '^/utilities/withFeatureToggle';
import { defaultFeatures } from '^/constants/defaultContent';

type StatePropKeys = 'currentTab' | 'role' | 'printingContentId' | 'squareLogoUrl' | 'has3DView' | 'userFeaturePermission' | 'features';
type DispatchPropKeys = 'onTabClick' | 'onUploadClick' | 'onLogoClick' | 'preventAutoSelect';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: (
  state: Pick<T.State, 'Pages' | 'Projects' | 'PlanConfig' | 'Contents' | 'ProjectConfigPerUser' | 'Auth' | 'Users'>,
) => StateProps = (
  { Pages, Projects, PlanConfig, Contents, ProjectConfigPerUser, Auth, Users },
) => {
  const projectId: number | undefined = Pages.Contents.projectId;
  const role: T.PermissionRole = projectId && Projects.projects.allIds.includes(projectId)
    ? Projects.projects.byId[projectId].permissionRole
    : T.PermissionRole.VIEWER;

  const features: T.PermissionFeature = projectId && Projects.projects.allIds.includes(projectId)
    ? Projects.projects.byId[projectId].features : defaultFeatures;

  const userFeaturePermission: T.User['featurePermission'] = Auth.authedUser?.id !== undefined
    ? Users.users.byId[Auth.authedUser.id].featurePermission
    : DEFAULT_USER_FEATURE_PERMISSION;

  return {
    role,
    currentTab: Pages.Contents.sidebarTab,
    printingContentId: Pages.Contents.printingContentId,
    squareLogoUrl: PlanConfig.config?.squareLogoUrl,
    has3DView: !!getViewableThreeDContentId(Contents, Pages, ProjectConfigPerUser),
    userFeaturePermission,
    features,
  };
};

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onTabClick(sidebarTab: T.ContentPageTabType): void {
    dispatch(ChangeContentsSidebarTab({ sidebarTab }));
  },
  onUploadClick(role: T.PermissionRole): void {
    dispatch(OpenContentPagePopup({
      popup: isAllowToUpload(role) ?
        T.ContentPagePopupType.UPLOAD :
        T.ContentPagePopupType.NO_PERMISSION,
    }));
  },
  onLogoClick(): void {
    dispatch(push(route.project.main));
  },
  preventAutoSelect(): void {
    dispatch(SetPreventAutoSelect({
      value: true,
    }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ContentsTabbar);
