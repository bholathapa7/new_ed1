/* eslint-disable max-lines */
import axios, { AxiosResponse } from 'axios';
import _ from 'lodash-es';
import React, { FC, ReactNode, SyntheticEvent, useState, useEffect } from 'react';
import styled, { CSSObject } from 'styled-components';

import ApiDetector from '^/components/atoms/ApiDetector';
import AutosizeTextarea from '^/components/atoms/AutosizeTextarea';
import { CancelButton as RawCancelButton, ConfirmButton as RawConfirmButton } from '^/components/atoms/Buttons';
import DDMInput from '^/components/atoms/DDMInput/1';
import { Option } from '^/components/atoms/Dropdown/1';
import FaIcon from '^/components/atoms/FaIcon';
import LogoUploadButton from '^/components/atoms/LogoUploadButton';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import WrapperHoverable, {
  Props as WrapperHoverableProps,
} from '^/components/atoms/WrapperHoverable';
import CoordinateSystemDropdown from '^/components/molecules/CoordinateSystemDropdown/1';
import UnitDropdown from '^/components/molecules/UnitDropdown';
import MemberBoard from '^/components/organisms/MemberBoard';
import palette from '^/constants/palette';
import { MediaQuery } from '^/constants/styles';
import { AuthHeader, makeAuthHeader, makeV2APIURL } from '^/store/duck/API';
import * as T from '^/types';
import { projectionSystemLabel } from '^/utilities/coordinate-util';
import { getFormattedDate } from '^/utilities/date-format';
import { determineUnitType, unitLabel } from '^/utilities/imperial-unit';
import { l10n } from '^/utilities/l10n';
import { isRoleAdmin } from '^/utilities/role-permission-check';
import Text from './text';

const Root = styled.div({
  boxSizing: 'border-box',
  width: '100%',
  // height: '100%',
  paddingTop: '50px',
  paddingBottom: '50px',
  paddingLeft: '30px',
  paddingRight: '30px',
});

const TabTitleWrapper = styled.div({
  display: 'flex',
  direction: 'ltr',
  alignItems: 'flex-start',
  justifyContent: 'space-between',

  width: '100%',
  marginBottom: '30px',
});

const TabTitle = styled.h1({
  fontSize: '30px',
  lineHeight: 1,
  fontWeight: 'normal',
  color: palette.darkBlack.toString(),

  [MediaQuery[T.Device.MOBILE_L]]: {
    fontSize: '24px',
  },
  [MediaQuery[T.Device.MOBILE_S]]: {
    fontSize: '22px',
  },
});

const DateTextWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const DateText = styled.span({
  fontSize: '13px',
  lineHeight: '24px',
  fontWeight: 'normal',
  color: palette.textLight.toString(),

  [MediaQuery[T.Device.MOBILE_L]]: {
    fontSize: '11px',
  },
  [MediaQuery[T.Device.MOBILE_S]]: {
    fontSize: '9px',
  },
});

const FieldWrapper = styled.div({
  paddingTop: '17px',
});

const FieldTitle = styled.h3({
  marginBottom: '10px',
  fontSize: '18px',
  [MediaQuery[T.Device.MOBILE_L]]: {
    fontSize: '14px',
  },
  [MediaQuery[T.Device.MOBILE_L]]: {
    fontSize: '12px',
  },
  lineHeight: 1,
  fontWeight: 'bold',
  color: palette.darkBlack.toString(),
});

interface CustomStyleProps {
  readonly customStyle: CSSObject;
}

const Title = styled(DDMInput)<CustomStyleProps>({
  paddingTop: '0px',
  color: palette.textBlack.toString(),
  backgroundColor: palette.white.toString(),
}, ({ customStyle }) => ({
  ...customStyle,
}));

const NonEditTitleStyle: CSSObject = {
  boxSizing: 'border-box',
  paddingLeft: '15px',
  paddingRight: '30px',
  height: '30px',
  borderWidth: 0,

  fontSize: '18.4px',
  lineHeight: '25px',

  [MediaQuery[T.Device.MOBILE_L]]: {
    fontSize: '12px',
  },
};

const EditTitleStyle: CSSObject = {
  marginBottom: '10px',
  borderWidth: 1,
};

const TopWrapper = styled.div({
  display: 'flex',
  direction: 'ltr',

  marginTop: '10px',

  [MediaQuery[T.Device.MOBILE_L]]: {
    flexDirection: 'column-reverse',
  },
});

