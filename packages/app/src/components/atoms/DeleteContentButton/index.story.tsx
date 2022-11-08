import { storiesOf } from '@storybook/react';
import React from 'react';

import { sampleContentFromType } from '^/store/Mock';
import * as T from '^/types';
import DeleteContentButton from '.';

storiesOf('Atoms|DeleteContentButton', module)
  .add('default', () => (
    <DeleteContentButton content={sampleContentFromType(T.ContentType.MAP)} isDisabled={false} />
  ));
