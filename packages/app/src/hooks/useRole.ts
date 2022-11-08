import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import * as T from '^/types';
import { IsRoleFunction } from '^/utilities/role-permission-check';

export const useRole: () => T.PermissionRole = () => useSelector(({ Projects, Pages }: T.State) => {
  const projectId: number | undefined = Pages.Contents.projectId;

  return projectId !== undefined && Projects.projects.allIds.includes(projectId) ?
    Projects.projects.byId[projectId].permissionRole :
    T.PermissionRole.VIEWER;
});

export const useIsRoleX: (isRoleFunction: IsRoleFunction) => boolean = (isRoleFunction) => {
  const role: T.PermissionRole = useRole();

  return useMemo(() => isRoleFunction(role), [role]);
};
