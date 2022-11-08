import Tippy from '@tippyjs/react';
import React, { ReactElement, ReactNode, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled, { CSSObject } from 'styled-components';

import { SubmitButton as RawSubmitButton } from '^/components/atoms/Buttons';
import { ContentIcon } from '^/components/atoms/ContentIcon';
import dsPalette from '^/constants/ds-palette';
import { L10nFn, UseL10n, useL10n } from '^/hooks';
import { UseRecoverEventLog, useRecoverEventLog } from '^/hooks/api/eventLog';
import * as T from '^/types';
import { getHasColor } from '^/utilities/annotation-content-util';
import { contentTexts } from '^/utilities/content-util';
import { ApplyOptionIfKorean, Formats, GetCommonFormat, formatWithOffset } from '^/utilities/date-format';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import Text from './text';

export const CENTER_ALIGNED_KEYS: Array<T.ContentEventLogKey> = [T.ContentEventLogKey.ID];

export const getWidth: (logKey: T.ContentEventLogKey) => CSSObject['width'] = (logKey) => {
  switch (logKey) {
    case T.ContentEventLogKey.ID:
      return '89px';
    case T.ContentEventLogKey.CREATED_AT:
      return '242px';
    case T.ContentEventLogKey.CREATED_BY:
      return '196px';
    case T.ContentEventLogKey.EVENT:
      return '153px';
    case T.ContentEventLogKey.SCREEN:
      return '247px';
    case T.ContentEventLogKey.CONTENT:
      return '413px';
    case T.ContentEventLogKey.ACTION:
      return '118px';

    default:
      return exhaustiveCheck(logKey);
  }
};

// todo: replace this with one of function in /src/utilities/annotation-content-util.ts
const getContentDescription: (content: T.ContentEventLog['content'], l10n: L10nFn) => string = (content, l10n) => {
  switch (content.type) {
    case T.ContentType.MAP:
    case T.ContentType.DSM:
    case T.ContentType.POINTCLOUD:
    case T.ContentType.THREE_D_ORTHO:
    case T.ContentType.GCP_GROUP:
    case T.ContentType.THREE_D_MESH:
      return l10n(contentTexts[content.type]);

    default:
      return content.description;
  }
};


interface LogKeyProps {
  logKey: T.ContentEventLogKey;
}

const Row = styled.tr({
  height: '83px',

  verticalAlign: 'middle',
});

const Cell = styled.td<LogKeyProps>(({ logKey }) => ({
  maxWidth: getWidth(logKey),
  verticalAlign: 'inherit',
}));

const TextWrapper = styled.div<LogKeyProps>(({ logKey }) => ({
  marginLeft: CENTER_ALIGNED_KEYS.includes(logKey) ? undefined : '15px',
  marginRight: '10px',
  padding: '10px 0',

  color: (() => {
    switch (logKey) {
      case T.ContentEventLogKey.SCREEN:
        return dsPalette.typeTertiary.toString();
      case T.ContentEventLogKey.ID:
        return dsPalette.grey60.toString();

      default:
        return dsPalette.typePrimary.toString();
    }
  })(),
  fontSize: '14px',
  fontWeight: logKey === T.ContentEventLogKey.CREATED_BY || logKey === T.ContentEventLogKey.SCREEN ? 'bold' : 'normal',
  textAlign: CENTER_ALIGNED_KEYS.includes(logKey) ? 'center' : 'left',

  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const EventLabel = styled.label<{
  event: T.ContentEvent;
}>(({ event }) => {
  const color: CSSObject['color'] = (() => {
    switch (event) {
      case T.ContentEvent.CREATED:
        return 'var(--color-theme-primary)';
      case T.ContentEvent.DESTROY:
        return dsPalette.errorStatus.toString();
      case T.ContentEvent.RECOVERED:
        return dsPalette.grey130.toString();

      default:
        return exhaustiveCheck(event);
    }
  })();

  return ({
    display: 'inline-block',

    width: '60px',
    padding: '3px 0',

    textAlign: 'center',
    fontSize: '13px',
    color,
    border: `1px solid ${color}`,
    borderRadius: '3px',
  });
});

const ScreenDescription = styled.span({
  fontWeight: 'normal',
});

const ContentWrapper = styled.div({
  display: 'flex',
  alignItems: 'flex-end',
});

const ContentTitle = styled.span({
  marginLeft: '10px',

  fontSize: '15px',
  color: dsPalette.typePrimary.toString(),
});

const ContentInfoWrapper = styled.div({
  marginTop: '7px',

  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const ContentInfo = styled.span({
  fontSize: '11px',
  color: dsPalette.typeTertiary.toString(),
});

const ContentInfoTitle = styled(ContentInfo)({
  fontWeight: 'bold',
});

const SubmitButton = styled(RawSubmitButton)<{isDisabled?: boolean}>(({ isDisabled }) => ({
  width: '73px',
  height: '30px',

  fontSize: '13px',

  ...(() => isDisabled ? ({
    backgroundColor: dsPalette.grey20.toString(),
    color: dsPalette.typeDisabled.toString(),
  }) : ({}))(),
}));

const PerformedLabel = styled.label({
  boxSizing: 'border-box',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  width: '73px',
  height: '30px',

  fontSize: '13px',
  color: dsPalette.typePrimary.toString(),
  border: `1px solid ${dsPalette.typePrimary.toString()}`,
  borderRadius: '7px',
});


export interface Props {
  readonly log: T.ContentEventLog;
}

function ContentEventLog({
  log: { id, createdAt, createdBy, event, status, screen, content },
}: Props): ReactElement {
  const [l10n, lang]: UseL10n = useL10n();

  const { mutate, isLoading }: UseRecoverEventLog = useRecoverEventLog();

  const timezoneOffset: T.CommonPageState['timezoneOffset'] = useSelector((s: T.State) => s.Pages.Common.timezoneOffset);

  const color: string | undefined = useMemo(() => getHasColor(content.type) ? content.color.toString() : undefined, [content.type, content.color]);

  const getFormattedDate: (date: Date, hasTime?: boolean) => string = useCallback((date, hasTime = false) => formatWithOffset(
    timezoneOffset, date, `${GetCommonFormat({ lang, hasDay: true })} ${hasTime ? Formats.pp : ''}`, ApplyOptionIfKorean(lang),
  ), [timezoneOffset, lang]);

  const actionButton: ReactNode = useMemo(() => {
    if (event !== T.ContentEvent.DESTROY) return null;

    switch (status) {
      case T.ContentEventStatus.OK:
        const handleClick: () => void = () => {
          if (isLoading) return;

          mutate(id);
        };

        return (
          <SubmitButton onClick={handleClick}>{l10n(Text.action.restore)}</SubmitButton>
        );
      case T.ContentEventStatus.EXPIRED:
        return (
          <Tippy theme='angelsw' offset={T.TIPPY_OFFSET} arrow={false} placement='bottom' content={l10n(Text.action.tooltipExpireRestore)}>
            <SubmitButton isDisabled={true}>{l10n(Text.action.restore)}</SubmitButton>
          </Tippy>
        );

      case T.ContentEventStatus.PERFORMED:
        return (
          <PerformedLabel>{l10n(Text.action.restored)}</PerformedLabel>
        );

      default:
        return exhaustiveCheck(status);
    }
  }, [isLoading, id, event, status, l10n]);

  return (
    <Row key={id}>
      <Cell logKey={T.ContentEventLogKey.ID}>
        <TextWrapper logKey={T.ContentEventLogKey.ID}>{id}</TextWrapper>
      </Cell>
      <Cell logKey={T.ContentEventLogKey.CREATED_AT}>
        <TextWrapper logKey={T.ContentEventLogKey.CREATED_AT}>{getFormattedDate(createdAt, true)}</TextWrapper>
      </Cell>
      <Cell logKey={T.ContentEventLogKey.CREATED_BY}>
        <TextWrapper logKey={T.ContentEventLogKey.CREATED_BY}>{createdBy.name}</TextWrapper>
      </Cell>
      <Cell logKey={T.ContentEventLogKey.EVENT}>
        <TextWrapper logKey={T.ContentEventLogKey.EVENT}>
          <EventLabel event={event}>{l10n(Text.event[event])}</EventLabel>
        </TextWrapper>
      </Cell>
      <Cell logKey={T.ContentEventLogKey.SCREEN}>
        <TextWrapper logKey={T.ContentEventLogKey.SCREEN}>
          {screen.appearAt !== null ? getFormattedDate(screen.appearAt) : null}
          <ScreenDescription>{screen.title}</ScreenDescription>
        </TextWrapper>
      </Cell>
      <Cell logKey={T.ContentEventLogKey.CONTENT}>
        <TextWrapper logKey={T.ContentEventLogKey.CONTENT}>
          <ContentWrapper>
            <ContentIcon contentType={content.type} color={color} />
            <ContentTitle>{getContentDescription(content, l10n)}</ContentTitle>
          </ContentWrapper>
          <ContentInfoWrapper>
            <ContentInfo>
              <ContentInfoTitle>{l10n(Text.createdAyBy)}</ContentInfoTitle>
              {`${getFormattedDate(content.createdAt, true)}/${content.createdBy.name}`}
            </ContentInfo>
          </ContentInfoWrapper>
        </TextWrapper>
      </Cell>
      <Cell logKey={T.ContentEventLogKey.ACTION}>
        <TextWrapper logKey={T.ContentEventLogKey.ACTION}>{actionButton}</TextWrapper>
      </Cell>
    </Row>
  );
}

export default ContentEventLog;
