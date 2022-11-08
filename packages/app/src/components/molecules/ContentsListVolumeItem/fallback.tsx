import React, { FC } from 'react';

import { ContentsListItemFallback } from '^/components/atoms/ContentsListItem/fallback';
import { ErrorText, defaultToastErrorOption, useInitialToast } from '^/hooks';
import * as T from '^/types';
import { Props } from './';

export const Fallback: FC<Props> = ({ content }) => {
  useInitialToast({
    type: T.Toast.ERROR,
    content: {
      title: ErrorText.contentsListVolumeItem.title,
      description: ErrorText.contentsListVolumeItem.description,
    },
    option: defaultToastErrorOption,
  });

  return (
    <ContentsListItemFallback content={content} />
  );
};
