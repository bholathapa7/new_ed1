import { storiesOf } from '@storybook/react';
import React from 'react';

import { sampleContentFromType } from '^/store/Mock';
import * as T from '^/types';
import CopyContentButton from '.';

storiesOf('Atoms|CopyContentButton', module)
  .add('default', () =>
    <CopyContentButton content={sampleContentFromType(T.ContentType.MAP)} isDisabled={false} />
  );
