import React, { FC, ReactNode, memo, useMemo } from 'react';
import ScrollBars from 'react-custom-scrollbars';
import { useSelector } from 'react-redux';
import styled, { CSSObject } from 'styled-components';

import { ContentToItem } from '^/components/atoms/ContentToItem';
import ContentListEmptyMsg from '^/components/molecules/ContentListEmptyMsg';
import { tabToContent } from '^/store/duck/Pages/Content';
import * as T from '^/types';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { Fallback } from './fallback';


export const Root = styled.ol({
  width: '100%',
  height: '100%',
  paddingTop: '10px',
});


const Contents: FC = memo(() => {
  const contentIds: Array<T.Content['id']> = useSelector(({
    Contents: { contents: { byId, allIds } },
    ProjectConfigPerUser: { config },
  }: T.State) => {
    if (config?.lastSelectedScreenId === undefined) return [];

    return allIds.map((id) => byId[id])
      .filter(({ type, screenId }) => tabToContent[T.ContentPageTabType.MAP].includes(type) && screenId === config.lastSelectedScreenId)
      .sort((c1, c2) => T.MAP_TAB_CONTENTS_ORDER[c1.type] - T.MAP_TAB_CONTENTS_ORDER[c2.type])
      .map(({ id: contentId }) => contentId);
  });

  const contentListEmptyMsg: ReactNode = useMemo(() => <ContentListEmptyMsg currentTab={T.ContentPageTabType.MAP} />, []);

  return contentIds.length > 0 ? (
    <>{contentIds.map((contentId) => <ContentToItem key={contentId} contentId={contentId} />)}</>
  ) : (
    <>{contentListEmptyMsg}</>
  );
});

const MapContentsList: FC = () => {
  const ScrollBarView: FC<{ style: CSSObject } & any> = ({ style, ...others }) => (
    <div {...others} style={{ ...style, height: '100%', overflowX: 'hidden' }} />
  );
  const hiddenAfterMilliSec: number = 0;
  const hiddenViaMilliSec: number = 500;

  return (
    <Root>
      <ScrollBars
        renderView={ScrollBarView}
        autoHide={true}
        autoHideTimeout={hiddenAfterMilliSec}
        autoHideDuration={hiddenViaMilliSec}
      >
        <Contents />
      </ScrollBars>
    </Root>
  );
};

export default memo(withErrorBoundary(MapContentsList)(Fallback));
