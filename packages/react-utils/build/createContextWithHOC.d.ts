import { ComponentType, ComponentClass, Provider, Consumer } from 'react';
/**
 * @todo This should use HOCWithOverwrite
 */
export declare type ContextHOC<CP extends object> = <P>(C: ComponentType<P & CP> | ComponentType<P & Partial<CP>>) => ComponentClass<P>;
export interface ContextWithHOC<Context, CP extends object> {
    Provider: Provider<Context>;
    Consumer: Consumer<Context>;
    contextHOC: ContextHOC<CP>;
}
/**
 * @desc Fri Jul  6 10:24:20 2018 UTC updated
 */
export declare function createContextWithHOC<Context, CP extends object>(contextDefault: Context, map: (c: Context) => CP, nameMapper?: (name: string) => string): ContextWithHOC<Context, CP>;
