import React, { ReactElement, memo } from 'react';
import styled from 'styled-components';

import ErrorSvg from '^/assets/icons/permission-popup/error.svg';
import palette from '^/constants/palette';
import { UseL10n, useL10n } from '^/hooks';
import Text from './text';


const Root = styled.section({
  boxSizing: 'border-box',
  width: '100%',

  padding: '20px',

  backgroundColor: palette.ContentsList.itemHoverGray.toString(),
  borderRadius: '4px',
});

const TitleWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
});

const Title = styled.span({
  marginLeft: '8px',
  color: palette.EditableText.errorText.toString(),
  fontSize: '15px',
  fontWeight: 'bold',
});

const List = styled.ul({
  listStyle: 'disc',
  marginTop: '10px',
});

const Item = styled.li({
  marginLeft: '28px',

  fontSize: '13px',
  color: palette.Photo.photoTabButtonText.toString(),
  lineHeight: '20px',
});


export interface Props {
  readonly texts: Array<string>;
}

function WarningAlert({ texts }: Props): ReactElement | null {
  const [l10n]: UseL10n = useL10n();

  return (() => {
    if (texts.length === 0) throw new Error('Texts must not be empty');

    return (
      <Root>
        <TitleWrapper>
          <ErrorSvg width='26' height='26' />
          <Title>{l10n(Text.warning)}</Title>
        </TitleWrapper>
        <List>{texts.map((text) => <Item key={text}>{text}</Item>)}</List>
      </Root>
    );
  })();
}

export default memo(WarningAlert);
