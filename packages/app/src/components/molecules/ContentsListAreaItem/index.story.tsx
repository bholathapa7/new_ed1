import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MockStore } from 'redux-mock-store';

import ContentsListAreaItem from './';

import { ContentsListItemMockState, createContentsListItemMockState } from '^/components/atoms/ContentsListItem/index.story';
import * as M from '^/store/Mock';
import * as T from '^/types';
import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

const areaContent: T.AreaContent = M.sampleContentFromType(T.ContentType.AREA) as T.AreaContent;

storiesOf('Molecules|ContentsListAreaItem', module)
  .add('default', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <ContentsListAreaItem content={areaContent} />
      </Provider>
    );
  }).add('opened', () => {
    const store: MockStore<ContentsListItemMockState> = createContentsListItemMockState(areaContent);

    return (
      <Provider store={store}>
        <ContentsListAreaItem content={areaContent} />
      </Provider>
    );
  });
