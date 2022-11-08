import * as _ from 'lodash-es';
import React, { FC, ReactNode, memo, useCallback, useEffect, useState } from 'react';
import isEqual from 'react-fast-compare';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { ConfirmButton as RawConfirmButton } from '^/components/atoms/Buttons';
import { AttachUploadCoordinateSystem as CoordinateSystemDropdown } from '^/components/molecules/AttachUploadCoordinateSystem';
import { AttachUploadTitleInput as TitleInput } from '^/components/molecules/AttachUploadTitleInput';
import { CadUploadConfirmPopup } from '^/components/molecules/CadUploadConfirmPopup';
import { DateScreenInput } from '^/components/molecules/DateScreenInput';
import { FileInput, TextLabel } from '^/components/molecules/FileInput';
import Popup from '^/components/molecules/Popup';
import palette from '^/constants/palette';
import { UseL10n, UseState, useL10n } from '^/hooks';
import { UseIsDefaultScreenTitle, useGetDefaultScreenTitle, useIsDefaultScreenTitle } from '^/hooks/screens';
import { UseUploadContent, useUploadContent } from '^/hooks/useUploadContent';
import { getContentOverwriteCondition } from '^/store/duck/Contents/contentOverwriteManager';
import { CloseContentPagePopup, OpenContentPagePopup } from '^/store/duck/Pages';
import * as T from '^/types';
import { changeWordsOrderOnLang } from '^/utilities/l10n';
import { TEMP_SCREEN_ID } from '^/utilities/screen-util';
import { fileExtensions, fileSignatures } from './fileInformation';
import Text from './text';


const Root = styled.div({
  width: 'auto',
  minWidth: '287px',
  paddingTop: '11px',
  paddingLeft: '50px',
  paddingRight: '50px',
  paddingBottom: '50px',
});
const Wrapper = styled.div({
  width: '100%',
  marginTop: '24px',
});
const ButtonsWrapper = styled.div({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '35px',
  '> button + button': {
    marginLeft: '9px',
  },
});
const ConfirmButton = styled(RawConfirmButton)(({ isDisabled }) => ({
  cursor: 'pointer',
  opacity: 1,

  ...(isDisabled ? ({
    backgroundColor: palette.iconDisabled.toString(),
    color: palette.buttonFontColor.toString(),
  }) : undefined),
}));

const OverwritingWarningMsg = styled.p({
  marginTop: 7,

  color: palette.UploadPopup.error.toString(),
  fontSize: '12px',
  lineHeight: 1.35,
});

const PreventClickOverlay = styled.div({
  position: 'fixed',
  width: '100%',
  height: '100%',
  left: '0',
  top: '0',
  zIndex: 9999,
});


export type UploadPagePopupTypes =
  T.ContentPagePopupType.PHOTO_UPLOAD |
  T.ContentPagePopupType.BLUEPRINT_UPLOAD |
  T.ContentPagePopupType.ORTHO_UPLOAD |
  T.ContentPagePopupType.DSM_UPLOAD |
  T.ContentPagePopupType.LAS_UPLOAD |
  T.ContentPagePopupType.DESIGN_UPLOAD;

enum UI {
  TITLE = 'TITLE',
  ATTACH = 'ATTACH',
  COORDINATE = 'COORDINATE',
  SCREEN = 'SCREEN',
}

const { TITLE, ATTACH, COORDINATE, SCREEN }: typeof UI = UI;
const { PHOTO, ORTHO, BLUEPRINT_PDF, BLUEPRINT_DXF, BLUEPRINT_DWG, DESIGN_DXF, DSM, POINTCLOUD }: typeof T.AttachmentType = T.AttachmentType;

