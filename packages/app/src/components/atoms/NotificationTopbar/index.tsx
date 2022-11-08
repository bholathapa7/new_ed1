import React, { FC, useCallback, useState, memo } from 'react';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';
import routes from '^/constants/routes';

import { UseL10n, UseState, useL10n } from '^/hooks';

import Text from './text';

interface RootProps {
  hide: boolean;
}
const Root = styled.div.attrs({
  'data-testid': 'notification-topbar-root',
})<RootProps>(({ hide }) => ({
  width: '100%',
  height: '86px',

  backgroundColor: palette.topbarNotification.toString(),
  position: 'fixed',
  zIndex: Number.MAX_SAFE_INTEGER,
  display: hide ? 'none' : 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const CloseIcon = styled.i.attrs({
  className: 'fa fa-times',
  'data-testid': 'notification-topbar-close',
})({
  position: 'absolute',
  right: '33px',

  color: palette.white.toString(),
  fontSize: '20px',
  cursor: 'pointer',
  lineHeight: 0, // For IE
});

const DescriptionWrapper = styled.div({
  width: '80%',
  textAlign: 'center',
});

const spanCSSStyle: CSSObject = {
  fontSize: '16px',
  fontWeight: 'normal',
  fontStretch: 'normal',
  fontStyle: 'normal',
  lineHeight: 1.5,
  letterSpacing: 'normal',
  color: palette.white.toString(),
};

const Description = styled.span({
  ...spanCSSStyle,
});

const ChromeLink = styled.a.attrs({
  href: routes.externalLink.chromeDownloadURL,
})({
  ...spanCSSStyle,
  fontWeight: 'bold',
});

const NotificationTopbar: FC = () => {
  const [l10n]: UseL10n = useL10n();

  const [hide, setHide]: UseState<boolean> = useState<boolean>(false);
  // const auth: T.AuthState = useSelector((state: T.State) => state.Auth);

  const handleHide: () => void = useCallback(() => {
    setHide(true);
  }, []);

  return (
    <Root hide={hide}>
      <DescriptionWrapper>
        <Description>
          {l10n(Text.msg)[0]}
          <br />
          {l10n(Text.msg)[1]}
          <ChromeLink>{l10n(Text.msg)[2]}</ChromeLink>
          {/* eslint-disable-next-line no-magic-numbers */}
          {l10n(Text.msg)[3]}
          {/* <ChromeMoreInformationLink onClick={handleDetailLinkClick}>
            {l10n(Text.msg)[4]}
          </ChromeMoreInformationLink> */}
        </Description>
      </DescriptionWrapper>
      <CloseIcon onClick={handleHide} />
    </Root>
  );
};

export default memo(NotificationTopbar);
