import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import ProjectListAdd, { Props } from './';

/**
 * @todo add meaningful tests
 */
describe('ProjectListAdd', () => {
  const createProps: () => Props = () => ({
    onClick: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <ProjectListAdd {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should call onClick on root click', () => {
    expect(props.onClick).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.container.children[0]);
    expect(props.onClick).toHaveBeenCalledTimes(1);
  });
});
