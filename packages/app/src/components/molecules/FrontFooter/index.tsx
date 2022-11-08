import React, { FC, ReactNode } from 'react';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';
import styles from '^/constants/styles';

import BreakLineText from '^/components/atoms/BreakLineText';
import LogoPNG from '^/components/atoms/LogoPNG';

const FooterBar = styled.footer({
  position: 'relative',

  display: 'flex',
  marginTop: '40px',

  boxSizing: 'border-box',
  width: '100%',
  height: '134px',

  backgroundColor: palette.white.toString(),
  paddingLeft: '40px',
  paddingRight: '40px',

  justifyContent: 'center',

  [styles.mobileCssQuery]: {
    display: 'block',

    marginTop: '0',

    height: 'auto',

    padding: '30px',
  },
});

const FooterBody = styled.div({
  marginLeft: '40px',

  flexGrow: 1,
  maxWidth: '900px',

  fontSize: '13px',
  fontWeight: 300,
  color: palette.textLight.toString(),

  [styles.mobileCssQuery]: {
    marginLeft: 0,
    marginTop: '30px',

    fontSize: '17.3px',
  },
});

const FooterLogoWrapper = styled.div({
  width: '200px',
  height: '24px',

  [styles.mobileCssQuery]: {
    marginLeft: '-10px',

    width: '125px',
    height: '15px',
  },
});

const FooterContact = styled.address({
  display: 'block',
  marginTop: '-4px',

  lineHeight: '1.6',
  fontStyle: 'normal',
});

const FooterContactEmph = styled.span({
  fontWeight: 'normal',
  color: palette.textGray.toString(),
});

const FooterContactDivider = styled.div({
  display: 'inline-block',
  marginLeft: '7px',
  marginRight: '7px',

  width: '1px',
  height: '10px',

  backgroundColor: palette.textLight.toString(),
});

const footerContactEmailStyle: CSSObject = {
  textDecoration: 'none',
  color: 'inherit',
};
const FooterContactEmail = styled.a({
  marginLeft: '1ex',
  ...footerContactEmailStyle,

  ':link': footerContactEmailStyle,
  ':visited': footerContactEmailStyle,
  ':active': footerContactEmailStyle,

  [styles.mobileCssQuery]: {
    display: 'block',

    marginLeft: 0,
  },
});

const FooterTerm = styled.div({
  display: 'block',
  marginTop: '8px',

  lineHeight: 1,

  [styles.mobileCssQuery]: {
    marginTop: '47px',
    marginLeft: 0,
  },
});

const FooterCopyright = styled.div({
  display: 'inline-block',

  [styles.mobileCssQuery]: {
    display: 'block',
    marginTop: '16px',
  },
});

const FooterSNSLinkList = styled.ul({
  display: 'block',
  marginLeft: '40px',

  [styles.mobileCssQuery]: {
    position: 'absolute',
    bottom: '40px',
    right: '40px',
    display: 'block',
    marginLeft: 0,
  },
});

const FooterSNSLinkItem = styled.li({
  display: 'inline-block',
});

const snsLinkCommonStyle: CSSObject = {
  textDecoration: 'none',
  color: palette.white.toString(),
};
const FooterFacebookLink = styled.a.attrs({
  className: 'fa fa-facebook',
})({
  width: '30px',
  height: '30px',

  borderRadius: '50%',
  backgroundColor: palette.textLight.toString(),

  textAlign: 'center',
  lineHeight: '31px',
  fontSize: '16px',
  ...snsLinkCommonStyle,

  ':link': snsLinkCommonStyle,
  ':visited': snsLinkCommonStyle,
  ':active': snsLinkCommonStyle,
});

const FooterScroolTopButton =
styled.div.attrs({
  className: 'fa fa-arrow-circle-o-up',
})({
  display: 'none',
  position: 'absolute',

  right: '40px',
  top: '5%',

  fontSize: '3rem',
  color: palette.textGray.toString(),

  [styles.mobileCssQuery]: {
    display: 'block',
  },
});

interface FrontFooterProps {
  className?: string;
}

const FrontFooter: FC<FrontFooterProps> = ({ className }) => {
  const isMobile: boolean = styles.isMobile();
  const footerContactWeb: ReactNode = (
    <FooterContact>
      <FooterContactEmph>상호명</FooterContactEmph> (주)엔젤스윙<FooterContactDivider />
      <FooterContactEmph>대표이사</FooterContactEmph> 박원녕<FooterContactDivider />
      <FooterContactEmph>사업자등록번호</FooterContactEmph> 499-81-00330<br />
      <FooterContactEmph>주소</FooterContactEmph> 서울시 관악구 관악로 1 서울대학교 연구공원 본관 327호
      <FooterContactDivider />
      <FooterContactEmph>대표전화</FooterContactEmph> 070-8098-1040<FooterContactDivider />
      <FooterContactEmph>대표메일</FooterContactEmph>
      <FooterContactEmail href='mailto:info@angelswing.io'>
        info@angelswing.io
      </FooterContactEmail>
    </FooterContact>
  );
  const footerContacts: Array<string> = [
    '(주)엔젤스윙',
    '서울시 관악구 관악로 1 서울대학교 연구공원 본관 327호',
    '070-8098-1040',
  ];
  const footerContactMobile: ReactNode = (
    <FooterContact>
      <BreakLineText>
        {footerContacts}
      </BreakLineText>
      <FooterContactEmail href='mailto:info@angelswing.io'>
        info@angelswing.io
      </FooterContactEmail>
    </FooterContact>
  );
  const footerContact: ReactNode = isMobile ? footerContactMobile : footerContactWeb;

  const footerTermWeb: ReactNode = (
    <FooterTerm>
      이용약관<FooterContactDivider />개인정보처리방침&nbsp;&nbsp;&nbsp;
      <FooterCopyright>©ANGELSWING Inc.</FooterCopyright>
    </FooterTerm>
  );
  const footerTermMobile: ReactNode = (
    <FooterTerm>
      <FooterContactEmph>개인정보처리방침</FooterContactEmph>
      <FooterContactDivider />
      이용약관
      <FooterCopyright>©ANGELSWING Inc.</FooterCopyright>
    </FooterTerm>
  );
  const footerTerm: ReactNode = isMobile ? footerTermMobile : footerTermWeb;

  const scrollTop: () => void = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <FooterBar className={className}>
      <FooterLogoWrapper>
        <LogoPNG />
      </FooterLogoWrapper>
      <FooterBody>
        {footerContact}
        {footerTerm}
      </FooterBody>
      <FooterSNSLinkList>
        <FooterSNSLinkItem>
          <FooterFacebookLink href='https://www.facebook.com/angelswing.io' />
        </FooterSNSLinkItem>
      </FooterSNSLinkList>
      <FooterScroolTopButton onClick={scrollTop} />
    </FooterBar>
  );
};
export default FrontFooter;
