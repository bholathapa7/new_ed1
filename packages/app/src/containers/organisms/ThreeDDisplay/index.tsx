import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import ThreeDDisplay, { Props } from '^/components/organisms/ThreeDDisplay';
import { AuthHeader, makeAuthHeader } from '^/store/duck/API';
import { ChangeAuthedUser } from '^/store/duck/Auth';
import { PatchContent, contentsSelector } from '^/store/duck/Contents';
import { OpenContentPagePopup } from '^/store/duck/Pages';
import * as T from '^/types';
import { getCurrentScreenContentIds } from '^/hooks';

type StatePropKeys = 'authHeader' | 'contents';
type DispatchPropKeys = 'logout' | 'openWarning' | 'unselectExcept';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: (state: T.State) => StateProps = (state) => {
  const { Auth, Contents, ProjectConfigPerUser, PlanConfig } = state;
  const currentScreenContentIds: Array<T.Content['id']> = getCurrentScreenContentIds({ state });
  const authHeader: AuthHeader | undefined = makeAuthHeader(Auth, PlanConfig.config?.slug);

  return {
    authHeader,
    contents: currentScreenContentIds
      .filter(contentsSelector.isSelected(Contents, ProjectConfigPerUser))
      .map((id) => Contents.contents.byId[id])
      .filter((content) => content !== undefined)
      .filter((content): content is T.PointCloudContent => content.type === T.ContentType.POINTCLOUD)
      .sort((content0, content1) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
         content1.config!.selectedAt!.valueOf() - content0.config!.selectedAt!.valueOf()
      ),
  };
};

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  logout(): void {
    dispatch(ChangeAuthedUser({}));
  },
  openWarning(): void {
    dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_SELECTED_MAP }));
  },
  unselectExcept(contentIds: Array<number>, exceptionId: number): void {
    contentIds
      .filter((id) => id !== exceptionId)
      .map((id) => PatchContent({
        content: {
          id,
          config: {
            selectedAt: undefined,
          },
        },
      }))
      .map(dispatch);
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ThreeDDisplay);
