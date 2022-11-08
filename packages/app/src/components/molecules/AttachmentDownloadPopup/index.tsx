import Sentry from '@sentry/browser';
import Color from 'color';
import * as _ from 'lodash-es';
import React, { ReactNode, MouseEvent, FC, useEffect, useState } from 'react';
import { Observable, merge } from 'rxjs';
import { AjaxRequest, ajax } from 'rxjs/ajax';
import { catchError, map } from 'rxjs/operators';
import styled from 'styled-components';

import DownloadGrayActivatedSvg from '^/assets/icons/download-gray-activated.svg';
import DownloadGrayDeactivatedSvg from '^/assets/icons/download-gray-deactivated.svg';
import AttachmentDownloadButton from '^/components/atoms/AttachmentDownloadButton';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import Popup from '^/components/molecules/Popup';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { _getScreenOfId } from '^/hooks/screens';
import { AuthHeader, makeV2APIURL } from '^/store/duck/API';
import * as T from '^/types';
import download from '^/utilities/download';
import { l10n } from '^/utilities/l10n';
import { DateScreenInput } from '../DateScreenInput';
import Text from './text';

const DOWNLOAD_NOT_AVAILABLE_OPACITY: number = 0.4;
/* eslint-disable max-lines */
const PopupContent = styled.section({
  width: '310px',

  padding: '50px',
  paddingTop: '22px',
});

const Header = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  marginBottom: '15px',
});

const HeaderText = styled.div({
  fontSize: '15px',
  color: dsPalette.title.toString(),
});

const Detail = styled.section({
  display: 'flex',
  flexWrap: 'wrap',
});

const DownloadButtonList = styled.div({
  flexBasis: 0,
  flexGrow: 1,
  maxHeight: '440px',
  overflowY: 'auto',
});

const Notice = styled.span({
  display: 'block',

  marginTop: '25px',

  fontSize: '12px',
  lineHeight: 1.5,
  color: dsPalette.title.toString(),
});

const AttachmentDownloadWrapper = styled.div({
  marginBottom: '10px',

  backgroundColor: palette.DownloadPopup.itemBackgroundGray.toString(),
  borderRadius: '9px',
});

const ContentWrapper = styled.button({
  display: 'inline-block',

  marginBottom: '15px',

  borderRadius: '9px',
  cursor: 'pointer',

  backgroundColor: palette.DownloadPopup.itemBackgroundGray.toString(),

  width: '100%',
  padding: '0 17px',
  paddingRight: '16px',

  textAlign: 'left',
});

const LeftContent = styled.span<{ isDownloadable: boolean }>(({ isDownloadable }) => ({
  opacity: isDownloadable ? undefined : DOWNLOAD_NOT_AVAILABLE_OPACITY,
  fontSize: '15px',
  color: dsPalette.title.toString(),
}));


const RightContent = styled.span({
  float: 'right',
});

const LasDownSamplingFooter = styled.div({
  color: dsPalette.typePrimary.toString(),
  fontSize: '12px',
  padding: '0px 17px 15px 17px',
  wordBreak: 'keep-all',
  lineHeight: '17px',

  '& hr': {
    marginBottom: '15px',
    borderColor: palette.DownloadPopup.divider.toString(),
  },

  '& a': {
    color: dsPalette.themePrimary.toString(),
  },
});

const getFAClassName: (
  state: boolean,
) => string = (state) => state ? 'chevron-down' : 'chevron-left';


interface LowerElementInterface {
  resourceType: T.ResourceType;
  text: object;
  downloadMethod(): void;
}
export interface Props {
  readonly authHeader?: AuthHeader;
  readonly zIndex: number;
  readonly projectId: T.Project['id'];
  readonly timezoneOffset: T.CommonPageState['timezoneOffset'];
  readonly enabledDates: Array<Date>;
  readonly lastSelectedScreenId: T.Screen['id'];
  readonly screens: T.Screen[];
  readonly requestLasDownSamplingStatus: T.ContentsState['requestLasDownSamplingStatus'];
  readonly getContentDownloadablesStatus: T.ContentsState['getContentDownloadablesStatus'];
  readonly lasDownSamplingStatus: T.ContentsState['lasDownSamplingStatus'];
  readonly contentDownloadables: T.ContentsState['contentDownloadables'];
  onClose(): void;
  getContentDownloadables(screenId: T.Screen['id']): void;
  requestLasDownSampling(screenId: T.Screen['id']): void;
}
export interface State {
  readonly isOrthoFolded: boolean;
  readonly isPointCloudFolded: boolean;
  readonly isDSMFolded: boolean;
  readonly selectedScreenId: T.Screen['id'];
}

