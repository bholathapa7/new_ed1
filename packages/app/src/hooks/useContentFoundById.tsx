import { useSelector } from 'react-redux';

import * as T from '^/types';

export type FindContentById = <U extends T.Content>(contentId: number) => U | undefined;

export function useContentFoundById(): FindContentById {
  const { Contents: { contents: { byId } } }: T.State = useSelector((s: T.State) => s);

  return function findContentById<U extends T.Content>(contentId: number): U | undefined {
    return byId[contentId] as U | undefined;
  };
}

