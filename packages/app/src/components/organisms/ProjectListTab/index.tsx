import React, { FC, ReactNode, useEffect } from 'react';
import styled from 'styled-components';

import { l10n } from '^/utilities/l10n';

import palette from '^/constants/palette';
import { MediaQuery } from '^/constants/styles';

import * as T from '^/types';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import ProjectListAdd from '^/components/molecules/ProjectListAdd';
import ProjectListItem from '^/components/molecules/ProjectListItem';

import Text from './text';
import { usePrevProps } from '^/hooks';

const Root = styled.div({
  paddingTop: '45px',
  paddingRight: '30px',
  paddingLeft: '30px',
});

const Title = styled.h1({
  fontSize: '22px',
  lineHeight: 1,
  color: palette.textBlack.toString(),
});

const ProjectList = styled.ul({
  display: 'flex',
  flexWrap: 'wrap',

  width: '100%',
  height: '100%',
  marginTop: '20px',

  listStyle: 'none',

  '& > li': {
    flex: 'none',

    boxSizing: 'border-box',
    width: '320px',
    height: '220px',
    [MediaQuery[T.Device.MOBILE_L]]: {
      width: '100%',
    },

    marginRight: '15px',
    marginBottom: '20px',

    borderRadius: '3px',

    cursor: 'pointer',
  },
});

export interface Props {
  readonly timezoneOffset: number;
  readonly userId?: T.User['id'];
  readonly projects: Array<T.Project>;
  openPopup(popup: T.ProjectPagePopupType): void;
  onProjectClick(project: T.Project): void;
  onSettingClick(project: T.Project): void;
}

/**
 * Project page List tab component class
 */

const ProjectListTab: FC<Props & L10nProps> = ({
  projects, timezoneOffset, userId, language, openPopup, onProjectClick, onSettingClick,
}) => {
  const prevProject = usePrevProps<T.Project[]>(projects);

  useEffect(() => {
    const doesNewPendingProjectExist: boolean = projects.some((project) => project.permissionStatus === T.AcceptStatus.PENDING &&
    prevProject?.every((p) => project.id !== p.id));
    if (doesNewPendingProjectExist) {
      openPopup(T.ProjectPagePopupType.ACCEPT);
    }
  }, [projects.length]);

  const handleAddClick = () => {
    openPopup(T.ProjectPagePopupType.ADD);
  };

  const projectToElement: (project: T.Project) => ReactNode = (project) => {
    const handleProjectClick: () => void = () => onProjectClick(project);
    const handleSettingClick: () => void = () => onSettingClick(project);

    return (
      <ProjectListItem
        key={project.id}
        timezoneOffset={timezoneOffset}
        project={project}
        isShared={userId !== project.owner.id}
        isDemo={project.permissionRole === T.PermissionRole.DEMO}
        onClick={handleProjectClick}
        onSettingClick={handleSettingClick}
      />
    );
  };

  const validProjects: Array<T.Project> =
    projects
      .filter((project) => project.permissionStatus === T.AcceptStatus.ACCEPTED)
      .sort((a, b) => a.id - b.id);

  return (
    <Root>
      <Title>{l10n(Text.title, language)}</Title>
      <ProjectList>
        <ProjectListAdd onClick={handleAddClick} />
        {validProjects.map(projectToElement)}
      </ProjectList>
    </Root>
  );
};

export default withL10n(ProjectListTab);
