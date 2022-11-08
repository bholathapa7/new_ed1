import { ComponentType } from 'react';

export type PropsOf<C> =
  C extends ComponentType<infer P> ?
  P :
  never;

export type RefOf<C> =
  PropsOf<C> extends { ref: infer R } ?
  R :
  C;

export type InnerRefOf<C> =
  PropsOf<C> extends { innerRef: infer R } ?
  R :
  C;
