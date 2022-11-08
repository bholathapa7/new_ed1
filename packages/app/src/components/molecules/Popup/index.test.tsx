import * as ReactTesting from '@testing-library/react';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import Popup, { Props } from './';

describe('Popup', () => {
  const createProps: () => Props = () => ({
    title: 'title',
    alpha: 1,
    zIndex: 0,
    onCloseClick: jest.fn(),
    onMinimizeClick: jest.fn(),
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    // @ts-ignore
    window.crypto = { getRandomValues: (_a) => {} };
    props = createProps();
    renderResult = ReactTesting.render(
      <Popup {...props}>
        <div />
      </Popup>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  const getCloseButton: () => HTMLButtonElement = () =>
    renderResult.getByTestId('popup-close') as HTMLButtonElement;
  const getMinimizeButton: () => HTMLButtonElement = () =>
    renderResult.getByTestId('popup-minimize') as HTMLButtonElement;

  it('should show appropriate title', () => {
    const alphabetRadix: number = 36;
    const randoms: Uint32Array = new Uint32Array(1);
    window.crypto.getRandomValues(randoms);
    const newTitle: string = randoms[0].toString(alphabetRadix);

    renderResult = ReactTesting.render(
      <Popup {...props} title={newTitle}>
        <div />
      </Popup>,
    );
    expect(renderResult.queryAllByText(newTitle)).toHaveLength(1);
  });

  it('should call handler when close button clicked', () => {
    expect(props.onCloseClick).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(getCloseButton());
    expect(props.onCloseClick).toHaveBeenCalledTimes(1);
  });

  it('should call handler when minimize button clicked', () => {
    expect(props.onMinimizeClick).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(getMinimizeButton());
    expect(props.onMinimizeClick).toHaveBeenCalledTimes(1);
  });
});
