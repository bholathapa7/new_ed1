import Color from 'color';
import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';

import ToggleSvg from '^/assets/icons/contents-list/arrow.svg';
import DownloadGrayActivatedSvg from '^/assets/icons/download-gray-activated.svg';
import DownloadGrayDeactivatedSvg from '^/assets/icons/download-gray-deactivated.svg';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { UseL10n, useL10n } from '^/hooks';
import * as T from '^/types';

const DOWNLOAD_NOT_AVAILABLE_OPACITY: number = 0.4;
const DOWNLOAD_DATA_SIZE_ALTERABLE: Array<string> = ['정사영상', '수치표면모델', '포인트 클라우드'];

const Root = styled.button({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  height: '50px',

  backgroundColor: palette.DownloadPopup.itemBackgroundGray.toString(),
  cursor: 'pointer',

  width: '100%',
  padding: '0 17px',

  marginTop: '8px',

  borderRadius: '9px',
});

const FileTypeWrapper = styled.div<{ isDownloadable?: boolean }>(({ isDownloadable }) => ({
  display: 'flex',
  alignItems: 'center',

  paddingTop: '3px',

  opacity : isDownloadable ? undefined : DOWNLOAD_NOT_AVAILABLE_OPACITY,
}));

const FileExtensionWrapper = styled.div({
  fontSize: '13px',
  color: 'var(--color-theme-primary)',
});

const Divider = styled.span({
  display: 'inline-block',
  marginLeft: '12px',
  marginRight: '12px',
  marginBottom: '2.4px',

  width: '0px',
  borderRight: `thin solid ${palette.DownloadPopup.divider.toString()}`,
  height: '16px',
});

const FileTypeText = styled.span({
  fontSize: '15px',
  fontWeight: 600,
  color: dsPalette.title.toString(),
});

interface ToggleIconProps {
  readonly isFolded: boolean ;
  readonly isDownloadable: boolean;
}

const ToggleIcon = styled(ToggleSvg)<ToggleIconProps>(({ isFolded, isDownloadable }) => ({
  marginRight: isFolded ? undefined : '1.8px',

  transform: isFolded ? 'rotate(-180deg)' : undefined,
  transition: 'transform 0.17s',

  opacity: isDownloadable ? undefined : DOWNLOAD_NOT_AVAILABLE_OPACITY,
}));

const DownLoadSvgWrapper = styled.span({
  fontSize: '12px',

  color: palette.icon.toString(),
});

const isFoldable: (type: string) => boolean = (type) => DOWNLOAD_DATA_SIZE_ALTERABLE.includes(type);

export interface Props {
  readonly koreanFileType: string;
  readonly englishFileType: string;
  readonly isBorderVisible?: boolean;
  readonly isDownloadable?: boolean;
  readonly fileExtension: string;
  readonly iconColor: Color;
  readonly customIconClassName?: string;
  readonly trackAction?: string;
  readonly trackLabel?: string;
  onClick(): void;
}

const AttachmentDownloadButton: FC<Props & L10nProps> = (
  { fileExtension, koreanFileType, englishFileType,
    onClick, isBorderVisible, isDownloadable, trackAction, trackLabel },
) => {
  const [, lang]: UseL10n = useL10n();
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const fileTypeText: string = lang === T.Language.KO_KR ? koreanFileType : englishFileType;
  const iconOnRightSide: ReactNode = isFoldable(koreanFileType) ?
    <ToggleIcon isFolded={isBorderVisible} isDownloadable={isDownloadable} /> :
    (<DownLoadSvgWrapper>
      {isDownloadable ? <DownloadGrayActivatedSvg /> : <DownloadGrayDeactivatedSvg />}
    </DownLoadSvgWrapper>);

  return (
    <Root
      data-ddm-track-action={trackAction}
      data-ddm-track-label={trackLabel}
      onClick={onClick}
    >
      <FileTypeWrapper isDownloadable={isDownloadable}>
        <FileTypeText>
          {fileTypeText}
        </FileTypeText>
        <Divider />
        <FileExtensionWrapper>
          {fileExtension}
        </FileExtensionWrapper>
      </FileTypeWrapper>
      {iconOnRightSide}
    </Root>
  );
};
export default withL10n(AttachmentDownloadButton);
