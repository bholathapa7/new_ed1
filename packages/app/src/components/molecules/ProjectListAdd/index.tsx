import React, { FC } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

import { l10n } from '^/utilities/l10n';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import Text from './text';

const Root = styled.li({
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: palette.borderLight.toString(),
  backgroundColor: palette.white.toString(),
});

const Icon = styled.i.attrs({
  className: 'fa fa-plus',
})({
  marginTop: '77px',

  width: '100%',

  fontSize: '56px',
  lineHeight: '44px',
  color: palette.borderLight.toString(),
  textAlign: 'center',
});

const Title = styled.h2({
  marginTop: '17px',

  fontSize: '18px',
  lineHeight: 1,
  fontWeight: 'bold',
  color: palette.textLight.toString(),
  textAlign: 'center',
});

export interface Props {
  onClick(): void;
}

const ProjectListAdd: FC<Props & L10nProps> = ({
  onClick, language,
}) => (
  <Root onClick={onClick}>
    <Icon />
    <Title>{l10n(Text.title, language)}</Title>
  </Root>
);
export default withL10n(ProjectListAdd);
