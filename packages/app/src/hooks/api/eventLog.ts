import * as Sentry from '@sentry/browser';
import Color from 'color';
import _ from 'lodash-es';
import { useCallback } from 'react';
import {
  QueryClient, QueryFunctionContext, UseInfiniteQueryResult, UseMutationResult, useInfiniteQuery, useMutation, useQueryClient,
} from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { AjaxError, ajax } from 'rxjs/ajax';
import { map } from 'rxjs/operators';

import { INITIAL_LIMIT, LIMIT } from '^/constants/event-log';
import { AuthHeader, makeV2APIURL } from '^/store/duck/API';
import { GetInitialContents } from '^/store/duck/Contents';
import * as T from '^/types';
import { useAuthHeader } from '^/hooks';

// name and value should start with domain name
export enum EventLogCacheKey {
  EVENT_LOG = 'EVENT_LOG',
}

interface GetEventLogsResponse {
  logs: T.APIContentEventLog[];
  pagination: T.Pagination;
}

interface RecoverEventLogResponse {
  data: T.APIContentEventLog[];
}

interface EventLogsWithPagination {
  logs: {
    byId: { [K in number]: T.ContentEventLog };
    allIds: T.ContentEventLog['id'][];
  };
  pagination?: T.Pagination;
}

const APIToEventLog: (rawEventLog: T.APIContentEventLog) => T.ContentEventLog = (rawEventLog) => ({
  ...rawEventLog,
  createdAt: new Date(rawEventLog.createdAt),
  content: {
    ...rawEventLog.content,
    color: rawEventLog.content.color === null || rawEventLog.content.color === '' ? new Color('#ffffff') : new Color(rawEventLog.content.color),
    createdAt: new Date(rawEventLog.content.createdAt),
    deletedAt: rawEventLog.content.deletedAt !== null ? new Date(rawEventLog.content.deletedAt) : null,
  },
  screen: {
    ...rawEventLog.screen,
    appearAt: rawEventLog.screen.appearAt !== null ? new Date(rawEventLog.screen.appearAt) : null,
  },
});

async function getEventLogs({
  authHeader, projectId, offset,
}: {
  authHeader?: AuthHeader;
  projectId?: T.Project['id'];
  offset?: number;
}): Promise<EventLogsWithPagination | undefined> {
  if (authHeader === undefined || projectId === undefined) return;

  const URL: string = (() => {
    const url: string = makeV2APIURL('projects', projectId, 'event_logs');
    const query: string = `limit=${offset === undefined ? INITIAL_LIMIT : `${LIMIT}&offset=${offset}`}`;

    return `${url}?${query}`;
  })();

  return ajax.get(URL, authHeader).pipe(
    map(({ response }): GetEventLogsResponse => response),
    map(({ logs, ...others }) => ({
      logs: logs.map(APIToEventLog),
      ...others,
    })),
    map(({ logs, ...others }) => {
      const allIds: T.ContentEventLog['id'][] = logs.map((log) => log.id);

      return {
        logs: {
          byId: _.zipObject(allIds, logs),
          allIds,
        },
        ...others,
      };
    }),
  ).toPromise();
}

export type UseEventLogsQuery = UseInfiniteQueryResult<EventLogsWithPagination, AjaxError>;
export function useEventLogsQuery(): UseEventLogsQuery {
  const projectId: T.Project['id'] | undefined = useSelector((s: T.State) => s.Pages.Contents.projectId);
  const authHeader: AuthHeader | undefined = useAuthHeader();

  const fetchGetEventLogs: (
    params: QueryFunctionContext<EventLogCacheKey.EVENT_LOG, number>,
  ) => Promise<EventLogsWithPagination | undefined> = useCallback(async ({
    pageParam,
  }) => getEventLogs({ authHeader, projectId, offset: pageParam }), [projectId, authHeader]);

  return useInfiniteQuery(EventLogCacheKey.EVENT_LOG, fetchGetEventLogs, {
    getNextPageParam: (lastPage) => lastPage?.pagination?.nextOffset !== 0 ? lastPage?.pagination?.nextOffset : undefined,
  });
}

async function postRecoverEventLog({
  authHeader, logId,
}: {
  authHeader?: AuthHeader;
  logId: T.ContentEventLog['id'];
}): Promise<T.ContentEventLog[]> {
  if (authHeader === undefined) return [];

  const URL: string = makeV2APIURL('event_logs', logId, 'recover');

  return ajax.post(URL, {}, authHeader).pipe(
    map(({ response }): RecoverEventLogResponse => response),
    map(({ data }) => data.map(APIToEventLog)),
  ).toPromise();
}

export type UseRecoverEventLog = UseMutationResult<T.ContentEventLog[], AjaxError, T.ContentEventLog['id']>;
export function useRecoverEventLog(): UseRecoverEventLog {
  const dispatch: Dispatch = useDispatch();
  const queryClient: QueryClient = useQueryClient();

  const authHeader: AuthHeader | undefined = useAuthHeader();
  const projectId: T.Project['id'] | undefined = useSelector((s: T.State) => s.Pages.Contents.projectId);

  const fetchRecoverEventLog: (logId: T.ContentEventLog['id']) => Promise<T.ContentEventLog[]>
    = async (logId) => postRecoverEventLog({ authHeader, logId });

  return useMutation(fetchRecoverEventLog, {
    onSuccess: async () => {
      await queryClient.refetchQueries(EventLogCacheKey.EVENT_LOG, { stale: true, exact: true });

      if (projectId !== undefined) {
        dispatch(GetInitialContents({ projectId }));
      }
    },
    onError: (error) => {
      Sentry.captureException(error.response);
    },
  });
}
