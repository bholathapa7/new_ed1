import { glMatrix } from 'gl-matrix';
import React, { FC, memo, useEffect } from 'react';

const useGlMatrix: () => void = () => {
  useEffect(() => {
    // Greatly improve performance of glMatrix ops.
    // https://github.com/toji/gl-matrix#learn-more
    glMatrix.setMatrixArrayType(Array);
  }, []);
};

export const Initializer: FC = memo(() => {
  useGlMatrix();

  return <></>;
});
