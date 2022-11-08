import * as ReactTesting from '@testing-library/react';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import DDMCheckBox, { Props } from './';

describe('DDMCheckBox', () => {
  const createProps: () => Props = () => ({
    checked: false,
    label: 'This is test',
    className: 'dumbClassName',
    onChange: jest.fn(),
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <DDMCheckBox {...props} />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should className is applied to Root', () => {
    expect(renderResult.container.querySelector('div.dumbClassName')).toBeTruthy();
  });

  it('should call change handler when click it', () => {
    expect(props.onChange).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.getByTestId('ddmcheckbox-root'));
    expect(props.onChange).toHaveBeenCalledTimes(1);
  });

  it('should have non-checked icon when it has checked props', () => {
    expect(renderResult.container.querySelector('i.fa-square-o')).toBeTruthy();
  });

  it('should have checked icon when it has checked props', () => {
    renderResult.rerender(
      <DDMCheckBox {...props} checked={true} />,
    );
    expect(renderResult.container.querySelector('i.fa-check-square-o')).toBeTruthy();
  });
});
