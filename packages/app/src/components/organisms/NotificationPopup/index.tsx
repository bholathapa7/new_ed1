import React, { Dispatch, FC, ReactNode, useEffect, useRef, useState, MutableRefObject, SetStateAction } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import { AlertNotification, Notification } from '^/components/molecules/Notification';
import palette from '^/constants/palette';
import { UseState, useClickOutside } from '^/hooks';
import { Action, PatchNotice } from '^/store/duck/Users';
import * as T from '^/types';
import { isPhone } from '^/utilities/device';
import { l10n } from '^/utilities/l10n';
import Text from './text';

const AlertNotificationWrapper = styled.div({
  position: 'absolute',
  marginTop: '7px',
  top: '50px',
  right: '35px',
});

const NotificationWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',

  position: 'absolute',
  top: '50px',
  right: '35px',
  marginTop: '7px',

  maxHeight: '360px',

  borderRadius: '6px',
  backdropFilter: 'blur(6px)',
  backgroundColor: palette.notification.Popup.toString(),
  boxShadow: palette.notification.BoxShadow.toString(),

});

const NotificationScrollArea = styled.div`
  overflow: auto;

  ::-webkit-scrollbar {
  width: 8px;
  }
  ::-webkit-scrollbar-thumb {
    background: #7186A4; 
    border-radius: 5px;
  } 
  ::-webkit-scrollbar-thumb:hover {
    background: #2A5087; 
  } 
`;

const NotificationBalloon = styled.div<{ hasNotification: boolean }>(({ hasNotification }) => ({
  width: '100%',
  height: '100%',
  borderRadius: '5px',

  paddingTop: hasNotification ? undefined : '48px',
  paddingBottom: hasNotification ? undefined : '48px',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const NotificationBox = styled.div({
  width: '100%',

  paddingTop: '22px',
  paddingBottom: '16px',
});

export interface Props {
  readonly isNotificationPanelOpened: boolean;
  readonly setIsNotificationPanelOpened: Dispatch<SetStateAction<boolean>>;
  readonly parentRef: MutableRefObject<HTMLDivElement | null>;
}

const NotificationPopup: FC<Props & L10nProps> = ({
  language, isNotificationPanelOpened, setIsNotificationPanelOpened, parentRef,
}) => {
  const dispatch: Dispatch<Action> = useDispatch();
  const {
    notices, getNoticeStatus,
  }: T.UsersState = useSelector((state: T.State) => state.Users);

  const notificationRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const [unShownNotices, setUnShownNotices]: UseState<Array<T.Notice>>
    = useState<Array<T.Notice>>([]);
  const [unReadNotices, setUnReadNotices]: UseState<Array<T.Notice>>
    = useState<Array<T.Notice>>([]);
  const [unHiddenNotices, setUnHiddenNotices]: UseState<Array<T.Notice>>
    = useState<Array<T.Notice>>([]);

  const hasNotification: boolean
    = Object.values(notices).filter((notice: T.Notice) => !notice.isHidden).length > 0;
  const patchNotice: (obj: { notice: T.Notice }) => void = ({ notice }) =>
    dispatch(PatchNotice({ notice }));
  const getUnShownNotices: () => void = () => !isPhone() ? setUnShownNotices(
    Object.values(notices).filter((notice: T.Notice) => !notice.isShown),
  ) : undefined;
  const getUnHiddenNotices: () => void = () => setUnHiddenNotices(
    Object.values(notices).filter((notice: T.Notice) => !notice.isHidden),
  );
  const getUnReadNotices: () => void = () => setUnReadNotices(
    Object.values(notices).filter((notice: T.Notice) => !notice.isRead),
  );
  const descDateSort: (a: T.Notice, b: T.Notice) => number
    = (a: T.Notice, b: T.Notice) => b.createdAt.valueOf() - a.createdAt.valueOf();

  useEffect(() => {
    getUnShownNotices();
    getUnReadNotices();
    getUnHiddenNotices();
  }, [notices]);

  useClickOutside({
    ref: parentRef, callback: () => {
      setIsNotificationPanelOpened(false);
    },
  });

  useEffect(() => {
    if (isNotificationPanelOpened) {
      if (unShownNotices.length || unReadNotices.length) {
        Object.values(notices)
          .filter((notice: T.Notice) => !notice.isShown || !notice.isRead)
          .forEach((notice: T.Notice) =>
            patchNotice({ notice: { ...notice, isShown: true, isRead: true } }));
      }
    }
  }, [isNotificationPanelOpened]);

  const showNotifications: () => ReactNode = () => {
    const notifications: ReactNode | string = hasNotification ? (
      <NotificationBox> {
        Object.values(unHiddenNotices).sort(descDateSort).map((notice) =>
          (<Notification
            key={notice.id}
            notice={notice}
            isNotificationPanelOpened={isNotificationPanelOpened}
            read={unReadNotices.findIndex((val: T.Notice) => val.id === notice.id) === -1}
            language={language}
            patchNotice={patchNotice}
          />))}
      </NotificationBox>
    ) : l10n(Text.noAlerts, language);

    return (
      <NotificationWrapper ref={notificationRef}>
        <NotificationScrollArea>
          <NotificationBalloon hasNotification={hasNotification}>
            {notifications}
          </NotificationBalloon>
        </NotificationScrollArea>
      </NotificationWrapper>
    );
  };

  const showAlertNotifications: () => ReactNode = () => {
    const alertNotifications: ReactNode = Object.values(unShownNotices)
      .sort(descDateSort)
      .map((notice: T.Notice) => (
        <AlertNotification
          key={notice.id}
          notice={notice}
          isNotificationPanelOpened={isNotificationPanelOpened}
          language={language}
          patchNotice={patchNotice}
          data-testid='notice-notification-item'
        />
      ));

    return (
      <AlertNotificationWrapper>
        {alertNotifications}
      </AlertNotificationWrapper>
    );
  };

  const popup: ReactNode = getNoticeStatus !== T.APIStatus.SUCCESS ? <></> :
    isNotificationPanelOpened ?
      showNotifications() :
      showAlertNotifications();

  return (
    <>{popup}</>
  );
};

export default withL10n(NotificationPopup);
