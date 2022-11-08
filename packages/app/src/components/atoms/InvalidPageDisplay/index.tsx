import React, { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import DronePNG from '^/assets/drone.png';
import LogoPNG from '^/components/atoms/LogoPNG';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import routes from '^/constants/routes';
import { MediaQuery } from '^/constants/styles';
import { UseL10n, useL10n } from '^/hooks';
import * as T from '^/types';

import Text, { EMAIL_CUSTOM_TAG, INQUIRY_CUSTOM_TAG } from './text';

const Root = styled.main({
  width: '100%',
  height: '100%',

  background: palette.white.toString(),
});

const Wrapper = styled.div({
  position: 'relative',

  width: '100%',
  height: '100%',
});

const ContentCenter = styled.article({
  display: 'flex',
  position: 'absolute',
  top: '50%',
  left: '50%',

  borderRadius: '3px',
  background: palette.white.toString(),
  transform: 'translate(-50%, -50%)',

  fontSize: '15px',
  color: palette.textGray.toString(),
  lineHeight: 1.3,

  whiteSpace: 'pre-line',

  // in some versions of Safari/iOS, text sizes are somehow inconsistent
  // due its specific feature. This page already has its specific font sizes, so turning it off.
  // https://stackoverflow.com/questions/3226001/some-font-sizes-rendered-larger-on-safari-iphone
  '-webkit-text-size-adjust': 'none',

  [MediaQuery[T.Device.TABLET]]: {
    width: 'calc(100% - 130px)',
    margin: '0 60px 0 70px',
    left: 0,
    top: '70px',
    transform: 'translate(0, 0)',
  },

  [`${MediaQuery[T.Device.MOBILE_L]}, (max-height: 414px)`]: {
    width: 'calc(100% - 90px)',
    margin: '0 45px 0 45px',
    transform: 'translate(0, 0)',
    left: 0,
    top: '35px',
  },

  [MediaQuery[T.Device.MOBILE_S]]: {
    transform: 'translate(0, 0)',
    left: 0,
    top: '35px',
  },
});

const LogoWrapper = styled.div({
  width: '220px',
  marginBottom: '71px',

  [`${MediaQuery[T.Device.MOBILE_L]}, (max-height: 414px)`]: {
    marginBottom: '36px',
  },
});

const DescriptionWrapper = styled.div({
  width: '360px',
  color: dsPalette.typePrimary.toString(),

  fontSize: '14px',
  lineHeight: '22px',

  wordBreak: 'keep-all',

  [`${MediaQuery[T.Device.MOBILE_L]}, (max-height: 414px)`]: {
    width: '100%',
    fontSize: '13px',
  },

  ' p:first-of-type': {
    marginBottom: '8px',
  },
});

const PageTitle = styled.h2({
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '22px',

  [`${MediaQuery[T.Device.MOBILE_L]}, (max-height: 414px)`]: {
    fontSize: '18px',
  },
});

const DroneWrapper = styled.div({
  margin: '60px 0',
  display: 'flex',
  justifyContent: 'flex-end',

  background: `url(${DronePNG}) no-repeat`,
  width: '402px',
  height: '275px',

  [`${MediaQuery[T.Device.MOBILE_L]}, (max-height: 414px)`]: {
    display: 'none',
  },
});

const INQUIRY_LINK: string = 'https://angelswing.channel.io';

interface ErrorMessage {
  title: Record<T.Language, string>;
  description: Record<T.Language, string>;
  help: Record<T.Language, string>;
}

interface Props {
  readonly httpErrorStatus: T.HTTPError | undefined;
}

const InvalidPageDisplay: FC<Props> = ({ httpErrorStatus }) => {
  const [l10n]: UseL10n = useL10n();

  const { title, description, help }: ErrorMessage = (() => {
    switch (httpErrorStatus) {
      case T.HTTPError.CLIENT_UNAUTHORIZED_ERROR:
      case T.HTTPError.CLIENT_NOT_FOUND_ERROR: {
        return Text.errors[httpErrorStatus];
      }
      default: {
        return Text.errors.other;
      }
    }
  })();

  const helpNodes: ReactNode = (() => {
    const translatedHelp: string = l10n(help);

    // `Text.help` might contain a link whose text needs to be translated
    // to the respective language. Split the text apart and replace the link
    // with the actual clickable link. Otherwise return as-is.
    const emailSplits: string[] = translatedHelp.split(EMAIL_CUSTOM_TAG);
    if (emailSplits.length !== 2) {
      return translatedHelp;
    }

    const emailNode: ReactNode = <a href='mailto:help@angelswing.io' target='_blank' rel='noreferrer noopener'>help@angelswing.io</a>;

    const [emailTextFirstPart, emailTextLastPart]: string[] = emailSplits;
    const helpSplits: string[] = emailTextFirstPart.split(INQUIRY_CUSTOM_TAG);
    if (helpSplits.length !== 2) {
      return (
        <>
          {emailTextFirstPart}{emailNode}{emailTextLastPart}
        </>
      );
    }

    const [helpFirstPart, helpLastPart]: string[] = helpSplits;
    const link: ReactNode = (
      <a href={INQUIRY_LINK} target='_blank' rel='noreferrer noopener'>{l10n(Text.inquiry)}</a>
    );

    return (
      <>
        {helpFirstPart}{link}{helpLastPart}{emailNode}{emailTextLastPart}
      </>
    );
  })();

  const viewProjectPageNode: ReactNode = (
    <Link to={routes.project.main}>{l10n(Text.viewProjectBoard)}</Link>
  );

  return (
    <Root>
      <Wrapper>
        <ContentCenter>
          <DescriptionWrapper>
            <LogoWrapper>
              <LogoPNG />
            </LogoWrapper>
            <PageTitle>{l10n(title)}</PageTitle>
            <p>{l10n(description)}</p>
            <p>{helpNodes}</p>
            <br />
            {viewProjectPageNode}
          </DescriptionWrapper>
          <DroneWrapper />
        </ContentCenter>
      </Wrapper>
    </Root>
  );
};
export default InvalidPageDisplay;
