import React, { FC, FormEvent, ReactNode, SyntheticEvent, useEffect, useState } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

import * as T from '^/types';

import { l10n } from '^/utilities/l10n';

import ApiDetector from '^/components/atoms/ApiDetector';
import { CancelButton as RawCancelButton } from '^/components/atoms/Buttons';
import RawDDMInput from '^/components/atoms/DDMInput/1';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import Popup from '^/components/molecules/Popup';
import ProjectPreview from '^/components/molecules/ProjectPreview';
import { MediaQuery } from '^/constants/styles';

import Text from './text';

const Wrapper =
  styled.form({
    boxSizing: 'border-box',
    width: '640px',
    paddingTop: '30px',
    paddingBottom: '50px',
    paddingLeft: '30px',
    paddingRight: '30px',

    [MediaQuery[T.Device.MOBILE_L]]: {
      width: '420px',
    },

    [MediaQuery[T.Device.MOBILE_S]]: {
      width: '360px',
    },
  });

const Description =
  styled.h2({
    display: 'block',

    fontSize: '15px',
    lineHeight: 1,
    fontWeight: 'normal',
    color: palette.textBlack.toString(),
  });

const BottomWrapper =
  styled.div({
    display: 'flex',
    width: '100%',
    marginTop: '50px',

    [MediaQuery[T.Device.MOBILE_L]]: {
      flexDirection: 'column',
      alignItems: 'center',
    },
  });

const ContentWrapper =
  styled.div({
    display: 'flex',
    flexDirection: 'column',

    marginLeft: '20px',
    flexGrow: 1,

    [MediaQuery[T.Device.MOBILE_L]]: {
      marginTop: '15px',
      flexDirection: 'unset',
      marginLeft: '0px',
      width: '100%',
    },

    [MediaQuery[T.Device.MOBILE_S]]: {
      marginTop: '0px',
      flexDirection: 'column',
    },
  });

const PasswordLabel =
  styled.h3({
    marginBottom: '15px',

    fontSize: '15px',
    lineHeight: 1,
    fontWeight: 500,
    color: palette.textBlack.toString(),

    [MediaQuery[T.Device.MOBILE_L]]: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0px',
      marginRight: '15px',
    },

    [MediaQuery[T.Device.MOBILE_S]]: {
      margin: '15px 0',
    },
  });

const SubmitButton = styled(RawCancelButton)({
  margin: 'auto',
  marginTop: '20px',
  display: 'block',
});

const DDMInput = styled(RawDDMInput)({
  [MediaQuery[T.Device.MOBILE_L]]: {
    flexGrow: 1,
    width: 'auto',
  },
});

const SpinnerIcon =
  styled.i.attrs({
    className: 'fa fa-pulse fa-spinner',
  })({});

const backgroundAlpha: number = 0.45;

export interface Props {
  readonly project?: T.Project;
  readonly deleteStatus: T.APIStatus;
  readonly zIndex: number;
  onClose(): void;
  onSubmit(projectId: number, password: string): void;
  onSuccess(): void;
  resetAPIStatus(): void;
}

/**
 * Project adding popup component
 */
const ProjectDeletePopup: FC<Props & L10nProps> = ({
  project, deleteStatus, language, zIndex, onSuccess, onSubmit, resetAPIStatus, onClose,
}) => {
  const [password, setPassword] = useState<string>('');

  const handleChange: ({ currentTarget }: SyntheticEvent<HTMLInputElement>) => void = ({
    currentTarget,
  }) => {
    setPassword(currentTarget.value);
  };

  const handleSubmit: (event: FormEvent<HTMLFormElement>) => void = (event) => {
    event.preventDefault();

    if (project === undefined) {
      return;
    }

    onSubmit(project.id, password);
  };

  function handleError(): void {
    /** @todo implementing error handling */
  }

  const buttonContent: ReactNode = (deleteStatus === T.APIStatus.PROGRESS) ?
    (<SpinnerIcon />) :
    l10n(Text.delete, language);

  useEffect(() => () => {
    resetAPIStatus();
  }, []);

  return (
    <Popup
      title={l10n(Text.title, language)}
      alpha={backgroundAlpha}
      zIndex={zIndex}
      onCloseClick={onClose}
    >
      <Wrapper onSubmit={handleSubmit}>
        <Description>
          {l10n(Text.description, language)}
        </Description>
        <BottomWrapper>
          <ProjectPreview project={project} />
          <ContentWrapper>
            <PasswordLabel>{l10n(Text.inputTitle, language)}</PasswordLabel>
            <DDMInput
              error={deleteStatus === T.APIStatus.ERROR}
              type='password'
              name='password'
              onChange={handleChange}
            />
          </ContentWrapper>
        </BottomWrapper>
        <SubmitButton type='submit'>{buttonContent}</SubmitButton>
        <ApiDetector
          status={deleteStatus}
          onSuccess={onSuccess}
          onError={handleError}
        />
      </Wrapper>
    </Popup>
  );
};
export default withL10n(ProjectDeletePopup);