const getText: (type: T.ResourceType) => object = (type) => {
  switch (type) {
    case T.ResourceType.ORTHO:
    case T.ResourceType.DSM:
    case T.ResourceType.POINT_CLOUD:
      return Text.originalText;
    case T.ResourceType.ORTHO_COMPRESSED_10:
      return Text.compressedText.compressedOrtho10Text;
    case T.ResourceType.ORTHO_COMPRESSED_20:
      return Text.compressedText.compressedOrtho20Text;
    case T.ResourceType.DSM_COMPRESSED:
      return Text.compressedText.compressedDSMDefault;
    case T.ResourceType.POINT_CLOUD_COMPRESSED_100:
      return Text.compressedText.compressedPointCloud_100;
    case T.ResourceType.POINT_CLOUD_COMPRESSED_25:
      return Text.compressedText.compressedPointCloud_25;
    case T.ResourceType.POINT_CLOUD_COMPRESSED_4:
      return Text.compressedText.compressedPointCloud_4;
    default:
      return {};
  }
};

const TRACK_ACTION: string = 'map-download';
const TRACK_LABEL_PREFIX: string = 'btn-popup-download';

const ortho2Tfw: { [P in T.OrthophotoDownloadTypes]: T.OrthophotoTfwDownloadTypes } = {
  [T.ResourceType.ORTHO]: T.ResourceType.ORTHO_TFW,
  [T.ResourceType.ORTHO_COMPRESSED_10]: T.ResourceType.ORTHO_COMPRESSED_10_TFW,
  [T.ResourceType.ORTHO_COMPRESSED_20]: T.ResourceType.ORTHO_COMPRESSED_20_TFW,
};

const popupAlpha: number = 0.45;

export const executeDownload: (
  url: string, authHeader: AuthHeader, fileName: string, useXhr: boolean,
) => Observable<void | string> = (
  url, authHeader, fileName, useXhr,
) => {
  const request: AjaxRequest = {
    method: 'GET',
    headers: authHeader,
    responseType: 'text',
    url,
  };

  return ajax(request).pipe(
    map(({ response }) => download(response, false, useXhr, fileName)),
    catchError((err) => Sentry.captureException(err)),
  );
};

