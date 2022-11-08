import { contentsSelector } from '^/store/duck/Contents';
import * as T from '^/types';

export const getSingleContentId: (
  Contents: T.State['Contents'],
  Pages: T.State['Pages'],
  ProjectConfig: T.State['ProjectConfigPerUser'],
  contentType: T.ContentType,
) => T.Content['id'] | undefined = (
  Contents, Pages, ProjectConfig, contentType,
) => {
  const projectId: T.Project['id'] | undefined = Pages.Contents.projectId;
  const lastSelectedScreenId: T.Screen['id'] | undefined = ProjectConfig.config?.lastSelectedScreenId;

  if (projectId === undefined) return;
  if (lastSelectedScreenId === undefined) return;

  return Contents.contents.allIds.find((contentId) => {
    const content: T.Content = Contents.contents.byId[contentId];

    if (content.screenId === undefined) return;

    return (content.type === contentType) && (content.screenId === lastSelectedScreenId);
  });
};

/**
 * Returns either 3D mesh or 3D ortho id that isn't failing or processing.
 * 3D mesh takes precedence because it has a better quality than 3D ortho.
 */
export const getViewableThreeDContentId: (
  Contents: T.State['Contents'],
  Pages: T.State['Pages'],
  ProjectConfig: T.State['ProjectConfigPerUser'],
) => T.ThreeDMeshContent['id'] | T.ThreeDOrthoContent['id'] | undefined = (
  Contents, Pages, ProjectConfig,
) => {
  const threeDMeshId: T.ThreeDMeshContent['id'] | undefined = getSingleContentId(
    Contents, Pages, ProjectConfig, T.ContentType.THREE_D_MESH,
  );

  const threeDOrthoId: T.ThreeDMeshContent['id'] | undefined = getSingleContentId(
    Contents, Pages, ProjectConfig, T.ContentType.THREE_D_ORTHO,
  );

  if (threeDMeshId && !contentsSelector.isProcessingOrFailed(Contents)(threeDMeshId)) {
    return threeDMeshId;
  }

  if (threeDOrthoId && !contentsSelector.isProcessingOrFailed(Contents)(threeDOrthoId)) {
    return threeDOrthoId;
  }

  return undefined;
};

export const getRole: (
  Projects: T.ProjectsState,
  Contents: T.ContentsPageState,
) => T.PermissionRole = (
  Projects,
  Contents,
) => {
  const projectId: T.Project['id'] | undefined = Contents.projectId;
  const project: T.Project | undefined = projectId ? Projects.projects.byId[projectId] : undefined;

  return project ? project.permissionRole : T.PermissionRole.VIEWER;
};
