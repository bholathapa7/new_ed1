import React, { FC, ReactNode, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import CheckSvg from '^/assets/icons/check.svg';
import { ConfirmButton as RawConfirmButton } from '^/components/atoms/Buttons';
import { CheckForm } from '^/components/atoms/CheckForm';
import { Item as CheckFormItem } from '^/components/atoms/CheckForm/item';
import Popup from '^/components/molecules/Popup';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import tutorial from '^/constants/tutorial';
import { UseGoToZendesk, UseL10n, UseState, useConstant, useGoToZendesk, useL10n } from '^/hooks';
import Text from './text';


interface ErrorProp {
  hasError?: boolean;
}

const Root = styled.div({
  width: 'auto',
  maxWidth: '287px',
  paddingTop: '11px',
  paddingLeft: '50px',
  paddingRight: '50px',
  paddingBottom: '50px',
});

const Header = styled.div({
  display: 'flex',
  marginBottom: '26px',
});

const SubTitle = styled.div({
  color: 'var(--color-theme-primary)',
  marginLeft: '7px',
  fontSize: '14px',
  fontWeight: 700,
  lineHeight: '20px',
});

const SvgWrapper = styled.div({
  width: '19px',
  height: '16px',
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

const Description = styled.p<ErrorProp>(({ hasError }) => ({
  marginTop: '15px',
  marginBottom: '6px',

  color: dsPalette.typePrimary.toString(),
  fontSize: '11px',
  fontWeight: 400,
  wordBreak: 'keep-all',
  lineHeight: '17px',

  ...(hasError ? ({
    color: palette.error.toString(),
    fontWeight: 500,
  }) : undefined),
}));

const ConfirmButton = styled(RawConfirmButton)(({ isDisabled }) => ({
  cursor: 'pointer',
  opacity: 1,

  ...(isDisabled ? ({
    backgroundColor: palette.iconDisabled.toString(),
    color: palette.buttonFontColor.toString(),
  }) : undefined),
}));

const DetailButton = styled(ConfirmButton)({
  width: 'auto',
  padding: '0 12px',
});


interface Props {
  readonly zIndex?: number;
  onPreviousClick(): void;
  onSubmitClick(): void;
  onCloseClick(): void;
}

const POPUP_ALPHA: number = 0.39;

export const CadUploadConfirmPopup: FC<Props> = ({
  zIndex = 0,
  onPreviousClick,
  onSubmitClick,
  onCloseClick,
}) => {
  const [l10n]: UseL10n = useL10n();
  const goToZendesk: UseGoToZendesk = useGoToZendesk();

  const [checkedFormIds, setCheckedFormIds]: UseState<CheckFormItem['id'][]> = useState([]);
  const [isValidated, setIsValidated]: UseState<boolean> = useState<boolean>(false);

  const checkFormItems: CheckFormItem[] = useConstant(() =>
    Text.checkForm.map((text, id) => ({ id, text: l10n(text) })),
  );

  const hasError: boolean = checkedFormIds.length !== checkFormItems.length;

  const handleSubmitClick: () => void = useCallback(() => {
    if (hasError) {
      setIsValidated(true);

      return;
    }

    onSubmitClick();
  }, [onSubmitClick, hasError]);

  const handleCheckboxClick: (id: CheckFormItem['id']) => void = useCallback((id) => {
    setCheckedFormIds((prevState) => {
      const checkedIndex: number = prevState.findIndex((checkFormId) => checkFormId === id);

      if (checkedIndex > -1) {
        const _prevState: typeof prevState = [...prevState];
        _prevState.splice(checkedIndex, 1);

        return _prevState;
      } else {
        return [...prevState, id];
      }
    });
  }, []);

  const handleDetailButtonClick: () => void = useCallback(() => {
    goToZendesk(tutorial.cadError);
  }, [goToZendesk]);

  const warningDescription: ReactNode = useMemo(() => (
    <Description
      hasError={isValidated && hasError}
    >
      {l10n(Text.description)}
    </Description>
  ), [isValidated, hasError, l10n]);

  return (
    <Popup
      zIndex={zIndex}
      alpha={POPUP_ALPHA}
      hasBlur={true}
      title={l10n(Text.title)}
      onPreviousClick={onPreviousClick}
      onCloseClick={onCloseClick}
    >
      <Root>
        <Header>
          <SvgWrapper>
            <CheckSvg />
          </SvgWrapper>
          <SubTitle>{l10n(Text.subTitle)}</SubTitle>
        </Header>
        <CheckForm
          items={checkFormItems}
          checkedItemIds={checkedFormIds}
          onClick={handleCheckboxClick}
          isValidated={isValidated}
        />
        {warningDescription}
        <ButtonsWrapper>
          <DetailButton
            isDisabled={true}
            onClick={handleDetailButtonClick}
          >
            {l10n(Text.detail)}
          </DetailButton>
          <ConfirmButton
            isDisabled={hasError}
            onClick={handleSubmitClick}
          >
            {l10n(Text.submit)}
          </ConfirmButton>
        </ButtonsWrapper>
      </Root>
    </Popup>
  );
};
