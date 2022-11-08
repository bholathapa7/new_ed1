import React, { FC } from 'react';

import { ContentsListItemFallback } from '^/components/atoms/ContentsListItem/fallback';
import { ErrorText, defaultToastErrorOption, useInitialToast } from '^/hooks';
import * as T from '^/types';
import { Props } from './';

export const Fallback: FC<Props> = ({ content }) => {
  useInitialToast({
    type: T.Toast.ERROR,
    content: {
      title: ErrorText.contentsListESSArrowItem.title,
      description: ErrorText.contentsListESSArrowItem.description,
    },
    option: defaultToastErrorOption,
  });

  return (
    <ContentsListItemFallback content={content} />
  );
};
