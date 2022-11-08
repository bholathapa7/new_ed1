import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MockStore } from 'redux-mock-store';

import { ContentsListItemMockState, createContentsListItemMockState } from '^/components/atoms/ContentsListItem/index.story';
import { typeGuardThreeDMesh } from '^/hooks';
import { sampleContentFromType } from '^/store/Mock';
import * as T from '^/types';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { ContentsListThreeDMeshItem } from '.';
import { Fallback } from './fallback';

const story: StoryApi = storiesOf('Molecules|ContentsListThreeDMeshItem', module);

const threeDMeshContent: T.ThreeDMeshContent | undefined = typeGuardThreeDMesh(sampleContentFromType(T.ContentType.THREE_D_MESH));

if (threeDMeshContent === undefined) throw new Error('There is no 3D Mesh Content in Mock');

Object.values(T.Language).map((lang) => {
  const store: DDMMockStore = createDDMMockStore(lang);

  story.add(lang, () => (
    <Provider store={store}>
      <ContentsListThreeDMeshItem content={threeDMeshContent} />
    </Provider>
  ));
});

Object.values(T.Language).map((lang) => {
  const store: MockStore<ContentsListItemMockState> = createContentsListItemMockState(threeDMeshContent, lang);

  story.add(`${lang} - opened`, () => (
    <Provider store={store}>
      <ContentsListThreeDMeshItem content={threeDMeshContent} />
    </Provider>
  ));
});

Object.values(T.Language).map((lang) => {
  const store: DDMMockStore = createDDMMockStore(lang);

  story.add(`fallback - ${lang}`, () => (
    <Provider store={store}>
      <Fallback content={threeDMeshContent} />
    </Provider>
  ));
});
