import { storiesOf } from '@storybook/react';
import React from 'react';
import BreakLineText from './';


storiesOf('Atoms|BreakLineText', module)
  .add('default', () => {
    const textArray: Array<string> = ['데이터를 정상적으로 업로드하였습니다.', '도면을 처리하는데에 시간이 소요됩니다.'];

    return (
      <BreakLineText>
        {textArray}
      </BreakLineText>
    );
  });
