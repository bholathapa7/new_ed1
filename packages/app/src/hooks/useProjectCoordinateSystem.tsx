import * as T from '^/types';
import { defaultCoordinateSystem } from '^/utilities/coordinate-util';
import { useSelector } from 'react-redux';

export const getCoordinateSystem: (param: {
  Projects: T.ProjectsState;
  Pages: T.PagesState;
}) => T.ProjectionEnum = ({
  Projects, Pages,
}) => {
  const projectId: T.Project['id'] | undefined = Pages.Contents.projectId;

  if (projectId === undefined) {
    return defaultCoordinateSystem;
  }

  const coordinateSystem: T.ProjectionEnum | undefined
    = Projects.projects.byId[projectId].coordinateSystem;

  if (coordinateSystem === undefined) {
    return defaultCoordinateSystem;
  }

  return coordinateSystem;
};

export function useProjectCoordinateSystem(): T.ProjectionEnum {
  return useSelector(({ Projects, Pages }: T.State) => getCoordinateSystem({ Projects, Pages }));
}
