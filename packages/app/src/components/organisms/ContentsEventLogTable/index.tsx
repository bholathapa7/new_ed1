import React, { ReactElement, ReactNode, memo, useCallback, useRef, MutableRefObject } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import LeftBoldArrowSVG from '^/assets/icons/left-bold-arrow.svg';
import LoadingIcon from '^/components/atoms/LoadingIcon';
import ContentEventLog, { CENTER_ALIGNED_KEYS, getWidth } from '^/components/molecules/ContentEventLog';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { UseL10n, useL10n } from '^/hooks';
import { UseEventLogsQuery, useEventLogsQuery } from '^/hooks/api/eventLog';
import { ChangeIsInContentsHistoryLogTable } from '^/store/duck/Pages';
import * as T from '^/types';
import Text from './text';


interface LogKeyProps {
  logKey: T.ContentEventLogKey;
}

const Root = styled.section({
  position: 'absolute',
  zIndex: 260,

  width: '100%',
  height: '100%',

  backgroundColor: palette.white.toString(),

  overflow: 'scroll',
});

const ThHeader = styled.th({
  position: 'sticky',
  zIndex: 2, // zIndex of`Th` is 1
  top: 0,

  height: '49px',
});

const Header = styled.header({
  height: '100%',

  display: 'flex',
  alignItems: 'center',

  // eslint-disable-next-line no-magic-numbers
  boxShadow: `0 0 8px 0 ${palette.black.alpha(0.2).toString()}`,
  backgroundColor: palette.white.toString(),
});

const LeftArrow = styled(LeftBoldArrowSVG)({
  margin: '0 30px',
  cursor: 'pointer',
});

const HeaderTitle = styled.p({
  color: dsPalette.typePrimary.toString(),
  fontSize: '16px',
  fontWeight: 'bold',
});

const Table = styled.table({
  width: '100%',
  borderCollapse: 'separate',
});

const Head = styled.thead({});

const Th = styled.th<LogKeyProps>(({ logKey }) => ({
  boxSizing: 'border-box',

  top: 49,
  position: 'sticky',
  zIndex: 1,

  minWidth: getWidth(logKey),
  height: '49px',

  color: dsPalette.grey60.toString(),
  fontWeight: 'normal',
  fontSize: '13px',
  verticalAlign: 'middle',
  textAlign: CENTER_ALIGNED_KEYS.includes(logKey) ? 'center' : 'left',
  paddingLeft: CENTER_ALIGNED_KEYS.includes(logKey) ? undefined : '15px',

  border: `1px solid ${palette.Photo.border.toString()}`,
  backgroundColor: palette.white.toString(),
}));

const Body = styled.tbody({});

const LoadingIconWrapper = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  width: '100%',

  padding: '10px 0',
});


function ContentsEventLogTable(): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();

  const { data, fetchNextPage, isFetching }: UseEventLogsQuery = useEventLogsQuery();

  const rootRef: MutableRefObject<null | HTMLTableSectionElement> = useRef(null);

  const handlePreviousClick: () => void = useCallback(() => {
    dispatch(ChangeIsInContentsHistoryLogTable({ isInContentsEventLogTable: false }));
  }, []);

  const handleScroll: () => Promise<void> = async () => {
    if (rootRef.current === null) return;

    const { scrollTop, scrollHeight, clientHeight }: HTMLTableSectionElement = rootRef.current;

    if (!isFetching && (scrollTop + clientHeight === scrollHeight)) {
      await fetchNextPage();
    }
  };

  const bodyElement: ReactNode = data?.pages !== undefined ? (
    <Body>
      {data.pages.map((page) => page.logs.allIds.map((logId) => <ContentEventLog key={logId} log={page.logs.byId[logId]} />))}
    </Body>
  ) : null;

  return (
    <Root ref={rootRef} onScroll={handleScroll}>
      <Table>
        <Head>
          <tr>
            <ThHeader colSpan={Object.keys(T.ContentEventLogKey).length}>
              <Header>
                <LeftArrow onClick={handlePreviousClick} />
                <HeaderTitle>{l10n(Text.title)}</HeaderTitle>
              </Header>
            </ThHeader>
          </tr>
          <tr>
            <Th logKey={T.ContentEventLogKey.ID}>{l10n(Text.tableHeader.id)}</Th>
            <Th logKey={T.ContentEventLogKey.CREATED_AT}>{l10n(Text.tableHeader.createdAt)}</Th>
            <Th logKey={T.ContentEventLogKey.CREATED_BY}>{l10n(Text.tableHeader.createdBy)}</Th>
            <Th logKey={T.ContentEventLogKey.EVENT}>{l10n(Text.tableHeader.event)}</Th>
            <Th logKey={T.ContentEventLogKey.SCREEN}>{l10n(Text.tableHeader.screen)}</Th>
            <Th logKey={T.ContentEventLogKey.CONTENT}>{l10n(Text.tableHeader.content)}</Th>
            <Th logKey={T.ContentEventLogKey.ACTION}>{l10n(Text.tableHeader.action)}</Th>
          </tr>
        </Head>
        {bodyElement}
      </Table>
      {isFetching ? <LoadingIconWrapper><LoadingIcon /></LoadingIconWrapper> : null}
    </Root>
  );
}

export default memo(ContentsEventLogTable);
