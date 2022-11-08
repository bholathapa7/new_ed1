import React, { FC } from 'react';

import { Root as BaseMapToggleButtonRoot, Thumbnail } from '^/components/atoms/BasemapToggleButton';
import { spanCustomStyle } from '^/components/atoms/DisplayToggleButton';
import ToggleButton from '^/components/atoms/ToggleButton';
import { ErrorText, NOT_ALLOWED_CLASS_NAME, defaultToastErrorOption, useInitialToast } from '^/hooks';
import * as T from '^/types';
import { Root } from './';

export const Fallback: FC = () => {
  useInitialToast({
    type: T.Toast.ERROR,
    content: {
      title: ErrorText.mapMode.title,
      description: ErrorText.mapMode.description,
    },
    option: defaultToastErrorOption,
  });

  return (
    <Root className={NOT_ALLOWED_CLASS_NAME}>
      <BaseMapToggleButtonRoot>
        <Thumbnail />
      </BaseMapToggleButtonRoot>
      <ToggleButton
        isRight={false}
        leftText='2D'
        rightText='3D'
        spanCustomStyle={spanCustomStyle}
      />
    </Root>
  );
};
