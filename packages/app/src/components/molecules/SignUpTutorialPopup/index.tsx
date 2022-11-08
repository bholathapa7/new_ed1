
import React, { FC, memo, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import FileIcon from '^/assets/icons/file.svg';
import AngelswingWithMonitor from '^/assets/icons/popup/angelswing-with-monitor.png';
import { ConfirmButton } from '^/components/atoms/Buttons';
import { CloseButton, Props as CloseButtonProps } from '^/components/atoms/CloseButton';
import { GrayBlueCheckbox as Checkbox } from '^/components/atoms/GrayBlueCheckbox';
import Modal from '^/components/atoms/Modal';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { MediaQuery } from '^/constants/styles';
import { UseL10n, UseState, useL10n } from '^/hooks';
import { useAuthedUser } from '^/hooks/useAuthedUser';
import { makeV2APIURL } from '^/store/duck/API';
import { HideSignUpTutorialPopup } from '^/store/duck/Pages';
import * as T from '^/types';
import download from '^/utilities/download';
import Text, { TEXT_NAME_PRESET, TEXT_ORGANIZATION_PRESET } from './text';
import { ESSPlanConfig } from '^/store/duck/PlanConfig';
import route from '^/constants/routes';

const ALPHA: number = 0.39;


const Root = styled.div({
  display: 'flex',

  [MediaQuery.TABLET]: {
    flexDirection: 'column',
  },

  [MediaQuery.MOBILE_L]: {
    width: '95vw',
  },
});

const ImageWrapper = styled.div({
  backgroundColor: palette.dropdown.dividerColor.toString(),

  borderTopLeftRadius: '5px',
  borderBottomLeftRadius: '5px',

  textAlign: 'center',

  [MediaQuery.TABLET]: {
    borderTopRightRadius: '2px',
    borderBottomLeftRadius: 0,
  },
});

const Image = styled.img.attrs({
  src: AngelswingWithMonitor,
})({
  width: '330px',
  height: '360px',

  [MediaQuery.TABLET]: {
    width: '45%',
    height: 'auto',
  },

  [MediaQuery.MOBILE_L]: {
    width: '50%',
  },
});

const Body = styled.section({
  position: 'relative',

  padding: '42px 70px 57px',
  backgroundColor: palette.white.toString(),
  borderTopRightRadius: '5px',
  borderBottomRightRadius: '5px',

  display: 'flex',
  flexDirection: 'column',

  [MediaQuery.TABLET]: {
    padding: '20px 35px 26px',

    borderTopRightRadius: 0,
    borderBottomLeftRadius: '2px',
    borderBottomRightRadius: '2px',
  },

  [MediaQuery.MOBILE_L]: {
    padding: '22px 30px 15px',
  },
});

const Title = styled.p({
  width: '340px',
  height: '52px',
  marginBottom: '21px',

  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  fontSize: '20px',
  fontWeight: 500,
  lineHeight: 1.35,
  color: dsPalette.title.toString(),
  wordBreak: 'keep-all',

  [MediaQuery.TABLET]: {
    height: '50px',

    marginBottom: '15px',

    fontSize: '18px',
    lineHeight: 1.5,
  },

  [MediaQuery.MOBILE_L]: {
    width: '100%',
    height: '37px',

    marginBottom: '12px',

    fontSize: '15px',
    lineHeight: 1.33,
  },
});

const DescriptionWrapper = styled.div({
  lineHeight: 1.5,
  color: dsPalette.title.toString(),
});

const Description = styled.p<{ hasColor?: boolean }>(({ hasColor }) => ({
  fontSize: '16px',
  color: hasColor ? 'var(--color-theme-primary-lighter)' : undefined,
  fontWeight: hasColor ? 'bold' : undefined,

  [MediaQuery.TABLET]: {
    fontSize: '15px',
  },

  [MediaQuery.MOBILE_L]: {
    fontSize: '12px',
  },
}));

const ButtonWrapper = styled.div({
  marginTop: '51px',

  [MediaQuery.TABLET]: {
    marginTop: '29px',
  },

  [MediaQuery.MOBILE_L]: {
    marginTop: '18px',
  },
});

const DownloadButton = styled(ConfirmButton)({
  width: '255px',
  height: '47px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  [MediaQuery.TABLET]: {
    width: '100%',
    height: '42px',

    '> svg': {
      transform: 'scale(0.9)',
    },
  },

  [MediaQuery.MOBILE_L]: {
    height: '35px',

    '> svg': {
      transform: 'scale(0.7)',
    },
  },
});

