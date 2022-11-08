import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import PrintSuccessPopup, { Props } from './';

describe('PrintSuccessPopup', () => {
  const createProps: () => Props = () => ({
    zIndex: 0,
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <PrintSuccessPopup {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it.skip('should call onClose when ConfirmButton clicked', () => {
    ReactTesting.fireEvent.click(renderResult.container.getElementsByTagName('button')[0]);
    expect(store.dispatch).toHaveBeenCalledTimes(1);
  });
});
