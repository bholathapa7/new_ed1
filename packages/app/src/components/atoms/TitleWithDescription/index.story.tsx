import { storiesOf } from '@storybook/react';
import React, { ReactChild } from 'react';

import TitleWithDescription from './';

storiesOf('Atoms|TitleWithDescription', module)
  .add('default', () => {
    const title: ReactChild = <span>Title</span>;
    const description: string = 'Description of the title.';

    return (
      <TitleWithDescription
        title={title}
        description={description}
      />
    );
  });
