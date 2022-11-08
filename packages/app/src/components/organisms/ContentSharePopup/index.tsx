import { addDays } from 'date-fns';
import { Coordinate } from 'ol/coordinate';
import React, { FC, ReactNode, useState, useEffect } from 'react';
import 'react-day-picker/lib/style.css';
import styled from 'styled-components';

import CopyDoneSvg from '^/assets/icons/share-popup/copy-done.svg';
import CopySvg from '^/assets/icons/share-popup/copy.svg';
import EmbedSvg from '^/assets/icons/share-popup/embed.svg';
import LinkSvg from '^/assets/icons/share-popup/link.svg';
import LoadingIcon from '^/components/atoms/LoadingIcon';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import WrapperHoverable, {
  Props as WrapperHoverableProps,
} from '^/components/atoms/WrapperHoverable';
import Popup from '^/components/molecules/Popup';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import * as T from '^/types';
import { ApplyOptionIfKorean, GetCommonFormat, formatWithOffset } from '^/utilities/date-format';
import { l10n } from '^/utilities/l10n';
import Text from './text';

type Link = 'URL' | 'Embed';

const COPIED_STATUS_TIMEOUT: number = 3000;
const LOADING_ICON_HEIGHT: number = 12;

enum LinkIds {
  URL_LINK_ID = 'urllink',
  EMBED_LINK_ID = 'embedlink',
}

const Body =
  styled.section({
    width: '310px',
    padding: '50px',
    paddingTop: '34px',
  });

const InstructionHeading = styled.h3({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  fontSize: '12px',
  fontWeight: 'bold',
  color: dsPalette.title.toString(),

  lineHeight: 1.5,
});

const InstructionSubHeading = styled.h3({
  fontSize: 11,
  lineHeight: 1.55,
  fontWeight: 'normal',
  fontStretch: 'normal',
  fontStyle: 'normal',
  letterSpacing: 'normal',
  paddingTop: '8px',
  color: dsPalette.title.toString(),
});

const ShareMethodTitle = styled.h3({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  fontSize: '14px',
  fontWeight: 'bold',
  fontStretch: 'normal',
  fontStyle: 'normal',
  lineHeight: 'normal',
  letterSpacing: 'normal',
  color: dsPalette.title.toString(),

  paddingTop: '36px',
  paddingBottom: '13px',
});

const ShareLinkWrapper = styled.section({
  height: '39px',
});

const ShareTool =
  styled.div({
    marginTop: '12px',
    marginBottom: '20px',
  });

ShareTool.displayName = 'ShareTool';

const ShareLink =
  styled.input({
    boxSizing: 'border-box',

    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '5px',
    borderColor: palette.border.toString(),

    resize: 'none',

    display: 'inline-block',
    width: '100%',
    height: '39px',

    fontSize: '12px',
    padding: '10px 38px 10px 17px',

    textOverflow: 'ellipsis',
    whiteSpace: 'pre',
    overflow: 'hidden',

    color: palette.textGray.toString(),

    lineHeight: 1.42,

    userSelect: 'all',
  });

const SVGWrapper = styled.svg({
  position: 'absolute',
  top: '-34px',
  right: '4px',

  width: '12px',
  height: '12px',
  padding: '8px',

  cursor: 'pointer',
});

const TooltipCopyStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: { position: 'relative' },
  tooltipArrowStyle: {
    top : '-6px',
    left : '14px',
  },
  tooltipBalloonStyle: {
    top : '-10px',
    left : '275px',
    bottom: 'auto',
  },
  tooltipTextTitleStyle: {
    fontSize: '12px',
  },
  tooltipTargetStyle: {
    '> svg': {
      top: '-34px',
    },
  },
};

const LinkIcon = styled(LinkSvg)({
  marginTop: 1,
  paddingRight: 7,
  height: 17,
});
const EmbedIcon = styled(EmbedSvg)({
  marginTop: 1,
  paddingRight: 4,
});

const daysPerWeek: number = 7;
const backgroundAlpha: number = 0.39;

const SharingLink: FC<{ linkType: string; value: string }> = ({ linkType, value }) => {
  const id: string = linkType === 'URL' ? LinkIds.URL_LINK_ID : LinkIds.EMBED_LINK_ID;
  const handleSelectAll: () => void = () => {
    // using ref does not work
    const a: HTMLInputElement | null = document.getElementById(id) as HTMLInputElement | null;
    a?.select();
  };

  return (
    <ShareLink
      id={id}
      spellCheck={false}
      data-testid={linkType === 'URL' ? 'contentsharepopup-inputurllink' : 'contentsharepopup-textareaembedlink'}
      value={value}
      onFocus={handleSelectAll}
    />
  );
};

export interface Props {
  readonly defaultDate?: Date;
  readonly postShareStatus: T.APIStatus;
  readonly shareToken: T.SharedContentsState['shareToken'];
  readonly navbarLogoUrl: T.SharedContentsState['navbarLogoUrl'];
  readonly selectedContentIds: Array<T.Content['id']>;
  readonly lastSelectedScreenDate?: T.Screen['appearAt'];
  readonly timezoneOffset: T.PagesState['Common']['timezoneOffset'];
  readonly zIndex: number;
  readonly cameraPosition: Coordinate;
  readonly zoomLevel: number;
  postShareRequest(
    contentIds: Array<T.Content['id']>,
    expiredAt: Date,
    navbarLogoUrl: T.SharedContentsState['navbarLogoUrl'],
    cameraPosition: Coordinate,
    zoomLevel: number,
  ): void;
  cancelShareRequest(): void;
  onClose(): void;
}

