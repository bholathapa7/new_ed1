import { connect } from 'react-redux';

import * as T from '^/types';

import SharePage, { Props } from '^/components/pages/SharePage';

type StatePropsKey = 'sharedContentsStatus' | 'sharedContentsError' | 'popup';
type DispatchPropsKey = never;
export type OwnProps = Omit<Props, StatePropsKey | DispatchPropsKey>;
export type StateProps = Pick<Props, StatePropsKey>;
export type DispatchProps = Pick<Props, DispatchPropsKey>;

export const mapStateToProps: (
  state: Pick<T.State, 'Pages' | 'SharedContents'>,
) => StateProps = (
  { Pages, SharedContents },
) => ({
  sharedContentsStatus: SharedContents.getSharedContentsStatus,
  sharedContentsError: SharedContents.getSharedContentsError,
  popup: Pages.Contents.popup ? Pages.Contents.popup.type : undefined,
});

export default connect(mapStateToProps, undefined)(SharePage);
