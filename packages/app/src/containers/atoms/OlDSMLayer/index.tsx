import { pathToRegexp } from 'path-to-regexp';
import { connect } from 'react-redux';

import routes from '^/constants/routes';

import OlDSMLayer, { Props } from '^/components/atoms/OlDSMLayer';
import * as T from '^/types';

type StatePropKeys = 'isShared' | 'dsmInfo';
type DispatchPropKeys = never;
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: (
  state: Pick<T.State, 'Auth' | 'SharedContents' | 'router'>, ownProps: OwnProps,
) => StateProps = (
  { router }, ownProps,
) => {
  const config: T.DSMConfigPerUser | undefined = ownProps.content.config;

  return {
    isShared: pathToRegexp(routes.share.main).test(router.location.pathname),
    dsmInfo: {
      percents: {
        max: config?.percents ? config.percents.max : 1,
        min: config?.percents ? config.percents.min : 0,
      },
      // eslint-disable-next-line no-magic-numbers
      opacity: config?.opacity !== undefined ? config.opacity / 100 : 1,
    },
  };
};

export default connect(mapStateToProps, undefined)(OlDSMLayer);
