import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import ToggleButton, { Props } from './';

storiesOf('Atoms|ToggleButton', module)
  .add('default', () => {
    const props: Props = {
      leftText: '2D',
      rightText: '3D',
    };

    return (
      <ToggleButton {...props} />
    );
  })
  .add('with onChange props', () => {
    const props: Props = {
      leftText: '2D',
      rightText: '3D',
      onChange: action('change'),
    };

    return (
      <ToggleButton {...props} />
    );
  })
  .add('with value props', () => {
    const props: Props = {
      leftText: '2D',
      rightText: '3D',
      isRight: true,
    };

    return (
      <ToggleButton {...props} />
    );
  })
  .add('with value and onChange props', () => {
    const props: Props = {
      leftText: '2D',
      rightText: '3D',
      isRight: true,
      onChange: action('click'),
    };

    return (
      <ToggleButton {...props} />
    );
  });
