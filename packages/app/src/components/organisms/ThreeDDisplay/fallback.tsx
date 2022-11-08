import React, { FC } from 'react';

import { ErrorText, NOT_ALLOWED_CLASS_NAME, defaultToastErrorOption, useInitialToast } from '^/hooks';
import * as T from '^/types';
import { ViewerWrapper } from './';

export const Fallback: FC = () => {
  useInitialToast({
    type: T.Toast.ERROR,
    content: {
      title: ErrorText.threeDDisplay.title,
      description: ErrorText.threeDDisplay.description,
    },
    option: defaultToastErrorOption,
  });

  return (
    <ViewerWrapper className={NOT_ALLOWED_CLASS_NAME} />
  );
};
