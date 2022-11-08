import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';

import * as T from '^/types';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { Props, SidebarHeaderTab } from '.';

const Wrapper =
  styled.div({
    margin: '30px',
  });

const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

storiesOf('Molecules|SidebarHeaderTab', module)
  .add('default', () => {
    const props: Props = {
      viewMode: T.CalendarScreenTab.LIST,
      onTabClick: action('onTabClick'),
    };

    return (
      <Provider store={store}>
        <Wrapper>
          <SidebarHeaderTab {...props} />
        </Wrapper>
      </Provider>
    );
  });
