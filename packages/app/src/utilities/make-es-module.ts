/* istanbul ignore file: unused function */
const makeEsModuleFromObject: (obj: object) => object = (obj) => {
  const result: object = obj;
  Object.defineProperty(result, '__esModule', {
    value: true,
  });

  return result;
};
export default makeEsModuleFromObject;
