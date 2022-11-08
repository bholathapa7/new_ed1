import React, { FC, FormEvent, ReactNode, useEffect, useState, KeyboardEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { ContentsListItem, HorizontalWideDivider } from '^/components/atoms/ContentsListItem';
import { DoubleSlider, DoubleSliderIndex, DoubleSliderValues } from '^/components/atoms/DoubleSlider';
import RainbowHistogram from '^/components/atoms/RainbowHistogram';
import SingleSlider from '^/components/atoms/SingleSlider';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { DISABLED_CONTENT_OPACITY, FontFamily } from '^/constants/styles';
import { UseL10n, UseState, useL10n, useRole } from '^/hooks';
import { PatchContent, UpdateContentConfig, contentsSelector } from '^/store/duck/Contents';
import { ChangeIn3D, ChangeIn3DPointCloud, OpenContentPagePopup } from '^/store/duck/Pages';
import * as T from '^/types';
import { determineUnitType, UNIT_SYMBOL, VALUES_PER_METER } from '^/utilities/imperial-unit';
import { convertPercentToRanged, convertRangedToPercent } from '^/utilities/math';
import { isAllowToggleDSMElevation } from '^/utilities/role-permission-check';
import { getSingleContentId } from '^/utilities/state-util';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import { Fallback } from './fallback';
import Text from './text';

export const contentsListMapItemClassName: string = 'contents-list-map-item';
export const contentsListDsmItemClassName: string = 'contents-list-dsm-item';

const Opacity = styled.div({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'flex-start',

  marginTop: '13px',
});

const OpacityText = styled.div<{ isDisabled: boolean }>(({ isDisabled }) => ({
  opacity: isDisabled ? DISABLED_CONTENT_OPACITY : 1,
  marginBottom: '13px',

  color: 'var(--color-theme-primary)',
  fontFamily: FontFamily.ROBOTO,
  fontSize: '15px',
  fontWeight: 500,
}));

const ElevationWrapper = styled.div({
  display: 'flex',
  justfiyContent: 'space-around',
  alignItems: 'space-around',
  flexDirection: 'column',

  width: '100%',
});

const ElevationText = styled.div({
  fontSize: '13px',
  fontWeight: 'bold',

  color: dsPalette.title.toString(),
});

const HistogramWrapper = styled.div({
  marginTop: '8px',
  marginBottom: '12px',
});

const InputWrapper = styled.div({
  display: 'flex',
  justifyContent: 'space-between',

  paddingTop: '12px',
});

const MinMaxWrapper = styled.div({
  display: 'flex',
  alignItems: 'flex-end',
});

const MinMaxLabel = styled.input({
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

const Unit = styled.div({
  width: '12px',
  height: '13px',

  marginBottom: '2.7px',

  fontSize: '13px',

  fontFamily: FontFamily.ROBOTO,
  lineHeight: 1.31,

  color: dsPalette.title.toString(),
});

interface MinMaxString {
  min: string;
  max: string;
}

interface MinMaxNumber {
  min: number;
  max: number;
}

interface DSM {
  elevationCounts: T.DSMContent['info']['elevation']['counts'] | null;
  minHeight: T.DSMContent['info']['minHeight'] | null;
  maxHeight: T.DSMContent['info']['maxHeight'] | null;
}

export interface Props {
  readonly content: T.MapContent | T.DSMContent;
}

export const RawContentsListMapAndDSMItem: FC<Props> = ({ content }) => {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();
  const role: T.PermissionRole = useRole();

  const [editedHeights, setEditedHeights]: UseState<MinMaxString | undefined> = useState<MinMaxString | undefined>();
  const [percents, setPercents]: UseState<MinMaxNumber> = useState<MinMaxNumber>(
    content.config?.type === T.ContentType.DSM ? content.config.percents : { min: 0, max: 1 },
  );

  const {
    Contents, Pages, Pages: { Contents: { editingContentId, in3D, in3DPointCloud, isPreventAutoSelect } },
    ProjectConfigPerUser,
  }: T.State = useSelector((state: T.State) => state);

  const {
    projectId,
    projectById,
  } = useSelector((s: T.State) => ({
    projectById: s.Projects.projects.byId,
    projectId: s.Pages.Contents.projectId,
  }));

  if (projectId === undefined) throw new Error(' No Project Id in Pages.Contents.projectId');

  const unitType: T.ValidUnitType = determineUnitType(projectById[projectId].unit);

  // eslint-disable-next-line no-magic-numbers
  const opacity: number = content.config?.opacity !== undefined ? content.config.opacity : 100;
  const isDSM: boolean = content.type === T.ContentType.DSM;
  const isSelected: boolean = contentsSelector.isSelected(Contents, ProjectConfigPerUser)(content.id);
  const dsmId: T.DSMContent['id'] | undefined = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.DSM);
  const mapId: T.DSMContent['id'] | undefined = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.MAP);
  const isMapAvailable: boolean = mapId !== undefined;
  const isMapSelected: boolean = contentsSelector.isSelected(Contents, ProjectConfigPerUser)(dsmId);
  const hasUserJustToggledDSMIn3D: boolean = dsmId !== undefined && (editingContentId === dsmId) && isSelected;
  const hasUserJustSelectedDSMIn3D: boolean = isMapAvailable && isMapSelected;

  const shouldMapBeSelected: boolean = !isDSM && !in3D && !isSelected && !hasUserJustToggledDSMIn3D && !hasUserJustSelectedDSMIn3D;
  const shouldDSMBeSelected: boolean = isDSM && !isMapAvailable && !in3D && !isSelected;
  const isProcessingOrFailed: boolean = contentsSelector.isProcessingOrFailedByContent(content);

  useEffect(() => {
    if (in3D && isSelected) {
      dispatch(PatchContent({
        content: {
          id: content.id,
          config: {
            selectedAt: undefined,
          },
        },
      }));
    }
    if (!isPreventAutoSelect && (shouldMapBeSelected || shouldDSMBeSelected)) {
      dispatch(PatchContent({
        content: {
          id: content.id,
          config: {
            selectedAt: new Date(),
          },
        },
      }));
    }
  }, [in3D]);

  useEffect(() => {
    if ((editingContentId !== content.id) || !isSelected) return;
    if (in3D) dispatch(ChangeIn3D({ in3D: false }));
    if (in3DPointCloud) dispatch(ChangeIn3DPointCloud({ in3DPointCloud: false }));
  }, [editingContentId]);

  const { elevationCounts, minHeight, maxHeight }: DSM = content.type === T.ContentType.DSM ? ({
    elevationCounts: content.info.elevation.counts,
    minHeight: content.info.minHeight ? content.info.minHeight * VALUES_PER_METER[unitType] : null,
    maxHeight: content.info.maxHeight ? content.info.maxHeight * VALUES_PER_METER[unitType] : null,
  }) : ({
    elevationCounts: null,
    minHeight: null,
    maxHeight: null,
  });

  const updateContentConfig: (opacity: number, percents: T.DSMConfigPerUser['percents']) => void = (
    newOpacity, newPercents,
  ) => {
    if (isDSM) {
      dispatch(UpdateContentConfig({ contentId: content.id, config: {
        ...content.config,
        type: T.ContentType.DSM,
        opacity: newOpacity,
        percents: newPercents,
      } }));
    } else {
      dispatch(UpdateContentConfig({ contentId: content.id, config: {
        ...content.config,
        type: T.ContentType.MAP,
        opacity: newOpacity,
      } }));
    }
  };

  const patchContent: (opacity: number, percents: T.DSMConfigPerUser['percents']) => void = (
    newOpacity, newPercents,
  ) => {
    if (isDSM) {
      dispatch(PatchContent({ content: { id: content.id, config: { type: T.ContentType.DSM, opacity: newOpacity, percents: newPercents } } }));
    } else {
      dispatch(PatchContent({ content: { id: content.id, config: { type: T.ContentType.MAP, opacity: newOpacity } } }));
    }
  };

  const handleOpacityChange: (opacityValue: number) => void = (opacityValue) => {
    updateContentConfig(opacityValue, percents);
  };

  const handleElevationChange: (values: DoubleSliderValues) => void = (values) => {
    if (isAllowToggleDSMElevation(role)) {
      setPercents({
        min: values[DoubleSliderIndex.FIRST_SLIDER],
        max: values[DoubleSliderIndex.SECOND_SLIDER],
      });

      updateContentConfig(opacity, percents);
    } else {
      dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));
    }
  };

  const handleMinInputChange: (event: FormEvent<HTMLInputElement>) => void = (event) => {
    /**
     * @todo
     * Following conversion should handle invalid user input
     */
    /* istanbul ignore next: following is impossible case */
    if (minHeight === null || maxHeight === null) {
      throw new Error('Error code m/CDII:hMinIC');
    }
    const min: string = event.currentTarget.value;
    const max: string = editedHeights === undefined ? convertPercentToRanged(percents.max, minHeight, maxHeight).toFixed(2) : editedHeights.max;

    setEditedHeights({ min, max });
  };

  const handleMaxInputChange: (event: FormEvent<HTMLInputElement>) => void = (event) => {
    /**
     * @todo
     * Following conversion should handle invalid user input
     */
    /* istanbul ignore next: following is impossible case */
    if (minHeight === null || maxHeight === null) {
      throw new Error('Error code m/CDII:hMaxIC');
    }
    const min: string = editedHeights === undefined ? convertPercentToRanged(percents.min, minHeight, maxHeight).toFixed(2) : editedHeights.min;
    const max: string = event.currentTarget.value;

    setEditedHeights({ min, max });
  };

  const handleBlur: () => void = () => {
    if (editedHeights === undefined) {
      return;
    }

    const min: number = parseFloat(editedHeights.min);
    const max: number = parseFloat(editedHeights.max);

    if (minHeight !== null &&
        maxHeight !== null &&
        !isNaN(min) &&
        !isNaN(max) &&
        max > min) {
      let minPercent: number = convertRangedToPercent(min, minHeight, maxHeight);
      let maxPercent: number = convertRangedToPercent(max, minHeight, maxHeight);

      if (minPercent < 0) {
        minPercent = 0;
      }

      if (maxPercent > 1) {
        maxPercent = 1;
      }

      setPercents({ min: minPercent, max: maxPercent });
      updateContentConfig(opacity, ({ min: minPercent, max: maxPercent }));
      patchContent(opacity, ({ min: minPercent, max: maxPercent }));
    }

    setEditedHeights(undefined);
  };

  const handleKeyUp: (event: KeyboardEvent<HTMLInputElement>) => void = (event) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };

  const handleMouseUp: () => void = () => {
    patchContent(opacity, percents);
  };

  const dsmMinInput: string | null = isDSM ? (
    editedHeights !== undefined ?
      editedHeights.min :
      convertPercentToRanged(percents.min, minHeight as NonNullable<DSM['minHeight']>, maxHeight as NonNullable<DSM['maxHeight']>).toFixed(2)
  ) : null;

  const dsmMaxInput: string | null = isDSM ? (
    editedHeights !== undefined ?
      editedHeights.max :
      convertPercentToRanged(percents.max, minHeight as NonNullable<DSM['minHeight']>, maxHeight as NonNullable<DSM['maxHeight']>).toFixed(2)
  ) : null;

  const histogram: ReactNode = elevationCounts !== null ? (
    <HistogramWrapper>
      <RainbowHistogram
        data={elevationCounts}
        percents={percents}
      />
    </HistogramWrapper>
  ) : null;

  const minMaxInputs: ReactNode = !isDSM ? (
    <MinMaxWrapper>
      <MinMaxLabel value='Unknown' />
      <MinMaxLabel value='Unknown' />
    </MinMaxWrapper>
  ) : (
    <>
      <MinMaxWrapper>
        <MinMaxLabel
          value={dsmMinInput ?? ''}
          onChange={handleMinInputChange}
          onBlur={handleBlur}
          onKeyUp={handleKeyUp}
        />
        <Unit>{UNIT_SYMBOL[unitType]}</Unit>
      </MinMaxWrapper>
      <MinMaxWrapper>
        <MinMaxLabel
          value={dsmMaxInput ?? ''}
          onChange={handleMaxInputChange}
          onBlur={handleBlur}
          onKeyUp={handleKeyUp}
        />
        <Unit>{UNIT_SYMBOL[unitType]}</Unit>
      </MinMaxWrapper>
    </>
  );

  const elevation: ReactNode = isDSM && content.status === T.ContentProcessingStatus.COMPLETED ? (<>
    <HorizontalWideDivider />
    <ElevationWrapper>
      <ElevationText>
        {l10n(Text.elevation)}
      </ElevationText>
      {histogram}
      <DoubleSlider
        min={0}
        max={1}
        gap={0.01}
        /* eslint-disable: @typescript-eslint/strict-boolean-expressions */
        values={[percents.min || 0, percents.max || 1]}
        onChange={handleElevationChange}
        onAfterChange={handleMouseUp}
      />
      <InputWrapper>
        {minMaxInputs}
      </InputWrapper>
    </ElevationWrapper> </>) : undefined;

  return (
    <ContentsListItem
      className={`${CANCELLABLE_CLASS_NAME} ${isDSM ? contentsListDsmItemClassName : contentsListMapItemClassName}`}
      content={content}
      firstBalloonTitle={l10n(Text.firstBalloonTitle)}
    >
      <Opacity>
        <OpacityText isDisabled={isProcessingOrFailed}>
          {opacity.toFixed(0)}%
        </OpacityText>
        <SingleSlider
          minValue={0}
          // eslint-disable-next-line no-magic-numbers
          maxValue={100}
          value={opacity}
          onChange={handleOpacityChange}
          onMouseUp={handleMouseUp}
          isDisabled={isProcessingOrFailed}
        />
      </Opacity>
      {elevation}
    </ContentsListItem >
  );
};

export const ContentsListMapAndDSMItem: FC<Props> = withErrorBoundary(RawContentsListMapAndDSMItem)(Fallback);
