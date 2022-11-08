import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MockStore } from 'redux-mock-store';

import { ContentsListESSArrowItem } from './';
import { Fallback } from './fallback';

import { ContentsListItemMockState, createContentsListItemMockState } from '^/components/atoms/ContentsListItem/index.story';
import * as M from '^/store/Mock';
import * as T from '^/types';
import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

const story: StoryApi = storiesOf('Molecules|ContentsListESSArrowItem', module);

const content: T.ESSArrowContent = M.sampleContentFromType(T.ContentType.ESS_ARROW) as T.ESSArrowContent;

Object.values(T.Language).map((lang) => {
  const store: DDMMockStore = createDDMMockStore(lang);

  story.add(lang, () => (
    <Provider store={store}>
      <ContentsListESSArrowItem content={content} />
    </Provider>
  ));
});

Object.values(T.Language).map((lang) => {
  const store: MockStore<ContentsListItemMockState> = createContentsListItemMockState(content, lang);

  story.add(`${lang} - opened`, () => (
    <Provider store={store}>
      <ContentsListESSArrowItem content={content} />
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
