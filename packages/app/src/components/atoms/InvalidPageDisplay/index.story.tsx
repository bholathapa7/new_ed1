import { storiesOf } from '@storybook/react';
import React from 'react';

import * as T from '^/types';
import InvalidPageDisplay from './';

storiesOf('Atoms|InvalidPageDisplay', module)
  .add('default', () => (
    <InvalidPageDisplay httpErrorStatus={undefined} />
  ))
  .add(T.HTTPError.CLIENT_UNAUTHORIZED_ERROR, () => (
    <InvalidPageDisplay httpErrorStatus={T.HTTPError.CLIENT_UNAUTHORIZED_ERROR} />
  ))
  .add(T.HTTPError.CLIENT_NOT_FOUND_ERROR, () => (
    <InvalidPageDisplay httpErrorStatus={T.HTTPError.CLIENT_NOT_FOUND_ERROR} />
  ));
