import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';

import * as T from '^/types';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import SourcePhotoUpload from '.';

const story: StoryApi = storiesOf('Organisms|SourcePhotoUpload', module);

const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

const Wrapper = styled.div({
  width: '366px',
  height: '100vh',
});

story.add('default', () => (
  <Provider store={store}>
    <SourcePhotoUpload />
  </Provider>
));

story.add('with Wrapper', () => (
  <Provider store={store}>
    <Wrapper>
      <SourcePhotoUpload />
    </Wrapper>
  </Provider>
));
