import { storiesOf } from '@storybook/react';
import React from 'react';
import GeolocationButton from '.';

storiesOf('Atoms|GeolocationButton', module)
  .add('default', () => (
    <GeolocationButton />
  ));
