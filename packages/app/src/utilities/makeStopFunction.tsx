export type MightBeStoppedFunction = <U extends Function>(cb: U) => U | null;

export function makeStopFunction(condition: boolean): MightBeStoppedFunction {
  return (cb) => {
    if (condition) return null;

    return cb;
  };
}
