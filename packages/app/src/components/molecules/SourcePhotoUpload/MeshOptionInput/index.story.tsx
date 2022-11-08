import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React, { useState } from 'react';
import { Provider } from 'react-redux';

import { UseState } from '^/hooks';
import * as T from '^/types';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import MeshOptionInput, { Props } from '.';

const story: StoryApi = storiesOf('Molecules|SourcePhotoUpload', module);

const store: DDMMockStore = createDDMMockStore(T.Language.EN_US);

story.add('MeshOptionInput', () => {
  const [isUsingOption, setIsUsingOption]: UseState<Props['isMeshOption']> = useState(null);

  return (
    <>
      <Provider store={store}>
        <ul style={{ width: '376px', listStyle: 'none', backgroundColor: 'white' }}>
          <MeshOptionInput
            isMeshOption={isUsingOption}
            onChange={setIsUsingOption}
          />
        </ul>
      </Provider>
      <ul style={{ width: '376px', listStyle: 'none', backgroundColor: 'white' }}>
        <MeshOptionInput
          isMeshOption={isUsingOption}
          onChange={setIsUsingOption}
        />
      </ul>
    </>
  );
});
