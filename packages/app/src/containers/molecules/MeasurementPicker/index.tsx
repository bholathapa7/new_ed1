import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {
  ChangeCreatingVolume,
  ChangeCurrentContentTypeFromAnnotationPicker,
  ChangeElevationExpansionStatus,
  OpenContentPageMapPopup,
  OpenContentPagePopup,
} from '^/store/duck/Pages/Content';
import * as T from '^/types';

import MeasurementPicker, { OnMeasurementContentTypeSelectParamType, Props } from '^/components/molecules/MeasurementPicker';

import { contentsSelector } from '^/store/duck/Contents';
import { isRoleViewer } from '^/utilities/role-permission-check';
import { getRole, getSingleContentId } from '^/utilities/state-util';
import { DEFAULT_USER_FEATURE_PERMISSION } from '^/utilities/withFeatureToggle';

type StatePropKeys =
  'role' | 'currentMeasurementType' | 'dsmContentId' | 'isDesignDxfExist'
  | 'isAvailableSBVC' | 'isIn3D' | 'shouldShowESSWorkTool' | 'userFeaturePermission';
type DispatchPropKeys = 'onMeasurementContentTypeSelect';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: (
  state: Pick<T.State, 'Contents' | 'ProjectConfigPerUser' | 'Projects' | 'Pages' | 'Auth' | 'Users'>,
) => StateProps = (
  { Contents, ProjectConfigPerUser, Projects, Pages, Auth, Users },
) => {
  const designDxfContents: Array<T.Content> =
    Contents.contents.allIds
      .map((id) => Contents.contents.byId[id])
      .filter((content) => content.type === T.ContentType.DESIGN_DXF && !contentsSelector.isProcessingOrFailedByContent(content));
  const dsmContents: Array<T.Content> =
    Contents.contents.allIds
      .map((id) => Contents.contents.byId[id])
      .filter((content) => content.type === T.ContentType.DSM && !contentsSelector.isProcessingOrFailedByContent(content));

  // Users should only be able to create the arrow
  // when the tab is selected, but they should still
  // be able to view it when they're in 3D. Also if the role matches.
  const shouldShowESSWorkTool: boolean = !isRoleViewer(getRole(Projects, Pages.Contents)) &&
    Pages.Contents.sidebarTab === T.ContentPageTabType.ESS;

  const userFeaturePermission: T.User['featurePermission'] = Auth.authedUser?.id !== undefined
    ? Users.users.byId[Auth.authedUser.id].featurePermission
    : DEFAULT_USER_FEATURE_PERMISSION;

  return {
    role: (
      (
        Pages.Contents.projectId !== undefined &&
        Projects.projects.allIds.includes(Pages.Contents.projectId)
      ) ?
        Projects.projects.byId[Pages.Contents.projectId].permissionRole :
        T.PermissionRole.VIEWER
    ),
    currentMeasurementType: Pages.Contents.currentContentTypeFromAnnotationPicker,
    dsmContentId: getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.DSM),
    isDesignDxfExist: designDxfContents.length > 0,
    isAvailableSBVC: dsmContents.length > 1,
    isIn3D: Pages.Contents.in3D,
    shouldShowESSWorkTool,
    userFeaturePermission,
  };
};

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onMeasurementContentTypeSelect(param: OnMeasurementContentTypeSelectParamType): void {
    const { type, mapPopupType, volumeType }: OnMeasurementContentTypeSelectParamType = param;
    if (isRoleViewer(param.role)) {
      dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));

      return;
    }
    switch (type) {
      case T.ContentType.VOLUME:
        dispatch(ChangeCreatingVolume({ info: { type: volumeType } }));
        dispatch(ChangeCurrentContentTypeFromAnnotationPicker({ currentContentTypeFromAnnotationPicker: type }));
        if (mapPopupType !== undefined) {
          dispatch(OpenContentPageMapPopup({ popupType: mapPopupType }));
        }
        break;
      case undefined:
        dispatch(ChangeCurrentContentTypeFromAnnotationPicker({}));
        break;
      default:
        dispatch(ChangeCurrentContentTypeFromAnnotationPicker({ currentContentTypeFromAnnotationPicker: type }));
    }
    dispatch(ChangeElevationExpansionStatus({ open: false }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementPicker);
