import React, { FC, MutableRefObject, ReactNode, memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import DesignSvg from '^/assets/icons/upload-popup/design.svg';
import DsmSvg from '^/assets/icons/upload-popup/dsm.svg';
import OrthoPhotoSvg from '^/assets/icons/upload-popup/orthophoto.svg';
import OverlaySvg from '^/assets/icons/upload-popup/overlay.svg';
import PhotoSvg from '^/assets/icons/upload-popup/photo.svg';
import PointCloudSvg from '^/assets/icons/upload-popup/pointcloud.svg';
import ArrowSvg from '^/assets/icons/upload-popup/right-angle.svg';
import SourcePhotoSvg from '^/assets/icons/upload-popup/sourcephoto.svg';
import BreakLineText from '^/components/atoms/BreakLineText';
import Popup from '^/components/molecules/Popup';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { UseL10n, useL10n } from '^/hooks';
import { ChangeIsInSourcePhotoUpload, CloseContentPagePopup, OpenContentPagePopup } from '^/store/duck/Pages';
import * as T from '^/types';
import { HasFeature, useHasFeature } from '^/utilities/withFeatureToggle';
import Text from './text';

const ALPHA: number = 0.39;

export type UploadAttachmentTypes =
  | T.AttachmentType.PHOTO
  | T.AttachmentType.BLUEPRINT_PDF
  | T.AttachmentType.DESIGN_DXF
  | T.AttachmentType.DSM
  | T.AttachmentType.SOURCE
  | T.AttachmentType.ORTHO
  | T.AttachmentType.POINTCLOUD;

const DATA_ATTACHMENT_TYPES: Array<UploadAttachmentTypes> = [
  T.AttachmentType.SOURCE,
  T.AttachmentType.BLUEPRINT_PDF,
  T.AttachmentType.DESIGN_DXF,
  T.AttachmentType.ORTHO,
  T.AttachmentType.DSM,
  T.AttachmentType.POINTCLOUD,
];

const ATTACHMENT_UPLOAD_POPUP_MAP: { [K in Exclude<UploadAttachmentTypes, T.AttachmentType.SOURCE>]: T.ContentPagePopupType } = {
  [T.AttachmentType.PHOTO]: T.ContentPagePopupType.PHOTO_UPLOAD,
  [T.AttachmentType.BLUEPRINT_PDF]: T.ContentPagePopupType.BLUEPRINT_UPLOAD,
  [T.AttachmentType.DESIGN_DXF]: T.ContentPagePopupType.DESIGN_UPLOAD,
  [T.AttachmentType.ORTHO]: T.ContentPagePopupType.ORTHO_UPLOAD,
  [T.AttachmentType.DSM]: T.ContentPagePopupType.DSM_UPLOAD,
  [T.AttachmentType.POINTCLOUD]: T.ContentPagePopupType.LAS_UPLOAD,
};


const Root = styled.ul({
  display: 'flex',
  flexDirection: 'column',
  width: '410px',
  maxHeight: '540px',
  overflowY: 'auto',
  padding: '0 50px 50px',
  '> li + li': { marginTop: '8px' },
});

const UploadItem = styled.li({
  position: 'relative',

  display: 'flex',
  alignItems: 'center',

  width: '100%',

  padding: '28px 76.4px',

  boxSizing: 'border-box',
  cursor: 'pointer',
  backgroundColor: palette.UploadPopup.itemBackgroundGray.toString(),
  borderRadius: '9px',

  ':hover': {
    backgroundColor: palette.UploadPopup.hoverGray.toString(),
  },
});

const IconWrapper = styled.div({
  position: 'absolute',
  left: '28px',
});

const OverlayIcon = styled(OverlaySvg)({
  path: {
    fill: 'var(--color-theme-primary)',
  },
});

const TitleWrapper = styled.div({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  marginBottom: '7px',
});

const Title = styled.h2({
  display: 'inline',
  whiteSpace: 'nowrap',
  fontSize: '15px',
  fontWeight: 'bold',
  color: dsPalette.title.toString(),
});

const TitleDivider = styled.span({
  width: '1px',
  height: '16px',

  color: palette.UploadPopup.divider.toString(),

  marginLeft: '12px',
  marginRight: '12px',
});


const FileExtension = styled.span({
  display: 'inline',

  fontSize: '13px',
  fontWeight: 'normal',
  whiteSpace: 'nowrap',
  color: dsPalette.title.toString(),
});

const Description = styled.span({
  display: 'block',
  fontSize: '12px',
  lineHeight: '18px',
  fontWeight: 'normal',
  color: dsPalette.title.toString(),
  wordBreak: 'keep-all',
});

const ArrowIcon = styled(ArrowSvg)({
  position: 'absolute',
  right: '28px',
});

const SVGWrapper = styled.svg``;

const AttachmentHeader = styled.div<{ isSticky: boolean }>(({ isSticky }) => ({
  zIndex: 10,
  position: isSticky ? 'sticky' : 'relative',
  backgroundColor: palette.white.toString(),
  top: isSticky ? '0' : 'auto',
  lineHeight: '22px',
  fontSize: '15px',
  padding: '0 0 9px 0',
  paddingTop: isSticky ? '15px' : '9px',
  color: dsPalette.typePrimary.toString(),
}));
AttachmentHeader.displayName = 'AttachmentHeader';


type AttachmentIconMap = { [K in UploadAttachmentTypes]: ReactNode};

const attachmentIconMap: AttachmentIconMap = {
  [T.AttachmentType.PHOTO]: <SVGWrapper width='24px' height='18px'><PhotoSvg /></SVGWrapper>,
  [T.AttachmentType.SOURCE]: <SVGWrapper width='24px' height='18px'><SourcePhotoSvg /></SVGWrapper>,
  [T.AttachmentType.BLUEPRINT_PDF]: <SVGWrapper width='26px' height='26px'><OverlayIcon /></SVGWrapper>,
  [T.AttachmentType.DESIGN_DXF]: <SVGWrapper width='28px' height='28px'><DesignSvg /></SVGWrapper>,
  [T.AttachmentType.ORTHO]: <SVGWrapper width='22px' height='22px'><OrthoPhotoSvg /></SVGWrapper>,
  [T.AttachmentType.DSM]: <SVGWrapper width='26px' height='26px'><DsmSvg /></SVGWrapper>,
  [T.AttachmentType.POINTCLOUD]: <SVGWrapper width='28px' height='28px'><PointCloudSvg /></SVGWrapper>,
};

export interface Props {
  readonly zIndex: number;
}

const ContentUploadPopup: FC<Props> = memo(({ zIndex }) => {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();
  const hasFeature: HasFeature = useHasFeature();

  const contentListRef: MutableRefObject<HTMLUListElement | null> = useRef(null);
  const isOnPhotoTab: boolean = useSelector((s: T.State) => s.Pages.Contents.sidebarTab === T.ContentPageTabType.PHOTO);

  const handleClose: () => void = useCallback(() => {
    dispatch(CloseContentPagePopup());
  }, []);

  const handleClick: (attachmentType: UploadAttachmentTypes) => void = useCallback((type) => {
    if (type === T.AttachmentType.SOURCE) {
      dispatch(ChangeIsInSourcePhotoUpload({
        isInSourcePhotoUpload: true,
      }));

      handleClose();

      return;
    }

    dispatch(OpenContentPagePopup({
      popup: ATTACHMENT_UPLOAD_POPUP_MAP[type],
    }));
  }, [handleClose]);

  const typeToItem: (
    attachmentType: UploadAttachmentTypes, index: number,
  ) => ReactNode = useCallback((
    attachmentType, index,
  ) => {
    const icon: ReactNode = attachmentIconMap[attachmentType];

    const handleItemClick: () => void = () => {
      handleClick(attachmentType);
    };

    return (
      <UploadItem
        key={index}
        onClick={handleItemClick}
        data-ddm-track-action='content-upload'
        data-ddm-track-label={`btn-upload-overlay-${attachmentType}`}
      >
        <IconWrapper>{icon}</IconWrapper>
        <div>
          <TitleWrapper>
            <Title>{l10n(Text[attachmentType].title)}</Title>
            <TitleDivider>|</TitleDivider>
            <FileExtension>{Text[attachmentType].extension.join(' ')}</FileExtension>
          </TitleWrapper>
          <Description>
            <BreakLineText>{l10n(Text[attachmentType].description)}</BreakLineText>
          </Description>
        </div>
        <ArrowIcon />
      </UploadItem>
    );
  }, [l10n, handleClick]);

  const dataAttachmentItems: ReactNode = useMemo(() => hasFeature(T.Feature.DDM)
    ? DATA_ATTACHMENT_TYPES.map(typeToItem)
    : [typeToItem(T.AttachmentType.SOURCE, 0)], [DATA_ATTACHMENT_TYPES, typeToItem]);

  const photoAttachmentItem: ReactNode = useMemo(() => {
    if (hasFeature(T.Feature.DDM)) {
      return typeToItem(T.AttachmentType.PHOTO, DATA_ATTACHMENT_TYPES.length);
    }
    return null;
  }, [typeToItem, T.AttachmentType]);

  useEffect(() => {
    if (isOnPhotoTab && contentListRef.current) {
      contentListRef.current.scroll(0, contentListRef.current.scrollHeight);
    }
  }, [isOnPhotoTab, contentListRef]);

  return (
    <Popup
      title={l10n(Text.title)}
      alpha={ALPHA}
      zIndex={zIndex}
      hasBlur={true}
      onCloseClick={handleClose}
    >
      <Root ref={contentListRef}>
        {dataAttachmentItems}
        {photoAttachmentItem}
      </Root>
    </Popup>
  );
});

export default ContentUploadPopup;
