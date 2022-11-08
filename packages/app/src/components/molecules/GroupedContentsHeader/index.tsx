import Sentry from '@sentry/browser';
import axios, { AxiosResponse } from 'axios';
import React, { FC, useCallback, ReactNode, memo, useMemo, MouseEvent, KeyboardEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled, { CSSObject } from 'styled-components';

import ArrowTriangleDownSvg from '^/assets/icons/contents-list/arrow-triangle-down.svg';
import ArrowTriangleRightSvg from '^/assets/icons/contents-list/arrow-triangle-right.svg';
import CheckSvg from '^/assets/icons/contents-list/check.svg';
import GroupPinnedSvg from '^/assets/icons/contents-list/group-pinned.svg';
import GroupSvg from '^/assets/icons/contents-list/group.svg';
import PartialCheckSvg from '^/assets/icons/contents-list/partial-check.svg';
import UncheckSvg from '^/assets/icons/contents-list/uncheck.svg';
import { GroupedContentsTitle } from '^/components/atoms/GroupedContentsTitle';
import WrapperHoverable, { Props as WrapperHoverableProps } from '^/components/atoms/WrapperHoverable';
import palette from '^/constants/palette';
import {
  UseL10n,
  useAuthHeader,
  useL10n,
  isESSContent,
  typeGuardGroup,
  useIsRoleX,
} from '^/hooks';
import { AuthHeader, makeV2APIURL } from '^/store/duck/API';
import { PatchContent, UpdateContentsSelectedAtInStore } from '^/store/duck/Contents';
import { PatchESSContent } from '^/store/duck/ESSContents';
import { ChangeSelectedGroupId, CopySelectedGroup } from '^/store/duck/Groups';
import { OpenContentPagePopup } from '^/store/duck/Pages';
import * as T from '^/types';
import { isPinnable, isContentPinned } from '^/utilities/content-util';
import { isRoleViewer } from '^/utilities/role-permission-check';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import Text from './text';


const RelativeDiv = styled.div({ position: 'relative' });

const CheckboxTooltipBalloonStyle: CSSObject = {
  top: 'calc(100% + 3px)',
  left: 'calc(50% - 2px)',
  transform: 'translateX(-50%)',
  height: '14px',
};
const CheckboxTooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipBalloonStyle: CheckboxTooltipBalloonStyle,
};

const GroupTitleWrapper = styled.div({
  flex: 1,
  position: 'relative',
  height: '32px',
  marginBottom: '2px',
});

const GroupIconRoot = styled.div<{ shouldShowPinIcon: boolean }>(({ shouldShowPinIcon }) => ({
  width: '18px',
  marginRight: shouldShowPinIcon ? '3.5px' : '1.5px',
  marginTop: shouldShowPinIcon ? '4px' : '2px',
}));
GroupIconRoot.displayName = 'GroupIconRoot';

const GroupArrowRoot = styled.div<{ isOpened: boolean }>(({ isOpened }) => ({
  width: '11px',
  marginRight: '7px',
  paddingBottom: isOpened ? '2.5px' : '1.5px',
  transform: isOpened ? 'translateX(-2.5px)' : 'none',
}));
GroupArrowRoot.displayName = 'GroupArrowRoot';

const GroupCheckboxRoot = styled.div`margin-right: 9px`;
GroupCheckboxRoot.displayName = 'GroupCheckboxRoot';

const GroupedContentsHeaderRoot = styled.div<{ isSelected: boolean }>(({ isSelected }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',

  boxSizing: 'border-box',
  width: '100%',
  height: '40px',
  paddingLeft: '19.3px',
  paddingRight: '19.3px',
  fontSize: '15px',
  color: palette.ContentsList.groupHeaderTextGray.toString(),
  backgroundColor: isSelected ? palette.toggleButtonGray.toString() : 'none',
  cursor: 'pointer',
}));
GroupedContentsHeaderRoot.displayName = 'GroupedContentsHeaderRoot';


const GroupIcon: FC<{ shouldShowPinIcon: boolean }> = ({ shouldShowPinIcon }) => (
  <GroupIconRoot shouldShowPinIcon={shouldShowPinIcon}>{shouldShowPinIcon ? <GroupPinnedSvg /> : <GroupSvg />}</GroupIconRoot>
);