const attachmentTypeUIMap: { [K in Exclude<T.AttachmentType, T.AttachmentType.SOURCE>]: Array<UI> } = {
  [PHOTO]: [ATTACH],
  [BLUEPRINT_PDF]: [TITLE, ATTACH],
  [BLUEPRINT_DXF]: [TITLE, ATTACH, COORDINATE],
  [BLUEPRINT_DWG]: [TITLE, ATTACH, COORDINATE],
  [DESIGN_DXF]: [TITLE, ATTACH, COORDINATE],
  [ORTHO]: [ATTACH, SCREEN],
  [DSM]: [ATTACH, SCREEN],
  [POINTCLOUD]: [ATTACH, SCREEN],
};

const isInUI: (attachmentType: Exclude<T.AttachmentType, T.AttachmentType.SOURCE>, ui: UI) => boolean = (
  attachmentType, ui,
) => attachmentTypeUIMap[attachmentType].includes(ui);

const popupAttachmentTypeMap: {
  [K in UploadPagePopupTypes]: Exclude<T.AttachmentType, T.AttachmentType.BLUEPRINT_DXF | T.AttachmentType.BLUEPRINT_DWG | T.AttachmentType.SOURCE>;
} = ({
  [T.ContentPagePopupType.PHOTO_UPLOAD]: PHOTO,
  [T.ContentPagePopupType.BLUEPRINT_UPLOAD]: BLUEPRINT_PDF,
  [T.ContentPagePopupType.DESIGN_UPLOAD]: DESIGN_DXF,
  [T.ContentPagePopupType.ORTHO_UPLOAD]: ORTHO,
  [T.ContentPagePopupType.DSM_UPLOAD]: DSM,
  [T.ContentPagePopupType.LAS_UPLOAD]: POINTCLOUD,
});

type Errors = {
  [K in (UI.TITLE | UI.ATTACH | UI.SCREEN)]: boolean;
};

const INITIAL_ERRORS: Errors = {
  [TITLE]: false,
  [ATTACH]: false,
  [SCREEN]: false,
};

export const checkSignatureFromFiles: (files: File[], attachmentType: T.AttachmentType, errorCallback: (hasError: boolean) => void) => void = (
  files, attachmentType, errorCallback,
) => {
  let fileCount: number = files.length;
  let remainFilesCount: number = files.length;
  files.forEach((file) => {
    const fileReader: FileReader = new FileReader();
    const blob: Blob = file.slice(
      0, _.max(fileSignatures[attachmentType].map((array) => array.length)),
    );
    fileReader.onloadend = () => {
      const result: string | ArrayBuffer | null = fileReader.result;
      if (result instanceof ArrayBuffer) {
        if (validateSignature(result, fileSignatures[attachmentType])) {
          remainFilesCount -= 1;
        }
      }
      fileCount -= 1;
      if (fileCount === 0) {
        errorCallback(!(remainFilesCount === 0));
      }
    };
    fileReader.readAsArrayBuffer(blob);
  });
};

const validateSignature: (
  bytes: ArrayBuffer, signatures: Array<Array<number>>,
) => boolean = (bytes, signatures) => {
  const uint8Blob: Uint8Array = new Uint8Array(bytes);

  return signatures.some((signature) =>
    isEqual(uint8Blob.slice(0, signature.length), new Uint8Array(signature)));
};

export interface Props {
  readonly zIndex: number;
  readonly popupType: UploadPagePopupTypes;
}

const POPUP_ALPHA: number = 0.39;

