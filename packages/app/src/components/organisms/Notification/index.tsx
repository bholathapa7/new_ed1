import React, { FC, ReactNode, useRef, useState, MutableRefObject } from 'react';
import { useSelector } from 'react-redux';
import styled, { CSSObject } from 'styled-components';

import NotificationSvg from '^/assets/icons/top-bar/notification.svg';
import WrapperHoverable, {
  Props as WrapperHoverableProps,
} from '^/components/atoms/WrapperHoverable';
import { TopBarButton } from '^/components/molecules/MapTopBar';
import palette from '^/constants/palette';
import { UseL10n, UseState, useL10n } from '^/hooks';
import * as T from '^/types';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import NotificationPopup from '../NotificationPopup';
import { Fallback } from './fallback';
import Text from './text';

const TooltipWrapperStyle: CSSObject = {
  width: '100%',
  height: '100%',

  position: 'relative',

};
const TooltipTargetStyle: CSSObject = {
  width: '100%',
  height: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};
const TooltipBalloonStyle: CSSObject = {
  left: '50%',
  transform: 'translate(-50%, 0)',
  bottom: '-23px',
};

const TooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: TooltipWrapperStyle,
  tooltipTargetStyle: TooltipTargetStyle,
  tooltipBalloonStyle: TooltipBalloonStyle,
};


const NotificationBalloon =
  styled.div({
    position: 'absolute',
    right: 0,

    display: 'flex',

    justifyContent: 'center',
    alignItems: 'center',

    boxSizing: 'border-box',
    paddingBottom: '1px',

    width: '13px',
    height: '13px',

    backgroundColor: palette.notification.Badge.toString(),
    borderRadius: '50%',

    fontSize: '8px',
    color: palette.white.toString(),
  });


const RawNotification: FC = () => {
  const { Users }: T.State = useSelector((state: T.State) => state);
  const [l10n]: UseL10n = useL10n();

  const [isNotificationPanelOpened, setIsNotificationPanelOpened]: UseState<boolean> = useState(false);
  const notificationRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  const unReadNotificationCount: number = Object.values(Users.notices).filter((notification: T.Notice) => !notification.isRead).length;
  const notificationBadge: ReactNode = unReadNotificationCount ?
    <NotificationBalloon>{unReadNotificationCount}</NotificationBalloon> :
    undefined;

  const onNoticeClick: () => void = () => {
    setIsNotificationPanelOpened(!isNotificationPanelOpened);
  };

  return (
    <div ref={notificationRef}>
      <WrapperHoverable
        title={l10n(Text.notice)}
        customStyle={TooltipCustomStyle}
      >
        <TopBarButton onClick={onNoticeClick}>
          <NotificationSvg />
          {notificationBadge}
        </TopBarButton>
      </WrapperHoverable>
      <NotificationPopup
        isNotificationPanelOpened={isNotificationPanelOpened}
        setIsNotificationPanelOpened={setIsNotificationPanelOpened}
        parentRef={notificationRef}
      />
    </div>
  );
};

export const Notification: FC = withErrorBoundary(RawNotification)(Fallback);
