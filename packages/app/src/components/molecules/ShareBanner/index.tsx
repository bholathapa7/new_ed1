import * as T from '^/types';
import React, { FC, ReactNode, memo, useCallback, useMemo } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import styled from 'styled-components';

import AngelswingLogoSmall from '^/assets/icons/logo.svg';
import InfoIcon from '^/assets/icons/share-banner/info.svg';
import AngelswingLogoBig from '^/components/atoms/LogoPNG';
import WrapperHoverable, { Props as WrapperHoverableProps } from '^/components/atoms/WrapperHoverable';
import palette from '^/constants/palette';
import route from '^/constants/routes';
import { DeviceWidth, MediaQuery } from '^/constants/styles';
import { SharePage } from '^/constants/zindex';
import { UseL10n, useL10n, useWindowSize } from '^/hooks';
import { ChangeSharedProjectDetail } from '^/store/duck/SharedContents';
import { ApplyOptionIfKorean, GetCommonFormat, formatWithOffset } from '^/utilities/date-format';
import { useSelector } from 'react-redux';
import Text from './text';


const Banner = styled.header({
  width: '100%',
  height: '46px',
  position: 'fixed',
  top: 0,
  left: 0,
  backdropFilter: 'blur(4px)',
  backgroundColor: palette.ShareBanner.white.toString(),
  zIndex: SharePage.HEADER,
  display: 'flex',
  [MediaQuery[T.Device.MOBILE_L]]: {
    whiteSpace: 'nowrap',
  },
});

interface WidthProps {
  isLessThanResponsiveWidthThreshold: boolean;
}

const LogoWrapper = styled.figure<WidthProps>({
  position: 'relative',
  height: '100%',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}, ({ isLessThanResponsiveWidthThreshold }) => ({
  width: isLessThanResponsiveWidthThreshold ? 'auto' : '145px',
}));

const CustomLogo = styled.img({
  display: 'inline-block',
  width: 125,
});

const BannerSection = styled.section({
  paddingLeft: 15,
  paddingRight: 15,
  width: 'auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  borderRight: `thin solid ${palette.ShareBanner.BannerSection.toString()}`,
  [MediaQuery[T.Device.MOBILE_L]]: {
    '> section:first-of-type': {
      position: 'sticky',
      left: '0px',
    },
  },
});

const BannerScrollArea = styled.div({
  display: 'flex',
  width: '100%',
  height: '100%',
  '> section:nth-child(3)': {
    borderRight: 'none',
  },
});

const ScrollWrapper = styled.div({
  width: '100%',
  height: '100%',
});

const Title = styled.h3({
  fontSize: 11,
  fontWeight: 600,
  fontStretch: 'normal',
  fontStyle: 'normal',
  lineHeight: 'normal',
  letterSpacing: 'normal',
  color: palette.ShareBanner.Title.toString(),
});

const Detail = styled.p({
  fontSize: 11,
  fontWeight: 600,
  fontStretch: 'normal',
  fontStyle: 'normal',
  lineHeight: 'normal',
  letterSpacing: 'normal',
  color: palette.ShareBanner.Detail.toString(),
  paddingLeft: 15,
});

