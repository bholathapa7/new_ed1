import { Viewer } from 'cesium';
import React, { ComponentType, Context, FC, PropsWithChildren, useState, createContext } from 'react';

import { UseState } from '^/hooks';
import CesiumInteraction from '../CesiumInteraction';

export interface CesiumContextProps {
  viewer?: Viewer;
  interaction?: CesiumInteraction;
  setViewer?(viewer?: Viewer): void;
  setInteraction?(interaction: CesiumInteraction): void;
}

export const CesiumContext: Context<CesiumContextProps> = createContext<CesiumContextProps>({});

export const CesiumContextProvider: FC = (props: any) => {
  const [state, setState]: UseState<CesiumContextProps | undefined> = useState();

  const setViewer: (viewer: Viewer) => void = (viewer) => {
    setState((s) => ({ ...s, viewer }));
  };

  const setInteraction: (interaction: CesiumInteraction) => void = (interaction) => {
    setState((s) => ({ ...s, interaction }));
  };

  const value: CesiumContextProps = {
    viewer: state?.viewer,
    interaction: state?.interaction,
    setViewer,
    setInteraction,
  };

  return (
    <CesiumContext.Provider value={value}>
      {props.children}
    </CesiumContext.Provider>
  );
};

/**
 * Wrapper component to enable using Cesium context as a prop
 */
export function withCesiumViewer<T>(
  TargetComponent: ComponentType,
): FC<T> {
  return (subProps: PropsWithChildren<T>) => {
    const TargetComponentWrappedWithContext: FC<CesiumContextProps> = (
      cesiumContextProps: CesiumContextProps,
    ) => (
      <TargetComponent {...subProps} {...cesiumContextProps} >
        {subProps.children}
      </TargetComponent>
    );

    return (
      <CesiumContext.Consumer>
        {TargetComponentWrappedWithContext}
      </CesiumContext.Consumer>
    );
  };
}
