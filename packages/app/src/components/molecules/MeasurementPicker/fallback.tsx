import React, { FC, ReactNode } from 'react';

import ArrowSvg from '^/assets/icons/arrow.svg';
import { ErrorText, NOT_ALLOWED_CLASS_NAME, defaultToastErrorOption, useInitialToast } from '^/hooks';
import * as T from '^/types';
import {
  Root, SelectContentType,
  SelectDefaultContent, ToggleButton, ToggleIconContainer, ToolButton, typeToIcon,
} from './';


export const Fallback: FC = () => {
  useInitialToast({
    type: T.Toast.ERROR,
    content: {
      title: ErrorText.measurementPicker.title,
      description: ErrorText.measurementPicker.description,
    },
    option: defaultToastErrorOption,
  });

  const measurementPickerButtons: ReactNode = ([
    SelectDefaultContent,
    T.ContentType.MARKER,
    T.ContentType.LENGTH,
    T.ContentType.AREA,
    T.ContentType.VOLUME,
  ] as Array<SelectContentType>).map((type) => (
    <ToolButton key={type}>
      {typeToIcon[type]}
    </ToolButton>
  ));

  return (
    <Root className={NOT_ALLOWED_CLASS_NAME}>
      {measurementPickerButtons}
      <ToggleButton>
        <ToggleIconContainer isClicked={false}>
          <ArrowSvg />
        </ToggleIconContainer>
      </ToggleButton>
    </Root>
  );
};
