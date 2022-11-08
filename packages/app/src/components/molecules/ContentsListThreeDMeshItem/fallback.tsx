import React, { FC } from 'react';

import { ContentsListItemFallback } from '^/components/atoms/ContentsListItem/fallback';
import { defaultToastErrorOption, useInitialToast } from '^/hooks';
import * as T from '^/types';
import { Props } from './';
import Text from './text';

export const Fallback: FC<Props> = ({ content }) => {
  useInitialToast({
    type: T.Toast.ERROR,
    content: {
      title: Text.fallback.content.title,
      description: Text.fallback.content.description,
    },
    option: defaultToastErrorOption,
  });

  return (
    <ContentsListItemFallback content={content} />
  );
};
