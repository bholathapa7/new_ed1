import Color from 'color';
import React, { FC, ChangeEvent, ReactNode, useCallback, useMemo, useRef, useState, MutableRefObject, MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { CancelButton, ConfirmButton } from '^/components/atoms/Buttons';
import { DDMInput } from '^/components/atoms/DDMInput';
import { GrayBlueCheckbox as Checkbox } from '^/components/atoms/GrayBlueCheckbox';
import Popup from '^/components/molecules/Popup';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { UseL10n, UseLastSelectedScreen, UseState, useL10n, useLastSelectedScreen } from '^/hooks';
import { RunPrintMap } from '^/store/duck/Contents';
import { CloseContentPagePopup } from '^/store/duck/Pages';
import * as T from '^/types';
import { ApplyOptionIfKorean, GetCommonFormat, formatWithOffset } from '^/utilities/date-format';
import Text from './text';

export enum ImageSize {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

// Please see DFE-1150 for the logic of this.
const ImageSizesList: Record<ImageSize, T.PrintSize[]> = {
  [ImageSize.Low]: [T.PrintSize.A4],
  [ImageSize.Medium]: [T.PrintSize.A3, T.PrintSize.A2],
  [ImageSize.High]: [T.PrintSize.A1, T.PrintSize.A0],
};

const ImageSizesLabel: Record<ImageSize, Record<T.Language, string>> = {
  [ImageSize.Low]: Text.imageLow,
  [ImageSize.Medium]: Text.imageMedium,
  [ImageSize.High]: Text.imageHigh,
};


const Root = styled.div({
  padding: '50px',
  paddingTop: '12px',
});

const FileInputWrapper = styled.div({
  paddingBottom: '23px',
});

const FileSizesCheckboxWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

const FileSizesCheckboxRow = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '6px',
});

const FileSizesCheckboxLabel = styled.span(({ color }) => ({
  fontSize: '13px',
  fontWeight: 500,
  color,
  cursor: 'pointer',
}));

const FileSizesCheckboxSvgWrapper = styled.div(({ color }) => ({
  marginBottom: '8px',
  marginRight: '5px',
  height: '16px',
  ' svg path': {
    fill: color,
  },
}));

const FileSizesExtension = styled.div({
  fontSize: '11px',
  fontWeight: 500,
  color: dsPalette.title.toString(),
  marginTop: '12px',
});

const SectionTitleWrapper = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  width: '100%',
  margin: '16px 0',
});

const SectionTitle = styled.div({
  color: dsPalette.title.toString(),
  fontSize: '14px',
  fontWeight: 'bold',
});

const ErrorMsg = styled.p({
  marginTop: '3px',
  marginBottom: '5px',

  color: palette.error.toString(),
  fontSize: '11px',
  fontWeight: 500,
});

const FileInput = styled(DDMInput)({
  width: '310px',
  height: '37px',
  display: 'flex',
  alignItems: 'center',
  color: 'var(--color-theme-primary)',
});

const ButtonWrapper = styled.div({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',

  width: '100%',
  marginTop: '35px',
});


const BG_ALPHA: number = 0.45;
const SIZE_OPTIONS: T.PrintSize[] = Object.values(T.PrintSize);

export interface Props {
  readonly zIndex: number;
}

