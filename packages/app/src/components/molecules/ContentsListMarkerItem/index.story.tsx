import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import { ContentsListMarkerItem } from './';

import { ContentsListItemMockState, createContentsListItemMockState } from '^/components/atoms/ContentsListItem/index.story';
import * as M from '^/store/Mock';
import * as T from '^/types';
import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';
import { MockStore } from 'redux-mock-store';

const markerContent: T.MarkerContent = M.sampleContentFromType(T.ContentType.MARKER) as T.MarkerContent;

storiesOf('Molecules|ContentsListMarkerItem', module)
  .add('default', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <ContentsListMarkerItem content={markerContent} />
      </Provider>
    );
  }).add('opened', () => {
    const store: MockStore<ContentsListItemMockState> = createContentsListItemMockState(markerContent);

    return (
      <Provider store={store}>
        <ContentsListMarkerItem content={markerContent} />
      </Provider>
    );
  });
