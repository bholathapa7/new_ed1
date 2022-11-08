import React, { FC, ReactNode, useEffect, useState, MouseEvent } from 'react';
import { useSelector } from 'react-redux';
import { ajax } from 'rxjs/ajax';
import { map, tap } from 'rxjs/operators';
import styled from 'styled-components';

import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { UseState } from '^/hooks';
import { AuthHeader, makeAuthHeader, makeV2APIURL } from '^/store/duck/API';
import * as T from '^/types';
import { l10n } from '^/utilities/l10n';
import BackbuttonSvg from './back-button.svg';
import CloseThinSvg from './close-thinner.svg';
import Text from './text';
import UpdateSvg from './update.svg';

const ALERT_APPEAR_DURATION: number = 5000;

const Root = styled.div({
  width: '347px',
  opacity: 0.95,
  borderRadius: '5px',
  backgroundColor: palette.white.toString(),
  marginLeft: '24.5px',
  marginRight: '24.5px',
  marginBottom: '7.5px',

  display: 'flex',
  flexDirection: 'row',
});

const SVGWrapper = styled.div({
  width: '23px',
  height: '17px',
});

const Icon = styled.div<{isNotificationPanelOpened: boolean}>(({ isNotificationPanelOpened }) => ({
  position: 'relative',
  width: isNotificationPanelOpened ? '35px' : '36px',
  height: isNotificationPanelOpened ? '35px' : '36px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  margin: isNotificationPanelOpened ? '22px 1px 19.5px 22px' : '36.5px 22px 36.5px 22px',

  backgroundColor: dsPalette.themePrimary.toString(),
  borderRadius: '100%',
}));

const NotificationText = styled.div({
  paddingLeft: '17px',
  marginTop: '15.5px',

  width: '257px',
});

const UnreadBadge = styled.div({
  width: '10px',
  height: '10px',

  marginLeft: '5px',
  marginBottom: '5px',

  borderRadius: '100%',
  backgroundColor: palette.notification.Badge.toString(),
});

const TitleWrapper = styled.div({
  position: 'relative',

  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const Title = styled.p({
  color: palette.textGray.toString(),

  lineHeight: 1.44,
  fontSize: '14px',
  fontWeight: 700,
});

const ContentWrapper = styled.div({
  position: 'relative',

  width: '100%',

  textAlign: 'left',
  lineHeight: 1.44,
});

const Content = styled.div({
  color: palette.textGray.toString(),
  fontSize: '12px',
});

const ContentUl = styled.ul({
  listStyleType: 'none',
});

const ContentLi = styled(Content).attrs({ as: 'li' })``;

const ButtonWrapper = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  paddingRight: '5px',
  marginTop: '6px',
  marginBottom: '17px',

  cursor: 'pointer',
});

const CloseWrapper = styled.span({
  width: '29px',
  height: '29px',
  borderRadius: '100%',

  marginLeft: '15px',
  marginBottom: '6px',

  paddingRight: '1px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  cursor: 'pointer',

  '&:hover': {
    borderRadius: '100%',
    backgroundColor: palette.lightBlue.toString(),
  },
});

const DetailWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
  fontSize: '12px',
  fontWeight: 500,
  lineHeight: 1.44,
  color: palette.notification.DetailText.toString(),
  textDecoration: 'underline',
  textUnderlineOffset: '1px',
  padding: '6px 10px 6px 18px',
  borderRadius: '4px',

  '&:hover': {
    backgroundColor: dsPalette.grey20.toString(),
  },
});

const DetailButton = styled.span({
  marginTop: '3px',
  marginLeft: '6px',
});

const AlertRoot = styled.div({
  position: 'relative',
  width: '407.6px',
  height: '109px',

  display: 'flex',
  alignItems: 'center',

  marginBottom: '7px',

  borderRadius: '6px',
  backgroundColor: palette.white.toString(),
  boxShadow: palette.insideMap.shadow.toString(),

  cursor: 'pointer',
});

const AlertText = styled.div({
  display: 'flex',
  flexDirection: 'column',

  marginLeft: '22px',
});

const AlertHeader = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  width: '292.6px',
  height: '17px',

  marginTop: '5px',
  marginBottom: '10px',
});

const AlertTitle = styled.p({
  color: palette.textGray.toString(),
  lineHeight: 1.25,
  fontSize: '16px',
  fontWeight: 700,
});

const AlertContent = styled.div({
  width: '292.6px',
  height: '38px',

  fontSize: '13px',
  textAlign: 'left',
  lineHeight: 1.44,
});

const VerticalLine = styled.hr({
  position: 'absolute',
  top: '22px',
  left: '80px',

  height: '65px',

  borderLeft: `1px solid ${palette.dividerLight.toString()}`,
});

/**
 * Example Text: [공지] 플랫폼 ver1.9.1 업데이트 알림
 * After Split: [공지]/플랫폼/ver1.9.1/업데이트/알림
 */
const getVersion: (str: string) => string = (str) =>
  str.split(' ')[2];
const getReleaseText: (str: string, language: T.Language) => string = (str, language) => l10n(Text.update(getVersion(str)), language);
const getTitleText: (str: string, language: T.Language) => string = (str, language) => l10n(Text.title(getVersion(str)), language);

