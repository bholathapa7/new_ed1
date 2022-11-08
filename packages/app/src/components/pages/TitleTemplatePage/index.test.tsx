import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import TitleTemplatePage, { Props } from '.';

describe('TitleTemplatePage', () => {
  const createProps: () => Props = () => ({
    title: 'Dump Title',
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    store = createDDMMockStore(T.Language.KO_KR);
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <MemoryRouter>
          <TitleTemplatePage {...props}>
            <div data-testid='test-children' />
          </TitleTemplatePage>
        </MemoryRouter>
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should display its children', () => {
    expect(renderResult.queryAllByTestId('test-children')).toHaveLength(1);
  });
});
