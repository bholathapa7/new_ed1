import _ from 'lodash-es';
import React, { FC, KeyboardEvent, FormEvent, MouseEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import ContentInfoSvg from '^/assets/icons/contents-list/content-info.svg';
import QuestionMarkSvg from '^/assets/icons/question-mark.svg';
import { ContentsListItem, HorizontalDivider } from '^/components/atoms/ContentsListItem';
import SingleSlider from '^/components/atoms/SingleSlider';
import WrapperHoverable, { Props as WrapperHoverableProps } from '^/components/atoms/WrapperHoverable';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { DISABLED_CONTENT_OPACITY, FontFamily } from '^/constants/styles';
import { UseL10n, UseState, useL10n } from '^/hooks';
import { ChangeIn3D, ChangeIn3DPointCloud } from '^/store/duck/Pages';
import * as T from '^/types';
import { getSingleContentId } from '^/utilities/state-util';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { PatchContent, UpdateContentConfig, contentsSelector, RequestLasReprocessing } from '../../../store/duck/Contents';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import { Fallback } from './fallback';
import Text, { LINK_CUSTOM_TAG } from './text';

const MIN_NUMBER_OF_POINTS: number = 1;
const MAX_NUMBER_OF_POINTS: number = 20;
const MIN_SIZE_OF_POINT: number = 0.5;
const MAX_SIZE_OF_POINT: number = 3;
const SIZE_OF_POINT_STEP: number = 0.01;

enum PointConfigType {
  NUMBER_OF_POINTS = 'number_of_points',
  SIZE_OF_POINT = 'size_of_point',
}

export const HorizontalNarrowDivider = styled(HorizontalDivider)({
  marginTop: '20px',
  marginBottom: '20px',
});

export const HorizontalFooterDivider = styled(HorizontalDivider)({
  marginTop: '20px',
  marginBottom: '15px',
});

const SizeOfPointWrapper = styled.div<{ isHidden?: boolean }>(({ isHidden = false }) => ({
  display: isHidden ? 'none' : 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'flex-start',
}));

const SizeOfPointSlider = styled.div({
  width: '256px',
  height: '11px',
  clear: 'both',
  paddingTop: '13px',
});

const NumberOfPointText = styled.div<{ isDisabled: boolean }>(({ isDisabled }) => ({
  opacity: isDisabled ? DISABLED_CONTENT_OPACITY : 1,
  fontSize: '13px',
  fontWeight: 'bold',
  color: dsPalette.title.toString(),
}));

const InputWrapper = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-end',
  justifyItems: 'flex-start',
  paddingTop: '11px',
});

const TitleWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
});

const NumberOfPointInMilLabel = styled.input.attrs({
  'data-testid': 'numberofpoints-label',
})({
  display: 'inline-block',
  boxSizing: 'border-box',
  width: '65px',
  height: '29px',
  padding: '10px',
  marginRight: '3px',
  borderRadius: '5px',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: palette.ContentsList.inputBorder.toString(),
  fontSize: '12px',
  fontFamily: FontFamily.ROBOTO,
  fontWeight: 500,
  color: 'var(--color-theme-primary)',
  textAlign: 'center',
});
NumberOfPointInMilLabel.displayName = 'numberofpoints';

const SizeOfPointLabel = styled.input.attrs({
  'data-testid': 'sizeofpoints-label',
})({
  display: 'inline-block',
  float: 'right',
  boxSizing: 'border-box',
  width: '65px',
  height: '29px',
  padding: '10px',
  marginRight: '6px',
  borderRadius: '5px',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: palette.ContentsList.inputBorder.toString(),
  fontSize: '12px',
  fontFamily: FontFamily.ROBOTO,
  fontWeight: 500,
  color: 'var(--color-theme-primary)',
  textAlign: 'center',
});
SizeOfPointLabel.displayName = 'sizeofpoints';

const Unit = styled.div<{ isDisabled: boolean }>(({ isDisabled }) => ({
  opacity: isDisabled ? DISABLED_CONTENT_OPACITY : 1,
  height: '13px',
  marginBottom: '3px',
  fontSize: '13px',
  fontFamily: FontFamily.ROBOTO,
  color: dsPalette.typePrimary.toString(),
}));

const RequestReprocessingContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  '& span': {
    color: dsPalette.typePrimary.toString(),
    fontSize: '11px',
    wordBreak: 'keep-all',
    lineHeight: '17px',
  },
  '& a': {
    fontWeight: 'bold',
    color: dsPalette.themePrimary.toString(),
  },
});