const GroupArrow: FC<{ isOpened: boolean; onClick(e: MouseEvent<HTMLDivElement>): void }> = ({ isOpened, onClick }) => {
  const isOpenedArrowSvg: ReactNode = isOpened ? <ArrowTriangleDownSvg /> : <ArrowTriangleRightSvg />;

  return <GroupArrowRoot isOpened={isOpened} onClick={onClick}>{isOpenedArrowSvg}</GroupArrowRoot>;
};

const GroupCheckbox: FC<{
  readonly isChecked: boolean;
  readonly isPartiallyChecked: boolean;
  onClick(e: MouseEvent<HTMLDivElement>): void;
}> = ({
  isChecked,
  isPartiallyChecked,
  onClick,
}) => {
  const [l10n]: UseL10n = useL10n();

  const checkboxSvg: ReactNode = useMemo(() => {
    if (isPartiallyChecked) return <PartialCheckSvg />;

    if (isChecked) return <CheckSvg />;

    return <UncheckSvg />;
  }, [isChecked, isPartiallyChecked]);

  const checkboxTooltip: string = l10n(isChecked ? Text.tooltipUnselectAllText : Text.tooltipSelectAllText);

  return (<RelativeDiv>
    <WrapperHoverable
      title={checkboxTooltip}
      customStyle={CheckboxTooltipCustomStyle}
    >
      <GroupCheckboxRoot onClick={onClick}>{checkboxSvg}</GroupCheckboxRoot>
    </WrapperHoverable>
  </RelativeDiv>);
};


interface GroupedContentsHeaderProps {
  readonly groupId: T.GroupContent['id'];
  readonly childrenIds: Array<T.Content['id']>;
}

/*
 * Group Header
 */
