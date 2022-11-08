import React, { FC, memo } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

const Root = styled.div({});

const Heading = styled.h2.attrs({
  'data-testid': 'tutorialpanelcontent-heading',
})({
  fontSize: '15px',
  fontWeight: 'bold',

  lineHeight: 1.47,
  letterSpacing: 'normal',

  color: palette.textGray.toString(),

  paddingLeft: '10.2px',
});

const Main = styled.div({
  display: 'flex',
  flexDirection: 'row',
});

const Explanation = styled.p.attrs({
  'data-testid': 'tutorialpanelcontent-explanation',
})({
  width: '140px',

  fontSize: '13px',

  lineHeight: 1.46,

  padding: '10.8px 0 0 0',

  color: palette.textGray.toString(),
});

const ImageWrapper = styled.div.attrs({
  'data-testid': 'tutorialpanelcontent-ImageWrapper',
})({
  width: '148px',
  height: '129px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const Image = styled.img({
  width: '100%',
  height: '100%',
});

export interface Props {
  readonly heading: string;
  readonly explanation: string;
  readonly image: any;
}

const TutorialPanelContent: FC<Props> = ({ heading, explanation, image }) => (
  <Root>
    <Heading>
      {heading}
    </Heading>
    <Main>
      <ImageWrapper >
        <Image src={image} alt='tutorial-panel-image' />
      </ImageWrapper>
      <Explanation>
        {explanation}
      </Explanation>
    </Main>
  </Root>
);

export default memo(TutorialPanelContent);
