/* eslint-disable no-magic-numbers */
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';
import { addMouseAndTouchMoveEventListener } from '^/utilities/mouseTouchAdapter';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import styled from 'styled-components';
import LocationOverlay from '.';

storiesOf('Molecules|LocationOverlay', module)
  .add('Default', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    addMouseAndTouchMoveEventListener(document.body, () => {
      const coordX: HTMLElement | null = document.getElementById('coordX');
      const coordY: HTMLElement | null = document.getElementById('coordY');
      const coordZ: HTMLElement | null = document.getElementById('coordZ');

      if (coordX && coordY && coordZ) {
        coordX.textContent = (Math.random() * 10000).toFixed(6);
        coordY.textContent = (Math.random() * 10000).toFixed(6);
        coordZ.textContent = (Math.random() * 100).toFixed(2);
      }
    });

    const LocationOverlayWrapper = styled.div({ position: 'relative', width: '600px', height: '25px' });

    return (
      <Provider store={store}>
        <LocationOverlayWrapper>
          <LocationOverlay />
        </LocationOverlayWrapper>
      </Provider>
    );
  });
