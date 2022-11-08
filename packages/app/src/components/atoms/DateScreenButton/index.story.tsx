import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';

import * as M from '^/store/Mock';
import * as T from '^/types';
import { TEMP_SCREEN_ID } from '^/utilities/screen-util';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { DateScreenButton, Props } from '.';

const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);


const DivForBackdropFilterCheck = styled.div({
  height: '37px',
  width: '100%',
  background: 'linear-gradient(to right, orange , yellow, green, cyan, blue, violet)',
});

storiesOf('Atoms|DateScreenButton', module)
  .add('SourcePhotoUpload-default', () => {
    const props: Props = {
      screen: M.mockScreens.screens[0],
      type: T.DateScreenButton.MAP_CONTENTS_UPLOAD,
      isClicked: true,
      onClick: action('onClick'),
    };

    return (
      <Provider store={store} >
        <DateScreenButton {...props} />
      </Provider>
    );
  })
  .add('SourcePhotoUpload-fakeScreen', () => {
    const props: Props = {
      screen: {
        contentIds: [1, 2],
        id: TEMP_SCREEN_ID,
        appearAt: new Date(),
        title: '나는 임시 스크린. Source Photo용입니다.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      type: T.DateScreenButton.MAP_CONTENTS_UPLOAD,
      isClicked: true,
      onClick: action('onClick'),
    };

    return (
      <Provider store={store} >
        <DateScreenButton {...props} />
      </Provider>
    );
  })
  .add('SplitView-default', () => {
    const props: Props = {
      screen: M.mockScreens.screens[0],
      type: T.DateScreenButton.SPLIT_VIEW,
      isClicked: true,
      onClick: action('onClick'),
    };

    return (
      <Provider store={store} >
        <DivForBackdropFilterCheck>
          <DateScreenButton {...props} />
        </DivForBackdropFilterCheck>
      </Provider>
    );
  })
  .add('SplitView-fakeScreen', () => {
    const props: Props = {
      screen: {
        contentIds: [1, 2],
        id: TEMP_SCREEN_ID,
        appearAt: new Date(),
        title: '나는 임시 스크린. 가짜 스크린 용입니다.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      type: T.DateScreenButton.SPLIT_VIEW,
      isClicked: true,
      onClick: action('onClick'),
    };

    return (
      <Provider store={store} >
        <DivForBackdropFilterCheck>
          <DateScreenButton {...props} />
        </DivForBackdropFilterCheck>
      </Provider>
    );
  });
