import React, { Component, ReactNode, Context as ReactContext, ComponentType, ComponentClass, createContext, Provider, Consumer } from 'react';

/**
 * @todo This should use HOCWithOverwrite
 */
export type ContextHOC<CP extends object> =
  <P>(
    C: ComponentType<P & CP> | ComponentType<P & Partial<CP>>,
  ) => ComponentClass<P>;

export interface ContextWithHOC<Context, CP extends object> {
  Provider: Provider<Context>;
  Consumer: Consumer<Context>;
  contextHOC: ContextHOC<CP>;
}

/**
 * @desc Fri Jul  6 10:24:20 2018 UTC updated
 */
export function createContextWithHOC<Context, CP extends object>(
  contextDefault: Context, map: (c: Context) => CP, nameMapper?: (name: string) => string,
): ContextWithHOC<Context, CP> {
  const context: ReactContext<Context> = createContext(contextDefault);

  return {
    Provider: context.Provider,
    Consumer: context.Consumer,
    /**
     * @todo This should use HOCWithOverwriteProps
     */
    contextHOC<P>(
      C: ComponentType<P & CP>,
    ): ComponentClass<P> {
      const innerName: string = C.displayName || (C as any).name || '' as string;
      const displayName: string = nameMapper !== undefined ?
        nameMapper(innerName) :
        `HOC(${innerName})`;

      return class extends Component<P> {
        public static displayName: string = displayName;

        public constructor(props: P) {
          super(props);
          this.renderChild = this.renderChild.bind(this);
        }

        private renderChild(c: Context): ReactNode {
          const extraProps: CP = map(c);
          const mergedProps: any = {
            ...(this.props as any),
            ...(extraProps as any),
          };

          return (
            <C {...mergedProps} />
          );
        }

        public render(): ReactNode {
          return (
            <context.Consumer>
              {this.renderChild}
            </context.Consumer>
          );
        }
      };
    },
  };
}
