import React, { useEffect, useState, FC } from 'react';
import styled from 'styled-components';
import config, { BuildLevel } from '^/config';

import CircleQuestionMarkSvg from '^/assets/icons/circle-question-mark.svg';
import * as T from '^/types';
import channel from '^/store/duck/vendor/channel';
import {
  defaultToastInfoOption, generalErrorDescription, useL10n, UseL10n,
  UseState, useToast, UseToast,
} from '^/hooks';
import { Global } from '^/constants/zindex';
import palette from '^/constants/palette';
import Text from './text';
import { useAuthedUser } from '^/hooks/useAuthedUser';

interface User {
  alert: number;
}

const Button = styled.button<{ isOpen: boolean }>({
  zIndex: Global.GUIDE,
  position: 'fixed',
  bottom: '9px',
  right: '9px',
  background: 'var(--color-theme-primary)',
  cursor: 'pointer',
  borderRadius: '50%',
  padding: '7px 6.5px',
  lineHeight: 0.9,
}, ({ isOpen }) => ({
  display: isOpen ? 'none' : 'inline',
}));

const GuideIcon = styled(CircleQuestionMarkSvg)({
  width: '17px',
  height: '16px',
  cursor: 'inherit',
  lineHeight: 1,
});

const UnreadMark = styled.div({
  width: '14px',
  height: '14px',
  background: palette.guide.unreadMark.toString(),
  position: 'absolute',
  borderRadius: '50%',
  top: '-3px',
  right: '-3px',
});

const PLUGIN_KEY = '2a4158f6-45ac-4575-a4a7-46725d2e6105';
const GUIDE_BUTTON_ID = 'channel-talk-btn';
const GUIDE_BUTTON_SELECTOR = `#${GUIDE_BUTTON_ID}`;

const GuideButton: FC = () => {
  const [, lang]: UseL10n = useL10n();
  const [isOpen, setOpen]: UseState<boolean> = useState(false);
  const [isExistUnread, setExistUnread]: UseState<boolean> = useState(false);
  const toastify: UseToast = useToast();

  if (config.buildLevel !== BuildLevel.PRODUCTION) return null;

  const authedUser: T.User | undefined = useAuthedUser();

  const channelConfig = (() => {
    const baseConfig = {
      pluginKey: PLUGIN_KEY,
      customLauncherSelector: GUIDE_BUTTON_SELECTOR,
      hideChannelButtonOnBoot: true,
    };

    if (!authedUser) return baseConfig;

    return {
      ...baseConfig,
      memberId: authedUser.id,
      profile: {
        name:
          lang === T.Language.KO_KR ?
            `${authedUser.lastName} ${authedUser.firstName}` :
            `${authedUser.firstName} ${authedUser.lastName}`,
        mobileNumber: authedUser.contactNumber,
        email: authedUser.email,
        company: authedUser.organization,
      },
    };
  })();

  useEffect(() => {
    setOpen(false);
    const channelIO = channel();
    channelIO('boot', channelConfig, (error: Error, user: User) => {
      if (error) {
        toastify({
          type: T.Toast.ERROR,
          content: {
            title: Text.error.title,
            description: generalErrorDescription,
          },
          option: defaultToastInfoOption,
        });
      } else setExistUnread(user.alert > 0);
    });

    channelIO('onShowMessenger', () => {
      setOpen(true);
    });

    channelIO('onHideMessenger', () => {
      setOpen(false);
    });

    channelIO('onBadgeChanged', (unreadCount: number) => {
      setExistUnread(unreadCount > 0);
    });
  }, [authedUser]);

  return (
    <Button isOpen={isOpen} id={GUIDE_BUTTON_ID}>
      <GuideIcon />
      {isExistUnread && <UnreadMark />}
    </Button>
  );
};

export default GuideButton;
