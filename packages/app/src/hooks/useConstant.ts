import { MutableRefObject, useRef } from 'react';

export interface ResultBox<T> {
  v: T;
}

export function useConstant<T>(fn: () => T): T {
  const ref: MutableRefObject<ResultBox<T> | undefined> = useRef<ResultBox<T>>();

  if (!ref.current) {
    ref.current = { v: fn() };
  }

  return ref.current.v;
}