export const GroupedContentsHeader: FC<GroupedContentsHeaderProps> = memo(({
  groupId, childrenIds,
}) => {
  const dispatch: Dispatch = useDispatch();
  const authHeader: AuthHeader | undefined = useAuthHeader();
  const selectedGroupIdByTab = useSelector((s: T.State) => s.Groups.selectedGroupIdByTab);
  const sidebarTab = useSelector((s: T.State) => s.Pages.Contents.sidebarTab);
  const children = useSelector((s: T.State) => childrenIds.map((childId) => s.Contents.contents.byId[childId]))
    .filter((child) => child !== undefined);
  const group = useSelector((s: T.State) => typeGuardGroup(s.Contents.contents.byId[groupId]));


  if (group === undefined || sidebarTab === T.ContentPageTabType.MAP || sidebarTab === T.ContentPageTabType.PHOTO) {
    return null;
  }

  const isSelected: boolean = group.id === selectedGroupIdByTab[sidebarTab];
  const hasPinnedFolder = isPinnable(group.category);
  const isPinned = isContentPinned(group);
  const printingContentId = useSelector((s: T.State) => s.Pages.Contents.printingContentId);
  const isViewer: boolean = useIsRoleX(isRoleViewer);
  const selectedGroupId = useSelector((s: T.State) => s.Groups.selectedGroupIdByTab[sidebarTab]);

  const selectedChildren = children.filter((child: T.Content) => child.config?.selectedAt);
  const noChildrenSelected = selectedChildren.length === 0;
  const hasAllChildrenSelected = !noChildrenSelected && selectedChildren.length === children.length;
  const isPartiallyChecked = !noChildrenSelected && selectedChildren.length < children.length;
  const isChecked = (children.length === 0 && Boolean(group?.config?.selectedAt)) || hasAllChildrenSelected;

  const handleGroupArrowClick: (e: MouseEvent<HTMLDivElement>) => void = (e) => {
    e.stopPropagation();

    switch (group.category) {
      case T.ContentCategory.ESS: {
        dispatch(PatchESSContent({ content: { id: group.id, info: { isOpened: !group.info?.isOpened } } }));
        break;
      }
      default: {
        dispatch(PatchContent({ content: { id: group.id, info: { isOpened: !group.info?.isOpened } } }));
        break;
      }
    }
  };

  const handleGroupHeaderClick: () => void = () => {
    dispatch(
      ChangeSelectedGroupId({
        selectedGroupId: group.id === selectedGroupIdByTab[sidebarTab] ? undefined : group.id,
        tab: sidebarTab,
      })
    );
  };

  function alreadyUpToDateContents(content: T.Content): boolean {
    return isChecked ? true : content?.config?.selectedAt === undefined;
  }

  const handleToggleGroupCheckbox: (e: MouseEvent<HTMLDivElement>) => void = async (e) => {
    try {
      e.stopPropagation();
      dispatch(ChangeSelectedGroupId({ selectedGroupId: groupId, tab: sidebarTab }));

      const selectedAt: Date | undefined = isChecked ? undefined : new Date();

      // Note: Technically an empty group doesn't need to have
      // the ability to be toggled, but it's done anyway to make it consistent
      // with the previous behavior.
      switch (group.category) {
        case T.ContentCategory.ESS: {
          dispatch(PatchESSContent({ content: { id: groupId, config: { selectedAt } } }));
          break;
        }
        default: {
          dispatch(PatchContent({ content: { id: groupId, config: { selectedAt } } }));
          break;
        }
      }
      if (children.length === 0) return;
      const outdatedContents: Array<T.Content> = children.filter(alreadyUpToDateContents);
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      const requests: Array<Promise<void>> = outdatedContents.map((c) => updateContentSelectedAtInServer(c, selectedAt));
      dispatch(UpdateContentsSelectedAtInStore({ ids: outdatedContents.map((c) => c.id), selectedAt }));
      await Promise.all(requests);
    } catch (event) {
      // eslint-disable-next-line no-console
      console.error(event);
      Sentry.captureException(event);
    }
  };

  async function updateContentSelectedAtInServer(content: T.Content, selectedAt?: any): Promise<void> {
    // ESS contents will only update the selectedAt locally,
    // since the requirement is to always hide the ESS contents
    // when loading the map. Therefore, skipping it.
    if (isESSContent(content)) {
      return;
    }

    const url: string = makeV2APIURL('contents', content.id);
    if (authHeader === undefined) return;
    const body: object = { config: JSON.stringify({ ...content.config, selectedAt }) };
    const res: AxiosResponse = await axios.patch(url, body, { headers: { Authorization: authHeader.Authorization } });

    return res.data.data;
  }

  const copySelectedGroup: () => void = useCallback(() => {
    if (printingContentId) return;
    if (isViewer) {
      dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));

      return;
    }

    // Avoid lagging behind the previously selected group by clearing them first.
    dispatch(ChangeSelectedGroupId({ tab: sidebarTab }));
    dispatch(CopySelectedGroup({ isPinned, selectedGroupId }));
  }, [printingContentId, isViewer, selectedGroupId, isPinned, selectedGroupId]);

  const deleteGroupConfirm: () => void = useCallback(() => {
    if (printingContentId) return;
    if (isViewer) {
      dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));

      return;
    }
    dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.DELETE_GROUP }));
  }, [printingContentId]);

  const handleKeyDown: (e: KeyboardEvent<HTMLElement>) => void = (e) => {
    if ((e.target as HTMLElement).tagName === T.TagName.INPUT) return;
    if (!isSelected || sidebarTab !== T.ContentPageTabType.ESS) return;
    e.preventDefault();

    if (e.ctrlKey && e.key === T.ShortCut.D) {
      copySelectedGroup();
    } else if (e.key === T.ShortCut.DELETE) {
      deleteGroupConfirm();
    }
  };

  return (
    <GroupedContentsHeaderRoot
      data-ctxsort='Group'
      data-ctxsort-key={group.id}
      onClick={handleGroupHeaderClick}
      onKeyDown={handleKeyDown}
      isSelected={isSelected}
      tabIndex={0}
    >
      <GroupArrow isOpened={group.info?.isOpened ?? false} onClick={handleGroupArrowClick} />
      <GroupCheckbox isChecked={isChecked} isPartiallyChecked={isPartiallyChecked} onClick={handleToggleGroupCheckbox} />
      <GroupIcon shouldShowPinIcon={isPinned && hasPinnedFolder} />
      <GroupTitleWrapper className={CANCELLABLE_CLASS_NAME}>
        <GroupedContentsTitle
          isPinned={isPinned}
          fromUI={T.EditableTextUI.GROUP_TITLE}
          group={group}
          initialText={group.title}
          isEditing={true}
        />
      </GroupTitleWrapper>
    </GroupedContentsHeaderRoot>
  );
});
