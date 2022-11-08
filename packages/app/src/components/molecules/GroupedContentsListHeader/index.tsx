import React, { FC, ReactNode, memo, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import GroupAddDisabledSvg from '^/assets/icons/contents-list/group-add-disabled.svg';
import GroupAddPinnedDisabledSvg from '^/assets/icons/contents-list/group-add-pinned-disabled.svg';
import GroupAddPinnedSvg from '^/assets/icons/contents-list/group-add-pinned.svg';
import GroupAddSvg from '^/assets/icons/contents-list/group-add.svg';
import CopyFolderIcon from '^/assets/icons/copy-folder-filled.svg';
import DeleteFolderIcon from '^/assets/icons/delete-filled.svg';
import palette from '^/constants/palette';
import { UseL10n, useIsRoleX, useL10n } from '^/hooks';
import { ChangeSelectedGroupId, AddNewGroup, CopySelectedGroup } from '^/store/duck/Groups';
import { OpenContentPagePopup } from '^/store/duck/Pages/Content';
import * as T from '^/types';
import { isContentPinned } from '^/utilities/content-util';
import { isRoleAdmin, isRoleDemo, isRolePilot, isRoleViewer } from '^/utilities/role-permission-check';
import Text from './text';

export const enum GroupedContentsListHeaderDataSortKeys {
  PROJECT = '1',
  SCREEN = '0',
}

const Root = styled.section<{ isPinnedGroups: boolean }>(({ isPinnedGroups }) => ({
  position: 'sticky',
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  top: isPinnedGroups ? '0' : '49px',
  height: '44px',
  fontSize: '14px',
  paddingLeft: '18.5px',
  paddingRight: '12.5px',
  backgroundColor: palette.SideBar.ContentslistBackground.toString(),
  color: palette.ContentsList.groupListHeaderTextGray.toString(),
}));
Root.displayName = 'GroupedContentsListHeader';

const TitleWrapper = styled.div`flex: 1;`;
TitleWrapper.displayName = 'TitleWrapper';

const SvgWrapper = styled.div<{ isDisabled: boolean }>(({ isDisabled }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '30px',
  height: '30px',
  cursor: isDisabled ? 'default' : 'pointer',
  borderRadius: '3px',
  ':hover': isDisabled ? undefined : {
    backgroundColor: palette.GroupedContentsHeader.iconBackgroundDisabled.toString(),
  },

  '& > svg': {
    fill: isDisabled ? palette.iconDisabled.toString() : palette.hoverUploadIcon.toString(),
  },
}));
SvgWrapper.displayName = 'SvgWrapper';

const GroupAddSvgWrapper: FC<Readonly<{ shouldShowPinIcon: boolean; isDisabled: boolean; onClick(): void }>> = ({
  shouldShowPinIcon,
  isDisabled,
  onClick,
}) => {
  const groupAddSvg: ReactNode = shouldShowPinIcon ?
    isDisabled ? <GroupAddPinnedDisabledSvg /> : <GroupAddPinnedSvg /> :
    isDisabled ? <GroupAddDisabledSvg /> : <GroupAddSvg />;

  return (
    <div style={{ transform: shouldShowPinIcon ? 'translateX(2px)' : undefined }}>
      <SvgWrapper onClick={onClick} isDisabled={isDisabled}>
        {groupAddSvg}
      </SvgWrapper>
    </div>
  );
};

type Props = Readonly<{
  isPinnedGroups: boolean;
  hasPinnedFolder?: boolean;
}>;

