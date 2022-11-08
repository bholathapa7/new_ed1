import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { CreatingVolumeClickEventHandler, Props } from '^/components/molecules/CreatingVolumeClickEventHandler';
import { OpenContentPagePopup } from '^/store/duck/Pages';
import * as T from '^/types';

type StatePropsKeys = 'creatingVolumeType';
type DispatchPropKeys = 'onOpenPopup';
type StateProps = Pick<Props, StatePropsKeys>;
type DispatchProps = Pick<Props, DispatchPropKeys>;

const mapStateToProps: (
  state: Pick<T.State, 'Pages'>,
) => StateProps = ({ Pages }) => ({
  creatingVolumeType: Pages.Contents.creatingVolumeInfo?.type,
});

const mapDispatchToProps: (dispatch: Dispatch) => DispatchProps = (dispatch) => ({
  onOpenPopup(): void {
    dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.CANCEL_VOLUME_CREATION_POPUP }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(CreatingVolumeClickEventHandler);
