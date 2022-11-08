import React, { FC, ReactChild } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

interface ContainerProps {
  hasSubDescription: boolean;
}

const Container = styled.div<ContainerProps>(({ hasSubDescription }) => ({
  display: 'grid',
  gridTemplateRows: hasSubDescription ? 'repeat(2, 1fr)' : '1fr',
  alignItems: hasSubDescription ? 'flex-start' : 'center',
  gridGap: '10px',
  marginBottom: hasSubDescription ? 0 : '10px',
}));

const MainTitle = styled.h2({
  display: 'inline',
  marginRight: '10px',

  fontSize: '15px',
  lineHeight: 1,
  fontWeight: 500,
  color: palette.textBlack.toString(),
});

const Description = styled.h3({
  display: 'inline',

  fontSize: '12px',
  lineHeight: 1,
  fontWeight: 'normal',
  color: palette.textLight.toString(),
});

export interface Props {
  readonly title: ReactChild;
  readonly description: string;
  readonly subDescription?: string;
}

const TitleWithDescription: FC<Props> = (
  { description, subDescription, title },
) => (
  <Container hasSubDescription={subDescription !== undefined} >
    <div>
      <MainTitle>{title}</MainTitle>
      <Description>{description}</Description>
    </div>
    {subDescription && <Description>{subDescription}</Description>}
  </Container>
);
export default TitleWithDescription;
