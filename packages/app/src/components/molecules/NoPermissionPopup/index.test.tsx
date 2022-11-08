import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import NoPermissionPopup, { Props } from './';

describe('NoPermissionPopup', () => {
  const createProps: () => Props = () => ({
    zIndex: 0,
    onClose: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <NoPermissionPopup {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should call onClose when ConfirmButton is clicked', () => {
    expect(props.onClose).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.getByTestId('confirm-button'));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });
});
