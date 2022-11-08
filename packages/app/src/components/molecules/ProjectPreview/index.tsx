import React, { FC } from 'react';
import styled from 'styled-components';

import { Project } from '^/types';

import palette from '^/constants/palette';

interface RootProps {
  readonly thumbnail?: string;
}
const Root = styled.div<RootProps>({
  boxSizing: 'border-box',
  width: '261px',
  height: '183px',
  padding: '25px',
  borderRadius: '3px',
}, ({ thumbnail }) => {
  const emptyAlpha: number = 0.45;
  const backgroundAlpha: number = 0.35;

  return {
    backgroundColor: thumbnail !== undefined ?
      palette.black.alpha(backgroundAlpha).toString() :
      palette.black.alpha(emptyAlpha).toString(),
    backgroundImage: `url(${thumbnail})`,
    backgroundSize: 'cover',
  };
});

const ProjectText = styled.h3({
  fontSize: '15px',
  lineHeight: 1,
  fontWeight: 'bold',
  color: palette.white.toString(),
});

const Title = styled.h3({
  marginTop: '6px',

  fontSize: '15px',
  lineHeight: '21px',
  fontWeight: 'bold',
  color: palette.white.toString(),
});
Title.displayName = 'Title';

export interface Props {
  readonly project?: Project;
}

const ProjectPreview: FC<Props> = (
  { project },
) => {
  const thumbnail: string | undefined =
    project !== undefined ? project.thumbnail : undefined;
  const title: string =
    project !== undefined ? project.title : '';

  return (
    <Root thumbnail={thumbnail}>
      <ProjectText>PROJECT</ProjectText>
      <Title data-testid='project-preview-title'>{title}</Title>
    </Root>
  );
};
export default ProjectPreview;