export interface IsCopiedState {
  URL: boolean;
  Embed: boolean;
}

const ContentSharePopup: FC<Props & L10nProps> = ({
  shareToken, defaultDate, selectedContentIds, navbarLogoUrl, cameraPosition, zoomLevel,
  postShareStatus, language, lastSelectedScreenDate, timezoneOffset, zIndex, onClose,
  postShareRequest,
}) => {
  const URLLink: () => string = () => {
    const { protocol, host }: Location = window.location;
    return `${protocol}//${host}/share/${shareToken}`;
  };

  const EmbedLink = () => `<iframe src="${URLLink}" width="960px" height="640px" frameborder="0"></iframe>`;

  const YYYYMMDD: string = lastSelectedScreenDate !== undefined ? formatWithOffset(
    timezoneOffset, lastSelectedScreenDate, GetCommonFormat({ lang: language, hasDay: true }), ApplyOptionIfKorean(language),
  ) : '';

  const currentDate = defaultDate || addDays(new Date(), daysPerWeek);
  const [isCopied, setisCopied] = useState<IsCopiedState>({
    URL: false,
    Embed: false,
  });

  useEffect(() => {
    postShareRequest(selectedContentIds, currentDate, navbarLogoUrl, cameraPosition, zoomLevel,);
  }, []);

  const setIsCopied: (status: boolean, linkType: Link) => void = (status, linkType) => {
    setisCopied({ ...isCopied, [linkType]: status });
  };

  const handleCopyClick: (linkType: Link) => void = (linkType) => {
    focusOnLink(linkType);
    copyLink(linkType);
  };

  const focusOnLink: (linkType: Link) => void = (linkType) => {
    const shareId: string = linkType === 'URL' ? LinkIds.URL_LINK_ID : LinkIds.EMBED_LINK_ID;

    if (!isCopied[linkType]) {
      const shareLinkFocus: HTMLInputElement | null = document.getElementById(shareId) as HTMLInputElement | null;
      if (shareLinkFocus === null) throw new Error('No Share Element ID Found');

      shareLinkFocus.select();

      document.execCommand('copy');

      setIsCopied(true, linkType);

      window.setTimeout(() => {
        setIsCopied(false, linkType);
        shareLinkFocus.blur();
      }, COPIED_STATUS_TIMEOUT);
    }
  };

  /**
   * @desc IE does not support standard CopyEvent.
   * Instead it have clipboardData in window.
   */
  const copyLink: (linkType: Link) => void = (linkType) => {
    const link: string = linkType === 'URL' ? URLLink() : EmbedLink();
    if (window.clipboardData) {
      window.clipboardData.setData('Text', link);
    } else {
      const copyListener: EventListener = (copyEvent: ClipboardEvent) => {
        copyEvent.preventDefault();
        if (copyEvent.clipboardData) {
          copyEvent.clipboardData.setData('text/plain', link);
        }
        document.removeEventListener('copy', copyListener);
      };
      document.addEventListener('copy', copyListener);
      document.execCommand('copy');
    }
  };

  const getShareLink: (linkType: Link) => ReactNode = (linkType) => {
    const canDisplayShare: boolean =
      postShareStatus !== T.APIStatus.PROGRESS &&
      shareToken !== undefined;

    return canDisplayShare ? (
      <>
        <SharingLink
          linkType={linkType}
          value={linkType === 'URL' ? URLLink() : EmbedLink()}
          data-testid={linkType === 'URL' ? 'contentsharepopup-inputurllink' : 'contentsharepopup-textareaembedlink'}
        />
        <WrapperHoverable
          title={l10n(Text.copy, language)}
          customStyle={TooltipCopyStyle}
        >
          <SVGWrapper
            onClick={(() => handleCopyClick(linkType))}
          >
            {isCopied[linkType] ? <CopyDoneSvg /> : <CopySvg />}
          </SVGWrapper>
        </WrapperHoverable>
      </>
    ) : (
      <>
        <ShareLinkWrapper>
          <ShareLink disabled={true} />
          <LoadingIcon
            loadingDivCustomStyle={{ height: LOADING_ICON_HEIGHT, width: LOADING_ICON_HEIGHT, position: 'relative', top: '-27px', left: '15px' }}
          />
        </ShareLinkWrapper>
      </>
    );
  };

  return (
    <Popup
      title={l10n(Text.title, language)}
      onCloseClick={onClose}
      hasBlur={true}
      zIndex={zIndex}
      alpha={backgroundAlpha}
    >
      <Body>
        <InstructionHeading>
          {/* eslint-disable-next-line max-len */}
          {language === T.Language.KO_KR ? `${YYYYMMDD}${l10n(Text.instructionHeading, language)}` : `${l10n(Text.instructionHeading, language)}${YYYYMMDD}`}
        </InstructionHeading>
        <InstructionSubHeading>
          {l10n(Text.expirationInstruction, language)}
        </InstructionSubHeading>
        <ShareMethodTitle>
          <LinkIcon />
          <h3>{l10n(Text.sharingAddress, language)}</h3>
        </ShareMethodTitle>
        {getShareLink('URL')}
        <ShareMethodTitle>
          <EmbedIcon />
          <h3>{l10n(Text.sharingCode, language)}</h3>
        </ShareMethodTitle>
        {getShareLink('Embed')}
        <InstructionSubHeading>
          {l10n(Text.notice, language)}
        </InstructionSubHeading>
      </Body >
    </Popup >
  );
};

export default withL10n(ContentSharePopup);
