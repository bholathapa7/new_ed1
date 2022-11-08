import { storiesOf } from '@storybook/react';
import React, { FC, useState } from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';

import { UseState } from '^/hooks';
import * as M from '^/store/Mock';
import * as T from '^/types';
import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';
import { ContentsListItemTitle, Props } from './';

const Wrapper = styled.div({
  margin: '20px',
});

const Component: FC = () => {
  const [isTitleEditing, setIsTitleEditing]: UseState<boolean> = useState<boolean>(false);

  const createProps: () => Props = () => ({
    content: M.sampleContentFromType(T.ContentType.LENGTH),
    isEditing: false,
    isTitleEditing, setIsTitleEditing,
    fromUI: T.EditableTextUI.CONTENT_TITLE,
  });
  const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

  return (
    <Provider store={store}>
      <Wrapper>
        <ContentsListItemTitle {...createProps()} />
      </Wrapper>
    </Provider>
  );
};

storiesOf('Atom|ContentsListItemTitle', module).add('default', () => <Component />);