const ReprocessingInProgressContainer = styled.div({
  display: 'flex',
});

const ReprocessingInProgressIconContainer = styled.div({
  marginRight: '3px',
  '& > svg' :{
    fill: palette.ContentsList.balloonHeaderIconGray.toString(),
  },
});

function getCustomStyleFor(type: PointConfigType): WrapperHoverableProps['customStyle'] {
  const isSizeOfPoint: boolean = type === PointConfigType.SIZE_OF_POINT;

  return {
    tooltipWrapperStyle: {
      position: 'relative',

      display: 'inline-block',
      marginLeft: '3px',
    },
    tooltipBackgroundStyle: {
      borderRadius: '6px',
      backdropFilter: 'blur(3px)',
    },
    tooltipBalloonStyle: {
      bottom: '-45px',
      left: isSizeOfPoint ? '-92px' : '-120px',

      width: isSizeOfPoint ? '242px' : '268px',
      maxWidth: 'unset',
    },
    tooltipTextTitleStyle: {
      height: '33px',

      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',

      lineHeight: '1.58',

      fontSize: '12px',
      fontWeight: 'normal',
    },
  };
}

interface PointConfig {
  numberOfPointsInMil: number;
  sizeOfPoint: number;
}

interface SelectorState {
  readonly editingContentId: T.ContentsPageState['editingContentId'];
  readonly isInPointcloud: T.ContentsPageState['in3DPointCloud'];
  readonly isIn3D: T.ContentsPageState['in3D'];
}

export interface Props {
  readonly content: T.PointCloudContent;
}

