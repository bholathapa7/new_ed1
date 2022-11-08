import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';

import * as T from '^/types';
import { withState } from '^/utilities/storybook-state.story';
import { Props, ScreenPickerTab } from '.';

const Wrapper = styled.div({
  margin: '30px',
});

const story: StoryApi = storiesOf('Atoms|ScreenPickerTab', module);

[T.CalendarScreenSize.S, T.CalendarScreenSize.M].map((size: Props['size']) => (
  story.add(size, withState({ tab: T.CalendarScreenTab.CALENDAR })(({
    state,
    setState,
  }) => {
    const props: Props = {
      size,
      viewMode: state.tab,
      onTabClick: (tab) => setState({ tab }),
    };

    return (
      <Wrapper>
        <ScreenPickerTab {...props} />
      </Wrapper>
    );
  }))
));
