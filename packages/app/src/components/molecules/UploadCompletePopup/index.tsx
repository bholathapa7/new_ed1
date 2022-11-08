import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';

import BreakLineText from '^/components/atoms/BreakLineText';
import { ConfirmButton } from '^/components/atoms/Buttons';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import dsPalette from '^/constants/ds-palette';
import * as T from '^/types';
import { l10n } from '^/utilities/l10n';
import Popup from '../Popup';
import Text from './text';

const Root = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  width: '313px',
  padding: '50px',
  paddingBottom: '35px',
  paddingTop: '35px',
});

const Description = styled.h2({
  display: 'block',
  width: '100%',

  marginBottom: '35px',

  lineHeight: 1.6,
  fontSize: '16px',
  fontWeight: 'normal',
  color: dsPalette.title.toString(),
});

export interface Props {
  readonly success: boolean;
  readonly zIndex: number;
  readonly contentId: T.Content['id'];
  onClose(contentId: T.Content['id']): void;
}

const backgroundAlpha: number = 0.45;

const UploadCompletePopup: FC<Props & L10nProps> = (props) => {
  const { success, zIndex, contentId, onClose, language }: Props & L10nProps = props;

  const title: string = success ?
    l10n(Text.success.title, language) : l10n(Text.error.title, language);
  const description: ReactNode = success ? (
    <BreakLineText>
      {l10n(Text.success.description1, language)}
      {l10n(Text.success.description2, language)}
      {l10n(Text.success.description3, language)}
    </BreakLineText>
  ) : (
    <>{l10n(Text.error.description, language)}</>
  );

  const handleClose: () => void = () => onClose(contentId);

  return (
    <Popup
      title={title}
      alpha={backgroundAlpha}
      zIndex={zIndex}
      onCloseClick={handleClose}
    >
      <Root>
        <Description data-testid='upload-complete-description'>
          {description}
        </Description>
        <ConfirmButton onClick={handleClose}>
          {l10n(Text.submit, props.language)}
        </ConfirmButton>
      </Root>
    </Popup>
  );
};

export default withL10n(UploadCompletePopup);
