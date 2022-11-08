import React, {
  ChangeEvent,
  FC, ReactNode, useCallback, useMemo, useState,
} from 'react';
import styled, { CSSObject } from 'styled-components';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';

import ShareSvg from '^/assets/icons/popup/send-share.svg';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { MediaQuery } from '^/constants/styles';
import * as T from '^/types';
import * as V from '^/utilities/validators';
import ApiDetector from '^/components/atoms/ApiDetector';
import Dropdown, { Option as DropdownOption } from '^/components/atoms/Dropdown/1';
import Popup from '^/components/molecules/Popup';
import Text from './text';
import { ConfirmButton } from '^/components/atoms/Buttons';
import { useL10n, UseL10n } from '^/hooks';
import { CloseContentPagePopup, CloseProjectPagePopup, OpenContentPagePopup, OpenProjectPagePopup } from '^/store/duck/Pages';
import { PostPermission } from '^/store/duck/Permissions';
import { Dispatch } from 'redux';
import route from '^/constants/routes';

const Wrapper = styled.div({
  padding: '30px',
  paddingBottom: '50px',

  [MediaQuery[T.Device.MOBILE_L]]: {
    width: '360px',
  },
  [MediaQuery[T.Device.MOBILE_S]]: {
    width: '340px',
  },
});

const BigDescription = styled.h2({
  display: 'block',
  fontSize: '18px',
  lineHeight: 1,
  fontWeight: 'bold',
  color: palette.textBlack.toString(),

  paddingBottom: '30px',

  [MediaQuery[T.Device.MOBILE_L]]: {
    width: '360px',
    padding: '0 10px',
  },
  [MediaQuery[T.Device.MOBILE_S]]: {
    width: '340px',
    padding: '0 20px',
  },
});

const RoleWrapper = styled.h3({
  display: 'flex',
  marginTop: '15px',
  fontSize: '15px',
  lineHeight: '25px',
  fontWeight: 'normal',
  color: palette.textGray.toString(),

  [MediaQuery[T.Device.MOBILE_L]]: {
    width: '340px',
    padding: '0 10px',
  },
  [MediaQuery[T.Device.MOBILE_S]]: {
    width: '300px',
    padding: '0 20px',
  },
});

const RoleColumn = styled.div({
  width: '60px',
});

const DescriptionColumn = styled.div({
  marginLeft: '20px',
});

const Title = styled.div({
  fontSize: '15px',
  lineHeight: 1,
  fontWeight: 'bold',
  marginBottom: '12px',
  color: palette.Photo.photoTabButtonText.toString(),
});

const RoleTitle = styled(Title)({
  [MediaQuery[T.Device.MOBILE_S]]: {
    fontSize: '12px',
  },
});

const RoleDescription = styled.div({
  marginLeft: '5px',
  fontSize: '14px',
  lineHeight: 1,
  marginBottom: '12px',
  fontWeight: 'normal',
  color: palette.Photo.photoCountText.toString(),

  [MediaQuery[T.Device.MOBILE_S]]: {
    fontSize: '12px',
  },
});

const SectionWrapper = styled.div({
  marginTop: '35px',
});

const InputWrapper = styled.div({
  display: 'flex',
  borderTop: `2px solid ${dsPalette.line.toString()}`,
  height: '41px',
});

const Input = styled.input({
  width: '426px',
  color: palette.Photo.photoTabButtonText.toString(),
  fontSize: '13px',
  paddingLeft: '18px',
  borderBottom: `1px solid ${palette.share.border.toString()}`,
  '&::placeholder': {
    color: palette.share.font.toString(),
  },
});

const ButtonWrapper = styled.div({
  display: 'flex',
  justifyContent: 'left',
  marginTop: '35px',

  '& > button': {
    width: 'auto',
    padding: '0 45px',
    background: palette.share.subButton.toString(),
    '&: hover': {
      background: palette.share.subButtonHover.toString(),
    },
  },
});

const SubmitButton = styled.button<{ isValid: boolean }>(({ isValid }) => ({
  width: '69px',
  height: '41px',
  background: palette.share.buttonBackground.toString(),
  display: 'flex',
  alignItems: 'center',
  cursor: 'not-allowed',

  ...(isValid ? ({
    cursor: 'pointer',
    background: 'var(--color-theme-primary)',
  }) : null),
}));

const ShareIcon = styled(ShareSvg)({
  margin: '0 auto',
});

