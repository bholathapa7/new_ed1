import React, { FC, ReactNode, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import styled, { CSSObject } from 'styled-components';

import ExclamationMarkSvg from '^/assets/icons/exclamation-mark.svg';
import QuestionMarkSvg from '^/assets/icons/question-mark.svg';
import { SubmitButton } from '^/components/atoms/Buttons';
import { ContentsListItem, HorizontalDivider } from '^/components/atoms/ContentsListItem';
import SingleSlider from '^/components/atoms/SingleSlider';
import WrapperHoverable, {
  Props as WrapperHoverableProps,
} from '^/components/atoms/WrapperHoverable';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { DISABLED_CONTENT_OPACITY, FontFamily } from '^/constants/styles';
import tutorial from '^/constants/tutorial';
import { UseGoToZendesk, UseL10n, isCADContent, useGoToZendesk, useL10n } from '^/hooks';
import { PatchContent, UpdateContentConfig, contentsSelector } from '^/store/duck/Contents';
import {
  ChangeAligningBlueprintContent,
  ChangeIsTopBarShown,
  ChangeSidebarStatus,
  OpenContentPagePopup,
} from '^/store/duck/Pages';
import * as T from '^/types';
import { isPhone } from '^/utilities/device';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import { Fallback } from './fallback';
import Text from './text';

interface DisabledProp {
  isDisabled: boolean;
}


const Opacity = styled.div({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'flex-start',
  marginTop: '13px',
});

const OpacityText = styled.div<DisabledProp>(({ isDisabled }) => ({
  opacity: isDisabled ? DISABLED_CONTENT_OPACITY : 1,
  width: '48.5px',

  marginBottom: '13px',

  color: 'var(--color-theme-primary)',
  fontFamily: FontFamily.ROBOTO,
  fontSize: '15px',
  fontWeight: 500,
}));

const GoToPinSettingButtonWrapper = styled.div({
  width: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: '13px',

  /**
   * @desc For simple div wrapper
   */
  '> div': {
    width: '100%',
  },
});

const GoToPinSettingButton = styled.div<DisabledProp>(({ isDisabled }) => ({
  opacity: isDisabled ? DISABLED_CONTENT_OPACITY : 1,
  width: '100%',
  height: '33px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '&:hover': {
    background: palette.ContentsList.hoverGray.toString(),
  },

  borderColor: 'var(--color-theme-primary-lightest)',
  borderRadius: '6px',

  color: dsPalette.title.toString(),
  background: palette.ContentsList.itemBackgroundGray.toString(),

  cursor: isDisabled ? 'default' : 'pointer',
  userSelect: isDisabled ? 'none' : 'auto',
}));

const GoToPinSettingText = styled.div({
  fontSize: '11px',

  paddingLeft: '10.5px',
  // eslint-disable-next-line no-magic-numbers
  color: palette.font.alpha(0.84).toString(),
});

const TooltipWrapperStyle: CSSObject = {
  position: 'relative',
  marginTop: '3.43px',
  marginLeft: '9.5px',
  marginRight: '10.5px',
};

const TooltipInfoStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: TooltipWrapperStyle,
  tooltipBackgroundStyle: {
    width: '225px',
    height: '60px',
    borderRadius: '6px',

  },
  tooltipBalloonStyle: {
    top: '22px',
    left: 'auto',
    right: '-45px',

    paddingLeft: '15px',
    paddingRight: '15px',
    paddingTop: '12px',
    paddingBottom: '10px',

  },
  tooltipArrowStyle: {
    marginTop: '4px',

    top: '-10px',
    left: 'auto',
    right: '58px',
  },

  tooltipTextTitleStyle: {
    width: '195px',
    height: '38px',

    lineHeight: '1.58',

    fontSize: '12px',
    fontWeight: 'normal',

    whiteSpace: 'normal',

    wordBreak: 'break-all',
  },
};

const ErrorWrapper = styled.div({
  marginTop: '15px',
  paddingTop: '20px',
  borderTop: '1px solid #e6e6e6',
});

const DescriptionWrapper = styled.p({
  display: 'flex',
});

const Description = styled.p({
  fontSize: '11px',
  lineHeight: '16px',
  marginBottom: '15px',
  wordBreak: 'keep-all',
  color: dsPalette.typePrimary.toString(),
});

const SvgWrapper = styled.div({
  width: '13px',
  height: '13px',
  marginRight: '3px',
});

const Button = styled(SubmitButton)({
  width: '100%',
  fontSize: '12px',
});


