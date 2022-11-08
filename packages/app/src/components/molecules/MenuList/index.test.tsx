import * as ReactTesting from '@testing-library/react';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import { MenuItem, MenuList } from './';

describe('MenuList', () => {
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    renderResult = ReactTesting.render(
      <MenuList>
        <MenuItem selected={true} data-testid='test-menu-item' />
        <MenuItem selected={false} data-testid='test-menu-item' />
      </MenuList>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render all children menu items', () => {
    expect(renderResult.queryAllByTestId('test-menu-item')).toHaveLength(2);
  });

  it('should display selected menu item with special style', () => {
    expect(renderResult.queryAllByTestId('test-menu-item')[0])
      .toHaveStyleRule('font-weight', '500');
  });

  it('should display the other menu item without special style', () => {
    expect(renderResult.queryAllByTestId('test-menu-item')[1])
      .toHaveStyleRule('font-weight', 'normal');
  });
});
