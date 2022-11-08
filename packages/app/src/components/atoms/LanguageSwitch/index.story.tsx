import { storiesOf } from '@storybook/react';
import React from 'react';

import * as T from '^/types';

import LanguageSwitch, { Props } from './';

storiesOf('Atoms|LanguageSwitch', module)
  .add('default', () => {
    const props: Props = {
      target: [T.Language.KO_KR, T.Language.EN_US],
    };

    return (
      <LanguageSwitch {...props} />
    );
  });
