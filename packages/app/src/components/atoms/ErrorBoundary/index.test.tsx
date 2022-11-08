import * as ReactTesting from '@testing-library/react';
import _ from 'lodash-es';
import React, { FC } from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import { ErrorBoundary } from '.';

const TestComp: FC<{ error?: boolean }> = ({ error }) => {
  if (!error) {
    return (
      <>
        Normal Text
      </>
    );
  } else {
    throw new Error('hi');
  }
};

describe('ErrorBoundary', () => {
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    renderResult = ReactTesting.render(
      <ErrorBoundary>
        <TestComp />
      </ErrorBoundary>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should match with the snapshot', () => {
    expect(renderResult.asFragment()).toMatchSnapshot();
  });

  it('should render its children when there is no error', () => {
    expect(renderResult.queryByText('Normal Text')).toBeTruthy();
  });

  it('should render error display when an error occurs', () => {
    jest.spyOn(console, 'error').mockImplementation(_.noop);

    try {
      renderResult.rerender(
        <ErrorBoundary>
          <TestComp error={true} />
        </ErrorBoundary>,
      );
    } catch {
      expect(renderResult.asFragment).toMatchSnapshot();
    }
  });
});
