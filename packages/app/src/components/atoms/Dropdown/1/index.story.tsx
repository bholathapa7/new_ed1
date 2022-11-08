import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import Dropdown, { createOptions } from './';

storiesOf('Atoms|Dropdown', module)
  .add('basic dropdown', () => (
    <Dropdown
      value='first'
      placeHolder='hi'
      options={createOptions(['first', 'second', 'third'])}
      onClick={action('item-click')}
      zIndex={1}
    />
  ))
  .add('overlapping dropdowns', () => (
    <div>
      <Dropdown
        value={'second'}
        placeHolder='hi holder'
        options={createOptions(['first', 'second', 'third'])}
        onClick={action('item-click-upper')}
        zIndex={1}
      />
      <Dropdown
        value={undefined}
        placeHolder='some place'
        options={createOptions(['first', 'second', 'third'])}
        onClick={action('item-click-lower')}
        zIndex={0}
      />
    </div>
  ));
