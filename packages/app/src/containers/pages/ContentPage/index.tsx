import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import ContentPage, { Props } from '^/components/pages/ContentPage';
import { default3DOption } from '^/constants/defaultContent';
import { makeAuthHeader } from '^/store/duck/API';
import { tabToContent } from '^/store/duck/Pages/Content';
import { GetNotice } from '^/store/duck/Users';
import * as T from '^/types';
import { getSingleContentId } from '^/utilities/state-util';

type StatePropKeys =
  | 'in3D'
  | 'in3DPointCloud'
  | 'currentPointCloudEngine'
  | 'popup'
  | 'isBlueprintAligning'
  | 'isSidebarOpened'
  | 'isInContentsEventLogTable'
  | 'twoDDisplayMode'
  | 'getInitialContentsStatus'
  | 'getScreensStatus'
  | 'printingContentId'
  | 'getLonLatOn2D3DToggleStatus'
  | 'authHeader'
  | 'isLengthContent'
  | 'pointCloudNumberOfPointsInMil'
  | 'pointCloudSizeOfPoint'
  | 'isTopbarOpened'
  | 'contentsInCurrentTab'
  | 'currentScreen'
  | 'currentProject'
  | 'lang'
  | 'isTopbarShown'
  | 'getProjectStatus'
  | 'getProjectError'
;
type DispatchPropKeys =
  | 'getNotice'
;
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: (
  state: Pick<T.State, 'Contents' | 'Pages' | 'Auth' | 'ProjectConfigPerUser' | 'Screens' | 'Projects' | 'PlanConfig'>,
) => StateProps = (
  { Contents, Pages, Auth, ProjectConfigPerUser, Screens, Projects, PlanConfig },
) => {
  const editingContentId: T.Content['id'] | undefined = Pages.Contents.editingContentId ;
  const isLengthContent: boolean = editingContentId ? Contents.contents.byId[editingContentId].type === T.ContentType.LENGTH : false;
  const pointCloudContentId: T.PointCloudContent['id'] | undefined = getSingleContentId(
    Contents, Pages, ProjectConfigPerUser, T.ContentType.POINTCLOUD,
  );
  const pointCloudContent: T.PointCloudContent | undefined = pointCloudContentId !== undefined ?
    Contents.contents.byId[pointCloudContentId] as T.PointCloudContent : undefined;

  const contentsInCurrentTab: Array<T.Content> = Contents.contents.allIds.map((id: number) => Contents.contents.byId[id]).filter(
    (content) => tabToContent[T.ContentPageTabType.MEASUREMENT].includes(content.type),
  );

  const lastScreenId: number | undefined = ProjectConfigPerUser.config?.lastSelectedScreenId;
  const currentScreen: T.Screen | undefined = Screens.screens.find((screen) => screen.id === lastScreenId);
  const projectConfig: T.ProjectConfig | undefined = ProjectConfigPerUser.config;
  const projectById: T.ProjectsState['projects']['byId'] = Projects.projects.byId;
  const currentProject: T.Project | undefined = projectConfig ? projectById[projectConfig?.projectId] : undefined;

  return {
    in3D: Pages.Contents.in3D,
    in3DPointCloud: Pages.Contents.in3DPointCloud,
    currentPointCloudEngine: Pages.Contents.currentPointCloudEngine,
    isBlueprintAligning:
      Pages.Contents.editingContentId !== undefined &&
      Contents.contents.byId[Pages.Contents.editingContentId].type === T.ContentType.BLUEPRINT_PDF &&
      Pages.Contents.aligningBlueprintId === Pages.Contents.editingContentId,
    isSidebarOpened: Pages.Contents.showSidebar,
    isTopbarOpened: Pages.Contents.isTopbarShown,
    isInContentsEventLogTable: Pages.Contents.isInContentsEventLogTable,
    popup: Pages.Contents.popup ? Pages.Contents.popup.type : undefined,
    twoDDisplayMode: Pages.Contents.twoDDisplayMode,
    printingContentId: Pages.Contents.printingContentId,
    getInitialContentsStatus: Contents.getInitialContentsStatus,
    getScreensStatus: Screens.getScreensStatus,
    getLonLatOn2D3DToggleStatus: Pages.Contents.getLonLatOn2D3DToggleStatus,
    authHeader: makeAuthHeader(Auth, PlanConfig.config?.slug),
    isLengthContent,
    pointCloudNumberOfPointsInMil: pointCloudContent?.config?.points?.numberOfPointsInMil !== undefined ?
      pointCloudContent?.config?.points.numberOfPointsInMil : default3DOption.pointNumber,
    pointCloudSizeOfPoint: pointCloudContent?.config?.points?.sizeOfPoint !== undefined ?
      pointCloudContent?.config?.points.sizeOfPoint : default3DOption.pointSize,
    contentsInCurrentTab,
    currentScreen,
    currentProject,
    lang: Pages.Common.language,
    sidebarTab: Pages.Contents.sidebarTab,
    isTopbarShown: Pages.Contents.isTopbarShown,
    getProjectStatus: Projects.getProjectStatus,
    getProjectError: Projects.getProjectError,
  };
};


export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  getNotice(): void {
    dispatch(GetNotice());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ContentPage);
