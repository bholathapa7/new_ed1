import { DependencyList, MutableRefObject, useLayoutEffect, useRef } from 'react';

export function useDidMountEffect<Callback extends Function>(cb: Callback, deps?: DependencyList): void {
  const didMountRef: MutableRefObject<boolean> = useRef(false);

  useLayoutEffect(() => {
    if (didMountRef.current) cb();
    else didMountRef.current = true;
  }, deps);
}
