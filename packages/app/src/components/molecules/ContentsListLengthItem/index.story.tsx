import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import ContentsListLengthItem from './';

import { ContentsListItemMockState, createContentsListItemMockState } from '^/components/atoms/ContentsListItem/index.story';
import * as M from '^/store/Mock';
import * as T from '^/types';
import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';
import { MockStore } from 'redux-mock-store';

const lengthContent: T.LengthContent = M.sampleContentFromType(T.ContentType.LENGTH) as T.LengthContent;

storiesOf('Molecules|ContentsListLengthItem', module)
  .add('default', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <ContentsListLengthItem content={lengthContent} />
      </Provider>
    );
  }).add('opened', () => {
    const store: MockStore<ContentsListItemMockState> = createContentsListItemMockState(lengthContent);

    return (
      <Provider store={store}>
        <ContentsListLengthItem content={lengthContent} />
      </Provider>
    );
  });
