import React, { FC, memo, useCallback, useEffect } from 'react';
import ScrollBars from 'react-custom-scrollbars';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled, { CSSObject } from 'styled-components';

import { GroupedContentsListHeader } from '^/components/molecules/GroupedContentsListHeader';

import palette from '^/constants/palette';
import { useIsRoleX } from '^/hooks';
import * as T from '^/types';
import { CtxSort, CtxSortCollisionMode, CtxSortContext, CtxSortEvent, CtxSortEventOptions } from '^/utilities/ctxsort';
import { arePropsEqual } from '^/utilities/react-util';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';

import { isRoleViewer } from '^/utilities/role-permission-check';
import { ContentsTreeList } from '../ContentsTreeList';
import { Fallback } from './fallback';
import { MoveContent } from '^/store/duck/Groups';
import { CONTENTSLIST_CTXSORT_KEY } from '^/components/atoms/ContentsListItem';


const OverlayContentsListWrapper =
  styled.div.attrs({
    className : 'ctxsort-scroller',
  })({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflowX: 'hidden',
    touchAction: 'none',
  });
OverlayContentsListWrapper.displayName = 'OverlayContentsListWrapper';

export const OverlayContentsListRoot =
  styled.ol({
    width: '100%',
    height: '100%',
  });
OverlayContentsListRoot.displayName = 'GroupedContentsListRoot';

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


/**
 * @description Component for content list in sidebar of contents page
 */
const Contents: FC = () => {
  const contentIds = useSelector((s: T.State) => s.Groups.tree.rootIdsByCategory[T.ContentCategory.OVERLAY].pinned);

  return (<>
    <GroupedContentsListHeader isPinnedGroups={true} />
    <ContentsTreeList contentIds={contentIds ?? []} />
  </>);
};

const GroupedContentsList: FC = () => {
  const dispatch: Dispatch = useDispatch();
  const isViewer: boolean = useIsRoleX(isRoleViewer);

  const printingContentId: T.ContentsPageState['printingContentId'] = useSelector((s: T.State) => s.Pages.Contents.printingContentId);

  const handleContentMoveThroughDnD: CtxSortEventOptions['onSortEnd'] = useCallback((e: CtxSortEvent) => {
    dispatch(MoveContent({ e }));
  }, []);

  useEffect(() => {
    if (isViewer || printingContentId) return;

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

  const scrollBarViewStyle: CSSObject = {
    height: '100%',
    overflowX: 'hidden',
    paddingBottom: '2.5px',
    touchAction: 'none',
  };
  const ScrollBarView: FC<{ style: CSSObject } & any> = ({ style, ...others }) => (
    <div className='ctxsort-scroller' {...others} style={{ ...style, ...scrollBarViewStyle }} />
  );
  const hiddenAfterMilliSec: number = 0;
  const hiddenViaMilliSec: number = 500;


  return (
    <OverlayContentsListRoot>
      <ScrollBars
        renderView={ScrollBarView}
        autoHide={true}
        autoHideTimeout={hiddenAfterMilliSec}
        autoHideDuration={hiddenViaMilliSec}
      >
        <Contents />
      </ScrollBars >
    </OverlayContentsListRoot>
  );
};
// eslint-disable-next-line max-lines
export default memo(withErrorBoundary(GroupedContentsList)(Fallback), arePropsEqual);
