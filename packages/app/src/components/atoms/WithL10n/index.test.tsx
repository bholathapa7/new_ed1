import * as ReactTesting from '@testing-library/react';
import React, { ComponentClass, FC } from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import withL10n, { L10nProps } from './';

describe('withL10n', () => {
  const Child: FC<L10nProps> = (props) => (
    <div data-testid='children'>{props.language}</div>
  );
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    const Wrapped: ComponentClass = withL10n(Child);
    store = createDDMMockStore(T.Language.KO_KR);
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <Wrapped />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should provide language as prop', () => {
    expect(renderResult.getByTestId('children').textContent).toBe(T.Language.KO_KR);
  });
});
