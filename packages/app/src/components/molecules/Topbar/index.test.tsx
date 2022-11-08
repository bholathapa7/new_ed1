import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import { MenuItem, MenuItemProps } from '^/components/molecules/MenuList';

import Topbar, { Props } from './';

describe('Topbar', () => {
  const createProps: () => Props = () => ({
    onLogoClick: jest.fn(),
  });
  const createMenuItemProps: (selected: boolean) => MenuItemProps = (selected: boolean) => ({
    selected,
    onClick: jest.fn(),
  });
  let props: Props;
  let defaultMenuItemProps: MenuItemProps;
  let selectedMenuItemProps: MenuItemProps;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    defaultMenuItemProps = createMenuItemProps(false);
    selectedMenuItemProps = createMenuItemProps(true);
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <Topbar {...props}>
          <MenuItem {...defaultMenuItemProps}>Test Menu</MenuItem>
          <MenuItem {...defaultMenuItemProps}>Non-Selected Menu</MenuItem>
          <MenuItem {...selectedMenuItemProps}>Selected Menu</MenuItem>
        </Topbar>
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should have language switch by default', () => {
    expect(renderResult.queryAllByTestId('language-switch')).toHaveLength(1);
  });

  it('should not have language switch when withLanguage props has a value of false', () => {
    renderResult.rerender(
      <Provider store={store}>
        <Topbar {...props} withLanguageSwitch={false}>
          <MenuItem {...defaultMenuItemProps}>Test Menu</MenuItem>
          <MenuItem {...defaultMenuItemProps}>Non-Selected Menu</MenuItem>
          <MenuItem {...selectedMenuItemProps}>Selected Menu</MenuItem>
        </Topbar>
      </Provider>,
    );
    expect(renderResult.queryAllByTestId('language-switch')).toHaveLength(0);
  });
});