const ProjectEditWrapper = styled.div<CustomStyleProps>({
  position: 'relative',

  flexGrow: 1,

  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: palette.border.toString(),
  borderRadius: '3px',
  backgroundColor: palette.white.toString(),

}, ({ customStyle }) => ({
  ...customStyle,
}));

const EditWrapperStyle: CSSObject = {
  paddingLeft: '20px',
  height: '180px',
};

const NonEditWrapperStyle: CSSObject = {
  paddingLeft: '30px',
  paddingRight: '30px',
  paddingBottom: '17px',

  height: '100%',
  borderTop: '0px',

  [MediaQuery[T.Device.MOBILE_L]]: {
    paddingLeft: '20px',
    paddingRight: '20px',
  },
};

const DescriptionAreaStyle: CSSObject = {
  boxSizing: 'border-box',
  paddingRight: '20px',
  paddingTop: '5px',
  paddingLeft: '15px',

  fontSize: '15px',
  lineHeight: '25px',
  color: palette.textGray.toString(),
  backgroundColor: palette.white.toString(),

  overflowY: 'auto',
};

const DescriptionEditStyle: CSSObject = {
  ...DescriptionAreaStyle,

  paddingBottom: '5px',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: palette.border.toString(),
  borderRadius: '3px',
};

const ProjectInfoWrapper = styled.div({
  position: 'relative',

  flexGrow: 1,
  height: '100%',

  borderTop: '1px solid',
  borderColor: palette.border.toString(),
});

const CoordinateWrapper = styled.div({
  backgroundColor: palette.white.toString(),
});

const Coordinate = styled.div({
  paddingLeft: '15px',
  fontSize: '18.4px',
  lineHeight: '25px',
});

const UnitWrapper = styled.div({
  backgroundColor: palette.white.toString(),
});

const Unit = styled.div({
  paddingLeft: '15px',
  fontSize: '18.4px',
  lineHeight: '25px',
});

const dropdownButtonStyle: CSSObject = {
  borderColor: palette.border.toString(),
};

interface ImageProp {
  readonly image?: string;
}

const LogoImage = styled.div<ImageProp>({
  position: 'relative',
  width: '150px',
  height: '150px',
  marginLeft: '10px',

  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: palette.border.toString(),
  borderRadius: '3px',

  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center',
  backgroundColor: palette.white.toString(),

  [MediaQuery[T.Device.MOBILE_L]]: {
    width: '100%',

    marginLeft: 0,
    marginBottom: '10px',
  },
}, ({ image }) => ({
  backgroundImage: `url(${image})`,
}));

const ButtonsWrapper = styled.div({
  marginTop: '30px',
  textAlign: 'center',
});

const SubmitButton = styled(RawConfirmButton)({
  width: '160px',
  height: '60px',

  [MediaQuery[T.Device.MOBILE_L]]: {
    width: '120px',
    height: '45px',
  },
});

const CancelButton = styled(RawCancelButton)({
  backgroundColor: palette.textLight.toString(),
  color: palette.white.toString(),
  width: '160px',
  height: '60px',
  marginRight: '10px',

  ':hover': {
    backgroundColor: palette.dividerLight.toString(),
  },

  [MediaQuery[T.Device.MOBILE_L]]: {
    width: '120px',
    height: '45px',
  },
});

const ProgressSpinner: ReactNode = (
  <FaIcon
    faNames={['spinner', 'pulse', 'fw']}
    fontSize={'inherit'}
  />
);

const TooltipWrapperStyle: CSSObject = {
  position: 'relative',
  display: 'inline-block',
};
const TooltipTargetStyle: CSSObject = {
  display: 'flex',
  justifyContent: 'center',
  marginLeft: '5px',
};
const TooltipBalloonStyle: CSSObject = {
  top: '23px',
  bottom: 'auto',
  left: '-13px',
  width: 'auto',
  minWidth: '115px',
};
const TooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: TooltipWrapperStyle,
  tooltipTargetStyle: TooltipTargetStyle,
  tooltipBalloonStyle: TooltipBalloonStyle,
  tooltipTextTitleStyle: { whiteSpace: 'pre-wrap' },
  tooltipArrowStyle: { left: '20px' },
};