export const RawContentsListPointCloudItem: FC<Props> = ({ content }) => {
  const dispatch: Dispatch = useDispatch();

  const { editingContentId, isInPointcloud, isIn3D }: SelectorState = useSelector((state: T.State) => ({
    editingContentId: state.Pages.Contents.editingContentId,
    isInPointcloud: state.Pages.Contents.in3DPointCloud,
    isIn3D: state.Pages.Contents.in3D,
  }), shallowEqual);
  const isSelected: boolean = useSelector(({ Contents, ProjectConfigPerUser }: T.State) =>
    contentsSelector.isSelected(Contents, ProjectConfigPerUser)(content.id));
  const threeDOrthoId: T.ThreeDOrthoContent['id'] | undefined = useSelector(({ Contents, Pages, ProjectConfigPerUser }: T.State) =>
    getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.THREE_D_ORTHO));
  const is3DOrthoSelected: boolean = useSelector(({ Contents, ProjectConfigPerUser }: T.State) =>
    contentsSelector.isSelected(Contents, ProjectConfigPerUser)(threeDOrthoId));
  const threeDMeshId: T.ThreeDMeshContent['id'] | undefined = useSelector(({ Contents, Pages, ProjectConfigPerUser }: T.State) =>
    getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.THREE_D_MESH));
  const is3DMeshSelected: boolean = useSelector(({ Contents, ProjectConfigPerUser }: T.State) =>
    contentsSelector.isSelected(Contents, ProjectConfigPerUser)(threeDMeshId));

  const [l10n]: UseL10n = useL10n();
  const [pointConfig, setPointConfig]: UseState<PointConfig> = useState(
    content.config?.points !== undefined &&
        content.config?.points.sizeOfPoint !== undefined &&
        content.config?.points.numberOfPointsInMil !== undefined ?
      content.config.points : { sizeOfPoint: MAX_SIZE_OF_POINT, numberOfPointsInMil: MAX_NUMBER_OF_POINTS },
  );

  const isProcessingOrFailed: boolean = contentsSelector.isProcessingOrFailedByContent(content);

  useEffect(() => {
    if (isSelected && !isIn3D) {
      dispatch(PatchContent({
        content: {
          id: content.id,
          config: {
            selectedAt: undefined,
          },
        },
      }));
    }
  }, [isIn3D]);

  useEffect(() => {
    if ((editingContentId !== content.id) || !isSelected) return;
    if (!isIn3D) dispatch(ChangeIn3D({ in3D: true }));
    if (!isInPointcloud) dispatch(ChangeIn3DPointCloud({ in3DPointCloud: true }));
    if (is3DOrthoSelected && threeDOrthoId !== undefined) {
      dispatch(PatchContent({
        content: {
          id: threeDOrthoId,
          config: {
            selectedAt: undefined,
          },
        },
      }));
    }
    if (is3DMeshSelected && threeDMeshId !== undefined) {
      dispatch(PatchContent({
        content: {
          id: threeDMeshId,
          config: {
            selectedAt: undefined,
          },
        },
      }));
    }
  }, [editingContentId]);

  const handleNumberOfPointsChange: (value: number) => void = (value) => {
    const roundedValue: number = _.round(value, 2);
    setPointConfig({ numberOfPointsInMil: roundedValue, sizeOfPoint: pointConfig.sizeOfPoint });
    dispatch(UpdateContentConfig({ contentId: content.id, config: {
      ...content.config,
      type: T.ContentType.POINTCLOUD,
      points: {
        numberOfPointsInMil: roundedValue,
        sizeOfPoint: pointConfig.sizeOfPoint,
      },
    } }));
  };

  const handleSizeOfPointChange: (value: number) => void = (value) => {
    const roundedValue: number = _.round(value, 2);
    setPointConfig({ numberOfPointsInMil: pointConfig.numberOfPointsInMil, sizeOfPoint: roundedValue });
    dispatch(UpdateContentConfig({ contentId: content.id, config: {
      ...content.config,
      type: T.ContentType.POINTCLOUD,
      points: {
        numberOfPointsInMil: pointConfig.numberOfPointsInMil,
        sizeOfPoint: roundedValue,
      },
    } }));
  };

  const handleSizeOfPointInputChange: (event: FormEvent<HTMLInputElement>) => void = (event) => {
    const input: number = parseFloat(event.currentTarget.value);
    let roundedValue: number = isNaN(input) || input < MIN_SIZE_OF_POINT || input > MAX_SIZE_OF_POINT ?
      MIN_SIZE_OF_POINT : _.round(parseFloat(event.currentTarget.value), 2);

    if (input > MAX_SIZE_OF_POINT) roundedValue = MAX_SIZE_OF_POINT;
    setPointConfig({ numberOfPointsInMil: pointConfig.numberOfPointsInMil, sizeOfPoint: roundedValue });
  };

  const handleNumberOfPointsInputChange: (event: FormEvent<HTMLInputElement>) => void = (event) => {
    const input: number = parseFloat(event.currentTarget.value);
    let roundedValue: number = isNaN(input) || input < MIN_NUMBER_OF_POINTS || input > MAX_NUMBER_OF_POINTS ?
      MIN_NUMBER_OF_POINTS : _.round(parseFloat(event.currentTarget.value), 2);

    if (input > MAX_NUMBER_OF_POINTS) roundedValue = MAX_NUMBER_OF_POINTS;
    setPointConfig({ numberOfPointsInMil: roundedValue, sizeOfPoint: pointConfig.sizeOfPoint });
  };

  const handleBlur: () => void = () => {
    const { numberOfPointsInMil, sizeOfPoint }: PointConfig = pointConfig;
    let newPointConfig: PointConfig;
    newPointConfig = {
      numberOfPointsInMil, sizeOfPoint,
    };
    if (isNaN(numberOfPointsInMil) || numberOfPointsInMil < 0) {
      newPointConfig = {
        numberOfPointsInMil: MIN_NUMBER_OF_POINTS,
        sizeOfPoint,
      };
    }
    if (isNaN(sizeOfPoint) || sizeOfPoint < 0) {
      newPointConfig = {
        numberOfPointsInMil,
        sizeOfPoint: MIN_SIZE_OF_POINT,
      };
    }

    setPointConfig(newPointConfig);
    dispatch(UpdateContentConfig({ contentId: content.id, config: {
      ...content.config,
      type: T.ContentType.POINTCLOUD,
      points: newPointConfig,
    } }));

    dispatch(PatchContent({ content: { id: content.id, config: { type: T.ContentType.POINTCLOUD, points: pointConfig } } }));
  };

  const handleKeyUp: (event: KeyboardEvent<HTMLInputElement>) => void = (event) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };

  const handleMouseUp: () => void = () => {
    dispatch(PatchContent({ content: { id: content.id, config: { type: T.ContentType.POINTCLOUD, points: pointConfig } } }));
  };

  const sizeOfPointInput: ReactNode = (<>
    <SizeOfPointLabel
      value={pointConfig.sizeOfPoint}
      onChange={handleSizeOfPointInputChange}
      onBlur={handleBlur}
      onKeyUp={handleKeyUp}
      disabled={isProcessingOrFailed}
    />
  </>);

  const numberOfPointsInput: ReactNode = (<>
    <SizeOfPointLabel
      value={pointConfig.numberOfPointsInMil}
      onChange={handleNumberOfPointsInputChange}
      onBlur={handleBlur}
      onKeyUp={handleKeyUp}
      disabled={isProcessingOrFailed}
    />
    <Unit isDisabled={isProcessingOrFailed}>{l10n(Text.unit)}</Unit>
  </>);

  const questionMark: ReactNode = (
    <WrapperHoverable
      title={l10n(Text.sizeOfPointTooltip)}
      customStyle={getCustomStyleFor(PointConfigType.SIZE_OF_POINT)}
    >
      <QuestionMarkSvg />
    </WrapperHoverable>
  );

  const requestProcessing: (e: MouseEvent) => void = (e) => {
    e.preventDefault();

    dispatch(RequestLasReprocessing({ contentId: content.id }));
  };

  const isInPotree = content.info?.engine === T.PointCloudEngine.POTREE;
  const requestReprocessingNote = useMemo(() => {
    if (isInPotree) {
      if (content.status === T.ContentProcessingStatus.READY || content.status === T.ContentProcessingStatus.COMPLETED) {
        const textSplit = l10n(Text.requestReprocessing).split(LINK_CUSTOM_TAG);
        const link = (
          <a href={'#'} onClick={requestProcessing}>{l10n(Text.requestReprocessingLink)}</a>
        );

        return (
          <RequestReprocessingContainer>
            <HorizontalFooterDivider />
            <span>{textSplit[0]}{link}{textSplit[1]}</span>
          </RequestReprocessingContainer>
        );
      }

      return null;
    }

    if (content.status === T.ContentProcessingStatus.PROCESSING) {
      return (
        <RequestReprocessingContainer>
          <HorizontalFooterDivider />
          <ReprocessingInProgressContainer>
            <ReprocessingInProgressIconContainer><ContentInfoSvg /></ReprocessingInProgressIconContainer>
            <span>{l10n(Text.reprocessingInProgress)}</span>
          </ReprocessingInProgressContainer>
        </RequestReprocessingContainer>
      );
    }

    return null;
  }, [isInPotree, content.status, l10n]);

  return (
    <ContentsListItem
      className={CANCELLABLE_CLASS_NAME}
      content={content}
      firstBalloonTitle={l10n(Text.sizeOfPoint)}
      firstBalloonDescription={questionMark}
    >
      <SizeOfPointWrapper>
        <SizeOfPointSlider>
          <SingleSlider
            minValue={MIN_SIZE_OF_POINT}
            maxValue={MAX_SIZE_OF_POINT}
            value={pointConfig.sizeOfPoint}
            onChange={handleSizeOfPointChange}
            onMouseUp={handleMouseUp}
            step={SIZE_OF_POINT_STEP}
            isDisabled={isProcessingOrFailed}
          />
        </SizeOfPointSlider>
        <InputWrapper>
          {sizeOfPointInput}
        </InputWrapper>
      </SizeOfPointWrapper>
      {isInPotree && < HorizontalNarrowDivider />}
      <SizeOfPointWrapper isHidden={!isInPotree}>
        <TitleWrapper>
          <NumberOfPointText isDisabled={isProcessingOrFailed}>
            {l10n(Text.numberOfPoints)}
          </NumberOfPointText>
          <WrapperHoverable
            title={l10n(Text.numberOfPointsTooltip)}
            customStyle={getCustomStyleFor(PointConfigType.NUMBER_OF_POINTS)}
          >
            <QuestionMarkSvg />
          </WrapperHoverable>
        </TitleWrapper>
        <SizeOfPointSlider>
          <SingleSlider
            minValue={MIN_NUMBER_OF_POINTS}
            maxValue={MAX_NUMBER_OF_POINTS}
            value={pointConfig.numberOfPointsInMil}
            onChange={handleNumberOfPointsChange}
            onMouseUp={handleMouseUp}
            isDisabled={isProcessingOrFailed}
          />
        </SizeOfPointSlider>
        <InputWrapper>
          {numberOfPointsInput}
        </InputWrapper>
      </SizeOfPointWrapper>
      {requestReprocessingNote}
    </ContentsListItem >
  );
};

export const ContentsListPointCloudItem: FC<Props> = withErrorBoundary(RawContentsListPointCloudItem)(Fallback);
