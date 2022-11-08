import React, { FC, ReactNode, useMemo } from 'react';
import Scrollbars, { ScrollbarProps } from 'react-custom-scrollbars';
import { useSelector } from 'react-redux';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';
import dsPalette from '^/constants/ds-palette';
import { DeviceLandscapeHeight, MediaQuery, MediaQueryLandscapeHeight } from '^/constants/styles';
import * as T from '^/types';

import { Props } from '.';

const Root = styled.div({
  display: 'flex',

  boxSizing: 'border-box',
  width: '100%',
  height: '100%',

  flexDirection: 'column',
  backgroundColor: palette.white.toString(),
  overflow: 'hidden',
});

const ScrollbarsWrapper = styled(Scrollbars)<ScrollbarProps>({ flexGrow: 1 });

/**
 * @todo change css when user change the language.
 */
const PageTitle =
  styled.h1.attrs({
    className: 'no-select',
  })({
    textAlign: 'center',
    fontSize: '25px',
    fontWeight: 300,
    color: palette.textBlack.toString(),
    marginBottom: '50px',
  });

const ContentsWrapper = styled.section({
  display: 'flex',
  justifyContent: 'center',
});
ContentsWrapper.displayName = 'ContentsWrapper';

interface CustomStyleProps {
  readonly customStyle?: CSSObject;
  readonly hasLogo?: boolean;
  readonly currentPath?: string;
}
const Description =
  styled.div<CustomStyleProps>({
    position: 'relative',

    width: '400px',

    padding: '50px',
    backgroundColor: palette.white.toString(),

    wordBreak: 'keep-all',
    fontSize: '15px',
    lineHeight: '25px',
    fontWeight: 'normal',
    color: palette.textGray.toString(),
    textAlign: 'center',
    boxSizing: 'border-box',

    borderRadius: '6px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: dsPalette.typeDisabled.toString(),
  }, ({ customStyle }) => customStyle ? customStyle : {});
Description.displayName = 'Description';

const LogoContainer = styled.div<{ isSmallSize: boolean }>(({ isSmallSize }) => ({
  width: isSmallSize ? '190px' : '240px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  paddingTop: '20px',
  margin: '0px auto 54px auto',
  img: {
    width: '100%',
  },
}));

const BgContainer = styled.div({
  width: '100%',
  img: {
    minHeight: '100%',
    minWidth: '1024px',
    width: '100%',
    height: 'auto',
    position: 'fixed',
    top: 0,
    left: 0,
  },

  [MediaQuery[T.Device.MOBILE_L]]: {
    '& img': {
      display: 'none',
    },
  },
});

const HeroCont = styled.div<{ isScrollable?: boolean }>(({ isScrollable }) => ({
  width: '400px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  height: isScrollable ? undefined : '100vh',
  margin: isScrollable ? '130px 0 30px 0' : undefined,

  [`${MediaQuery[T.Device.MOBILE_L]}, (max-height: ${DeviceLandscapeHeight[T.Device.MOBILE_L]}px)`]: {
    margin: '0px',
  },

  [MediaQueryLandscapeHeight[T.Device.TABLET]]: {
    margin: '30px',
    height: undefined,
    justifyContent: 'flex-start',
  },
}));

const LogoTopCont = styled.div<{ isScrollable?: boolean }>(({ isScrollable }) => ({
  display: isScrollable ? 'none' : 'flex',
  justifyContent: 'center',
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginBottom: '30px',

  '& img': {
    width: '290px',
  },

  [MediaQueryLandscapeHeight[T.Device.MOBILE_L]]: {
    paddingTop: '40px',
  },

  [MediaQuery[T.Device.MOBILE_L]]: {
    display: 'none',
  },
}));

const LogoBottomCont = styled.div<{ isScrollable?: boolean }>(({ isScrollable }) => ({
  display: isScrollable ? 'none' : 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'center',
  marginTop: '135px',
  paddingBottom: '30px',

  '& img': {
    width: '200px',
  },

  [MediaQuery[T.Device.MOBILE_L]]: {
    display: 'none',
  },

  [MediaQueryLandscapeHeight[T.Device.TABLET]]: {
    marginTop: '80px',
  },
}));

const LogoTopLeft = styled.div({
  position: 'absolute',
  top: '50px',
  left: '50px',

  '& img': {
    maxWidth: '116px',
  },

  [MediaQuery[T.Device.MOBILE_L]]: {
    display: 'none',
  },

  [MediaQueryLandscapeHeight[T.Device.MOBILE_L]]: {
    top: '20px',
    left: '20px',

    '& img': {
      maxWidth: '70px',
    },
  },
});

