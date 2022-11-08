import _ from 'lodash-es';
import React, { FC, FormEvent, ReactChild, ReactNode, SyntheticEvent, useEffect, useState } from 'react';
import styled, { CSSObject } from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import ApiDetector from '^/components/atoms/ApiDetector';
import { ConfirmButton as RawConfirmButton } from '^/components/atoms/Buttons';
import RawDDMInput, { Props as InputProp } from '^/components/atoms/DDMInput/1';
import DDMSmallButton from '^/components/atoms/DDMSmallButton';
import { Option } from '^/components/atoms/Dropdown/1';
import RequiredIcon from '^/components/atoms/RequiredIcon';
import RawTitle, { Props as TitleProp } from '^/components/atoms/TitleWithDescription';
import CoordinateSystemDropdown from '^/components/molecules/CoordinateSystemDropdown/1';
import Popup from '^/components/molecules/Popup';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { MediaQuery } from '^/constants/styles';
import * as T from '^/types';
import PlanDropdown from '^/components/molecules/PlanDropdown';
import { projectionSystemLabel } from '^/utilities/coordinate-util';
import Text from './text';
import { useAuthHeader, useL10n, UseL10n, UseState } from '^/hooks';
import { CloseProjectPagePopup, OpenProjectPagePopup } from '^/store/duck/Pages';
import { PostProject } from '^/store/duck/Projects';
import { AuthHeader, makeV2APIURL } from '^/store/duck/API';
import axios, { AxiosResponse } from 'axios';
import { unitLabel } from '^/utilities/imperial-unit';
import UnitDropdown from '^/components/molecules/UnitDropdown';

const popupAlpha: number = 0.45;

const Wrapper = styled.form({
  boxSizing: 'border-box',
  width: '600px',
  padding: '30px',

  [MediaQuery.MOBILE_L]: {
    width: '420px',
  },
  [MediaQuery.MOBILE_S]: {
    width: '360px',
  },
});

const LabelWrapper = styled.div({
  marginBottom: '30px',
});

const TitleLabel = styled(RawTitle)<TitleProp>({
  marginBottom: '10px',
});

const DDMInput = styled(RawDDMInput)<InputProp>({
  marginBottom: '0px',
});

const LogoWrapper = styled.div({
  display: 'flex',
  alignItems: 'flex-start',

  marginTop: '10px',
  marginBottom: '30px',
});

const UploadFileName = styled(RawDDMInput)<InputProp>({
  flexGrow: 1,
});

const UploadButton = styled(DDMSmallButton)({
  marginLeft: '5px',

  '& > input': {
    display: 'none',
  },
});

const ErrorDisplay = styled.div({
  marginTop: '10px',

  fontSize: '13px',
  fontWeight: 'normal',
  color: palette.error.toString(),
});

const CoordinateWrapper = styled.div({
  marginBottom: '30px',
});

const UnitWrapper = styled.div({
  marginBottom: '30px',
});

const PlanWrapper = styled.div({
  marginBottom: '30px',
});

const dropdownButtonStyle: CSSObject = {
  borderColor: palette.border.toString(),
};

interface ConfirmProps {
  error: boolean;
}

const ConfirmButton = styled(RawConfirmButton)<ConfirmProps>(({ error }) => ({
  margin: 'auto',
  display: 'block',
  backgroundColor: error ? palette.ContentsList.itemBackgroundGray.toString() : dsPalette.themePrimary.toString(),
  color: error ? palette.buttonFontColor.toString() : palette.white.toString(),

  ':hover': {
    backgroundColor: error ? palette.ContentsList.itemBackgroundGray.toString() : dsPalette.themePrimaryLighter.toString(),
  },
}));

export interface Props {
  readonly zIndex: number;
}

interface Value {
  readonly planId: T.Project['planId'];
  readonly title: T.Project['title'];
  readonly coordinateSystem: T.Project['coordinateSystem'];
  readonly description: T.Project['description'];
  readonly logo: File | undefined;
  readonly unit: T.ValidUnitType;
}

