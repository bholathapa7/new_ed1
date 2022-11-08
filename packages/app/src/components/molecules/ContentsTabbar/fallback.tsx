import React, { FC } from 'react';

import UploadSVG from '^/assets/icons/contents-tab-bar/upload.svg';
import AngelswingLogo from '^/assets/icons/logo.svg';
import { ErrorText, NOT_ALLOWED_CLASS_NAME, defaultToastErrorOption, useInitialToast } from '^/hooks';
import * as T from '^/types';
import { LogoTab, Root, TabItem, UploadTab, tabIconMap } from './';

export const Fallback: FC = () => {
  useInitialToast({
    type: T.Toast.ERROR,
    content: {
      title: ErrorText.contentsTabbar.title,
      description: ErrorText.contentsTabbar.description,
    },
    option: defaultToastErrorOption,
  });

  const allTabs: T.ContentPageTabType[] = Object.values(T.ContentPageTabType);

  return (
    <Root className={NOT_ALLOWED_CLASS_NAME}>
      <LogoTab>
        <AngelswingLogo />
      </LogoTab>
      {allTabs.map((tabType) => (<TabItem key={tabType}> {tabIconMap[tabType]} </TabItem>))}
      <UploadTab>
        <UploadSVG />
      </UploadTab>
    </Root>
  );
};
