import { storiesOf } from '@storybook/react';
import React, { FC } from 'react';
import { Provider } from 'react-redux';

import * as M from '^/store/Mock';
import * as T from '^/types';
import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';
import { ContentsListItemCheckbox, Props } from '.';

const Component: FC = () => {
  const createProps: () => Props = () => ({
    content: M.sampleContentFromType(T.ContentType.LENGTH),
    isProcessingOrFailed: false,
    isFailed: false,
  });
  const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

  return (
    <Provider store={store}>
      <ContentsListItemCheckbox {...createProps()} />
    </Provider>
  );
};

storiesOf('Atom|ContentsListItemCheckbox', module).add('default', () => <Component />);