const AttachmentDownloadPopup: FC<Props & L10nProps> = ({
  requestLasDownSamplingStatus, language, zIndex, lasDownSamplingStatus, requestLasDownSampling,
  lastSelectedScreenId, onClose, screens, authHeader, getContentDownloadables, contentDownloadables, getContentDownloadablesStatus,
}) => {
  const [attachmentState, setAttachmentState] = useState<State>({
    selectedScreenId: lastSelectedScreenId,
    isOrthoFolded: false,
    isPointCloudFolded: false,
    isDSMFolded: false,
  });

  useEffect(() => {
    handleScreenSelect(_getScreenOfId(lastSelectedScreenId, screens));
  }, []);

  const onDownload: (type: T.ResourceType) => void = (type) => {
    if (authHeader === undefined) {
      onClose();

      return;
    }

    const { selectedScreenId }: State = attachmentState;
    const isLoading: boolean = getContentDownloadablesStatus === T.APIStatus.PROGRESS;
    const isDownloadUnavailable: boolean = !contentDownloadables[selectedScreenId]?.[type];

    if (isLoading || isDownloadUnavailable) {
      return;
    }

    const downloadParams: Array<string | number> = [
      'screens', selectedScreenId, 'downloadables',
    ];

    const downloadObservables: Array<Observable<void | string>> =
      [executeDownload(makeV2APIURL(...downloadParams, type), authHeader, type, false)];

    if (Object.keys(ortho2Tfw).includes(type)) {
      const tfwToDownload: T.OrthophotoTfwDownloadTypes =
        ortho2Tfw[type as T.OrthophotoDownloadTypes];
      downloadObservables.push(executeDownload(
        makeV2APIURL(...downloadParams, tfwToDownload), authHeader, tfwToDownload, true,
      ));
    }

    merge(...downloadObservables).subscribe();
  };

  /**
   * @fixme
   * This function use ad-hoc api request.
   * Please extract it to redux
   */

  const handleScreenSelect: (screen: T.Screen | undefined) => void = (screen) => {
    if (screen === undefined) return;
    if (authHeader === undefined) {
      onClose();

      return;
    }

    setAttachmentState({
      isOrthoFolded: false,
      isPointCloudFolded: false,
      isDSMFolded: false,
      selectedScreenId: screen.id,
    });

    getContentDownloadables(screen.id);
  };

  const onOrthoPhotoClick: () => void = () => {
    setAttachmentState({ ...attachmentState, isOrthoFolded: !attachmentState.isOrthoFolded });
  };

  const onDSMClick: () => void = () => {
    setAttachmentState({ ...attachmentState, isDSMFolded: !attachmentState.isDSMFolded });
  };

  const onPointCloudClick: () => void = () => {
    setAttachmentState({ ...attachmentState, isPointCloudFolded: !attachmentState.isPointCloudFolded });
  };

  const getButtonColor: (type: T.ResourceType, downloadableColor: Color) => Color = (type, downloadableColor) => isDownloadable(type)
    ? downloadableColor
    : palette.textLight;

  const isDownloadable: (type: T.ResourceType) => boolean = (type) => contentDownloadables[attachmentState.selectedScreenId]?.[type] ?? false;

  const appendLowerElement: (Type: T.ResourceType, lang: T.Language) => ReactNode = (Type, lang) => {
    let collections: Array<T.ResourceType> = [];
    // eslint-disable-next-line default-case
    switch (Type) {
      case T.ResourceType.ORTHO:
        collections = [
          T.ResourceType.ORTHO,
          T.ResourceType.ORTHO_COMPRESSED_10,
          T.ResourceType.ORTHO_COMPRESSED_20,
        ];
        break;
      case T.ResourceType.DSM:
        collections = [
          T.ResourceType.DSM,
          T.ResourceType.DSM_COMPRESSED,
        ];
        break;
      case T.ResourceType.POINT_CLOUD:
        collections = [
          T.ResourceType.POINT_CLOUD,
          T.ResourceType.POINT_CLOUD_COMPRESSED_100,
          T.ResourceType.POINT_CLOUD_COMPRESSED_25,
          T.ResourceType.POINT_CLOUD_COMPRESSED_4,
        ];
        break;
    }
    const lowerElements: Array<LowerElementInterface> = collections.map((type) => ({
      resourceType: type,
      text: getText(type),
      downloadMethod: _.partial(onDownload, type),
    }));

    return (
      <>
        {lowerElements.map((item) => collectionToElement(item, lang))}
      </>
    );
  };

  const collectionToElement: (item: LowerElementInterface, lang: T.Language) => ReactNode = (item, lang) => (
    <>
      <ContentWrapper
        onClick={item.downloadMethod}
        data-ddm-track-action={TRACK_ACTION}
        data-ddm-track-label={`${TRACK_LABEL_PREFIX}-${item.resourceType}`}
      >
        <LeftContent isDownloadable={isDownloadable(item.resourceType)}>
          {l10n(item.text, lang)}
        </LeftContent>
        <RightContent>
          {isDownloadable(item.resourceType) ? <DownloadGrayActivatedSvg /> : <DownloadGrayDeactivatedSvg />}
        </RightContent>
      </ContentWrapper>
    </>
  );

  const appendUpperElement: (Type: T.ResourceType) => ReactNode = (Type) => {
    let info: {
      fileExtension: string;
      iconColor: Color;
      koreanFileType: string;
      englishFileType: string;
      customIconClassName: string;
      isVisible: boolean;
      onClick(): void;
    } = {
      fileExtension: '',
      iconColor: new Color(),
      koreanFileType: '',
      englishFileType: '',
      customIconClassName: '',
      isVisible: false,
      onClick: () => undefined,
    };

    switch (Type) {
      case T.ResourceType.ORTHO:
        info = {
          fileExtension: 'TIF',
          iconColor: getButtonColor(T.ResourceType.ORTHO, palette.tifColor),
          koreanFileType: '정사영상',
          englishFileType: 'Orthophoto',
          customIconClassName: getFAClassName(attachmentState.isOrthoFolded),
          onClick: onOrthoPhotoClick,
          isVisible: attachmentState.isOrthoFolded,
        };
        break;
      case T.ResourceType.DSM:
        info = {
          fileExtension: 'TIF',
          iconColor: getButtonColor(T.ResourceType.DSM, palette.tifColor),
          koreanFileType: '수치표면모델',
          englishFileType: 'Digital Surface Model',
          customIconClassName: getFAClassName(attachmentState.isDSMFolded),
          onClick: onDSMClick,
          isVisible: attachmentState.isDSMFolded,
        };
        break;
      case T.ResourceType.POINT_CLOUD:
        info = {
          fileExtension: 'LAS',
          iconColor: getButtonColor(T.ResourceType.POINT_CLOUD, palette.lasColor),
          koreanFileType: '포인트 클라우드',
          englishFileType: '3D Point Cloud',
          customIconClassName: getFAClassName(attachmentState.isPointCloudFolded),
          onClick: onPointCloudClick,
          isVisible: attachmentState.isPointCloudFolded,
        };
        break;
      default:
        return info;
    }

    return (
      <AttachmentDownloadButton
        fileExtension={info.fileExtension}
        iconColor={info.iconColor}
        koreanFileType={info.koreanFileType}
        englishFileType={info.englishFileType}
        customIconClassName={info.customIconClassName}
        onClick={info.onClick}
        isBorderVisible={info.isVisible}
        isDownloadable={isDownloadable(Type)}
      />
    );
  };

  const onRequestLasDownSampling: (e: MouseEvent) => void = (e) => {
    e.preventDefault();

    if (requestLasDownSamplingStatus === T.APIStatus.PROGRESS) return;

    requestLasDownSampling(attachmentState.selectedScreenId);
  };


  const orthoElement: ReactNode =
    attachmentState.isOrthoFolded ? (
      <AttachmentDownloadWrapper>
        {appendUpperElement(T.ResourceType.ORTHO)}
        {appendLowerElement(T.ResourceType.ORTHO, language)}
      </AttachmentDownloadWrapper>
    ) : appendUpperElement(T.ResourceType.ORTHO);

  const dsmElement: ReactNode =
    attachmentState.isDSMFolded ? (
      <AttachmentDownloadWrapper>
        {appendUpperElement(T.ResourceType.DSM)}
        {appendLowerElement(T.ResourceType.DSM, language)}
      </AttachmentDownloadWrapper>
    ) : appendUpperElement(T.ResourceType.DSM);

  const lasDownSamplingFooter: ReactNode = (() => {
    const selectedLasDownSamplingStatus: T.LasDownSamplingStatus | undefined =
      lasDownSamplingStatus[attachmentState.selectedScreenId]?.status;

    if (!lasDownSamplingStatus || selectedLasDownSamplingStatus === T.LasDownSamplingStatus.COMPLETED) return null;

    const text: ReactNode = selectedLasDownSamplingStatus === T.LasDownSamplingStatus.PROCESSING
      ? l10n(Text.lasDownloadDone, language)
      : (
        <>
          <a href='/#' onClick={onRequestLasDownSampling}>{l10n(Text.lasDownloadClick, language)}</a>{l10n(Text.lasDownloadPrompt, language)}
        </>
      );

    return (
      <LasDownSamplingFooter>
        <hr />
        {text}
      </LasDownSamplingFooter>
    );
  })();

  const pointCloudElement: ReactNode =
    attachmentState.isPointCloudFolded ? (
      <AttachmentDownloadWrapper>
        {appendUpperElement(T.ResourceType.POINT_CLOUD)}
        {appendLowerElement(T.ResourceType.POINT_CLOUD, language)}
        {lasDownSamplingFooter}
      </AttachmentDownloadWrapper>
    ) : appendUpperElement(T.ResourceType.POINT_CLOUD);

  return (
    <Popup
      alpha={popupAlpha}
      title={l10n(Text.title, language)}
      zIndex={zIndex}
      onCloseClick={onClose}
    >
      <PopupContent>
        <Header>
          <HeaderText>
            {l10n(Text.selectMapTitle, language)}
          </HeaderText>
          <DateScreenInput
            buttonType={T.DateScreenButton.DOWNLOAD}
            screen={_getScreenOfId(attachmentState.selectedScreenId, screens)}
            placement={T.ModalPlacement.BOTTOM_RIGHT}
            onScreenChange={handleScreenSelect}
          />
        </Header>
        <Detail>
          <DownloadButtonList data-testid='attachmentdownloadpopup-download-btns'>
            <AttachmentDownloadButton
              fileExtension='ZIP'
              iconColor={getButtonColor(T.ResourceType.SOURCE, palette.zipColor)}
              koreanFileType='소스포토'
              englishFileType='Source Index'
              onClick={_.partial(onDownload, T.ResourceType.SOURCE)}
              isDownloadable={isDownloadable(T.ResourceType.SOURCE)}
              trackAction={TRACK_ACTION}
              trackLabel={`${TRACK_LABEL_PREFIX}-${T.ResourceType.SOURCE}`}
            />
            {orthoElement}
            {pointCloudElement}
            {dsmElement}
            <AttachmentDownloadButton
              fileExtension='ZIP'
              iconColor={getButtonColor(T.ResourceType.MESH, palette.zipColor)}
              koreanFileType='3D 메쉬'
              englishFileType='3D Mesh'
              onClick={_.partial(onDownload, T.ResourceType.MESH)}
              isDownloadable={isDownloadable(T.ResourceType.MESH)}
              trackAction={TRACK_ACTION}
              trackLabel={`${TRACK_LABEL_PREFIX}-${T.ResourceType.MESH}`}
            />
          </DownloadButtonList>
        </Detail>
        <Notice>
          {l10n(Text.notice, language)}
        </Notice>
      </PopupContent>
    </Popup>
  );
};
export default withL10n(AttachmentDownloadPopup);
