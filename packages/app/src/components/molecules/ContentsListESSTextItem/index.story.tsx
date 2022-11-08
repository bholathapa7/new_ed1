import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MockStore } from 'redux-mock-store';

import { ContentsListESSTextItem } from './';
import { Fallback } from './fallback';

import { ContentsListItemMockState, createContentsListItemMockState } from '^/components/atoms/ContentsListItem/index.story';
import * as M from '^/store/Mock';
import * as T from '^/types';
import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

const story: StoryApi = storiesOf('Molecules|ContentsListESSTextItem', module);

const content: T.ESSTextContent = M.sampleContentFromType(T.ContentType.ESS_TEXT) as T.ESSTextContent;

Object.values(T.Language).map((lang) => {
  const store: DDMMockStore = createDDMMockStore(lang);

  story.add(lang, () => (
    <Provider store={store}>
      <ContentsListESSTextItem content={content} />
    </Provider>
  ));
});

Object.values(T.Language).map((lang) => {
  const store: MockStore<ContentsListItemMockState> = createContentsListItemMockState(content, lang);

  story.add(`${lang} - opened`, () => (
    <Provider store={store}>
      <ContentsListESSTextItem content={content} />
    </Provider>
  ));
});

Object.values(T.Language).map((lang) => {
  const store: DDMMockStore = createDDMMockStore(lang);

  story.add(`fallback - ${lang}`, () => (
    <Provider store={store}>
      <Fallback content={content} />
    </Provider>
  ));
});
