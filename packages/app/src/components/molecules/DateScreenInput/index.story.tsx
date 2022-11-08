import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';

import { sampleScreen } from '^/store/Mock';
import * as T from '^/types';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { DateScreenInput } from '.';

const Wrapper = styled.div({
  padding: '50px',
});

const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);
const screen: T.Screen = sampleScreen();

storiesOf('Molecules|DateScreenInput', module)
  .add('SourcePhotoUpload', () => (
    <Provider store={store}>
      <Wrapper>
        <DateScreenInput
          buttonType={T.DateScreenButton.MAP_CONTENTS_UPLOAD}
          placement={T.ModalPlacement.BOTTOM_RIGHT}
          screen={screen}
        />
      </Wrapper>
    </Provider>
  ))
  .add('Download', () => (
    <Provider store={store}>
      <Wrapper>
        <DateScreenInput
          buttonType={T.DateScreenButton.DOWNLOAD}
          placement={T.ModalPlacement.BOTTOM_RIGHT}
          screen={screen}
        />
      </Wrapper>
    </Provider>
  ))
  .add('SplitView', () => (
    <Provider store={store}>
      <Wrapper>
        <DateScreenInput
          buttonType={T.DateScreenButton.SPLIT_VIEW}
          placement={T.ModalPlacement.BOTTOM_RIGHT}
          screen={screen}
        />
      </Wrapper>
    </Provider>
  ))
  .add('SplitView-SelfClose', () => (
    <Provider store={store}>
      <Wrapper>
        <DateScreenInput
          buttonType={T.DateScreenButton.SPLIT_VIEW}
          placement={T.ModalPlacement.BOTTOM_RIGHT}
          screen={screen}
        />
      </Wrapper>
    </Provider>
  ));
