import React, { FC } from 'react';

import { ErrorText, NOT_ALLOWED_CLASS_NAME, defaultToastErrorOption, useInitialToast } from '^/hooks';
import * as T from '^/types';
import { MeasurementContentsListRoot } from '.';

export const Fallback: FC = () => {
  useInitialToast({
    type: T.Toast.ERROR,
    content: {
      title: ErrorText.contentsList.title,
      description: ErrorText.contentsList.description,
    },
    option: defaultToastErrorOption,
  });

  return (
    <MeasurementContentsListRoot className={NOT_ALLOWED_CLASS_NAME} />
  );
};
