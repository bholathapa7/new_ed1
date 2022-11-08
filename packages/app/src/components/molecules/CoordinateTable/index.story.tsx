import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';

import * as T from '^/types';
import CoordinateTable from '.';

const Wrapper = styled.div({
  width: '500px',
  height: '500px',
});

const titles: Array<string> = ['라벨', '라벨', '', ''];
const rows: Array<Array<string>> = [
  ['a', 'b', 'c', 'd'],
  ['', '', '', ''],
  ['', '', '', ''],
  ['', '', '', ''],
  ['', '', '', ''],
];
storiesOf('Molecules|CoordinateTable', module)
  .add('default', () => (
    <Wrapper>
      <CoordinateTable
        coordinateSystem={T.ProjectionEnum.WGS84_EPSG_4326_LL}
        titles={titles}
        rows={rows}
        onTitlesChange={action('onTitlesChange')}
        onRowsChange={action('onRowsChange')}
      />
    </Wrapper>
  ));
