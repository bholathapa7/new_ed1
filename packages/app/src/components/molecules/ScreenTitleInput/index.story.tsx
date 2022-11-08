import { action } from '@storybook/addon-actions';
import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';

import * as T from '^/types';
import { withState } from '^/utilities/storybook-state.story';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { Props, ScreenTitleInput } from '.';

const Wrapper = styled.div({
  width: '254px',
});

const appearAt: Date = new Date();

const story: StoryApi = storiesOf('Molecules|ScreenTitleInput', module);
const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

interface State {
  title?: string;
}

[T.CalendarScreenSize.S, T.CalendarScreenSize.M].map((size: Props['size']) => {
  story.add(size, withState<State>({
    title: undefined,
  })(({ state, setState }) => {
    const onTitleChange: (title: string) => void = (title) => {
      setState({ title });
    };

    return (
      <Provider store={store}>
        <Wrapper>
          <ScreenTitleInput
            size={size}
            appearAt={appearAt}
            title={state.title}
            onTitleChange={onTitleChange}
            onScreenPickerClose={action('onScreenPickerClose')}
          />
        </Wrapper>
      </Provider>
    );
  }));
});
