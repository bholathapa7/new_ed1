import React, { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import BreakLineText from '^/components/atoms/BreakLineText';
import { ConfirmButton } from '^/components/atoms/Buttons';
import Popup from '^/components/molecules/Popup';
import palette from '^/constants/palette';
import { UseL10n, useL10n } from '^/hooks';
import { CloseProjectPagePopup } from '^/store/duck/Pages';
import { DeletePermission } from '^/store/duck/Permissions';
import * as T from '^/types';
import Text, { EMAIL_CUSTOM_TAG } from './text';

const Root = styled.div({
  width: '313px',

  padding: '35px 50px 35px 50px',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});
Root.displayName = 'Body';

const Description = styled.p({
  marginBottom: '30px',

  width: '100%',

  textAlign: 'left',
  lineHeight: 1.6,
  fontSize: '15px',
  fontWeight: 500,
  color: palette.textBlack.toString(),
});
Description.displayName = 'Description';

const BG_ALPHA: number = 0.63;

export interface Props {
  readonly zIndex: number;
}

const ProjectPermissionDeleteConfirmPopup: FC<Props> = ({ zIndex }) => {
  const email: T.Permission['email'] | undefined = useSelector((state: T.State) => state.Permissions.confirmDeletePermission?.email);

  const permissionId: T.Permission['id'] | undefined = useSelector((state: T.State) => state.Permissions.confirmDeletePermission?.id);

  const deletePermissionStatus: T.PermissionsState['deletePermissionStatus']
    = useSelector((state: T.State) => state.Permissions.deletePermissionStatus);

  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();

  const description: string = l10n(Text.description).replace(EMAIL_CUSTOM_TAG, email ?? '');

  const onCloseClick: () => void = () => {
    dispatch(CloseProjectPagePopup());
  };
  const handleDelete: () => void = useCallback(() => {
    if (permissionId === undefined) {
      return;
    }

    dispatch(DeletePermission({ id: permissionId }));
  }, [permissionId]);

  return (
    <Popup
      alpha={BG_ALPHA}
      title={l10n(Text.title)}
      zIndex={zIndex}
      hasBlur={true}
      onCloseClick={onCloseClick}
    >
      <Root>
        <Description>
          <BreakLineText>{[description]}</BreakLineText>
        </Description>
        <ConfirmButton
          onClick={handleDelete}
          disabled={deletePermissionStatus === T.APIStatus.PROGRESS}
        >
          {l10n(Text.deleteButtonLabel)}
        </ConfirmButton>
      </Root>
    </Popup>
  );
};

export default ProjectPermissionDeleteConfirmPopup;
