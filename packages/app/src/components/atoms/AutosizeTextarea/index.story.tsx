import { storiesOf } from '@storybook/react';
import React from 'react';

import AutosizeTextarea from './';

storiesOf('Atoms|AutosizeTextarea', module)
  .add('default', () => {
    const curValue: string = 'asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf'
                           + ' asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf';

    return (
      <AutosizeTextarea
        value={curValue}
        customStyle={{ width: '100px', padding: '15px', boxSizing: 'border-box' }}
      />
    );
  })
;
