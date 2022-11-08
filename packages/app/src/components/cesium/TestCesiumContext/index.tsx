/* istanbul ignore file: only used for testing */
import React, { FC } from 'react';

import { CesiumContext, CesiumContextProps } from '../CesiumContext';

export type TestCesiumContextProps = Required<CesiumContextProps>;

interface TestCesiumContextProviderProps {
  cesiumContextProps: TestCesiumContextProps;
}

export const TestCesiumContextProvider: FC<TestCesiumContextProviderProps> = (
  { children, cesiumContextProps },
) => (
  <CesiumContext.Provider value={cesiumContextProps}>
    {children}
  </CesiumContext.Provider>
);
