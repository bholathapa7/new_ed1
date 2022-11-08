import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import ProjectPreview, { Props } from './';

import { sampleSingleProject } from '^/store/Mock';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

import * as T from '^/types';

storiesOf('Molecules|ProjectPreview', module)
  .add('default', () => {
    const props: Props = {
      project: sampleSingleProject,
    };
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <ProjectPreview {...props} />
      </Provider>
    );
  });
