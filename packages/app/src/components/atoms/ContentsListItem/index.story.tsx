import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as M from '^/store/Mock';
import * as T from '^/types';
import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import { ContentsListItem, Props } from './';

export type ContentsListItemMockState = Pick<T.State, | 'Attachments' | 'Pages' | 'Contents' | 'Projects' | 'ProjectConfigPerUser'>;

export const createContentsListItemMockState: (
  content: T.Content, language?: T.Language,
) => MockStoreEnhanced<ContentsListItemMockState, {}> = (content, language = T.Language.KO_KR) => createMockStore<ContentsListItemMockState>()({
  Attachments: M.mockAttachments,
  Pages: {
    ...M.mockPages,
    Common: {
      ...M.mockCommonPage,
      language,
    },
    Contents: {
      ...M.mockContentsPage,
      editingContentId: content.id,
    },
  },
  Contents: {
    ...M.mockContents,
    measurement: {
      [content.id]: '13.3m',
    },
  },
  Projects: M.mockProjects,
  ProjectConfigPerUser: M.mockProjectConfigPerUser,
});


storiesOf('Atom|ContentsListItem', module).add('default', () => {
  const sample: T.MarkerContent
    = M.sampleContentFromType(T.ContentType.MARKER) as T.MarkerContent;
  const createProps: () => Props = () => ({
    firstBalloonTitle: 'Lat, Lon',
    content: sample,
  });
  const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

  return (
    <Provider store={store}>
      <ContentsListItem {...createProps()} />
    </Provider>
  );
});