const LowResolutionMsg = styled.p({
  fontSize: 12,
  fontWeight: 600,
  fontStretch: 'normal',
  fontStyle: 'normal',
  lineHeight: 'normal',
  letterSpacing: 'normal',
  textAlign: 'right',
  color: palette.ShareBanner.Title.toString(),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const LowResolutionMsgWrapper = styled.div({
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  paddingRight: 15,
});

const InfoIconWrapper = styled(InfoIcon)({
  paddingRight: 7,
  minWidth: 13,
  minHeight: 13,
});


const lowResolutionTooltipMsg: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: { position: 'relative' },
  tooltipBackgroundStyle: {
    borderRadius: '6px',
  },
  tooltipArrowStyle: {
    left: '71%',
  },
  tooltipBalloonStyle: {
    width: '216px',

    bottom: 'auto',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',

    padding: '14px 15px 9px 15px',

    transform: 'translate(-50%, 3px)',
    left: '50%',
    top: '100%',

    [MediaQuery[T.Device.TABLET]]: {
      transform: 'unset',
      position: 'absolute',
      left: 'unset',
      right: '12px',
    },

    [MediaQuery[T.Device.MOBILE_L]]: {
      transform: 'unset',
      position: 'fixed',
      top: '76%',
      right: '20px',
    },
  },
  tooltipTextTitleStyle: {
    marginBottom: '4px',

    whiteSpace: 'normal',

    overflowWrap: 'break-word',

    lineHeight: '1.58',

    fontSize: '12px',
    fontWeight: 'normal',
  },
};

const RESPONSIVE_WIDTH_THRESHOLD: number = 1365;

export const ShareBanner: FC = memo(() => {
  const [l10n, lang]: UseL10n = useL10n();

  const { projectName, showAt, screenTitle, navbarLogoUrl }: Omit<ChangeSharedProjectDetail, 'projection'> =
    useSelector(({ SharedContents }: T.State) => ({
      projectName: SharedContents.projectName,
      showAt: SharedContents.showAt,
      screenTitle: SharedContents.screenTitle,
      navbarLogoUrl: SharedContents.navbarLogoUrl,
    }));
  const showAtTime: number | undefined = showAt?.getTime();

  const YYYYMMDD: string | undefined = useMemo(() => showAt ? formatWithOffset(
    0, new Date(showAt), GetCommonFormat({ lang, hasDay: true }), ApplyOptionIfKorean(lang),
  ) : undefined, [showAtTime]);

  const needsCustomization: boolean = useSelector((state: T.State) => !!state.PlanConfig.config?.slug);

  const handleLogoClick: () => void = useCallback(() => {
    if (!needsCustomization) window.open(route.externalLink.homepage, '_self');
  }, [needsCustomization]);

  const [windowX]: Readonly<[number, number]> = useWindowSize();
  const isLessThanResponsiveWidthThreshold: boolean = windowX < RESPONSIVE_WIDTH_THRESHOLD;

  const navbarLogo: ReactNode = useMemo(() => {
    if (needsCustomization) {
      return <CustomLogo src={navbarLogoUrl} alt={projectName} />;
    }
    if (isLessThanResponsiveWidthThreshold) {
      return <AngelswingLogoSmall />;
    }
    return <AngelswingLogoBig />;
  }, [needsCustomization, isLessThanResponsiveWidthThreshold]);

  const mapDateSection: ReactNode = useMemo(() => (
    YYYYMMDD !== undefined ? (
      <BannerSection>
        <Title>{l10n(Text.mapDate)}</Title>
        <Detail>{YYYYMMDD}</Detail>
      </BannerSection>
    ) : null
  ), [showAtTime]);

  const lowResolutionMsg: ReactNode = useMemo(() => (
    isLessThanResponsiveWidthThreshold ?
      <LowResolutionMsgWrapper>
        <WrapperHoverable customStyle={lowResolutionTooltipMsg} title={l10n(Text.lowResolutionMsg)}>
          <InfoIconWrapper />
        </WrapperHoverable>
      </LowResolutionMsgWrapper> :
      <LowResolutionMsgWrapper>
        <InfoIconWrapper />
        <LowResolutionMsg>{l10n(Text.lowResolutionMsg)}</LowResolutionMsg>
      </LowResolutionMsgWrapper>
  ), [isLessThanResponsiveWidthThreshold]);

  const scrollBannerSections: ReactNode = (
    <BannerScrollArea>
      <BannerSection>
        <Title>{l10n(Text.projectName)}</Title>
        <Detail>{projectName}</Detail>
      </BannerSection>
      {mapDateSection}
      <BannerSection>
        <Title>{l10n(Text.screenTitle)}</Title>
        <Detail>{screenTitle}</Detail>
      </BannerSection>
      {lowResolutionMsg}
    </BannerScrollArea>
  );

  const scrollArea: ReactNode = windowX <= DeviceWidth.MOBILE_L ? (
    <ScrollWrapper>
      <Scrollbars>
        {scrollBannerSections}
      </Scrollbars>
    </ScrollWrapper>
  ) : (
    <>
      {scrollBannerSections}
    </>
  );

  return (
    <Banner>
      <BannerSection onClick={handleLogoClick}>
        <LogoWrapper isLessThanResponsiveWidthThreshold={isLessThanResponsiveWidthThreshold}>
          {navbarLogo}
        </LogoWrapper>
      </BannerSection>
      {scrollArea}
    </Banner>
  );
});
