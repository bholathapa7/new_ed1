import { storiesOf } from '@storybook/react';
import React from 'react';

import palette from '^/constants/palette';
import Modal from './';

storiesOf('Atoms|Modal', module)
  .add('default', () => (
    <Modal backgroundColor={palette.textGray} zIndex={1}>
      <>
        {'환상의 나라로 오세요~'}
      </>
    </Modal>
  ));
