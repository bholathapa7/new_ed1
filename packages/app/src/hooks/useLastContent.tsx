import * as T from '^/types';
import { useSelector } from 'react-redux';
import { lastSelectedScreenSelector } from '.';

interface LastDSMOrDSMContentSelectorOptions {
  needsSelectedAt?: boolean;
}

export function lastDSMOrMapContentSelector<Content extends T.DSMorMapContent>(
  s: T.State,
  contentType: T.ContentType,
  options: LastDSMOrDSMContentSelectorOptions = {
    needsSelectedAt: false,
  }): Content | undefined {
  const lastSelectedScreenId: T.Screen['id'] | undefined = lastSelectedScreenSelector(s)?.id;
  const byId: T.ContentsState['contents']['byId'] = s.Contents.contents.byId;
  const lastDSMOrMapContentId: Content['id'] | undefined = s.Contents.contents.allIds
    .find((id) => byId[id].type === contentType && byId[id].screenId === lastSelectedScreenId);

  if (lastDSMOrMapContentId === undefined) return undefined;
  if (options.needsSelectedAt && !byId[lastDSMOrMapContentId]?.config?.selectedAt) return undefined;

  return byId[lastDSMOrMapContentId] as Content;
}

export function useLastDSMOrMapContent<Content extends T.DSMorMapContent>(
  contentType: T.ContentType,
  options?: LastDSMOrDSMContentSelectorOptions,
): Content | undefined {
  return useSelector((s: T.State) => lastDSMOrMapContentSelector(s, contentType, options));
}
