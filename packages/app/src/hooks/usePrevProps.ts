import { MutableRefObject, useEffect, useRef } from 'react';

/**
 * @description
 * If you store previous props, use this hook.
 */
export const usePrevProps: <T>(value: T) => T | undefined = <T>(value: T) => {
  const ref: MutableRefObject<T | undefined> = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