export const AttachUploadPopup: FC<Props> = memo(({ zIndex, popupType: rawPopupType }) => {
  const dispatch: Dispatch = useDispatch();
  const [l10n, lang]: UseL10n = useL10n();

  const {
    Contents: { contents },
    Screens: { screens },
    Photos: { uploadedPhotoCount },
  }: T.State = useSelector((state: T.State) => state);

  const uploadContent: UseUploadContent = useUploadContent();
  const isDefaultScreenTitle: UseIsDefaultScreenTitle = useIsDefaultScreenTitle();
  const defaultScreenTitle: string = useGetDefaultScreenTitle()(new Date());

  const isJustCreatedProject: boolean =
    screens.length === 1 &&
    isDefaultScreenTitle(screens[0].title) &&
    contents.allIds
      .filter((id) => contents.byId[id].screenId === screens[0].id)
      .map((id) => contents.byId[id])
      .every(({ type }) => !T.MAP_TAB_CONTENTS.includes(type));

  const [selectedScreen, setSelectedScreen]: UseState<T.Screen> = useState(isJustCreatedProject ? screens[0] : {
    id: TEMP_SCREEN_ID,
    title: defaultScreenTitle,
    contentIds: [],
    appearAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
  });

  const [attachmentType, setPopupType]: UseState<Exclude<T.AttachmentType, T.AttachmentType.SOURCE>>
    = useState<Exclude<T.AttachmentType, T.AttachmentType.SOURCE>>(popupAttachmentTypeMap[rawPopupType]);
  const [title, setTitle]: UseState<string> = useState<string>('');
  const [files, setFiles]: UseState<Array<File>> = useState<Array<File>>([]);
  const [coordinateSystem, setCoordinateSystem]: UseState<T.CoordinateSystem | undefined> = useState<T.CoordinateSystem>();
  const [errors, setErrors]: UseState<Errors> = useState<Errors>(INITIAL_ERRORS);
  const [isValidated, setIsValidated]: UseState<boolean> = useState<boolean>(false);
  const [isUploading, setIsUploading]: UseState<boolean> = useState(false);
  const [isConfirming, setIsConfirming]: UseState<boolean> = useState(false);

  const hasMoreThanOneError: boolean = Object.values(errors).some((hasError) => hasError);
  const hasNoError: boolean = Object.values(errors).every((hasError) => !hasError);
  const fileName: string = files.length ? files[0].name : '';
  const isBlueprint: boolean = attachmentType === BLUEPRINT_PDF || attachmentType === BLUEPRINT_DXF || attachmentType === BLUEPRINT_DWG;

  useEffect(() => {
    if (isBlueprint) {
      setPopupType(fileName ? (() => {
        const fileExtension: string = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

        if (BLUEPRINT_DXF.includes(fileExtension)) return BLUEPRINT_DXF;
        if (BLUEPRINT_DWG.includes(fileExtension)) return BLUEPRINT_DWG;

        return BLUEPRINT_PDF;
      })() : BLUEPRINT_PDF);
    }
  }, [fileName]);

  useEffect(() => {
    const hasErrors: Errors = {
      [TITLE]: title.trim().length < 1,
      [ATTACH]: errors[ATTACH],
      [SCREEN]: errors[SCREEN],
    };

    Object.keys(hasErrors).forEach((ui: keyof Errors) => {
      if (!isInUI(attachmentType, ui)) {
        hasErrors[ui] = false;
      }
    });
    setErrors(hasErrors);

    if (hasNoError) setIsValidated(false);
  }, [title.length]);

  useEffect(() => {
    if (files.length > 0) {
      checkSignatureFromFiles(files, attachmentType, (hasError) => {
        setErrors((prevState) => ({
          ...prevState,
          [ATTACH]: hasError,
        }));
      });
    } else {
      setErrors((prevState) => ({
        ...prevState,
        [ATTACH]: true,
      }));
    }
  }, [fileName]);

  const handleCloseClick: () => void = useCallback(() => {
    dispatch(CloseContentPagePopup());
  }, []);
  const handleBackClick: () => void = useCallback(() => {
    dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.UPLOAD }));
  }, []);
  const handlePreviousClick: () => void = useCallback(() => {
    setIsConfirming(false);
  }, []);
  const handleSubmitClick: () => Promise<void> = async () => {
    if (hasMoreThanOneError) {
      setIsValidated(true);

      return;
    }

    if (attachmentType === T.AttachmentType.PHOTO) {
      setIsUploading(true);
    }

    if (attachmentType === T.AttachmentType.BLUEPRINT_DXF || attachmentType === T.AttachmentType.BLUEPRINT_DWG) {
      setIsConfirming(true);

      return;
    }

    handleUpload();
  };

  const handleUpload: () => void = () => {
    uploadContent({
      attachmentType, title, files, coordinateSystem, screen: selectedScreen,
    });
  };

  const handleTitleChange: (str: string) => void = (str) => {
    setTitle(str);
  };
  const handleFilesChange: (files: Array<File>) => void = (changedFiles) => {
    setFiles(changedFiles);
  };

  const handleScreenChange: (screen: T.Screen) => void = (screen) => {
    setSelectedScreen(() => screen);
  };

  const handleScreenError: (hasError: boolean) => void = useCallback((hasError) => {
    setErrors((prevState) => ({
      ...prevState,
      [SCREEN]: hasError,
    }));
  }, []);

  const overwritingWarningMsg: ReactNode =
    getContentOverwriteCondition({ contents, screenId: selectedScreen.id, attachmentType }) ?
      <OverwritingWarningMsg>{l10n(Text.overwritingWarningMsg)}</OverwritingWarningMsg> :
      null;

  const uiComponentMap: { [K in UI]: ReactNode } = {
    [TITLE]:
      <TitleInput
        title={title}
        hasError={isValidated && errors[TITLE]}
        setTitle={handleTitleChange}
      />,
    [ATTACH]:
      <FileInput
        hasError={isValidated && errors[ATTACH]}
        hasMultipleFiles={[PHOTO].includes(attachmentType)}
        extensions={fileExtensions[attachmentType]}
        files={files}
        setFiles={handleFilesChange}
      />,
    [COORDINATE]:
      <CoordinateSystemDropdown
        coordinateSystem={coordinateSystem}
        setCoordinateSystem={setCoordinateSystem}
      />,
    [SCREEN]: (
      <>
        <TextLabel>{l10n(Text.datasetDateAndName)}</TextLabel>
        <DateScreenInput
          buttonType={T.DateScreenButton.MAP_CONTENTS_UPLOAD}
          screen={selectedScreen}
          placement={T.ModalPlacement.MIDDLE_RIGHT}
          hasError={errors[SCREEN]}
          onScreenChange={handleScreenChange}
          onError={handleScreenError}
        />
        {overwritingWarningMsg}
      </>
    ),
  };

  const popupTypeUI: ReactNode = attachmentTypeUIMap[attachmentType].map((ui, index) => (
    <Wrapper key={index}>
      {uiComponentMap[ui]}
    </Wrapper>
  ));

  const submitButtonText: string = (() => {
    if (isUploading) return l10n(Text.photoUploadingText);
    if (attachmentType === T.AttachmentType.BLUEPRINT_DXF || attachmentType === T.AttachmentType.BLUEPRINT_DWG) return l10n(Text.next);

    return l10n(Text.upload);
  })();

  const photoUploadProgressText: string | null = isUploading ? `${uploadedPhotoCount}/${files.length}` : null;

  if (isConfirming) {
    return (
      <CadUploadConfirmPopup
        zIndex={zIndex}
        onPreviousClick={handlePreviousClick}
        onSubmitClick={handleUpload}
        onCloseClick={handleCloseClick}
      />
    );
  }

  return (
    <Popup
      zIndex={zIndex}
      alpha={POPUP_ALPHA}
      hasBlur={true}
      title={changeWordsOrderOnLang(l10n(Text.content[attachmentType]), l10n(Text.upload), lang)}
      onPreviousClick={handleBackClick}
      onCloseClick={handleCloseClick}
    >
      <Root>
        {isUploading ? <PreventClickOverlay /> : null}
        {popupTypeUI}
        <ButtonsWrapper>
          <ConfirmButton
            isDisabled={hasMoreThanOneError || isUploading}
            onClick={handleSubmitClick}
          >
            {submitButtonText}
            {photoUploadProgressText}
          </ConfirmButton>
        </ButtonsWrapper>
      </Root>
    </Popup>
  );
});