const LogoTopRight = styled.div({
  position: 'absolute',
  top: '50px',
  right: '50px',

  '& img': {
    maxWidth: '90px',
  },

  [MediaQuery[T.Device.MOBILE_L]]: {
    display: 'none',
  },

  [MediaQueryLandscapeHeight[T.Device.MOBILE_L]]: {
    top: '20px',
    right: '20px',

    '& img': {
      maxWidth: '40px',
    },
  },
});

/**
 * Customized non-authenticated template page.
 * Unlike SimpleTitleTemplatePage, this component adds logo
 * and background image onto the main description page,
 * along with other UI tweaks. See Figma doc below for more details.
 * https://www.figma.com/file/JV8evx9HcLsfKGrJjLhdH3/Done_Plan?node-id=0%3A1.
 */
const CustomTitleTemplatePage: FC<Props> = ({ title, descriptionStyle, children, isScrollable }) => {
  const logoUrl: T.PlanConfig['logoUrl'] = useSelector((state: T.State) => state.PlanConfig.config?.logoUrl);

  const bgUrl: T.PlanConfig['bgUrl'] = useSelector((state: T.State) => state.PlanConfig.config?.bgUrl);

  const logoTopLeftUrl: T.PlanConfig['logoTopLeftUrl'] = useSelector((state: T.State) => state.PlanConfig.config?.logoTopLeftUrl);

  const logoTopRightUrl: T.PlanConfig['logoTopRightUrl'] = useSelector((state: T.State) => state.PlanConfig.config?.logoTopRightUrl);

  const loginLogoTopUrl: T.PlanConfig['loginLogoTopUrl'] = useSelector((state: T.State) => state.PlanConfig.config?.loginLogoTopUrl);

  const loginLogoBottomUrl: T.PlanConfig['loginLogoBottomUrl'] = useSelector((state: T.State) => state.PlanConfig.config?.loginLogoBottomUrl);

  const logo: ReactNode = useMemo(() => {
    if (!logoUrl) {
      return null;
    }

    return (
      <LogoContainer isSmallSize={!!title}>
        <img src={logoUrl} />
      </LogoContainer>
    );
  }, [logoUrl, title]);

  const bg: ReactNode = useMemo(() => {
    if (!bgUrl) {
      return null;
    }

    return (
      <>
        <BgContainer>
          <img src={bgUrl} />
        </BgContainer>
      </>
    );
  }, [bgUrl]);

  const pageTitle: ReactNode = useMemo(() => title ? <PageTitle>{title}</PageTitle> : null, [title]);

  const logoTopLeft: ReactNode = useMemo(() => {
    if (logoTopLeftUrl) {
      return (
        <LogoTopLeft>
          <img src={logoTopLeftUrl} />
        </LogoTopLeft>
      );
    }

    return null;
  }, [logoTopLeftUrl]);

  const logoTopRight: ReactNode = useMemo(() => {
    if (logoTopRightUrl) {
      return (
        <LogoTopRight>
          <img src={logoTopRightUrl} />
        </LogoTopRight>
      );
    }

    return null;
  }, [logoTopRightUrl]);

  const logoTopCont: ReactNode = useMemo(() => {
    if (loginLogoTopUrl) {
      return (
        <LogoTopCont isScrollable={isScrollable}>
          <img src={loginLogoTopUrl} />
        </LogoTopCont>
      );
    }

    return null;
  }, [isScrollable, loginLogoTopUrl]);

  const logoBottomCont: ReactNode = useMemo(() => {
    if (loginLogoBottomUrl) {
      return (
        <LogoBottomCont isScrollable={isScrollable}>
          <img src={loginLogoBottomUrl} />
        </LogoBottomCont>
      );
    }

    return null;
  }, [isScrollable, loginLogoBottomUrl]);

  const content: ReactNode = children ? (
    <ContentsWrapper>
      {logoTopLeft}{logoTopRight}
      <HeroCont isScrollable={isScrollable}>
        {logoTopCont}
        <Description
          customStyle={descriptionStyle}
          data-testid='custom-title-template-description'
        >
          {logo}
          {pageTitle}
          {children}
        </Description>
        {logoBottomCont}
      </HeroCont>
    </ContentsWrapper>
  ) : undefined;

  return (
    <Root>
      {bg}
      <ScrollbarsWrapper>
        {content}
      </ScrollbarsWrapper>
    </Root>
  );
};

export default CustomTitleTemplatePage;
