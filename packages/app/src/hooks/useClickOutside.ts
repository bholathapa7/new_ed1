import { useEffect, MutableRefObject } from 'react';

/**
 * If you click outside of ref which is in params,
 * callback function will be run
 */
export const useClickOutside: <T extends HTMLElement>(param: {
  ref: MutableRefObject<T | undefined | null>;
  callback(): void;
}) => void = ({ ref, callback }) => {
  const handleClickOutside: (e: MouseEvent) => void = (e) => {
    if (!ref.current?.contains(e.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  });
};
