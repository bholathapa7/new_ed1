import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { OpenProjectPagePopup } from '^/store/duck/Pages';
import { GetPermission } from '^/store/duck/Permissions';
import { PatchProject } from '^/store/duck/Projects';
import * as T from '^/types';

import ProjectManageTab, { Props } from '^/components/organisms/ProjectManageTab';
import { isMarker } from '^/hooks';
import { ChangeAuthedUser } from '^/store/duck/Auth';
import { PatchContent } from '^/store/duck/Contents';
import { getEPSGfromProjectionLabel } from '^/utilities/coordinate-util';
import proj4 from 'proj4';

type StatePropsKey = 'project' | 'patchStatus' | 'timezoneOffset' | 'auth' | 'slug';
type DispatchPropsKey = 'onDeleteClick' | 'onShareClick' | 'onSubmit' | 'updateCoordinates' | 'fetchPermission' |
  'displayNoPermissionPopup' | 'changeAuthedUser';
export type OwnProps = Omit<Props, StatePropsKey | DispatchPropsKey>;
export type StateProps = Pick<Props, StatePropsKey>;
export type DispatchProps = Pick<Props, DispatchPropsKey>;

export const mapStateToProps: (
  state: Pick<T.State, 'Projects' | 'Pages' | 'Auth' | 'PlanConfig'>,
) => StateProps = (
  { Projects, Pages, Auth, PlanConfig },
) => ({
  patchStatus: Projects.patchProjectStatus,
  timezoneOffset: Pages.Common.timezoneOffset,
  project: (
    Pages.Project.editingProjectId !== undefined ?
      Projects.projects.byId[Pages.Project.editingProjectId] :
      undefined
  ),
  auth: Auth,
  slug: PlanConfig.config?.slug,
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onDeleteClick(): void {
    dispatch(OpenProjectPagePopup({ popup: T.ProjectPagePopupType.DELETE }));
  },
  onShareClick(): void {
    dispatch(OpenProjectPagePopup({ popup: T.ProjectPagePopupType.SHARE }));
  },
  onSubmit(
    id: number, title: string, description: string,
    coordinateSystem?: T.ProjectionEnum, logo?: File, unit?: T.ValidUnitType,
  ): void {
    dispatch(PatchProject({
      project: {
        id,
        title,
        description,
        coordinateSystem,
        logo,
        unit,
      },
    }));
  },
  changeAuthedUser(): void {
    dispatch(ChangeAuthedUser({}));
  },
  async updateCoordinates(targetContent: T.Content, from: T.ProjectionEnum, to: T.ProjectionEnum): Promise<void> {
    if (!isMarker(targetContent)) return;
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await dispatch(PatchContent({
      content: { id: targetContent.id, info: {
        location: proj4(getEPSGfromProjectionLabel(from), getEPSGfromProjectionLabel(to)).forward(targetContent.info.location),
      } },
    }));
  },
  fetchPermission(projectId: T.Project['id']): void {
    dispatch(GetPermission({ projectId }));
  },
  displayNoPermissionPopup(): void {
    dispatch(OpenProjectPagePopup({ popup: T.ProjectPagePopupType.NO_PERMISSION }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectManageTab);
