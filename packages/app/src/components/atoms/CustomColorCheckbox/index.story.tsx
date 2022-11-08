import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import { CustomColorCheckbox } from './';

storiesOf('Atoms|CustomColorCheckbox', module)
  .add('checked - default color', () => (
    <CustomColorCheckbox checked={true} onChange={action('click')}>
      {'some label'}
    </CustomColorCheckbox>
  ))
  .add('unchecked - default color', () => (
    <CustomColorCheckbox checked={false} onChange={action('click')}>
      {'some label'}
    </CustomColorCheckbox>
  ))
  .add('checked - custom color', () => (
    <CustomColorCheckbox checked={true} onChange={action('click')} color={'#098e79'}>
      {'some label'}
    </CustomColorCheckbox>
  ))
  .add('unchecked - custom color', () => (
    <CustomColorCheckbox checked={false} onChange={action('click')} color={'#098e79'}>
      {'some label'}
    </CustomColorCheckbox>
  ))
  .add('react nodes as label', () => (
    <CustomColorCheckbox checked={false} onChange={action('click')} color={'#098e79'}>
      <a href={'https://google.com'} target={'_blank'} rel={'noreferrer'}>Google</a>{' is my website'}
    </CustomColorCheckbox>
  ));