const DownloadButtonText = styled.span({
  fontSize: '13px',
  fontWeight: 'bold',

  marginLeft: '10px',

  [MediaQuery.MOBILE_L]: {
    fontSize: '11px',

    marginLeft: '6px',
  },
});

const CheckboxWrapper = styled.div({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  marginTop: '25px',

  [MediaQuery.TABLET]: {
    marginTop: '24px',
  },
  [MediaQuery.MOBILE_L]: {
    marginTop: '15px',
  },
});

const CheckboxText = styled.span({
  paddingLeft: '10px',

  fontSize: '14px',
  color: dsPalette.title.toString(),

  cursor: 'pointer',
  userSelect: 'none',

  [MediaQuery.TABLET]: {
    fontSize: '12px',
  },
  [MediaQuery.MOBILE_L]: {
    fontSize: '10px',
  },
});

const MobileCloseButton = styled.button({
  display: 'none',

  [MediaQuery.TABLET]: {
    display: 'unset',

    width: '100%',
    height: '45px',

    backgroundColor: palette.white.toString(),
    borderTop: `1px solid ${palette.toggleButtonGray.toString()}`,

    fontWeight: 'bold',
    fontSize: '15px',
    color: dsPalette.title.toString(),
  },

  [MediaQuery.MOBILE_L]: {
    height: '37px',

    fontSize: '13px',
  },
});


const closeButtonWrapperCustomStyle: CloseButtonProps['iconWrapperCustomStyle'] = {
  transform: 'scale(0.775)',

  position: 'absolute',
  top: '8px',
  right: '8px',

  [MediaQuery.TABLET]: {
    display: 'none',
  },
};

export interface Props {
  zIndex: number;
}

export const SignUpTutorialPopup: FC<Props> = memo(({ zIndex }) => {
  const dispatch: Dispatch = useDispatch();

  const [l10n, language]: UseL10n = useL10n();
  const user: T.User | undefined = useAuthedUser();
  const isESS: boolean = useSelector((state: T.State) => state.PlanConfig.config?.slug === ESSPlanConfig.slug);

  const [isChecked, setIsChecked]: UseState<boolean> = useState<boolean>(false);

  const nameText: string = useMemo(() => (
    language === T.Language.KO_KR ? `${user?.lastName}${user?.firstName}` : `${user?.firstName} ${user?.lastName}`
  ), [user?.lastName, user?.firstName, language]);

  const handleCloseClick: () => void = useCallback(() => {
    dispatch(HideSignUpTutorialPopup({ isKeepingHideAfterLogin: isChecked }));
  }, [isChecked]);

  const handleDownloadButtonClick: () => void = useCallback(() => {
    if (isESS) {
      window.open(l10n(route.externalLink.essSupport), '_blank');
      return;
    }

    download(makeV2APIURL(`download_tutorials?language=${language}`), true, false);
  }, [language, isESS]);

  const handleCheckClick: () => void = useCallback(() => {
    setIsChecked((prevState) => !prevState);
  }, []);

  if (user === undefined) return null;

  return (
    <Modal
      zIndex={zIndex}
      hasBlur={true}
      backgroundColor={palette.black.alpha(ALPHA)}
    >
      <Root>
        <ImageWrapper><Image /></ImageWrapper>
        <Body>
          <CloseButton iconWrapperCustomStyle={closeButtonWrapperCustomStyle} onCloseClick={handleCloseClick} />
          <Title>
            {l10n(Text.title).replace(TEXT_ORGANIZATION_PRESET, user.organization).replace(TEXT_NAME_PRESET, nameText)}
          </Title>
          <DescriptionWrapper>
            <Description>{l10n(Text.description)}</Description>
            <Description hasColor={true}>{l10n(isESS ? Text.essImportant : Text.important)}</Description>
          </DescriptionWrapper>
          <ButtonWrapper onClick={handleDownloadButtonClick}>
            <DownloadButton>
              <FileIcon />
              <DownloadButtonText>
                {l10n(isESS ? Text.essGuide : Text.download)}
              </DownloadButtonText>
            </DownloadButton>
          </ButtonWrapper>
          <CheckboxWrapper>
            <Checkbox isChecked={isChecked} onClick={handleCheckClick} />
            <CheckboxText onClick={handleCheckClick}>{l10n(Text.checkboxText)}</CheckboxText>
          </CheckboxWrapper>
        </Body>
        <MobileCloseButton onClick={handleCloseClick}>{l10n(Text.close)}</MobileCloseButton>
      </Root>
    </Modal>
  );
});
