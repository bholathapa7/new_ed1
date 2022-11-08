import React, { FC } from 'react';

import { ErrorText, NOT_ALLOWED_CLASS_NAME, defaultToastErrorOption, useInitialToast } from '^/hooks';
import * as T from '^/types';
import { ThreeDOrthoMessageViewer } from '../CesiumHooks';

export const Fallback: FC = () => {
  useInitialToast({
    type: T.Toast.ERROR,
    content: {
      title: ErrorText.cesiumViewer.title,
      description: ErrorText.cesiumViewer.description,
    },
    option: defaultToastErrorOption,
  });

  return (
    <ThreeDOrthoMessageViewer className={NOT_ALLOWED_CLASS_NAME} />
  );
};
