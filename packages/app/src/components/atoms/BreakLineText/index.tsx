import React, { FC, ReactNode } from 'react';

export interface Props {
  readonly children: Array<string>;
}

const BreakLineText: FC<Props> = ({ children }) => {
  const textArray: Array<string> = children.slice(0);
  const texts: ReactNode = textArray
    .reduce((acc, x, index) => index === 0 ? [x] : [acc, <br key={index} />, x], null);

  return (
    <>
      {texts}
    </>
  );
};

export default BreakLineText;
