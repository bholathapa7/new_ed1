import { useSelector } from 'react-redux';

import * as T from '^/types';

export function contentSelector<C extends T.Content>(s: T.State, id: C['id']): C | undefined {
  const c: C | undefined = s.Contents.contents.byId[id] as C | undefined;

  /**
   * https://react-redux.js.org/api/hooks#stale-props-and-zombie-children
   *
   * In cases where you do rely on props in your selector function and those props may change over time,
   * or the data you're extracting may be based on items that can be deleted,
   * try writing the selector functions defensively.
   * Don't just reach straight into state.todos[props.id].name -
   * read state.todos[props.id] first, and verify that it exists before trying to read todo.name.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return c ? c as C : undefined;
}

export function useContent<C extends T.Content>(id: C['id'], areEqual?: (prev?: C, next?: C) => boolean): C | undefined {
  return useSelector((s: T.State) => contentSelector(s, id), areEqual);
}
