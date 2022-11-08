import React, { FC } from 'react';
import styled from 'styled-components';

import { CancelButton as RawCancelButton, ConfirmButton as RawConfirmButton } from '^/components/atoms/Buttons';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import palette from '^/constants/palette';
import { MediaQuery } from '^/constants/styles';

import * as T from '^/types';

import ProjectPermissionTable from '^/containers/organisms/ProjectPermissionTable';
import { l10n } from '^/utilities/l10n';
import Text from './text';

const TableTitleWrapper = styled.div({
  display: 'flex',
  direction: 'ltr',
  alignItems: 'flex-end',
  justifyContent: 'space-between',

  width: '100%',
  marginTop: '50px',
});

const TableTitle = styled.h2({
  fontSize: '18px',
  lineHeight: 1,
  fontWeight: 500,
  color: palette.textBlack.toString(),
});

const ShareButton = styled(RawConfirmButton)({
  [MediaQuery[T.Device.MOBILE_L]]: {
    width: '80px',
    height: '32px',
  },
});

export const DeleteButton = styled(RawCancelButton)({
  backgroundColor: palette.textLight.toString(),
  color: palette.white.toString(),
  display: 'block',
  margin: 'auto',
  marginTop: '80px',
  width: '160px',
  height: '58px',
  fontSize: '16px',

  ':hover': {
    backgroundColor: palette.dividerLight.toString(),
  },
});

export interface Props {
  handleShareClick(): void;
  handleDeleteClick(): void;
}

const MemberBoard: FC<Props & L10nProps> = ({ handleShareClick, handleDeleteClick, language }) => (
  <>
    <TableTitleWrapper>
      <TableTitle>{l10n(Text.tableTitle, language)}</TableTitle>
      <ShareButton onClick={handleShareClick} data-testid='share-button'>
        {l10n(Text.addMember, language)}
      </ShareButton>
    </TableTitleWrapper>
    <ProjectPermissionTable />
    <DeleteButton onClick={handleDeleteClick} data-testid='delete-button'>
      {l10n(Text.delete, language)}
    </DeleteButton>
  </>
);

export default withL10n(MemberBoard);
