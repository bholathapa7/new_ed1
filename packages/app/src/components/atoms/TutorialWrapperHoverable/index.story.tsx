import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React, { ReactNode } from 'react';
import styled from 'styled-components';

import ExampleImage1 from '^/assets/icons/tutorial/volume-sbvc-kr.png';
import palette from '^/constants/palette';
import { TutorialPosition, TutorialWrapperHoverable } from '.';

const Root = styled.div({
  padding: '500px',
});

const Button = styled.button({
  width: '20px',
  height: '20px',

  backgroundColor: palette.borderGreen.toString(),
  cursor: 'pointer',
});

const Img1 = styled.img.attrs({
  src: ExampleImage1,
})({
  width: '198px',
  height: '57px',

  marginTop: '4px',
  marginBottom: '19px',
});


const WIDTH: number = 226;
const IMAGE: ReactNode = <Img1 />;
const MARGIN: number = 30;

const TITLE: string = '다른 날짜와 비교';
const DESCRIPTION: string = '다른 날짜를 기준 밑면으로 선택하여 체적의 변화량을 계산합니다.';
const LINK: string = 'https://www.naver.com';

const story: StoryApi = storiesOf('Atoms|TutorialWrapperHoverable', module);

Object.values(TutorialPosition).map((position: TutorialPosition) => {
  story.add(position, () => (
    <Root>
      <TutorialWrapperHoverable
        width={WIDTH}
        position={position}
        margin={MARGIN}

        image={IMAGE}
        title={TITLE}

        description={DESCRIPTION}
        link={LINK}
        isZendesk={false}
      >
        <Button />
      </TutorialWrapperHoverable>
    </Root>
  ));
});
