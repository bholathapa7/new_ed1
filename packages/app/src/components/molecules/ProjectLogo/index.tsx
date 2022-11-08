import React, { FC, memo } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { MediaQuery } from '^/constants/styles';
import * as T from '^/types';

const Logo = styled.img({
  maxWidth: '100px',
  maxHeight: '100px',
  opacity: 0.6,

  backdropFilter: 'blur(0)',

  pointerEvents: 'none',

  [MediaQuery[T.Device.MOBILE_L]]: {
    display: 'none',
  },
});

const ProjectLogo: FC = () => {
  const { Pages: { Contents: { projectId } }, Projects: { projects } }: T.State
    = useSelector((state: T.State) => state);

  const project: T.Project | undefined
    = (projectId !== undefined && projects.allIds.includes(projectId)) ?
      projects.byId[projectId] : undefined;

  if (project?.logo === undefined) {
    return null;
  }

  return <Logo src={project.logo} alt='project-logo' />;
};

export default memo(ProjectLogo);
