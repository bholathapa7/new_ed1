import _ from 'lodash-es';
import { useCallback, useEffect, EffectCallback } from 'react';
import isEqual from 'react-fast-compare';

interface KeyStringInterface {
  [key: string]: any;
}

type pluckNonFunctions = <T>(fromObj: T & KeyStringInterface) => Partial<T>;

type UseDebouncedEffect = (effect: EffectCallback, delay: number, deps?: any) => void;

/*
* @fixme
* Recursive function removal is NOT possible,
* because there is a circular reference in openlayer related objects.
* As of now it's not a big problem, but this should be noted that
* nested object properties which are functions are not removed.
*/
export const pluckNonFunctions: pluckNonFunctions = <T>(fromObj: T & KeyStringInterface) => {
  const obj: KeyStringInterface = {};
  Object.keys(fromObj).forEach((key: string) => {
    // eslint-disable-next-line no-unused-expressions
    !_.isFunction(fromObj[key]) && (obj[key] = fromObj[key]);
  });

  return obj as Partial<T>;
};

type arePropsEqual = <T>(prevProps: T, nextProps: T) => boolean;

/*
 * @desc
 * Compares props EXCEPT functions, because:
 * const a = () => 1; const b = () => 1;
 * a === b will always be FALSE.
 * Therefore functions need to be excluded in the comparision process.
 *
 * There is no problem with excluding functions, because:
 * functions do not change (constant reference)
 *
 * All functions come from mapDispatchToProps, or custom hooks. So they won't change.
 */
export const arePropsEqual: arePropsEqual = <T>(prevProps: T, nextProps: T) => {
  const [a, b]: Array<Partial<T>> = [prevProps, nextProps]
    .map(pluckNonFunctions);

  return isEqual(a, b);
};

/**
 * @desc handle only last useEffectCall
 * @param deps is type any in order to handle when no dependency array is given
 */
export const useDebouncedEffect: UseDebouncedEffect = (effect: EffectCallback, delay: number, deps?: any) => {
  const callback: EffectCallback = useCallback(effect, deps);

  useEffect(() => {
    const delayedCallback: number = window.setTimeout(() => {
      callback();
    }, delay);

    return () => {
      clearTimeout(delayedCallback);
    };
  }, [callback, delay]);
};
