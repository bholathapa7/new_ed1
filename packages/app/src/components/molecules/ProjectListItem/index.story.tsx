import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import ProjectListItem, { Props } from './';

import { sampleSingleProject } from '^/store/Mock';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

import * as T from '^/types';

storiesOf('Molecules|ProjectListItem', module)
  .add('default', () => {
    const props: Props = {
      isShared: false,
      isDemo: false,
      timezoneOffset: 0,
      project: sampleSingleProject,
      onClick: action('onclick'),
      onSettingClick: action('onsettingclick'),
    };
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <ProjectListItem {...props} />
      </Provider>
    );
  });
