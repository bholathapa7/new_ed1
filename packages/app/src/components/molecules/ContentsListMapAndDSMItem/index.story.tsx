import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import { ContentsListMapAndDSMItem } from './';

import { ContentsListItemMockState, createContentsListItemMockState } from '^/components/atoms/ContentsListItem/index.story';
import * as M from '^/store/Mock';
import * as T from '^/types';
import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';
import { MockStore } from 'redux-mock-store';

const mapContent: T.MapContent = M.sampleContentFromType(T.ContentType.MAP) as T.MapContent;
const dsmContent: T.DSMContent = M.sampleContentFromType(T.ContentType.DSM) as T.DSMContent;

storiesOf('Molecules|ContentsListMapAndDSMItem', module)
  .add('map-default', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <ContentsListMapAndDSMItem content={mapContent} />
      </Provider>
    );
  }).add('map-opened', () => {
    const store: MockStore<ContentsListItemMockState> = createContentsListItemMockState(mapContent);

    return (
      <Provider store={store}>
        <ContentsListMapAndDSMItem content={mapContent} />
      </Provider>
    );
  }).add('dsm-default', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <ContentsListMapAndDSMItem content={dsmContent} />
      </Provider>
    );
  }).add('dsm-opened', () => {
    const store: MockStore<ContentsListItemMockState> = createContentsListItemMockState(dsmContent);

    return (
      <Provider store={store}>
        <ContentsListMapAndDSMItem content={dsmContent} />
      </Provider>
    );
  });
