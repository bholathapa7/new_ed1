import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React, { useState } from 'react';

import BetaSVG from '^/assets/icons/upload-popup/beta.svg';
import { UseState } from '^/hooks';
import CardOption, { Props } from '.';

const story: StoryApi = storiesOf('Atoms|CardOption', module);

const customStyle: Props['customStyle'] = {
  card: {
    default: {
      width: '148px',
      height: '216px',
      marginBottom: '10px',
    },
    image: { width: '33px', height: '16px' },
    title: { height: '36px', fontSize: '13px' },
    description: { fontSize: '12px' },
  },
  checkbox: {
    width: '20px',
    height: '20px',
  },
};

story.add('default', () => {
  const [isSelected, onClick]: UseState<boolean> = useState(false);

  return (
    <div style={{ display: 'flex' }}>
      <CardOption
        customStyle={customStyle}
        isSelected={isSelected}
        image={<BetaSVG />}
        title={['기존 데이터 세트', '+ 3D 메쉬']}
        description={'정사영상, 수치표면모델, 포인트 클라우드, 3D 정사영상으로 구성된 기본 데이터 세트를 생성합니다.'}
        onSelect={onClick}
      />
      <CardOption
        customStyle={customStyle}
        isSelected={isSelected}
        title={'기존 데이터 세트'}
        description={'기본 데이터 세트 외에 3D 메쉬 데이터를 추가로 생성합니다.'}
        onSelect={onClick}
      />
    </div>
  );
});
