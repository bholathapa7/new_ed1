import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import { format } from 'date-fns';
import _ from 'lodash-es';
import React from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';

import { mockScreens } from '^/store/Mock';
import * as T from '^/types';
import { Formats } from '^/utilities/date-format';
import { withState } from '^/utilities/storybook-state.story';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { DateScreenList } from '.';

const Wrapper = styled.div({
  width: '254px',
  height: '333px',
});

const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);
const dates: Array<Date> = _.uniqBy(mockScreens.screens, (screen) => format(screen.appearAt, Formats.YYYYMMDD)).map((screen) => screen.appearAt);

interface State {
  clickedScreenId?: T.Screen['id'];
}

const story: StoryApi = storiesOf('Organisms|DateScreenList', module);

Object.values(T.CalendarScreenSize).map((size) => (
  story.add(size, withState<State>({
    clickedScreenId: undefined,
  })(({
    state,
    setState,
  }) => {
    const onScreenClick: (screen: T.Screen) => void = (screen) => setState({
      clickedScreenId: screen.id,
    });

    return (
      <Provider store={store}>
        <Wrapper>
          <DateScreenList
            size={size}
            dates={dates}
            clickedScreenId={state.clickedScreenId}
            onScreenClick={onScreenClick}
          />
        </Wrapper>
      </Provider>
    );
  }))
));