const isAdmin: (project?: T.Project) => boolean = (project) => (
  project !== undefined &&
  isRoleAdmin(project.permissionRole)
);

export interface Props {
  readonly timezoneOffset: number;
  /**
   * @todo Remove the case of undefined project
   */
  readonly project?: T.Project;
  readonly patchStatus: T.APIStatus;
  readonly auth: T.AuthState;
  readonly slug: T.PlanConfig['slug'];
  onDeleteClick(): void;
  onShareClick(): void;
  onSubmit(
    id: number, title: string, description: string,
    coordinate?: T.ProjectionEnum, logo?: File, unit?: T.ValidUnitType,
  ): void;
  changeAuthedUser(): void;
  updateCoordinates(contents: T.Content, from: T.ProjectionEnum, to: T.ProjectionEnum): Promise<void>;
  fetchPermission(id: T.Project['id']): void;
  displayNoPermissionPopup(): void;
}

export interface State {
  readonly projectId?: T.ProjectWithConfig['id'];
  readonly title: string;
  readonly description: string;
  readonly coordinateSystem?: T.ProjectionEnum;
  readonly unit?: T.Project['unit'];
  readonly logo?: {
    readonly raw: File;
    readonly url: string;
  };
  isEditMode: boolean;
}

/**
 * Project page Manage tab component class
 */
