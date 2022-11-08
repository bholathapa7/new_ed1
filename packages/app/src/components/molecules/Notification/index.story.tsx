import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { AlertNotification, AlertNotificationProps, Notification, NotificationProps } from '.';

import * as M from '^/store/Mock';
import { Story } from '^/story.types';
import * as T from '^/types';

const makeNoticeProps: (language: T.Language) => AlertNotificationProps = (language) => ({
  notice: Object.values(M.mockUsers.notices)[0],
  isNotificationPanelOpened: true,
  language,
  patchNotice: action('patchNotice'),
});

const makeNotificationProps: (language: T.Language) => NotificationProps = (language) => ({
  notice: Object.values(M.mockUsers.notices)[0],
  read: false,
  isNotificationPanelOpened: true,
  language,
  patchNotice: action('patchNotice'),
});

const noticeItemStory: Story = storiesOf('Molecules|NoticeItem', module);

const zip: Array<[string, T.Language]> = [['English', T.Language.EN_US], ['한글', T.Language.KO_KR]];

zip.forEach(([language, Language]: [string, T.Language]) =>
  noticeItemStory.add(`NoticeItem-${language}`, () => (
    <AlertNotification {...makeNoticeProps(Language)} />
  )));

zip.forEach(([language, Language]: [string, T.Language]) =>
  noticeItemStory.add(`NotificationItem-${language}`, () => (
    <Notification {...makeNotificationProps(Language)} />
  )));
