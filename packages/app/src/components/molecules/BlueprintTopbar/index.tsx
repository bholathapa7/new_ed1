import React, { FC, useEffect } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

import { l10n } from '^/utilities/l10n';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import { FontFamily } from '^/constants/styles';
import Text from './text';

const Root = styled.div({
  display: 'flex',
  alignItems: 'center',

  width: '100%',

  fontSize: '15px',
  lineHeight: 1.4,
  color: palette.textBlack.toString(),

  backgroundColor: palette.MapTopBar.background.toString(),
});

const ContentsWrapper = styled.div({
  display: 'flex',
  position: 'relative',
  alignItems: 'center',
  boxSizing: 'border-box',

  paddingTop: '20px',
  paddingBottom: '20px',
  paddingLeft: '75px',

  width: '50%',
  height: 'auto',
});

const ContentsWrapper2 = styled(ContentsWrapper)({
  borderLeft: `thin solid ${palette.dropdown.dividerColor.toString()}`,
});

const Description = styled.span({
  marginRight: '210px',
});

const ToggleButton = styled.button({
  width: '80px',
  height: '40px',

  borderRadius: '3px',
  backgroundColor: palette.white.toString(),

  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--color-theme-primary-lightest)',

  cursor: 'pointer',
});

const Circle = styled.div({
  position: 'absolute',

  left: '30px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  paddingTop: '2px',
  marginRight: '10px',

  width: '34px',
  height: '31px',
  borderRadius: '50%',

  color: 'var(--color-theme-primary-lighter)',
  backgroundColor: palette.MapTopBar.hoverGray.toString(),
  fontFamily: FontFamily.ROBOTO,
  fontSize: '15px',
  fontWeight: 'bold',
});

const SubmitButton = styled(ToggleButton)({
  position: 'absolute',
  right: '21px',

  width: '83px',
  height: '33px',

  fontSize: '12px',
  fontWeight: 600,
  color: palette.white.toString(),

  borderRadius: '6px',

  marginLeft: '129px',
  marginRight: '6px',

  backgroundColor: 'var(--color-theme-primary-lighter)',
});

const CancelButton = styled(ToggleButton)({
  position: 'absolute',
  right: '75px',

  width: '83px',
  height: '33px',

  fontSize: '12px',
  fontWeight: 'bold',
  color: palette.buttonFontColor.toString(),

  borderRadius: '6px',

  marginRight: '41px',

  backgroundColor: palette.PDFOverlayCancel.toString(),
});


export interface Props {
  readonly className?: string;
  closePopup(): void;
  submit(): void;
  cancel(): void;
}

/**
 * Component representing top bar for blueprint edit
 */
const BlueprintTopbar: FC<Props & L10nProps> = ({
  className, language, submit, closePopup, cancel,
}) => {
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, false);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, false);
      closePopup();
    };
  }, []);

  const handleKeyDown: (e: globalThis.KeyboardEvent) => void = (e) => {
    if (e.key === 'Escape') {
      cancel();
    }
  };

  return (
    <Root className={className} >
      <ContentsWrapper>
        <Circle>
          01
        </Circle>
        {l10n(Text.editTitle, language)}
      </ContentsWrapper>
      <ContentsWrapper2>
        <Circle>
          02
        </Circle>
        <Description>
          {l10n(Text.plainTitle, language)}
        </Description>
        <CancelButton onClick={cancel} data-testid='blueprinttopbar-cancel'>
          {l10n(Text.cancel, language)}
        </CancelButton>
        <SubmitButton onClick={submit} data-testid='blueprinttopbar-submit'>
          {l10n(Text.submit, language)}
        </SubmitButton>
      </ContentsWrapper2>
    </Root>
  );
};
export default withL10n(BlueprintTopbar);
