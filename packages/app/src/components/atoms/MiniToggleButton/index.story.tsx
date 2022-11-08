import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import MiniToggleButton, { Props } from './';

storiesOf('Atoms|MiniToggleButton', module)
  .add('default', () => {
    const props: Props = {
    };

    return (
      <MiniToggleButton {...props} />
    );
  })
  .add('with onChange props', () => {
    const props: Props = {
      onChange: action('change'),
    };

    return (
      <MiniToggleButton {...props} />
    );
  })
  .add('with value props', () => {
    const props: Props = {
      isRight: true,
    };

    return (
      <MiniToggleButton {...props} />
    );
  })
  .add('with value and onChange props', () => {
    const props: Props = {
      isRight: true,
      onChange: action('click'),
    };

    return (
      <MiniToggleButton {...props} />
    );
  });
