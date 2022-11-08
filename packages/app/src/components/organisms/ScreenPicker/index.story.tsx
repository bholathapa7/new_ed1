import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React, { ReactNode, useState } from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';

import { action } from '@storybook/addon-actions';
import { UseState } from '^/hooks';
import * as T from '^/types';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { NewScreen, ScreenPicker } from '.';


const Root = styled.div({
  width: '100%',
  height: 'auto',

  margin: '20px',

  display: 'flex',
  flexWrap: 'wrap',
});

const Wrapper = styled.div<{ size: T.CalendarScreenSize }>(({ size }) => ({
  ...({
    [T.CalendarScreenSize.S]: {},
    [T.CalendarScreenSize.M]: {},
    [T.CalendarScreenSize.L]: {
      width: '306px',
    },
  })[size],
}));

const Divider = styled.div({ width: '20px', height: '100%', background: '#d9d9d9', color: 'transparent' });


const story: StoryApi = storiesOf('Organisms|ScreenPicker', module);

story.add('default', () => {
  const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);
  const { Screens: { screens } }: T.State = store.getState();
  const [currentScreenId, setCurrentScreenId]: UseState<Readonly<T.Screen['id']>> = useState<Readonly<T.Screen['id']>>(screens[0].id);

  const setLastSelectedScreen: (screen: T.Screen) => void = (screen) => {
    setCurrentScreenId(screen.id);
  };

  const onScreenPickerSubmit: () => void = () => {
    action('onScreenPickerSubmit');
  };

  const onScreenPickerDismiss: () => void = () => {
    action('onScreenPickerDismiss');
  };

  const pickers: ReactNode = Object.values(T.CalendarScreenSize).map((size, key1) =>
    Object.values(T.CalendarScreenTab).map((tab, key2) => (
      <>
        <Wrapper key={`${key1} ${key2}`} size={size}>
          <ScreenPicker
            defaultViewMode={tab}
            size={size}
            currentScreenId={currentScreenId}
            onChange={setLastSelectedScreen}
          />
        </Wrapper>
        <Divider />
      </>
    )),
  );

  const pickersWithButton: ReactNode = Object.values(T.CalendarScreenSize).map((size, key1) =>
    Object.values(T.CalendarScreenTab).map((tab, key2) => (
      <>
        <Wrapper key={`${key1} ${key2}`} size={size}>
          <ScreenPicker
            defaultViewMode={tab}
            size={size}
            currentScreenId={currentScreenId}
            onChange={setLastSelectedScreen}
            onSubmit={onScreenPickerSubmit}
            onDismiss={onScreenPickerDismiss}
          />
        </Wrapper>
        <Divider />
      </>
    )),
  );

  return (
    <Provider store={store}>
      <Root>
        {pickers}
        {pickersWithButton}
      </Root>
    </Provider>
  );
});

story.add('with input', () => {
  const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

  const [selectedScreenId, setSelectedScreenId]: UseState<Readonly<T.Screen['id'] | undefined>> = useState<Readonly<T.Screen['id'] | undefined>>();
  const [newScreen, setNewScreen]: UseState<Readonly<NewScreen | undefined>> = useState<Readonly<T.Screen | undefined>>();

  const onNewScreenChange: (screen: NewScreen) => void = (screen) => {
    setNewScreen(screen);
    setSelectedScreenId(undefined);
  };

  const onSubmit: () => void = () => action('onSubmit');
  const onDismiss: () => void = () => action('onDismiss');

  const pickers: ReactNode = [T.CalendarScreenSize.S, T.CalendarScreenSize.M]
    .map((size: Exclude<T.CalendarScreenSize, T.CalendarScreenSize.L>, key1) =>
      Object.values(T.CalendarScreenTab).map((tab, key2) => (
        <>
          <Wrapper key={`${key1} ${key2}`} size={size}>
            <ScreenPicker
              size={size}
              defaultViewMode={tab}
              currentScreenId={selectedScreenId}
              newScreen={newScreen}
              isEditable={true}
              onNewScreenChange={onNewScreenChange}
              onSubmit={onSubmit}
              onDismiss={onDismiss}
            />
          </Wrapper>
          <Divider />
        </>
      )),
    );

  return (
    <Provider store={store}>
      <Root>
        {pickers}
      </Root>
    </Provider>
  );
});