export const GroupedContentsListHeader: FC<Props> = memo((({
  isPinnedGroups,
  hasPinnedFolder = false,
}) => {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();

  const sidebarTab = useSelector((s: T.State) => s.Pages.Contents.sidebarTab);
  const printingContentId = useSelector((s: T.State) => s.Pages.Contents.printingContentId);
  const selectedGroupId = useSelector((s: T.State) => s.Groups.selectedGroupIdByTab[sidebarTab]);

  const isSelectedGroupPinned = useSelector((s: T.State) => {
    const group = s.Contents.contents.byId[selectedGroupId ?? NaN];
    if (group === undefined) {
      return false;
    }

    return isContentPinned(group);
  });
  const isDisabled: boolean = Boolean(printingContentId);
  const isViewer: boolean = useIsRoleX(isRoleViewer);
  const isPilot: boolean = useIsRoleX(isRolePilot);
  const isAdmin: boolean = useIsRoleX(isRoleAdmin);
  const isDemo: boolean = useIsRoleX(isRoleDemo);

  const addNewGroup: () => void = useCallback(() => {
    if (printingContentId) return;
    // the user who has a role as viewer is not allowed to create a new content
    if (isViewer) {
      dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));

      return;
    }

    // the user who has a role as demo is not allowed to create a new content in Overlay
    if (isDemo && sidebarTab === T.ContentPageTabType.OVERLAY) {
      dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));

      return;
    }

    // Avoid lagging behind the previously selected group by clearing them first.
    dispatch(ChangeSelectedGroupId({ tab: sidebarTab }));
    dispatch(AddNewGroup({ isPinned: isPinnedGroups }));
  }, [printingContentId, isViewer]);

  const copySelectedGroup: () => void = useCallback(() => {
    if (printingContentId) return;
    // the user who has a role as viewer is not allowed to copy a content
    if (isViewer) {
      dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));

      return;
    }

    // Avoid lagging behind the previously selected group by clearing them first.
    dispatch(ChangeSelectedGroupId({ tab: sidebarTab }));
    dispatch(CopySelectedGroup({ isPinned: isPinnedGroups, selectedGroupId }));
  }, [printingContentId, isViewer, selectedGroupId, isPinnedGroups, sidebarTab]);

  const deleteGroupConfirm: () => void = useCallback(() => {
    if (printingContentId) return;
    // only the user who has a role as pilot or admin of project can delete the group
    if (isPilot || isAdmin) {
      dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.DELETE_GROUP }));

      return;
    }
    dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));
  }, [printingContentId]);

  const isGroupSelected = selectedGroupId !== undefined && isSelectedGroupPinned === isPinnedGroups;

  const copyGroupSvg: ReactNode = useMemo(() => (isGroupSelected && sidebarTab === T.ContentPageTabType.ESS ?
    <SvgWrapper onClick={copySelectedGroup} isDisabled={isDisabled}>
      <CopyFolderIcon />
    </SvgWrapper> :
    null
  ), [isGroupSelected, sidebarTab, copySelectedGroup, isDisabled]);

  const deleteGroupSvg: ReactNode = useMemo(() => (isGroupSelected ?
    <SvgWrapper onClick={deleteGroupConfirm} isDisabled={isDisabled}>
      <DeleteFolderIcon />
    </SvgWrapper> :
    null
  ), [isGroupSelected, deleteGroupConfirm, isDisabled]);

  const titleText: string = isPinnedGroups ?
    l10n(Text.groupListHeader.pinned[sidebarTab]) :
    l10n(Text.groupListHeader.unpinned[sidebarTab]);

  const dataCtxSortKey: GroupedContentsListHeaderDataSortKeys =
    isPinnedGroups ? GroupedContentsListHeaderDataSortKeys.PROJECT : GroupedContentsListHeaderDataSortKeys.SCREEN;

  return (
    <Root isPinnedGroups={isPinnedGroups} data-ctxsort='GroupedContentsListHeader' data-ctxsort-key={dataCtxSortKey}>
      <TitleWrapper>{titleText}</TitleWrapper>
      {copyGroupSvg}
      {deleteGroupSvg}
      <GroupAddSvgWrapper shouldShowPinIcon={isPinnedGroups && hasPinnedFolder} onClick={addNewGroup} isDisabled={isDisabled} />
    </Root>
  );
}));
