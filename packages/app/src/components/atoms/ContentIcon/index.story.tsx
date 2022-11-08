import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import { ContentIcon } from './';

import * as M from '^/store/Mock';
import * as T from '^/types';

import { StoryApi } from '@storybook/addons';
import { StoryFnReactReturnType } from '@storybook/react/dist/client/preview/types';
import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

const contentTypes: Array<T.ContentType> = Object.values(T.ContentType)
  .map((key: string) => key as T.ContentType);

const story: StoryApi<StoryFnReactReturnType> = storiesOf('Atom|ContentIcon', module);
const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

contentTypes.forEach((contentType: T.ContentType) => {
  story.add(contentType, () => (
    <Provider store={store}>
      <ContentIcon contentType={M.sampleContentFromType(contentType).type} />
    </Provider>
  ));
});
