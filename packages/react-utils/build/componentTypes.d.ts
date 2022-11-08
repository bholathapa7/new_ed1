import { ComponentType } from 'react';
export declare type PropsOf<C> = C extends ComponentType<infer P> ? P : never;
export declare type RefOf<C> = PropsOf<C> extends {
    ref: infer R;
} ? R : C;
export declare type InnerRefOf<C> = PropsOf<C> extends {
    innerRef: infer R;
} ? R : C;