const PrintPopup: FC<Props> = ({
  zIndex,
}) => {
  const dispatch: Dispatch = useDispatch();
  const timezoneOffset: number = useSelector((s: T.State) => s.Pages.Common.timezoneOffset);
  const printMapStatus: T.ContentsState['printMapStatus'] = useSelector((s: T.State) => s.Contents.printMapStatus);
  const [l10n, lang]: UseL10n = useL10n();

  const fileInputRef: MutableRefObject<HTMLInputElement | null> = useRef(null);
  const [sizes, setSizes]: UseState<ImageSize[]> = useState([]);
  const [hasNoSizeError, setHasNoSizeError]: UseState<boolean> = useState(false);
  const [customTitle, setCustomTitle]: UseState<string> = useState('');
  const lastSelectedScreen: UseLastSelectedScreen = useLastSelectedScreen();
  const hasNoSizes: boolean = sizes.length === 0;
  const isSubmitButtonDisabled: boolean = printMapStatus === T.APIStatus.PROGRESS;
  const defaultTitle: string = lastSelectedScreen === undefined ? '' : formatWithOffset(
    timezoneOffset,
    lastSelectedScreen.appearAt,
    GetCommonFormat({ lang, hasDay: true }),
    ApplyOptionIfKorean(lang),
  ) + (lastSelectedScreen.title ? ` ${lastSelectedScreen.title}` : '');

  const handleSubmit: (e: MouseEvent<HTMLButtonElement>) => void = useCallback((e) => {
    if (isSubmitButtonDisabled) return;

    e.preventDefault();

    const fileSizes: T.PrintSize[] = sizes.reduce<T.PrintSize[]>((t, n) => t.concat(ImageSizesList[n]), []);

    const printFormatsAndSizes: T.PrintFormatsAndSizes = fileSizes.map((size) => ({
      size,
      // For now, the format will always be JPG. See DFE-1150.
      format: T.PrintFormat.JPG,
    }));

    dispatch(RunPrintMap({
      title: customTitle || defaultTitle,
      printFiles: printFormatsAndSizes,
    }));
  }, [isSubmitButtonDisabled, sizes, customTitle, defaultTitle]);

  const onClose: () => void = () => {
    dispatch(CloseContentPagePopup());
  };

  const onClickFileSize: (value: ImageSize, isChecked: boolean) => () => void = useCallback((value, isChecked) => () => {
    if (isChecked) {
      setSizes((prevSizes) => prevSizes.filter((size) => size !== value));
    } else {
      setSizes((prevSizes) => [...prevSizes, value]);
      setHasNoSizeError(false);
    }
  }, []);

  const onClickNoSize: () => void = useCallback(() => {
    setHasNoSizeError(true);
  }, []);

  const onFocusFileInput: () => void = useCallback(() => {
    if (customTitle === '') {
      setCustomTitle(defaultTitle);
    }

    // This rAF is needed because
    // it needs to wait until the input has a value
    // only then select the text.
    window.requestAnimationFrame(() => {
      fileInputRef.current?.select();
    });
  }, [customTitle, defaultTitle]);

  const onInputFileInput: (e: ChangeEvent<HTMLInputElement>) => void = useCallback(({ target: { value } }) => {
    setCustomTitle(value);
  }, [customTitle]);

  const sizeOptions: ReactNode = useMemo(() => {
    const textColor: Color = hasNoSizeError ? palette.error : palette.font;
    const svgColor: string | undefined = hasNoSizeError ? palette.error.toString() : undefined;

    return Object.values(ImageSize).map((value) => (
      <FileSizesCheckboxRow key={value}>
        <FileSizesCheckboxSvgWrapper color={svgColor}>
          <Checkbox
            isChecked={sizes.includes(value)}
            onClick={onClickFileSize(value, sizes.includes(value))}
          />
        </FileSizesCheckboxSvgWrapper>
        <FileSizesCheckboxLabel
          color={textColor.toString()}
          onClick={onClickFileSize(value, sizes.includes(value))}
        >
          {l10n(ImageSizesLabel[value])}
        </FileSizesCheckboxLabel>
      </FileSizesCheckboxRow>
    ));
  }, [hasNoSizeError, sizes, onClickFileSize, SIZE_OPTIONS]);

  const errorMessage: ReactNode = useMemo(() => hasNoSizeError ? <ErrorMsg>{l10n(Text.error)}</ErrorMsg> : undefined, [hasNoSizeError]);

  const submitButton: ReactNode = useMemo(() => hasNoSizes
    ? <CancelButton onClick={onClickNoSize}>{l10n(Text.submit)}</CancelButton>
    : <ConfirmButton onClick={handleSubmit} isDisabled={isSubmitButtonDisabled}>{l10n(Text.submit)}</ConfirmButton>
  , [hasNoSizes, onClickNoSize, handleSubmit]);

  return (
    <Popup
      title={l10n(Text.title)}
      alpha={BG_ALPHA}
      zIndex={zIndex}
      onCloseClick={onClose}
    >
      <Root>
        <FileInputWrapper>
          <SectionTitleWrapper>
            <SectionTitle>
              {l10n(Text.labelTitle)}
            </SectionTitle>
          </SectionTitleWrapper>
          <FileInput
            ref={fileInputRef}
            type='text'
            placeholder={defaultTitle}
            value={customTitle}
            onInput={onInputFileInput}
            onFocus={onFocusFileInput}
          />
          <FileSizesExtension>
            {l10n(Text.supportedFileFormats)}
          </FileSizesExtension>
        </FileInputWrapper>
        <SectionTitleWrapper>
          <SectionTitle>
            {l10n(Text.imageSizes)}
          </SectionTitle>
        </SectionTitleWrapper>
        <FileSizesCheckboxWrapper>
          {sizeOptions}
        </FileSizesCheckboxWrapper>
        {errorMessage}
        <ButtonWrapper>
          {submitButton}
        </ButtonWrapper>
      </Root>
    </Popup>
  );
};

export default PrintPopup;