const MAX_OPACITY: number = 100;

export interface Props {
  readonly content: T.OverLayContent;
}

const RawContentsListBlueprintItem: FC<Props> = ({ content }) => {
  const [l10n]: UseL10n = useL10n();
  const dispatch: Dispatch = useDispatch();
  const goToZendesk: UseGoToZendesk = useGoToZendesk();
  const contentId: number = content.id;

  const opacity: number = content.config?.opacity !== undefined ? content.config.opacity : MAX_OPACITY;
  const isBlueprintPDF: boolean = content.type === T.ContentType.BLUEPRINT_PDF;

  const isProcessingOrFailed: boolean = contentsSelector.isProcessingOrFailedByContent(content);
  const isFailed: boolean = content.status === T.ContentProcessingStatus.FAILED;

  const handleOpacityChange: (opacity: number) => void = (opacityValue) => {
    dispatch(UpdateContentConfig({
      contentId,
      config: {
        ...content.config,
        type: content.type,
        opacity: opacityValue,
      },
    }));
  };

  const handleOpacityMouseUp: () => void = () => {
    dispatch(PatchContent({
      content: {
        id: contentId,
        config: {
          opacity: content.config?.opacity,
        },
      },
    }));
  };

  const handleDetailButtonClick: () => void = useCallback(() => {
    goToZendesk(tutorial.cadError);
  }, [goToZendesk]);

  const handleOnClick: () => void = () => {
    if (isProcessingOrFailed) return;

    dispatch(ChangeSidebarStatus({ open: false }));
    dispatch(ChangeIsTopBarShown({ isOpened: false }));
    dispatch(ChangeAligningBlueprintContent({ aligningBlueprintId: contentId }));
    dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.BLUEPRINT_ALIGN }));
  };

  const pinSettingDescription: ReactNode = (
    <WrapperHoverable
      title={l10n(Text.description)}
      customStyle={TooltipInfoStyle}
    >
      <QuestionMarkSvg />
    </WrapperHoverable>
  );
  const pinSettingButton: ReactNode = (
    <GoToPinSettingButton
      className={CANCELLABLE_CLASS_NAME}
      onClick={handleOnClick}
      isDisabled={isProcessingOrFailed}
    >
      <GoToPinSettingText>
        {l10n(Text.title)}
      </GoToPinSettingText>
      {pinSettingDescription}
    </GoToPinSettingButton>
  );

  const pinSetting: ReactNode = (isPhone() || !isBlueprintPDF) ?
    undefined : (
      <>
        <HorizontalDivider isDisabled={isProcessingOrFailed} />
        <GoToPinSettingButtonWrapper>
          {pinSettingButton}
        </GoToPinSettingButtonWrapper>
      </>
    );

  const opacitySetting: ReactNode =
    (content.type === T.ContentType.DESIGN_DXF || isFailed) ?
      null : (
        <Opacity>
          <OpacityText isDisabled={isProcessingOrFailed}>
            {opacity.toFixed(0)}%
          </OpacityText>
          <SingleSlider
            minValue={0}
            maxValue={MAX_OPACITY}
            value={opacity}
            isDisabled={isProcessingOrFailed}
            onChange={handleOpacityChange}
            onMouseUp={handleOpacityMouseUp}
          />
        </Opacity>
      );

  const ErrorInfo: ReactNode =
    (isFailed && isCADContent(content) && content.info.error) ? (
      <ErrorWrapper>
        <DescriptionWrapper>
          <SvgWrapper>
            <ExclamationMarkSvg />
          </SvgWrapper>
          <Description>
            {l10n(content.info.error?.message)}
          </Description>
        </DescriptionWrapper>
        <Button onClick={handleDetailButtonClick}>
          {l10n(Text.errorDetail)}
        </Button>
      </ErrorWrapper>
    ) : null;

  const firstBalloonTitle: string = (() => {
    if (content.type === T.ContentType.DESIGN_DXF) return l10n(Text.designDXF);
    if (isFailed && isCADContent(content)) return l10n(Text.error);

    return l10n(Text.firstBalloonTitle);
  })();

  return (
    <ContentsListItem
      content={content}
      firstBalloonTitle={firstBalloonTitle}
    >
      {opacitySetting}
      {pinSetting}
      {ErrorInfo}
    </ContentsListItem >
  );
};

export const ContentsListBlueprintItem: FC<Props> = withErrorBoundary(RawContentsListBlueprintItem)(Fallback);
