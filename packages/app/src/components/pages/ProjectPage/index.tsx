import React, { FC, useEffect, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import palette from '^/constants/palette';

import { exhaustiveCheck } from '^/utilities/exhaustive-check';

import * as T from '^/types';

import { SignUpTutorialPopup } from '^/components/molecules/SignUpTutorialPopup';
import ProjectMarketTab from '^/components/organisms/ProjectMarketTab';
import ProjectPilotTab from '^/components/organisms/ProjectPilotTab';
import NoPermissionPopup from '^/containers/molecules/NoPermissionPopup';
import ProjectTopbar from '^/containers/molecules/ProjectTopbar';
import UserUpdateSuccessPopup from '^/containers/molecules/UserUpdateSuccessPopup';
import ConfirmUserUpdatePopup from '^/components/organisms/ConfirmUserUpdatePopup';
import ProjectAcceptPopup from '^/containers/organisms/ProjectAcceptPopup';
import ProjectAddPopup from '^/components/organisms/ProjectAddPopup';
import ProjectDeletePopup from '^/containers/organisms/ProjectDeletePopup';
import ProjectListTab from '^/containers/organisms/ProjectListTab';
import ProjectManageTab from '^/containers/organisms/ProjectManageTab';
import ProjectMypageTab from '^/containers/organisms/ProjectMypageTab';
import ProjectInvitePopup from '^/components/organisms/ProjectInvitePopup';
import ProjectSharePopup from '^/components/organisms/ProjectSharePopup';
import ProjectSidebar from '^/components/organisms/ProjectSidebar';
import InviteAlertPopup from '^/components/organisms/InviteAlertPopup';
import ShareAlertPopup from '^/components/organisms/ShareAlertPopup';
import ProjectPermissionDeleteConfirmPopup from '^/components/molecules/ProjectPermissionDeleteConfirmPopup';

import { GetProjects } from '^/store/duck/Projects';


const Root = styled.div({
  display: 'flex',

  width: '100%',
  height: '100%',

  flexDirection: 'column',
  overflow: 'hidden',
});

const ProjectPageBody = styled.div({
  display: 'flex',

  width: '100%',
  height: '0px',
  flexGrow: 1,
});

const TabWrapper = styled.main({
  width: '100%',
  height: '100%',

  backgroundColor: palette.background.toString(),
  overflowY: 'scroll',
});

const selectTab: (tab: T.ProjectPageTabType) => ReactNode = (
  tab,
) => {
  switch (tab) {
    case T.ProjectPageTabType.LIST:
      return <ProjectListTab />;
    case T.ProjectPageTabType.MANAGE:
      return <ProjectManageTab />;
    case T.ProjectPageTabType.MYPAGE:
      return <ProjectMypageTab />;
    case T.ProjectPageTabType.MARKET:
      return <ProjectMarketTab />;
    case T.ProjectPageTabType.PILOT:
      return <ProjectPilotTab />;
    /* istanbul ignore next: exhaustive check is validated by type checking */
    default:
      return exhaustiveCheck(tab);
  }
};

const selectPopup: (popup?: T.ProjectPagePopupType) => ReactNode = (
  popup,
) => {
  const zIndexPopup: number = 300;

  switch (popup) {
    case T.ProjectPagePopupType.ADD:
      return <ProjectAddPopup zIndex={zIndexPopup} />;
    case T.ProjectPagePopupType.DELETE:
      return <ProjectDeletePopup zIndex={zIndexPopup} />;
    case T.ProjectPagePopupType.INVITE:
      return <ProjectInvitePopup zIndex={zIndexPopup} />;
    case T.ProjectPagePopupType.INVITE_ALERT:
      return <InviteAlertPopup zIndex={zIndexPopup} />;
    case T.ProjectPagePopupType.SHARE:
      return <ProjectSharePopup zIndex={zIndexPopup} />;
    case T.ProjectPagePopupType.SHARE_ALERT:
      return <ShareAlertPopup zIndex={zIndexPopup} />;
    case T.ProjectPagePopupType.ACCEPT:
      return <ProjectAcceptPopup zIndex={zIndexPopup} />;
    case T.ProjectPagePopupType.CONFIRM_USER_UPDATE:
      return <ConfirmUserUpdatePopup zIndex={zIndexPopup} />;
    case T.ProjectPagePopupType.USER_UPDATE_SUCCESS:
      return <UserUpdateSuccessPopup zIndex={zIndexPopup} />;

    case T.ProjectPagePopupType.NO_PERMISSION:
      return <NoPermissionPopup zIndex={zIndexPopup} />;

    case T.ProjectPagePopupType.SIGN_UP_TUTORIAL:
      return <SignUpTutorialPopup zIndex={zIndexPopup} />;
    case T.ProjectPagePopupType.CONFIRM_DELETE_PERMISSION:
      return <ProjectPermissionDeleteConfirmPopup zIndex={zIndexPopup} />;

    case undefined:
      return undefined;
    /* istanbul ignore next: exhaustive check is validated by type checking */
    default:
      return exhaustiveCheck(popup);
  }
};

const ProjectPage: FC = () => {
  const dispatch: Dispatch = useDispatch();

  const tab = useSelector((state: T.State) => state.Pages.Project.tab);
  const popup = useSelector((state: T.State) => state.Pages.Project.popup);

  const getProjects: () => void = useCallback(() => {
    dispatch(GetProjects());
  }, []);

  useEffect(() => {
    getProjects();

    // When the project page is fully loaded,
    // let Hotjar know it needs to start recording heatmaps.
    if (typeof hj !== 'undefined') {
      hj('trigger', 'ddm_projects');
    }
  }, []);

  return (
    <Root>
      {selectPopup(popup)}
      <ProjectTopbar />
      <ProjectPageBody>
        <ProjectSidebar />
        <TabWrapper>{selectTab(tab)}</TabWrapper>
      </ProjectPageBody>
    </Root>
  );
};

export default ProjectPage;
