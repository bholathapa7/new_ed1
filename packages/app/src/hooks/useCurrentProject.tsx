import { useSelector } from 'react-redux';

import * as T from '^/types';

export function currentProjectSelector(s: T.State): T.Project | undefined {
  const projectId: number | undefined = s.ProjectConfigPerUser.config?.projectId;

  if (projectId === undefined || !s.Projects.projects.allIds.includes(projectId)) return;

  return s.Projects.projects.byId[projectId];
}

export type UseCurrentProject = T.Project | undefined;
export function useCurrentProject(): UseCurrentProject {
  return useSelector(currentProjectSelector);
}
