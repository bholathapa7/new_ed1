import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import SourceErrorPopup, { Props } from './';

describe('SourceErrorPopup', () => {
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
        <SourceErrorPopup {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should display single button for confirmation', () => {
    expect(renderResult.container.getElementsByTagName('button')).toHaveLength(1);
  });

  it('should call onClose on confirm button click', () => {
    expect(props.onClose).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.container.getElementsByTagName('button')[0]);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });
});
