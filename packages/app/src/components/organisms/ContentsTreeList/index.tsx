import { ContentToItem } from '^/components/atoms/ContentToItem';
import { GroupedContentsHeader } from '^/components/molecules/GroupedContentsHeader';
import * as T from '^/types';
import React, { FC, ReactNode, memo } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';


const ContentsList = styled.div({
  position: 'relative',
  minHeight: '2.5px',
  paddingBottom: '2.5px',
});
ContentsList.displayName = 'ContentsList';

export const GroupList: FC<Readonly<{ content: T.GroupContent }>> = ({ content }) => {
  const childrenIds = useSelector((s: T.State) => s.Groups.tree.idsByGroup[content.id] ?? []);

  return (
    <div
      key={content.id}
      data-ctxsort-parent='Group'
      data-ctxsort-key={content.id}
      style={{ paddingTop: '2.5px' }}
    >
      <GroupedContentsHeader
        groupId={content.id}
        childrenIds={childrenIds}
      />
      <ContentsList>
        {content?.info.isOpened ? <ContentsTreeList contentIds={childrenIds} /> : null}
      </ContentsList>
    </div>
  );
};

export const ContentsTreeList: FC<Readonly<{ contentIds: Array<T.GroupContent['id']> }>> = memo(({ contentIds }) => {
  const contentsTreeList: ReactNode = contentIds.map((id) => <ContentToItem key={id} contentId={id} />);

  return <>{contentsTreeList}</>;
});
