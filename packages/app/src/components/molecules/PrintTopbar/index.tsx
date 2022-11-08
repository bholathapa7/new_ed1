import React, { FC, ReactNode, memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { CancelButton, ConfirmButton } from '^/components/atoms/Buttons';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { l10n } from '^/utilities/l10n';
import Text from './text';

import * as T from '^/types';
import { arePropsEqual } from '^/utilities/react-util';

const Root = styled.div<{ isSidebarOpened: boolean }>(({ isSidebarOpened }) => ({
  boxSizing: 'border-box',
  position: 'fixed',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  right: '0',
  top: '0',

  width: isSidebarOpened ? 'calc(100% - 366px)' : '100%',
  height: '50px',

  fontSize: '15px',
  color: dsPalette.title.toString(),

  backgroundColor: palette.MapTopBar.background.toString(),
}));

const ButtonWrapper = styled.div({
  marginLeft: '22px',

  '> button': {
    width: '83px',
    height: '33px',
    fontSize: '12px',
  },
  '> button:first-of-type': {
    backgroundColor: palette.PDFOverlayCancel.toString(),
  },

  '> button:second-of-type': {
    backgroundColor: 'var(--color-theme-primary-lighter)',
  },

  '> button + button': {
    marginLeft: '6px',
  },
});
ButtonWrapper.displayName = 'ButtonWrapper';

export interface Props {
  readonly className?: string;
  next(): void;
  cancel(): void;
}

/**
 * Component representing top bar for blueprint edit
 */
const PrintTopbar: FC<Props & L10nProps> = ({ className, next, cancel, language }) => {
  const isSidebarOpened: boolean = useSelector((s: T.State) => s.Pages.Contents.showSidebar);
  const buttons: ReactNode = useMemo(() => (
    <ButtonWrapper>
      <CancelButton onClick={cancel} data-testid='printingtopbar-cancel'>
        {l10n(Text.cancel, language)}
      </CancelButton>
      <ConfirmButton onClick={next} data-testid='printingtopbar-next'>
        {l10n(Text.next, language)}
      </ConfirmButton>
    </ButtonWrapper>
  ), []);

  return (
    <Root className={className} isSidebarOpened={isSidebarOpened}>
      {l10n(Text.title, language)}
      {buttons}
    </Root>
  );
};

export default memo(withL10n(PrintTopbar), arePropsEqual);