const ProjectManageTab: FC<Props & L10nProps> = ({
  auth, slug, project, language, patchStatus, timezoneOffset,
  onShareClick, onDeleteClick, changeAuthedUser, fetchPermission, displayNoPermissionPopup, onSubmit, updateCoordinates,
}) => {
  const submitInProgress: boolean = patchStatus === T.APIStatus.PROGRESS;

  const [projectState, setProjectState] = useState<State>(project !== undefined ? {
    projectId: project.id,
    title: project.title,
    description: project.description,
    coordinateSystem: project.coordinateSystem !== undefined ?
      project.coordinateSystem : undefined,
    unit: project.unit,
    isEditMode: false,
  } : {
    title: '',
    description: '',
    isEditMode: false,
  }
  );

  useEffect(() => {
    if (project === undefined) {
      return;
    }
    fetchPermission(project.id);
  }, []);

  const handleChange: (event: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => void = ({ currentTarget }) => {
    if (currentTarget.name === 'title' || currentTarget.name === 'description') {
      setProjectState({ ...projectState, [currentTarget.name]: currentTarget.value });
      return;
    }
  };

  const handleSelectCoordinateSystem: (coordinateSystem: T.ProjectionEnum) => void = (coordinateSystem) => {
    setProjectState({ ...projectState, coordinateSystem });
  };

  const handleSelectUnit: (unit: T.ValidUnitType) => void = (unit) => {
    setProjectState({ ...projectState, unit });
  };

  const handleFileSelectClick: (event: SyntheticEvent<HTMLInputElement>) => void = (event) => {
    if (!isAdmin(project)) {
      displayNoPermissionPopup();
      event.preventDefault();

      return;
    }
  };

  const handleFileSelect: (event: SyntheticEvent<HTMLInputElement>) => void = (event) => {
    if (event.currentTarget.files !== null && event.currentTarget.files.length !== 0) {
      const logo: File = event.currentTarget.files[0];
      const reader: FileReader = new FileReader();
      reader.addEventListener('load', () => {
        if (typeof reader.result !== 'string') {
          throw new Error('reader.result in ProjectManageTab is not string');
        }
        setProjectState({ ...projectState, logo: {
          raw: logo,
          url: reader.result,
        },
        });
      });
      reader.readAsDataURL(logo);
    }
  };

  const handleSubmit: () => Promise<void> = async () => {
    if (!isAdmin(project)) {
      displayNoPermissionPopup();

      return;
    }
    if (projectState.isEditMode) {
      onSubmit(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        project!.id,
        projectState.title,
        projectState.description,
        projectState.coordinateSystem,
        (projectState.logo !== undefined ? projectState.logo.raw : undefined),
        determineUnitType(projectState.unit),
      );
      await updateCoords();
    } else {
      changeMode();
    }
  };

  const updateCoords: () => Promise<void> = async () => {
    try {
      const contents: T.Content[] | undefined = await getRawContents();
      if (contents === undefined) return;

      if (project?.coordinateSystem === undefined || projectState.coordinateSystem === undefined) return;
      const from: T.ProjectionEnum = project.coordinateSystem;
      const to: T.ProjectionEnum = projectState.coordinateSystem;
      if (from === to) return;

      const targetContents: T.Content[] = contents.filter((c) => T.CHANGE_COORDS_ON_PROJECTIONSYSTEM_CHANGE.includes(c.type));
      /* eslint-disable-next-line @typescript-eslint/promise-function-async */
      const updateRequests: Promise<void>[] = targetContents.map((c) => updateCoordinates(c, from, to));
      await Promise.all(updateRequests);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('failed to udpate coords', e);
    }
  };

  const getRawContents: () => Promise<T.Content[] | undefined> = async () => {
    if (project === undefined) return;
    const url: string = makeV2APIURL('projects', project.id, 'contents');
    const authHeader: AuthHeader | undefined = makeAuthHeader(auth, slug);
    if (authHeader === undefined) changeAuthedUser();

    const res: AxiosResponse = await axios.get(url, { headers: { Authorization: authHeader?.Authorization } });

    return res.data.data;
  };

  const handleCancel: () => void = async () => {
    if (project) {
      setProjectState({
        projectId: project.id,
        title: project.title,
        description: project.description,
        coordinateSystem: project.coordinateSystem !== undefined ?
          project.coordinateSystem : undefined,
        isEditMode: false,
      });
    }
  };

  const handleShareClick: () => void = () => {
    if (!isAdmin(project)) {
      displayNoPermissionPopup();

      return;
    }
    onShareClick();
  };

  const handleDeleteClick: () => void = () => {
    if (!isAdmin(project)) {
      displayNoPermissionPopup();

      return;
    }
    onDeleteClick();
  };

  const handlePatchSuccess: () => void = () => {
    changeMode();
  };

  const handlePatchError: () => void = () => {
    /**
     * @todo implementing error handling
     */
    changeMode();
  };

  const changeMode: () => void = () => {
    setProjectState({ ...projectState, isEditMode: !projectState.isEditMode });
  };

  if (project === undefined) {
    return null;
  }

  const getFormattedDateWithTimezone: (date: Date) => string = getFormattedDate(timezoneOffset, l10n(Text.dateFormat, language));

  const logo: string | undefined =
    projectState.logo !== undefined ?
      projectState.logo.url :
      project.logo;

  const title: ReactNode = (
    <FieldWrapper>
      <FieldTitle>{l10n(Text.projectName, language)}</FieldTitle>
      <Title
        name='title'
        value={projectState.title}
        onChange={handleChange}
        customStyle={projectState.isEditMode ? EditTitleStyle : NonEditTitleStyle}
        disabled={projectState.isEditMode ? undefined : true}
      />
    </FieldWrapper>
  );

  const coordinateOptions: Array<Option> = Object.keys(projectionSystemLabel)
    .map((c: T.CoordinateSystem) => ({
      text: l10n(projectionSystemLabel[c], language),
      value: c,
    }));
  const coordinateOption: Option | undefined =
    _.find(coordinateOptions, { value: projectState.coordinateSystem });
  const coordinateLabel: string = coordinateOption ? coordinateOption.text : '';

  const coordinateViewer: ReactNode = projectState.coordinateSystem !== undefined ? (
    <FieldWrapper>
      <FieldTitle>
        {l10n(Text.projectCoordinate, language)}
        <WrapperHoverable
          title={l10n(Text.tooltipProjectCoordinate, language)}
          customStyle={TooltipCustomStyle}
        >
          <FaIcon faNames='question-circle' fontSize='inherit' />
        </WrapperHoverable>
      </FieldTitle>
      <CoordinateWrapper>
        <Coordinate>
          {coordinateLabel}
        </Coordinate>
      </CoordinateWrapper>
    </FieldWrapper>
  ) : undefined;
  const coordinateEditor: ReactNode = (
    <FieldWrapper>
      <FieldTitle>
        {l10n(Text.projectCoordinate, language)}
        <WrapperHoverable
          title={l10n(Text.tooltipProjectCoordinate, language)}
          customStyle={TooltipCustomStyle}
        >
          <FaIcon faNames='question-circle' fontSize='inherit' />
        </WrapperHoverable>
      </FieldTitle>
      <CoordinateWrapper>
        <CoordinateSystemDropdown
          value={projectState.coordinateSystem}
          options={coordinateOptions}
          onSelect={handleSelectCoordinateSystem}
          dropdownButtonStyle={dropdownButtonStyle}
        />
      </CoordinateWrapper>
    </FieldWrapper>
  );

  const description: ReactNode = (
    <FieldWrapper>
      <FieldTitle>{l10n(Text.projectDescription, language)}</FieldTitle>
      <AutosizeTextarea
        name='description'
        value={projectState.description}
        onChange={handleChange}
        customStyle={projectState.isEditMode ? DescriptionEditStyle : DescriptionAreaStyle}
        disabled={projectState.isEditMode ? undefined : true}
      />
    </FieldWrapper>
  );

  const unitOptions: Array<Option> = Object.keys(unitLabel)
    .map((c: T.ValidUnitType) => ({
      text: l10n(unitLabel[c], language),
      value: c,
    }));
  const unitOption: Option | undefined =
    _.find(unitOptions, { value: projectState.unit });
  const unitTypeLabel: string = unitOption ? unitOption.text : '';

  const unitViewer: ReactNode = (
    <FieldWrapper>
      <FieldTitle>{l10n(Text.unit, language)}</FieldTitle>
      <UnitWrapper>
        <Unit>{unitTypeLabel}</Unit>
      </UnitWrapper>
    </FieldWrapper>
  );
  const unitEditor: ReactNode = (
    <FieldWrapper>
      <FieldTitle>{l10n(Text.unit, language)}</FieldTitle>
      <UnitWrapper>
        <UnitDropdown
          value={projectState.unit}
          options={unitOptions}
          onSelect={handleSelectUnit}
          dropdownButtonStyle={dropdownButtonStyle}
        />
      </UnitWrapper>
    </FieldWrapper>
  );

  const projectInfo: ReactNode = projectState.isEditMode ? (
    <ProjectInfoWrapper>
      {title}
      {coordinateEditor}
      {unitEditor}
      {description}
    </ProjectInfoWrapper>
  ) : (
    <ProjectInfoWrapper>
      <ProjectEditWrapper
        customStyle={projectState.isEditMode ? EditWrapperStyle : NonEditWrapperStyle}
      >
        {title}
        {coordinateViewer}
        {unitViewer}
        {description}
      </ProjectEditWrapper>
    </ProjectInfoWrapper>
  );

  const logoUploadButton: ReactNode = (
    <LogoUploadButton
      handleFileSelect={handleFileSelect}
      handleFileSelectClick={handleFileSelectClick}
    />
  );

  const memberBoard: ReactNode =
    isAdmin(project) ? (
      <MemberBoard
        handleDeleteClick={handleDeleteClick}
        handleShareClick={handleShareClick}
      />
    ) : undefined;

  const submitButtonContent: ReactNode =
    projectState.isEditMode ? (
      submitInProgress ? ProgressSpinner : l10n(Text.submit, language)
    ) : l10n(Text.edit, language);

  const cancelButton: ReactNode = projectState.isEditMode ? (
    <CancelButton onClick={handleCancel} disabled={submitInProgress}>
      {l10n(Text.cancel, language)}
    </CancelButton>
  ) : undefined;

  return (
    <Root>
      <TabTitleWrapper>
        <TabTitle>{l10n(Text.title, language)}</TabTitle>
        <DateTextWrapper>
          <DateText>{l10n(Text.createdAt, language)}: {getFormattedDateWithTimezone(project.createdAt)}</DateText>
          <DateText>{l10n(Text.updatedAt, language)}: {getFormattedDateWithTimezone(project.updatedAt)}</DateText>
        </DateTextWrapper>
      </TabTitleWrapper>
      <TopWrapper>
        {projectInfo}
        <LogoImage image={logo} data-testid='project-logoimage'>
          {projectState.isEditMode ? logoUploadButton : null}
        </LogoImage>
      </TopWrapper>
      <ButtonsWrapper>
        {cancelButton}
        <SubmitButton onClick={handleSubmit} disabled={submitInProgress}>
          {submitButtonContent}
        </SubmitButton>
      </ButtonsWrapper>
      <ApiDetector
        status={patchStatus}
        onSuccess={handlePatchSuccess}
        onError={handlePatchError}
      />
      {memberBoard}
    </Root>
  );
};
export default withL10n(ProjectManageTab);
