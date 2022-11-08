import { storiesOf } from '@storybook/react';
import React from 'react';

import * as T from '^/types';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { Provider } from 'react-redux';
import { TopBarScreenTitle } from '.';

const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

storiesOf('Molecules|TopBarScreenTitle', module)
  .add('L', () => (
    <Provider store={store}>
      <pre>
        {`
            에러 나는 거 테스트 하려면
            '어쩌라고랑 똑같은 날짜'
            '어쩌라고'
            를 쳐 보세요. 
          `}
      </pre>
      <div>
        <TopBarScreenTitle />
      </div>
    </Provider>
  ))
  .add('S', () => (
    <Provider store={store}>
      <pre>
        {`
            에러 나는 거 테스트 하려면
            '어쩌라고랑 똑같은 날짜'
            '어쩌라고'
            를 쳐 보세요. 
          `}
      </pre>
      <div>
        <TopBarScreenTitle />
      </div>
    </Provider>
  ));
