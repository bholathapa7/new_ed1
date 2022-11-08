export const exhaustiveCheck: (x: never) => never = (x) => {
  throw new Error(`Unexpected object : ${x}`);
};
