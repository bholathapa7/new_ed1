import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import SimpleDocumentPage, { Props } from './';

describe('SimpleDocumentPage', () => {
  const createProps: () => Props = () => ({
    title: 'This is title',
    paragraphs: [
      {
        title: 'paragraph 1',
        content: 'content of paragraph 1',
      },
      {
        title: 'paragraph 2',
        content: 'content of paragraph 2',
      },
    ],
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    store = createDDMMockStore(T.Language.KO_KR);
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <SimpleDocumentPage {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render all given paragraphs', () => {
    expect(renderResult.container.querySelectorAll('p'))
      .toHaveLength(props.paragraphs.length);
  });

  it('should render title', () => {
    expect(renderResult.queryAllByText(props.title)).toHaveLength(1);
  });
});