type Error = Record<keyof Pick<Value, 'title'>, boolean>;

const ProjectAddPopup: FC<Props> = ({
  zIndex,
}) => {
  const [l10n]: UseL10n = useL10n();
  const dispatch: Dispatch = useDispatch();

  const postStatus: T.APIStatus = useSelector((state: T.State) => state.Projects.postProjectStatus);

  const [value, setValue]: UseState<Value> = useState({
    planId: undefined,
    title: '',
    coordinateSystem: T.ProjectionEnum.WGS84_EPSG_4326_LL,
    description: '',
    logo: undefined,
    unit: T.UnitType.METRIC,
  });
  const [error, setError]: UseState<Error> = useState({
    title: false,
  });

  const [planOptions, setPlanOptions]: UseState<Array<Option>> = useState([]);

  const authHeader: AuthHeader | undefined = useAuthHeader();
  useEffect(() => {
    // request API for plans available to user
    const url: string = makeV2APIURL('plans');
    axios.get(url, { headers: authHeader }).then((response: AxiosResponse) => {
      const planOptionData: Array<Option> = response.data.data.map((plan: T.Plan) => ({
        text: `${plan.contractStartAt} - ${plan.contractEndAt} (${plan.planType.name})`,
        value: plan.id,
      }));

      if (planOptionData.length > 1) {
        // IF user has access to more than one active plan, provide dropdown to select
        // which plan the created project will be associated to
        setPlanOptions(planOptionData);
      } else if (planOptionData.length === 1) {
        // IF user has access to ONLY one active plan, set it as the default value
        // right now we focus on automating the plan-association process and don't do any validation yet
        setValue({
          ...value,
          planId: planOptionData[0].value.toString(),
        });
      }
    }).catch((err) => `caught error: ${err.toString()}`);
  },[]);

  const onClose: () => void = () => {
    dispatch(CloseProjectPagePopup());
  };

  const onSuccess: () => void = () => {
    dispatch(OpenProjectPagePopup({ popup: T.ProjectPagePopupType.INVITE }));
  };

  const onError: () => void = () => {
    /**
     * @todo implementing error handling
     */
  };

  const handleSubmit: (event: FormEvent) => void = (event) => {
    event.preventDefault();

    const hasError: boolean = _.reduce(error, (acc, err) => acc || err, false) || value.title === '';

    setError({
      title: value.title === '',
    });

    if (!hasError) {
      dispatch(PostProject({
        project: value,
      }));
    }
  };

  const handleChange: (event: SyntheticEvent<HTMLInputElement>) => void = (event) => {
    const { currentTarget: { name, files, value: targetValue } } = event;
    if (name === 'logo') {
      if (files && files.length && files[0]) {
        setValue((prev) => ({
          ...prev,
          logo: files[0],
        }));
      }
    } else {
      setValue((prev) => ({
        ...prev,
        [name]: targetValue,
      }));

      if (name === 'title') {
        setError({
          title: !value,
        });
      }
    }
  };

  const handleSelectCoordinateSystem: (coordinateSystem: T.ProjectionEnum) => void = (coordinateSystem) => {
    setValue((prev) => ({
      ...prev,
      coordinateSystem,
    }));
  };

  const handleSelectUnit: (unit: T.ValidUnitType) => void = (unit) => {
    setValue((prev) => ({
      ...prev,
      unit,
    }));
  };

  const handleSelectPlan: (planId: string) => void = (planId) => {
    setValue((prev) => ({
      ...prev,
      planId,
    }));
  };

  const buttonContent: ReactNode = postStatus === T.APIStatus.PROGRESS ? (
    <i className='fa fa-pulse fa-spinner' />
  ) : l10n(Text.next);

  const titleLabel: ReactChild = (
    <span>
      {l10n(Text.contentTitle.title)}<RequiredIcon />
    </span>
  );

  const planLabel: ReactChild = (
    <span>
      {l10n(Text.projectPlan.title)}
    </span>
  );

  const coordinateLabel: ReactChild = (
    <span>
      {l10n(Text.contentCoordinate.title)}
      <RequiredIcon />
    </span>
  );

  const unitTypeLabel: ReactChild = (
    <span>
      {l10n(Text.contentUnit.title)}
      <RequiredIcon />
    </span>
  );

  const titleError: ReactNode = error.title ? (
    <ErrorDisplay>
      {l10n(Text.error.title)}
    </ErrorDisplay>
  ) : undefined;

  const planOptionsDropDown: ReactNode = planOptions.length ? (
    <LabelWrapper>
      <label>
        <TitleLabel
          title={planLabel}
          description={l10n(Text.projectPlan.description)}
        />
        <PlanWrapper>
          <PlanDropdown
            value={value.planId}
            options={planOptions}
            onSelect={handleSelectPlan}
            dropdownButtonStyle={dropdownButtonStyle}
          />
        </PlanWrapper>
      </label>
    </LabelWrapper>
  ) : null;

  const coordinateOptions: Array<Option> = Object.keys(projectionSystemLabel).map((c: T.CoordinateSystem) => ({
    text: l10n(projectionSystemLabel[c]),
    value: c,
  }));

  const unitOptions: Array<Option> = Object.keys(unitLabel)
    .map((c: T.ValidUnitType) => ({
      text: l10n(unitLabel[c]),
      value: c,
    }));

  const fileName: string = value.logo ? value.logo.name : '';

  return (
    <Popup
      title={l10n(Text.title)}
      alpha={popupAlpha}
      zIndex={zIndex}
      onCloseClick={onClose}
    >
      <Wrapper onSubmit={handleSubmit}>
        <LabelWrapper>
          <label>
            <TitleLabel
              title={titleLabel}
              description={l10n(Text.contentTitle.description)}
            />
            <DDMInput
              error={error.title}
              name='title'
              type='text'
              onChange={handleChange}
            />
            {titleError}
          </label>
        </LabelWrapper>
        <LabelWrapper>
          <label>
            <TitleLabel
              title={coordinateLabel}
              description={l10n(Text.contentCoordinate.description)}
            />
            <CoordinateWrapper>
              <CoordinateSystemDropdown
                value={value.coordinateSystem}
                options={coordinateOptions}
                onSelect={handleSelectCoordinateSystem}
                dropdownButtonStyle={dropdownButtonStyle}
              />
            </CoordinateWrapper>
          </label>
        </LabelWrapper>
        <LabelWrapper>
          <label>
            <TitleLabel
              title={unitTypeLabel}
              description={l10n(Text.contentUnit.description)}
            />
            <UnitWrapper>
              <UnitDropdown
                value={value.unit}
                options={unitOptions}
                onSelect={handleSelectUnit}
                dropdownButtonStyle={dropdownButtonStyle}
              />
            </UnitWrapper>
          </label>
        </LabelWrapper>
        <LabelWrapper>
          <label>
            <TitleLabel
              title={l10n(Text.contentDescription.title)}
              description={l10n(Text.contentDescription.description)}
            />
            <DDMInput error={false} name='description' type='text' onChange={handleChange} />
          </label>
        </LabelWrapper>
        <TitleLabel
          title={l10n(Text.logo.title)}
          description={l10n(Text.logo.description)}
          subDescription={l10n(Text.logo.subDescription)}
        />
        <LogoWrapper>
          <UploadFileName error={false} readOnly={true} value={fileName} />
          <UploadButton as='label'>
            {l10n(Text.logo.button)}
            <input
              name='logo'
              type='file'
              accept='image/jpeg, image/png'
              onChange={handleChange}
            />
          </UploadButton>
        </LogoWrapper>
        {planOptionsDropDown}
        <ConfirmButton error={!value.title}>
          {buttonContent}
        </ConfirmButton>
        <ApiDetector
          status={postStatus}
          onSuccess={onSuccess}
          onError={onError}
        />
      </Wrapper>
    </Popup>
  );
};

export default ProjectAddPopup;
