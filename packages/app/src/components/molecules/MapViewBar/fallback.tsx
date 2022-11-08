import React, { FC, ReactNode } from 'react';

import { ErrorText, NOT_ALLOWED_CLASS_NAME, defaultToastErrorOption, useInitialToast } from '^/hooks';
import * as T from '^/types';
import { Root, ToolWrapper, toolSVG } from './';

export const Fallback: FC = () => {
  useInitialToast({
    type: T.Toast.ERROR,
    content: {
      title: ErrorText.mapViewBar.title,
      description: ErrorText.mapViewBar.description,
    },
    option: defaultToastErrorOption,
  });

  const toolList: ReactNode = [
    T.TwoDDisplayMode.NORMAL,
    T.TwoDDisplayMode.COMPARISON2,
    T.TwoDDisplayMode.COMPARISON4,
    T.TwoDDisplayMode.SLIDER,
  ].map((type) => (
    <ToolWrapper key={type}>
      {toolSVG[type]}
    </ToolWrapper>
  ));

  return (
    <Root className={NOT_ALLOWED_CLASS_NAME}>
      {toolList}
    </Root>
  );
};
