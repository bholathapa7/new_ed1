import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import ColorPickerPopup, { Props } from './';

import * as T from '^/types';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

import palette from '^/constants/palette';

storiesOf('Atom|ColorPickerPopup', module)
  .add('default',
    () => {
      const colors: Props['colors'] = [
        [palette.measurements.length, palette.measurements.area, palette.measurements.marker],
        [palette.measurements.volume, ...palette.pickColors.slice(0, 2)],
        // eslint-disable-next-line no-magic-numbers
        [...palette.pickColors.slice(2, 5)],
      ];
      const createProps: () => Props = () => ({
        clickedColor: palette.measurements.volume,
        colors,
        setColor: action('setColor'),
      });
      const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

      return (
        <Provider store={store}>
          <ColorPickerPopup {...createProps()} />
        </Provider>
      );
    });
