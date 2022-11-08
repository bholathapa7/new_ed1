import { Coordinate } from 'ol/coordinate';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { CloseContentPagePopup } from '^/store/duck/Pages';
import { CancelPostShareRequest, PostShareRequest } from '^/store/duck/SharedContents';
import * as T from '^/types';

import ContentSharePopup, { Props } from '^/components/organisms/ContentSharePopup';
import { contentsSelector } from '^/store/duck/Contents';
import { getCurrentScreenContentIds } from '^/hooks';

type StatePropKeys =
  | 'postShareStatus'
  | 'shareToken'
  | 'lastSelectedScreenDate'
  | 'selectedContentIds'
  | 'navbarLogoUrl'
  | 'cameraPosition'
  | 'zoomLevel'
  | 'timezoneOffset';
type DispatchPropKeys = 'postShareRequest' | 'cancelShareRequest' | 'onClose';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: (state: T.State) => StateProps = (state) => {
  // No ESS contents for share popup, therefore disabled.
  const currentScreenContentIds: Array<T.Content['id']> = getCurrentScreenContentIds({ state, isESSDisabled: true });
  const { Screens, Contents, SharedContents, Pages, ProjectConfigPerUser } = state;

  const selectedContentIds: Array<T.Content['id']> = currentScreenContentIds
    .filter(contentsSelector.isSelected(Contents, ProjectConfigPerUser))
    .sort((a, b) => {
      const aOfselectedAt: Date | undefined = contentsSelector.selectedAt(Contents)(a);
      const bOfselectedAt: Date | undefined = contentsSelector.selectedAt(Contents)(b);

      return aOfselectedAt && bOfselectedAt ?
        aOfselectedAt.valueOf() - bOfselectedAt.valueOf() : 0;
    });

  const lastSelectedScreenDate: Date | undefined =
    Screens.screens.find(({ id }) => ProjectConfigPerUser.config?.lastSelectedScreenId === id)?.appearAt;

  return {
    shareToken: SharedContents.shareToken,
    navbarLogoUrl: SharedContents.navbarLogoUrl,
    postShareStatus: SharedContents.postShareRequestStatus,
    selectedContentIds,
    cameraPosition: Pages.Contents.twoDDisplayCenter,
    zoomLevel: Pages.Contents.twoDDisplayZoom,
    lastSelectedScreenDate,
    timezoneOffset: Pages.Common.timezoneOffset,
  };
};

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  postShareRequest(
    contentIds: Array<number>, expiredAt: Date, navbarLogoUrl: T.SharedContentsState['navbarLogoUrl'], cameraPosition: Coordinate, zoomLevel: number,
  ): void {
    dispatch(PostShareRequest({ contentIds, expiredAt, navbarLogoUrl, cameraPosition, zoomLevel }));
  },
  cancelShareRequest(): void {
    dispatch(CancelPostShareRequest());
  },
  onClose(): void {
    dispatch(CloseContentPagePopup());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ContentSharePopup);
