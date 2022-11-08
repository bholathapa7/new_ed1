import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import Dropdown, { createOptions } from './';

storiesOf('Atoms|V2 Dropdown', module)
  .add('basic dropdown', () => (
    <Dropdown
      value='first'
      placeHolder='hi'
      options={createOptions(['first', 'second', 'third'])}
      onClick={action('item-click')}
      zIndex={1}
      menuItemHeight={'34px'}
    />
  ))
  .add('scroll dropdown', () => (
    <Dropdown
      value='1'
      placeHolder='hi'
      options={createOptions(['1', '2', '3', '4', '5', '6', '7'])}
      onClick={action('item-click')}
      zIndex={1}
      height={'200px'}
      menuItemHeight={'34px'}
    />
  ))
  .add('searchable scroll dropdown', () => (
    <Dropdown
      value='1'
      placeHolder='hi'
      options={createOptions(['1', '11', '111', '1111', '11111', '111111', '1111111'])}
      onClick={action('item-click')}
      zIndex={1}
      height={'150px'}
      isSearchEnabled={true}
      menuItemHeight={'34px'}
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
        menuItemHeight={'34px'}
      />
      <Dropdown
        value={undefined}
        placeHolder='some place'
        options={createOptions(['first', 'second', 'third'])}
        onClick={action('item-click-lower')}
        zIndex={0}
        menuItemHeight={'34px'}
      />
    </div>
  ));
