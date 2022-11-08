import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import MemberBoard, { Props } from '^/components/organisms/MemberBoard/index';

describe('ProjectManageTab', () => {
  const createProps: () => Props = () => ({
    handleDeleteClick: jest.fn(),
    handleShareClick: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <MemberBoard {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should call handler on delete button click', () => {
    expect(props.handleDeleteClick).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.getByTestId('delete-button'));
    expect(props.handleDeleteClick).toHaveBeenCalledTimes(1);
  });

  it('should call handler on share button click', () => {
    expect(props.handleShareClick).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.getByTestId('share-button'));
    expect(props.handleShareClick).toHaveBeenCalledTimes(1);
  });
});
