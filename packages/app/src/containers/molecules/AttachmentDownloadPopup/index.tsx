import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { makeAuthHeader } from '^/store/duck/API';
import { CloseContentPagePopup } from '^/store/duck/Pages';
import * as T from '^/types';

import AttachmentDownloadPopup, { Props } from '^/components/molecules/AttachmentDownloadPopup';
import { GetContentDownloadables, RequestLasDownSampling } from '^/store/duck/Contents';

type StatePropKeys = 'authHeader' | 'projectId' | 'timezoneOffset'
  | 'enabledDates' | 'lastSelectedScreenId' | 'screens'
  | 'requestLasDownSamplingStatus'
  | 'getContentDownloadablesStatus'
  | 'lasDownSamplingStatus'
  | 'contentDownloadables';
type DispatchPropKeys = 'onClose' | 'getContentDownloadables' | 'requestLasDownSampling';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: (
  state: Pick<T.State, 'Auth' | 'Contents' | 'Pages' | 'ProjectConfigPerUser' | 'Projects' | 'Screens' | 'PlanConfig'>,
) => StateProps = (
  { Auth, Contents, Pages, ProjectConfigPerUser, Projects: { projects }, Screens: { screens }, PlanConfig },
) => {
  const projectId: number | undefined = Pages.Contents.projectId;
  if (projectId === undefined) throw new Error(' No Project Id in Pages.Contents.projectId');

  const availableDates: Array<Date> | undefined = projects.byId[projectId].availableDates;
  const lastSelectedScreenId: T.Screen['id'] | undefined = ProjectConfigPerUser.config?.lastSelectedScreenId;

  return {
    authHeader: makeAuthHeader(Auth, PlanConfig.config?.slug),
    projectId,
    timezoneOffset: Pages.Common.timezoneOffset,
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    enabledDates: availableDates || [],
    /**
     * @type can't be undefined, so ignore the '0', this is just for type-narrowing
     */
    lastSelectedScreenId: lastSelectedScreenId === undefined ? 0 : lastSelectedScreenId,
    screens,
    requestLasDownSamplingStatus: Contents.requestLasDownSamplingStatus,
    getContentDownloadablesStatus: Contents.getContentDownloadablesStatus,
    lasDownSamplingStatus: Contents.lasDownSamplingStatus,
    contentDownloadables: Contents.contentDownloadables,
  };
};

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onClose(): void {
    dispatch(CloseContentPagePopup());
  },
  requestLasDownSampling(screenId: T.Screen['id']): void {
    dispatch(RequestLasDownSampling({ screenId }));
  },
  getContentDownloadables(screenId: T.Screen['id']): void {
    dispatch(GetContentDownloadables({ screenId }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AttachmentDownloadPopup);
