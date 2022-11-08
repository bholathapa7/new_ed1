import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

import ContentPage, { Props } from './';

const defaultProps: Props = {
  isTopbarOpened: true,
  in3DPointCloud: false,
  currentPointCloudEngine: T.PointCloudEngine.POTREE,
  in3D: false,
  isSidebarOpened: true,
  isInContentsEventLogTable: false,
  twoDDisplayMode: T.TwoDDisplayMode.NORMAL,
  isBlueprintAligning: false,
  getScreensStatus: T.APIStatus.SUCCESS,
  getInitialContentsStatus: T.APIStatus.SUCCESS,
  getLonLatOn2D3DToggleStatus: T.APIStatus.SUCCESS,
  pointCloudNumberOfPointsInMil: 0,
  pointCloudSizeOfPoint: 0,
  getNotice: action('getNotice'),
  contentsInCurrentTab: [],
  sidebarTab: T.ContentPageTabType.MAP,
  lang: T.Language.KO_KR,
  isTopbarShown: false,
  getProjectStatus: T.APIStatus.SUCCESS,
};

storiesOf('Pages|ContentPage', module)
  .add('default', () => {
    const createProps: () => Props = () => ({
      ...defaultProps,
    });
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <ContentPage {...createProps()} />
      </Provider>
    );
  }).add('loading', () => {
    const createProps: () => Props = () => ({
      ...defaultProps,
      getInitialContentsStatus: T.APIStatus.PROGRESS,
    });
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <ContentPage {...createProps()} />
      </Provider>
    );
  });
