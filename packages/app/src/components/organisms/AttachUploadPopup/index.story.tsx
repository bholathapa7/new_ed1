import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import createMockStore, { MockStore, MockStoreCreator } from 'redux-mock-store';

import * as M from '^/store/Mock';
import { Story } from '^/story.types';
import * as T from '^/types';
import { AttachUploadPopup, UploadPagePopupTypes } from '.';

const story: Story = storiesOf('Organisms|AttachUploadPopup', module);

type MockState = Pick<T.State, 'Contents' | 'Pages' | 'Users' | 'Projects' | 'ProjectConfigPerUser' | 'Screens' | 'Photos'>;
const mockStoreCreator: MockStoreCreator<MockState> = createMockStore<MockState>();

const createMockState: (lang: T.Language) => MockState = (lang) => ({
  Contents: M.mockContents,
  Projects: M.mockProjects,
  Pages: {
    ...M.mockPages,
    Common: {
      ...M.mockPages.Common,
      language: lang,
    },
  },
  Users: {
    ...M.mockUsers,
  },
  ProjectConfigPerUser: {
    config: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      projectId: M.mockPages.Contents.projectId!,
      // lastSelectedScreen: 1,
    },
    patchProjectConfigStatus: T.APIStatus.IDLE,
  },
  Screens: M.mockScreens,
  Photos: M.mockPhotos,
});

const popupTypes: Array<UploadPagePopupTypes> = [
  T.ContentPagePopupType.BLUEPRINT_UPLOAD,
  T.ContentPagePopupType.DSM_UPLOAD,
  T.ContentPagePopupType.LAS_UPLOAD,
  T.ContentPagePopupType.ORTHO_UPLOAD,
];

popupTypes.forEach((type: UploadPagePopupTypes) => {
  const enStore: MockStore<MockState> = mockStoreCreator(createMockState(T.Language.EN_US));
  story.add(`English-${type}`, () => (
    <Provider store={enStore} >
      <AttachUploadPopup
        zIndex={0}
        popupType={type}
      />
    </Provider>
  ));
  const koStore: MockStore<MockState> = mockStoreCreator(createMockState(T.Language.KO_KR));
  story.add(`Korean-${type}`, () => (
    <Provider store={koStore}>
      <AttachUploadPopup
        zIndex={0}
        popupType={type}
      />
    </Provider>
  ));
});
