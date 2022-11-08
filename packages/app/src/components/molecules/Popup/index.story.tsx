import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React, { ReactNode } from 'react';

import Popup, { Pagination, Props } from './';

const props: Props = {
  zIndex: 1000,
  alpha: 1,
  title: 'Popup',
  onCloseClick: action('onCloseClick'),
};
const alph45: number = 0.45;
const sampleChildren: ReactNode = <div style={{ padding: '50px' }}>Hello, I am the child inside this Popup</div>;
const samplePagination: Pagination = {
  current: 1,
  max: 3,
};

storiesOf('Molecules|Popup', module)
  .add('default', () => <Popup {...props}>{sampleChildren}</Popup>)
  .add('alpha-45', () => <Popup {...props} alpha={alph45}>{sampleChildren}</Popup>)
  .add('with Description', () => <Popup {...props} closeTooltipText={'123213123123'}>{sampleChildren}</Popup>)
  .add('with Minimize', () => <Popup {...props} onMinimizeClick={action('onMinimizeClick')}>{sampleChildren}</Popup>)
  .add('with Previous Button', () => <Popup {...props} onPreviousClick={action('onPreviousClick')}>{sampleChildren}</Popup>)
  .add('with Pagination', () => <Popup {...props} pagination={samplePagination}>{sampleChildren}</Popup>);
