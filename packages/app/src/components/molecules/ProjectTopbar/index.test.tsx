import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { DDMMockStore, commonAfterEach, createDDMMockStore } from '^/utilities/test-util';

import ProjectTopbar, { Props } from './';

import * as T from '^/types';

describe('ProjectTopbar', () => {
  const createProps: () => Props = () => ({
    openListTab: jest.fn(),
    openMypage: jest.fn(),
    signout: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <ProjectTopbar {...props} />,
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should call openMypage if mypage button clicked', () => {
    expect(props.openMypage).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.container.querySelectorAll('ul > li')[0]);
    expect(props.openMypage).toHaveBeenCalledTimes(1);
  });

  it('should call signout if signout button clicked', () => {
    expect(props.signout).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.container.querySelectorAll('ul > li')[2]);
    expect(props.signout).toHaveBeenCalledTimes(1);
  });
});
