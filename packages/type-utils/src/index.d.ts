export type Overwrite<T extends Partial<Record<keyof U, any>>, U> =
  & Pick<T, Exclude<keyof T, keyof U>>
  & U
  ;
export type Override<T, U> =
  & Pick<T, Exclude<keyof T, keyof U>>
  & U
  ;

export type First<A extends Array<any>> =
  A extends [] ?
  never :
  A extends [infer F, ...Array<any>] ?
  F :
  A extends Array<infer E> ?
  E :
  never
  ;
export type Tail<A extends Array<any>> =
  A extends [] ?
  never :
  ((...args: A) => any) extends ((__: any, ...tail: infer T) => any) ?
  T :
  A extends Array<infer E> ?
  Array<E> :
  never
  ;

/**
 * @desc
 * It's impossible (or very hard) to implement `Last` or `Init` for tuples, since
 * `type` definitions do not allow recursions.
 */

export type EqualWithResult<A, B, T, F> =
  A extends B ?
  (B extends A ? T : F) :
  F
  ;
export type Equal<A, B> = EqualWithResult<A, B, true, false>;

export type FindKey<T, U> = {
  [K in keyof T]: EqualWithResult<T[K], U, K, never>;
}[keyof T];
export type Find<T, U> = Pick<T, FindKey<T, U>>;

export type RemoveKey<T, U> = {
  [K in keyof T]: EqualWithResult<T[K], U, never, K>;
}[keyof T];
export type Remove<T, U> = Pick<T, RemoveKey<T, U>>;

export type DeepMutable<T> = { -readonly [P in keyof T]: DeepMutable<T[P]> };
