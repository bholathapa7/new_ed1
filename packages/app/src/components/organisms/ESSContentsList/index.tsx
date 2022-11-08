import _ from 'lodash-es';
import React, { FC, ReactNode, memo, useCallback, useEffect } from 'react';
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
import { getUserAgent } from '^/utilities/userAgent';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';

import { isRoleViewer } from '^/utilities/role-permission-check';
import { ContentsTreeList } from '../ContentsTreeList';
import { Fallback } from './fallback';
import { CONTENTSLIST_CTXSORT_KEY } from '^/components/atoms/ContentsListItem';
import { MoveContent } from '^/store/duck/Groups';

const ESSContentsListWrapper =
  styled.div.attrs({
    className : 'ctxsort-scroller',
  })({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflowX: 'hidden',
    touchAction: 'none',
  });
ESSContentsListWrapper.displayName = 'ESSContentsListWrapper';

export const ESSContentsListRoot =
  styled.ol({
    width: '100%',
    height: '100%',
  });
ESSContentsListRoot.displayName = 'GroupedContentsListRoot';

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

const Contents: FC = () => {
  const contentIds = useSelector((s: T.State) => s.Groups.tree.rootIdsByCategory[T.ContentCategory.ESS].pinned);

  return (<>
    <GroupedContentsListHeader isPinnedGroups={true} />
    <ContentsTreeList contentIds={contentIds ?? []} />
  </>);
};

const GroupedContentsList: FC = () => {
  const userAgent: T.UserAgent = getUserAgent();
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

  /**
   * Safari does not support Scrollbars
   */
  const Layout: ReactNode = userAgent === T.UserAgent.SAFARI ? (
    <ESSContentsListWrapper>
      <ESSContentsListRoot>
        <Contents />
      </ESSContentsListRoot>
    </ESSContentsListWrapper>
  ) : (
    <ESSContentsListRoot>
      <ScrollBars
        renderView={ScrollBarView}
        autoHide={true}
        autoHideTimeout={hiddenAfterMilliSec}
        autoHideDuration={hiddenViaMilliSec}
      >
        <Contents />
      </ScrollBars >
    </ESSContentsListRoot>
  );

  return (<>
    {Layout}
  </>);
};

export default memo(withErrorBoundary(GroupedContentsList)(Fallback), arePropsEqual);
