import React, {
  ChangeEvent, ReactNode,
  FC, useCallback, useMemo, useState,
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
import { ConfirmButton as RawConfirmButton } from '^/components/atoms/Buttons';
import { useL10n, UseL10n } from '^/hooks';
import { OpenProjectPagePopup } from '^/store/duck/Pages';
import { PostPermission } from '^/store/duck/Permissions';
import { Dispatch } from 'redux';
import route from '^/constants/routes';

const Wrapper = styled.div({
  width: '600px',
  padding: '50px',
  boxSizing: 'border-box',

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
  fontWeight: 'bold',
  color: palette.textBlack.toString(),

  paddingBottom: '35px',

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
  flexDirection: 'column',
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

const RoleRow = styled.div({
  display: 'grid',
  gridTemplateColumns: '95px auto',
  gridTemplateRows: '22px',
  alignItems: 'center',
  marginBottom: '10px',

  '&:last-child': {
    marginBottom: 0,
  },
});

const Title = styled.div({
  fontSize: '15px',
  lineHeight: 1.15,
  fontWeight: 700,
  color: palette.Photo.photoTabButtonText.toString(),
});

const RoleTitle = styled(Title)({
  [MediaQuery[T.Device.MOBILE_S]]: {
    fontSize: '12px',
  },
});

const RoleDescription = styled.div({
  fontSize: '13px',
  color: palette.Photo.photoCountText.toString(),

  [MediaQuery[T.Device.MOBILE_S]]: {
    fontSize: '12px',
  },
});

const SectionWrapper = styled.div({
  marginTop: '50px',
});

const InputWrapper = styled.div({
  display: 'flex',
  borderTop: `2px solid ${dsPalette.themePrimary.toString()}`,
  height: '41px',
  marginTop: '10px',
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
  justifyContent: 'center',
  marginTop: '94px',
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
    background: dsPalette.themePrimary.toString(),
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
    color: dsPalette.themePrimary.toString(),
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
      background: dsPalette.themePrimary.toString(),
      color: palette.white.toString(),
    },

    '& hr:first-of-type': {
      border: 0,
    },
  },
});

const headerStyle: CSSObject = {
  padding: '50px 50px 0',

  '& > div:nth-of-type(2)': {
    '& > div:hover': {
      background: dsPalette.iconHover.toString(),
    },
  },
};

const ConfirmButton = styled(RawConfirmButton)({
  width: '176px',
});


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

const ProjectInvitePopup: FC<Props> = ({
  zIndex,
}) => {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();
  const defaultRole: string = l10n(Text.defaultRole);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<T.PermissionRole | string>(defaultRole);

  const isValid: boolean = V.emailValidator(email).valid && role !== defaultRole;
  const projectId: number | undefined = useSelector((state: T.State) =>
    state.Projects.projects.allIds[state.Projects.projects.allIds.length - 1]
  );

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
      OpenProjectPagePopup({
        popup: T.ProjectPagePopupType.INVITE_ALERT,
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

  const onCreate: () => void = useCallback(() => {
    if (projectId === undefined) return;

    dispatch(push(route.content.createMain(projectId)));
  }, []);

  const onInputChange: (event: ChangeEvent<HTMLInputElement>) => void = useCallback((event) => {
    setEmail(event.target.value);
  }, []);

  const onDropdownClick: (options: DropdownOption) => void = useCallback((options) => {
    setRole(String(options.value));
  }, []);

  const inviteButton: ReactNode = useMemo(() => (
    <ButtonWrapper>
      <ConfirmButton onClick={onCreate} data-testid='confirm-button'>
        {l10n(Text.openProject)}
      </ConfirmButton>
    </ButtonWrapper>
  ), []);

  return (
    <Popup
      title={l10n(Text.title)}
      alpha={popupAlpha}
      zIndex={zIndex}
      headerStyle={headerStyle}
    >
      <Wrapper>
        <BigDescription>{l10n(Text.bigDescription)}</BigDescription>
        <RoleWrapper>
          <RoleRow>
            <RoleTitle>{l10n(Text.role[T.PermissionRole.ADMIN].name)}</RoleTitle>
            <RoleDescription>{l10n(Text.role[T.PermissionRole.ADMIN].description)}</RoleDescription>
          </RoleRow>
          <RoleRow>
            <RoleTitle>{l10n(Text.role[T.PermissionRole.PILOT].name)}</RoleTitle>
            <RoleDescription>{l10n(Text.role[T.PermissionRole.PILOT].description)}</RoleDescription>
          </RoleRow>
          <RoleRow>
            <RoleTitle>{l10n(Text.role[T.PermissionRole.MEMBER].name)}</RoleTitle>
            <RoleDescription>{l10n(Text.role[T.PermissionRole.MEMBER].description)}</RoleDescription>
          </RoleRow>
          <RoleRow>
            <RoleTitle>{l10n(Text.role[T.PermissionRole.VIEWER].name)}</RoleTitle>
            <RoleDescription>{l10n(Text.role[T.PermissionRole.VIEWER].description)}</RoleDescription>
          </RoleRow>
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
        {inviteButton}
        <ApiDetector
          status={postStatus}
          onSuccess={onShareSuccess}
          onError={onShareError}
        />
      </Wrapper>
    </Popup>
  );
};

export default ProjectInvitePopup;

