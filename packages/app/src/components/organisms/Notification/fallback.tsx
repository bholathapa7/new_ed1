import NotificationSvg from '^/assets/icons/top-bar/notification.svg';
import { ErrorText, NOT_ALLOWED_CLASS_NAME, defaultToastErrorOption, useInitialToast } from '^/hooks';
import React, { FC } from 'react';

import { TopBarButton } from '^/components/molecules/MapTopBar';
import * as T from '^/types';

export const Fallback: FC = () => {
  useInitialToast({
    type: T.Toast.ERROR,
    content: {
      title: ErrorText.notification.title,
      description: ErrorText.notification.description,
    },
    option: defaultToastErrorOption,
  });

  return (
    <div className={NOT_ALLOWED_CLASS_NAME}>
      <TopBarButton>
        <NotificationSvg />
      </TopBarButton>
    </div>
  );
};
