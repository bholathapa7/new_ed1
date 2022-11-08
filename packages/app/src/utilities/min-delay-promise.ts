export const delayPromise: (
  delay: number,
) => Promise<undefined> = async (
  delay,
) => new Promise((resolve) => {
  window.setTimeout(() => {
    resolve();
  }, delay);
});

const minDelayPromise: <T>(
  promise: Promise<T>,
  delay: number,
) => Promise<T> = async <T>(
  promise: Promise<T>,
  delay: number,
) => {
  const [result]: [...Array<any>] =
    await Promise.all([promise, delayPromise(delay)]);

  return result;
};
export default minDelayPromise;
