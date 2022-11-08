import React, { Context, FC, createContext, useContext, useLayoutEffect, useState } from 'react';
import { UseState } from '.';

export const WindowSizeContext: Context<Readonly<[number, number]>> =
  createContext([window.innerWidth, window.innerHeight] as Readonly<[number, number]>);

export const WindowSizeContextProvider: FC = ({ children }) => {
  const [size, setSize]: UseState<Readonly<[number, number]>> = useState([window.innerWidth, window.innerHeight]);

  useLayoutEffect(() => {
    function updateSize(): void {
      setSize(() => [window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <WindowSizeContext.Provider value={size}>
      {children}
    </WindowSizeContext.Provider>
  );
};

export type UseWindowSize = Readonly<[number, number]>;

export function useWindowSize(): UseWindowSize {
  return useContext(WindowSizeContext);
}
