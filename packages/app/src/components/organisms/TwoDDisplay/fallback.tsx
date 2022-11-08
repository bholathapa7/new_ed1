import React, { FC } from 'react';

import { ErrorText, NOT_ALLOWED_CLASS_NAME, defaultToastErrorOption, useInitialToast } from '^/hooks';
import * as T from '^/types';
import { Root } from './';

export const Fallback: FC = () => {
  useInitialToast({
    type: T.Toast.ERROR,
    content: {
      title: ErrorText.twoDDisplay.title,
      description: ErrorText.twoDDisplay.description,
    },
    option: defaultToastErrorOption,
  });

  return (
    <Root className={NOT_ALLOWED_CLASS_NAME} />
  );
};
