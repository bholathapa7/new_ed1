import { storiesOf } from '@storybook/react';
import React from 'react';
import { CSSObject } from 'styled-components';

import { PoweredBy } from './';

storiesOf('Atoms|PoweredBy', module)
  .add('default', () => (
    <PoweredBy />
  ))
  .add('custom style', () => {
    const customStyle: CSSObject = {
      marginLeft: '25px',
    };

    return (
      <PoweredBy customStyle={customStyle} />
    );
  });
