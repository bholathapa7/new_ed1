import * as ReactTesting from '@testing-library/react';
import { JWT } from 'jwt-decode';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import * as M from '^/store/Mock';

import BlueprintAlignPopup, { Props } from './';

jest.mock('jwt-decode', () => {
  const msecInSec: number = 1000;
  const twoDaysInSec: number = 172800;

  return (): JWT => ({
    exp: Date.now() / msecInSec + twoDaysInSec,
  });
});

/**
 * @todo
 * Add meaningful tests
 */
describe('TwoDDisplay', () => {
  const createProps: () => Props = () => ({
    content: M.sampleContentFromType(T.ContentType.BLUEPRINT_PDF) as T.BlueprintPDFContent,
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
        <BlueprintAlignPopup {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should have 50% width and 100% height', () => {
    expect(renderResult.getByTestId('blueprintalignpopup-root')).toHaveStyleRule('width', '50%');
    expect(renderResult.getByTestId('blueprintalignpopup-root')).toHaveStyleRule('height', '100%');
  });

  /**
   * @todo Add tests for center/zoom updates.
   * Currently they are (mistakenly?) component fields,
   * hence it is not reactive, i.e., not testable.
   */
});
