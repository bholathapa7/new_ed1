import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {
  ChangeRotation,
  ChangeTwoDDisplayCenter,
  ChangeTwoDDisplayZoom,
} from '^/store/duck/Pages/Content';
import * as T from '^/types';

import TwoDShareDisplay, { Props } from '^/components/organisms/TwoDShareDisplay';

type StatePropKeys = 'contents' | 'center' | 'zoom' | 'rotation';
type DispatchPropKeys = 'onCenterChange' | 'onZoomChange' | 'onRotationChange';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: (
  state: Pick<T.State, 'Contents' | 'Pages'>,
) => StateProps = (
  { Contents, Pages },
) => ({
  contents: Contents.contents.allIds
    .map((id) => Contents.contents.byId[id]),
  center: Pages.Contents.twoDDisplayCenter,
  zoom: Pages.Contents.twoDDisplayZoom,
  rotation: Pages.Contents.rotation,
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onCenterChange(twoDDisplayCenter: [number, number]): void {
    dispatch(ChangeTwoDDisplayCenter({ twoDDisplayCenter }));
  },
  onZoomChange(twoDDisplayZoom: number): void {
    dispatch(ChangeTwoDDisplayZoom({ twoDDisplayZoom }));
  },
  onRotationChange(rotation: number): void {
    dispatch(ChangeRotation({ rotation }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TwoDShareDisplay);
