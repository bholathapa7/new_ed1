import { storiesOf } from '@storybook/react';
import React from 'react';

import WrapperHoverable, { Props } from './';

const tooltipCustomStyle: Props['customStyle'] = {
  tooltipWrapperStyle: { position: 'relative' },
  tooltipArrowStyle: {
    left: '50%',
    transform: 'translate(-50%)',
  },
  tooltipBalloonStyle: {
    left: '50%',
    transform: 'translate(-50%, 3px)',
    bottom: 'auto',

    fontWeight: 'bold',
  },
};
storiesOf('Atoms|WrapperHoverable', module)
  .add('default', () => {
    const props: Props = {
      title: 'ddasdfasd 테스트 하는중 가나다라마 엔젤스윙',
      customStyle: tooltipCustomStyle,
    };

    return (
      <div style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
        <WrapperHoverable {...props}>
          <div style={{ backgroundColor: 'gray', width: '10px', height: '10px', flex: 1 }} />
        </WrapperHoverable>
      </div>
    );
  },
  );