const DropDownComponent = styled(Dropdown)({
  width: '105px',
  height: '41px',

  '&&& button': {
    borderTop: 0,
    borderRadius: 0,
    borderBottom: `1px solid ${palette.share.border}`,
    color: 'var(--color-theme-primary)',
  },

  '& ul': {
    color: palette.share.dropdownListFont.toString(),
    fontSize: '13px',
    justifyContent: 'space-around',
    borderTop: `1px solid ${palette.share.border.toString()}`,
    position: 'absolute',
    borderRadius: 0,

    '& li': {
      height: '41px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },

    '& li:hover': {
      background: 'var(--color-theme-primary)',
      color: palette.white.toString(),
    },

    '& hr:first-of-type': {
      border: 0,
    },
  },
});

const headerStyle: CSSObject = {
  padding: '50px 30px 0',

  '& > div:nth-of-type(2)': {
    '& > div:hover': {
      background: dsPalette.iconHover.toString(),
    },
  },
};


// The type was created because of the text of the dropdown option.
// If there is a better way, please change it or leave a comment.
type ShareRole = [
  T.PermissionRole.ADMIN,
  T.PermissionRole.MEMBER,
  T.PermissionRole.VIEWER,
  T.PermissionRole.PILOT,
];

const popupAlpha: number = 0.45;

export interface Props {
  readonly zIndex: number;
}

const ProjectSharePopup: FC<Props> = ({
  zIndex,
}) => {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();
  const defaultRole: string = l10n(Text.defaultRole);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<T.PermissionRole | string>(defaultRole);

  const isValid: boolean = V.emailValidator(email).valid && role !== defaultRole;
  const projectId: T.Project['id'] | undefined = useSelector((state: T.State) =>
    state.Pages.Project.editingProjectId ? state.Pages.Project.editingProjectId : state.Pages.Contents.projectId,
  );
  const isInContent: boolean = useSelector((state: T.State) => !state.Pages.Project.editingProjectId);

  const postStatus = useSelector((state: T.State) => state.Permissions.postPermissionsStatus);

  const dropdownOptions: DropdownOption[] = useMemo(() => {
    const roles: ShareRole = [
      T.PermissionRole.ADMIN,
      T.PermissionRole.MEMBER,
      T.PermissionRole.VIEWER,
      T.PermissionRole.PILOT,
    ];

    return roles.map((currentRole) => ({
      text: l10n(Text.role[currentRole].name),
      value: currentRole,
    }));
  }, []);

  const onShare: () => void = useCallback(() => {
    if (!isValid || !projectId) return;
    dispatch(PostPermission({
      projectId,
      permissions: [{
        email,
        role: (role as T.PermissionRole),
      }],
    }));
  }, [isValid, email, role]);

  const onShareSuccess = useCallback(() => {
    dispatch(
      isInContent ? OpenContentPagePopup({
        popup: T.ContentPagePopupType.SHARE_ALERT,
      }) : OpenProjectPagePopup({
        popup: T.ProjectPagePopupType.SHARE_ALERT,
      })
    );
  }, []);

  const onShareError = useCallback(() => {
    /*
      @todo error-handling
      Currently, there is no design shaping related to error handling.
      It will be improved in the improvement task later.
    */
  }, []);

  const onManage: () => void = useCallback(() => {
    if (projectId === undefined) return;

    dispatch(push(route.project.createManage(projectId)));
  }, []);

  const onClose: () => void = useCallback(() => {
    dispatch(isInContent ? CloseContentPagePopup() : CloseProjectPagePopup());
  }, []);

  const onInputChange: (event: ChangeEvent<HTMLInputElement>) => void = useCallback((event) => {
    setEmail(event.target.value);
  }, []);

  const onDropdownClick: (options: DropdownOption) => void = useCallback((options) => {
    setRole(String(options.value));
  }, []);

  const manageButton: ReactNode = useMemo(() =>
    isInContent ? (
      <ButtonWrapper>
        <ConfirmButton onClick={onManage} data-testid='confirm-button'>
          {l10n(Text.manage)}
        </ConfirmButton>
      </ButtonWrapper>
    ) : null
  , []);

  return (
    <Popup
      title={l10n(Text.title)}
      alpha={popupAlpha}
      zIndex={zIndex}
      onCloseClick={onClose}
      headerStyle={headerStyle}
    >
      <Wrapper>
        <BigDescription>{l10n(Text.bigDescription)}</BigDescription>
        <RoleWrapper>
          <RoleColumn>
            <RoleTitle>{l10n(Text.role[T.PermissionRole.ADMIN].name)}</RoleTitle>
            <RoleTitle>{l10n(Text.role[T.PermissionRole.PILOT].name)}</RoleTitle>
            <RoleTitle>{l10n(Text.role[T.PermissionRole.MEMBER].name)}</RoleTitle>
            <RoleTitle>{l10n(Text.role[T.PermissionRole.VIEWER].name)}</RoleTitle>
          </RoleColumn>
          <DescriptionColumn>
            <RoleDescription>{l10n(Text.role[T.PermissionRole.ADMIN].description)}</RoleDescription>
            <RoleDescription>{l10n(Text.role[T.PermissionRole.PILOT].description)}</RoleDescription>
            <RoleDescription>{l10n(Text.role[T.PermissionRole.MEMBER].description)}</RoleDescription>
            <RoleDescription>{l10n(Text.role[T.PermissionRole.VIEWER].description)}</RoleDescription>
          </DescriptionColumn>
        </RoleWrapper>
        <SectionWrapper>
          <Title>{l10n(Text.emailTitle)}</Title>
          <InputWrapper>
            <Input
              placeholder={l10n(Text.emailPlaceholder)}
              onChange={onInputChange}
              value={email}
            />
            <DropDownComponent
              zIndex={10}
              value={role}
              placeHolder={defaultRole}
              options={dropdownOptions}
              onClick={onDropdownClick}
            />
            <SubmitButton onClick={onShare} isValid={isValid}>
              <ShareIcon />
            </SubmitButton>
          </InputWrapper>
        </SectionWrapper>
        {manageButton}
        <ApiDetector
          status={postStatus}
          onSuccess={onShareSuccess}
          onError={onShareError}
        />
      </Wrapper>
    </Popup>
  );
};

export default ProjectSharePopup;

