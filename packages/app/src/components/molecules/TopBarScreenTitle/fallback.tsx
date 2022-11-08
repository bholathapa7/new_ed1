import React, { FC } from 'react';

import { Text, TextWrapper } from '^/components/atoms/EditableText';
import { defaultScreenMap } from '^/constants/screen';
import { ErrorText, NOT_ALLOWED_CLASS_NAME, UseL10n, defaultToastErrorOption, useInitialToast, useL10n } from '^/hooks';
import * as T from '^/types';
import { EditableScreenTextRoot } from '.';

export const Fallback: FC = () => {
  const [l10n]: UseL10n = useL10n();

  useInitialToast({
    type: T.Toast.ERROR,
    content: {
      title: ErrorText.topBarScreenTitle.title,
      description: ErrorText.topBarScreenTitle.description,
    },
    option: defaultToastErrorOption,
  });

  return (
    <EditableScreenTextRoot className={NOT_ALLOWED_CLASS_NAME} isSidebarShown={false}>
      <TextWrapper
        fromUI={T.EditableTextUI.TOPBAR}
        isTextEditable={false}
      >
        <Text
          fromUI={T.EditableTextUI.TOPBAR}
          hasText={true}
          isGenericName={false}
        >
          {l10n(defaultScreenMap.title)}
        </Text>
      </TextWrapper>
    </EditableScreenTextRoot>
  );
};
