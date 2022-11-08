import React, { FC, ReactNode, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import RawLogoPNG from '^/assets/logo.png';
import RawLanguageSwitch, { Props as SwitchProps } from '^/components/atoms/LanguageSwitch';
import LogoPNG from '^/components/atoms/LogoPNG';
import { MenuList } from '^/components/molecules/MenuList';
import palette from '^/constants/palette';
import styles, { DeviceWidth, MediaQuery } from '^/constants/styles';
import { UseWindowSize, useAuthHeader, useWindowSize } from '^/hooks';
import { AuthHeader } from '^/store/duck/API';
import * as T from '^/types';

interface RootProps {
  readonly backgroundColor?: string;
}
const Root = styled.nav<RootProps>({
  display: 'flex',

  boxSizing: 'border-box',
  flexShrink: 0,
  width: '100%',
  height: '70px',

  paddingRight: '40px',

  borderBottomWidth: '1px',
  borderBottomStyle: 'solid',
  borderBottomColor: palette.borderLight.toString(),

  alignItems: 'center',

  [styles.mobileCssQuery]: {
    paddingRight: '5%',
  },
}, ({ backgroundColor }) => ({
  backgroundColor: backgroundColor ? backgroundColor : palette.white.toString(),
}));

const TopbarLogoWrapper = styled.div<{ isLoggedIn: boolean }>(({ isLoggedIn }) => ({
  marginLeft: '30px',
  display: 'inline-block',
  maxWidth: '200px',

  cursor: 'pointer',
  [styles.mobileCssQuery]: {
    width: '40%',
    height: 'auto',
  },
  [MediaQuery[T.Device.MOBILE_L]]: {
    width: isLoggedIn ? '160px' : '30px',
    overflow: 'hidden',
  },
}));

const Padding = styled.div({
  flexGrow: 1,
});

const LogoImage = styled.img({
  display: 'inline-block',
  width: '150px',
  height: 'auto',
});

const CustomLogoImage = styled.img<{ isLoggedIn: boolean }>(({ isLoggedIn }) => ({
  width: '160px',

  [MediaQuery[T.Device.MOBILE_L]]: {
    width: isLoggedIn ? '100%' : undefined,
  },
}));

const LanguageSwitch = styled(RawLanguageSwitch)<SwitchProps>({
  marginLeft: '35px',
});
LanguageSwitch.displayName = 'LanguageSwitch';

export interface Props {
  readonly withLanguageSwitch?: boolean;
  readonly backgroundColor?: string;
  onLogoClick(): void;
}

const Topbar: FC<Props> = (
  { withLanguageSwitch = true, backgroundColor, onLogoClick, children: MenuItems },
) => {
  const languageSwitch: ReactNode = withLanguageSwitch ? (
    <LanguageSwitch target={[T.Language.KO_KR, T.Language.EN_US]} />
  ) : undefined;

  const authHeader: AuthHeader | undefined = useAuthHeader();
  const [windowX]: UseWindowSize = useWindowSize();

  const isLoggedIn: boolean = authHeader !== undefined;
  const navbarLogoUrl: T.PlanConfig['navbarLogoUrl'] = useSelector((state: T.State) => state.PlanConfig.config?.navbarLogoUrl);

  const navbarLogo: ReactNode = useMemo(() => {
    if (navbarLogoUrl) {
      return <CustomLogoImage src={navbarLogoUrl} isLoggedIn={isLoggedIn} />;
    }

    return !isLoggedIn && windowX <= DeviceWidth.MOBILE_L ?
      <LogoImage src={RawLogoPNG} /> : <LogoPNG />;
  }, [navbarLogoUrl, isLoggedIn, windowX]);

  return (
    <Root backgroundColor={backgroundColor}>
      <TopbarLogoWrapper onClick={onLogoClick} isLoggedIn={isLoggedIn}>
        {/* @todo: later angelswingLogo should be changed using LogoPNG Component in all device type */}
        {navbarLogo}
      </TopbarLogoWrapper>
      <Padding />
      <MenuList>
        {MenuItems}
      </MenuList>
      {languageSwitch}
    </Root>
  );
};
export default Topbar;
