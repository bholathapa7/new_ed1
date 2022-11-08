import React, { FC, memo, useCallback, useEffect } from 'react';
import ScrollBars from 'react-custom-scrollbars';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled, { CSSObject } from 'styled-components';

import { GroupedContentsListHeader } from '^/components/molecules/GroupedContentsListHeader';

import palette from '^/constants/palette';
import { UseLastSelectedScreen, useDidMountEffect, useIsRoleX, useLastSelectedScreen } from '^/hooks';
import * as T from '^/types';
import { CtxSort, CtxSortCollisionMode, CtxSortContext, CtxSortEvent, CtxSortEventOptions } from '^/utilities/ctxsort';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';

import { ChangeEditingContent } from '^/store/duck/Pages';
import { isRoleViewer } from '^/utilities/role-permission-check';
import { ContentsTreeList } from '../ContentsTreeList';
import { Fallback } from './fallback';
import { MoveContent } from '^/store/duck/Groups';
import { CONTENTSLIST_CTXSORT_KEY } from '^/components/atoms/ContentsListItem';


const MeasurementContentsListWrapper =
  styled.div.attrs({
    className : 'ctxsort-scroller',
  })({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflowX: 'hidden',
    touchAction: 'none',
  });
MeasurementContentsListWrapper.displayName = 'MeasurementContentsListWrapper';

export const MeasurementContentsListRoot =
  styled.ol({
    width: '100%',
    height: '100%',
  });
MeasurementContentsListRoot.displayName = 'GroupedContentsListRoot';

const GroupListDivider = styled.div({
  position: 'sticky',
  zIndex: 10,
  top: '43px',
  height: '6px',
  marginTop: '17.5px',
  borderTop: `1px solid ${palette.ContentsList.groupListDividerBorderGray.toString()}`,
  borderBottom: `1px solid ${palette.ContentsList.groupListDividerBorderGray.toString()}`,
  backgroundColor: palette.ContentsList.groupListDividerBackgroundGray.toString(),
  boxSizing: 'border-box',
});
GroupListDivider.displayName = 'GroupListDivider';


const scrollBarViewStyle: CSSObject = {
  height: '100%',
  overflowX: 'hidden',
  paddingBottom: '2.5px',
  touchAction: 'none',
};

const ScrollBarView: FC<{ style: CSSObject } & any> = ({ style, ...others }) => (
  <div className='ctxsort-scroller' {...others} style={{ ...style, ...scrollBarViewStyle }} />
);

const HIDE_SCROLL_BAR_TIMEOUT: number = 0;
const HIDE_SCROLL_BAR_DURATION: number = 500;

const Contents: FC = () => {
  const lastSelectedScreenId: T.Screen['id'] | undefined = useSelector((s: T.State) => s.ProjectConfigPerUser.config?.lastSelectedScreenId);

  const { pinned, unpinned } = useSelector((s: T.State) => s.Groups.tree.rootIdsByCategory[T.ContentCategory.MEASUREMENT]);
  const currentScreenTree = unpinned[lastSelectedScreenId ?? NaN];

  return (<>
    <GroupedContentsListHeader
      isPinnedGroups={true}
      hasPinnedFolder={true}
    />
    <ContentsTreeList contentIds={pinned ?? []} />
    <GroupListDivider />
    <GroupedContentsListHeader
      isPinnedGroups={false}
      hasPinnedFolder={true}
    />
    <ContentsTreeList contentIds={currentScreenTree ?? []} />
  </>);
};

const MeasurementContentsList: FC = memo(() => {
  const dispatch: Dispatch = useDispatch();
  const isViewer: boolean = useIsRoleX(isRoleViewer);

  const editingContentId: T.Content['id'] | undefined = useSelector((state: T.State) => state.Pages.Contents.editingContentId);
  const currentScreen: UseLastSelectedScreen = useLastSelectedScreen();

  const handleContentMoveThroughDnD: CtxSortEventOptions['onSortEnd'] = useCallback((e: CtxSortEvent) => {
    dispatch(MoveContent({ e }));
  }, []);

  useEffect(() => {
    if (isViewer) return;

    const ContentListItemCtxSort: CtxSortContext = CtxSort({
      target: CONTENTSLIST_CTXSORT_KEY,
      owner: 'Group',
      scroller: '.ctxsort-scroller',
      portalId: 'ctxsort-portal-content-list-item',
      delay: 200,
      onSortEnd: handleContentMoveThroughDnD,
      psuedoOwnerClassName: 'ctxsort-contentlistitem-owner-active',
    });

    const GroupCtxSort: CtxSortContext = CtxSort({
      target: 'Group',
      owner: 'GroupedContentsListHeader',
      scroller: '.ctxsort-scroller',
      portalId: 'ctxsort-portal-content-group',
      collisionMode: CtxSortCollisionMode.PARENT,
      delay: 200,
      onSortEnd: handleContentMoveThroughDnD,
    });

    return () => {
      ContentListItemCtxSort.destroy();
      GroupCtxSort.destroy();
    };
  }, []);

  useDidMountEffect(() => {
    if (editingContentId !== undefined) {
      dispatch(ChangeEditingContent({}));
    }
  }, [currentScreen?.id]);

  return (
    <MeasurementContentsListRoot>
      <ScrollBars
        renderView={ScrollBarView}
        autoHide={true}
        autoHideTimeout={HIDE_SCROLL_BAR_TIMEOUT}
        autoHideDuration={HIDE_SCROLL_BAR_DURATION}
      >
        <Contents />
      </ScrollBars >
    </MeasurementContentsListRoot>
  );
});

export default memo(withErrorBoundary(MeasurementContentsList)(Fallback));
