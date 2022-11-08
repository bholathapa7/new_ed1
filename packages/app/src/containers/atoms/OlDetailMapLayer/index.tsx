import { Coordinate } from 'ol/coordinate';
import { pathToRegexp } from 'path-to-regexp';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import routes from '^/constants/routes';
import {
  ChangeFirstVisitStatus,
  ChangeTwoDDisplayCenter,
  ChangeTwoDDisplayZoom,
} from '^/store/duck/Pages/Content';
import * as T from '^/types';

import OlDetailMapLayer, { Props } from '^/components/atoms/OlDetailMapLayer';

type StatePropKeys = 'opacity' | 'zoom' | 'isShared' | 'isFirstVisit';
type DispatchPropKeys = 'changeCenter' | 'changeZoom' | 'changeFirstVisit';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

/**
 * This function may cause a perfomance issue.
 * Do we need to use reselect?
 * Ref: https://github.com/reactjs/reselect
 */
export const mapStateToProps: (
  state: Pick<T.State, 'Auth' | 'SharedContents' | 'Pages' | 'router'> ,
  ownProps: OwnProps,
) => StateProps = (
  { Pages, router }, ownProps,
) => ({
  zoom: Pages.Contents.twoDDisplayZoom,
  isShared: pathToRegexp(routes.share.main).test(router.location.pathname),
  isFirstVisit: Pages.Contents.isFirstVisit,
  // eslint-disable-next-line no-magic-numbers
  opacity: ownProps.content.config?.opacity !== undefined ? ownProps.content.config.opacity : 100,
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  changeCenter(twoDDisplayCenter: Coordinate): void {
    dispatch(ChangeTwoDDisplayCenter({ twoDDisplayCenter }));
  },
  changeZoom(twoDDisplayZoom: number): void {
    dispatch(ChangeTwoDDisplayZoom({ twoDDisplayZoom }));
  },
  changeFirstVisit(firstVisit: boolean): void {
    dispatch(ChangeFirstVisitStatus({ firstVisit }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(OlDetailMapLayer);
