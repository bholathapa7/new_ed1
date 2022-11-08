import * as ReactTesting from '@testing-library/react';
import React from 'react';

import palette from '^/constants/palette';

import { commonAfterEach } from '^/utilities/test-util';

import ToggleButton, { Props } from './';

describe('ToggleButton', () => {
  const createProps: () => Props = () => ({
    leftText: 'avxce',
    rightText: 'afear',
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <ToggleButton {...props} />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it.todo('should be on left with initial state');

  it.todo('should change its state when click it, if there is no isRight prop');

  it.todo('should have the state value same with its passed props');

  it.todo('should not change its state when click it, if there is isRight prop');

  it('should call onChange with updated value when click it, if that exists', () => {
    const onChange: jest.Mock = jest.fn();
    renderResult.rerender(
      <ToggleButton {...props} onChange={onChange} />,
    );

    expect(onChange).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.container.children[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(true);

    onChange.mockClear();

    renderResult.rerender(
      <ToggleButton {...props} isRight={true} onChange={onChange} />,
    );
    expect(onChange).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.container.children[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(false);

    onChange.mockClear();

    renderResult.rerender(
      <ToggleButton {...props} isRight={true} onChange={onChange} />,
    );
    expect(onChange).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.container.children[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(false);
    ReactTesting.fireEvent.click(renderResult.container.children[0]);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(false);

    onChange.mockClear();

    renderResult.rerender(
      <ToggleButton {...props} isRight={false} onChange={onChange} />,
    );
    expect(onChange).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.container.children[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(true);
    ReactTesting.fireEvent.click(renderResult.container.children[0]);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it('should have correct colors for left and right texts, depending on state', () => {
    expect(renderResult.getByText(props.leftText))
      .toHaveStyleRule('color', palette.white.toString().replace(/\s/g, ''));
    expect(renderResult.getByText(props.rightText))
      .toHaveStyleRule('color', 'inherit');

    ReactTesting.fireEvent.click(renderResult.container.children[0]);
    expect(renderResult.getByText(props.leftText))
      .toHaveStyleRule('color', 'inherit');
    expect(renderResult.getByText(props.rightText))
      .toHaveStyleRule('color', palette.white.toString().replace(/\s/g, ''));
  });
});