export interface NotificationProps {
  notice: T.Notice;
  read: boolean;
  isNotificationPanelOpened: boolean;
  language: T.Language;
  patchNotice(obj: { notice: T.Notice }): void;
}

/**
 * @desc Notification that you see when you click the "Notification button" on top bar (If any).
 */
export const Notification: FC<NotificationProps> = ({
  notice, read, isNotificationPanelOpened, language, patchNotice,
}) => {
  const Auth: T.AuthState = useSelector((state: T.State) => state.Auth);
  const slug: T.PlanConfig['slug'] = useSelector((state: T.State) => state.PlanConfig.config?.slug);
  const [isCloseButtonClicked, setIsCloseButtonClicked]: UseState<boolean> = useState(false);

  const go2Detail: () => void = () => {
    const authHeader: AuthHeader | undefined = makeAuthHeader(Auth, slug);

    if (authHeader === undefined) {
      return;
    }

    const URL: string = `${makeV2APIURL('faq')}?return_to=${notice.url}`;

    ajax.get(URL, authHeader).pipe(
      map(({ response }) => response),
      tap(({ redirect_url }) => window.open(redirect_url)),
    ).subscribe();
  };

  const handleCloseClick: (e: MouseEvent) => void = (e) => {
    e.stopPropagation();
    setIsCloseButtonClicked(true);
    patchNotice({ notice: { ...notice, isHidden: true } });
  };

  const unreadBadge: ReactNode = read ? undefined : <UnreadBadge data-testid='notice-item-unread' />;
  const contents: ReactNode = notice.headings.map((heading: string, i: number) =>
    <ContentLi key={`heading-${i}`} data-testid='notice-item-content'>{heading}</ContentLi>);

  return !isCloseButtonClicked ? (
    <Root key={`notice-${notice.id}`}>
      <Icon isNotificationPanelOpened={isNotificationPanelOpened}>
        <SVGWrapper>
          <UpdateSvg />
        </SVGWrapper>
      </Icon>
      <NotificationText>
        <TitleWrapper>
          <Title>
            {getTitleText(notice.title, language)}
          </Title>
          {unreadBadge}
          <CloseWrapper
            onClick={handleCloseClick}
            data-testid='notice-item-hide'
          >
            <CloseThinSvg />
          </CloseWrapper>
        </TitleWrapper>
        <ContentWrapper>
          <Content>{getReleaseText(notice.title, language)}</Content>
          <ContentUl>{contents}</ContentUl>
          <ButtonWrapper>
            <DetailWrapper
              onClick={go2Detail}
            >
              {l10n(Text.detail, language)}
              <DetailButton>
                <BackbuttonSvg />
              </DetailButton>
            </DetailWrapper>
          </ButtonWrapper>
        </ContentWrapper>
      </NotificationText>
    </Root>
  ) : null;
};

export interface AlertNotificationProps {
  notice: T.Notice;
  isNotificationPanelOpened: boolean;
  language: T.Language;
  patchNotice(obj: { notice: T.Notice }): void;
}

/**
 * @desc Notification that you see when you enter the project (If any).
 */
export const AlertNotification: FC<AlertNotificationProps> = ({
  notice, isNotificationPanelOpened, language, patchNotice,
}) => {
  const Auth: T.AuthState = useSelector((state: T.State) => state.Auth);
  const slug: T.PlanConfig['slug'] = useSelector((state: T.State) => state.PlanConfig.config?.slug);

  useEffect(() => {
    const timer: number = window.setTimeout(() => {
      if (!isNotificationPanelOpened) {
        patchNotice({ notice: { ...notice, isShown: true } });
      }
    }, ALERT_APPEAR_DURATION);

    return () => clearTimeout(timer);
  }, []);

  const handleCloseClick: (e: MouseEvent, isRead?: boolean) => void = (e, isRead) => {
    e.stopPropagation();
    patchNotice({
      notice: {
        ...notice,
        id: notice.id,
        isShown: true,
        isRead: isRead === undefined ? notice.isRead : true,
      },
    });
  };

  const go2Detail: (e: MouseEvent) => void = (e) => {
    handleCloseClick(e, true);

    const authHeader: AuthHeader | undefined = makeAuthHeader(Auth, slug);

    if (authHeader === undefined) {
      return;
    }
    const URL: string = `${makeV2APIURL('faq')}?return_to=${notice.url}`;

    ajax.get(URL, authHeader).pipe(
      map(({ response }) => response),
      tap(({ redirect_url }) => window.open(redirect_url)),
    ).subscribe();
  };

  return (
    <AlertRoot key={`notice-${notice.id}`} onClick={go2Detail} data-testid='alert-item'>
      <Icon isNotificationPanelOpened={isNotificationPanelOpened} data-testid='alert-item-star'>
        <SVGWrapper>
          <UpdateSvg />
        </SVGWrapper>
      </Icon>
      <VerticalLine />
      <AlertText>
        <AlertHeader>
          <AlertTitle>
            {getTitleText(notice.title, language)}
          </AlertTitle>
          <CloseWrapper
            onClick={handleCloseClick}
            data-testid='alert-item-close'
          >
            <CloseThinSvg />
          </CloseWrapper>
        </AlertHeader>
        <AlertContent>
          {getReleaseText(notice.title, language)}
          <br />
          {l10n(Text.clickHere, language)}
        </AlertContent>
      </AlertText>
    </AlertRoot>
  );
};

