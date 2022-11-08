import { Coordinate } from 'ol/coordinate';
import Draw from 'ol/interaction/Draw';
import { toLonLat } from 'ol/proj';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import CloseSvg from '^/assets/icons/close-new-thin.svg';
import CloseButton from '^/assets/icons/close-new.svg';
import CheckSvg from '^/assets/icons/upload-popup/check.svg';
import UnCheckSvg from '^/assets/icons/upload-popup/uncheck.svg';
import { ConfirmButton as BaseConfirmButton } from '^/components/atoms/Buttons';
import {
  Option as DropdownOption,
  StyleProps as DropdownStyleProps,
} from '^/components/atoms/Dropdown';
import OlDesignDXFBorderLayer, { moveCameraPositionByDesignDxf } from '^/components/atoms/OlDesignDXFBorderLayer';
import olWrap, { OlProps } from '^/components/atoms/OlWrap';
import { getInteraction } from '^/components/ol/OlLengthSegmentOverlays/util';
import { setRootMapCursor } from '^/components/ol/OlMapEventListeners/OlDrawEventListener';
import { useLoadingLayer } from '^/components/ol/OlMapEventListeners/useLoadingLayer';
import { DesignDxfStyleParam } from '^/components/ol/styles';
import { DesignDXFDropdown } from '^/components/organisms/DesignDXFDropdown';
import { DEFAULT_MEASUREMENT_TEXT } from '^/constants/defaultContent';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { LayerGroupZIndex, OutsideMap } from '^/constants/zindex';
import { UseL10n, UseLastSelectedScreen, UseState, useL10n, useLastSelectedScreen } from '^/hooks';
import { CreateAndEditMeasurement, contentsSelector } from '^/store/duck/Contents';
import {
  ChangeCreatingVolume,
  ChangeCurrentContentTypeFromAnnotationPicker,
  CloseContentPageMapPopup,
} from '^/store/duck/Pages/Content';
import * as T from '^/types';
import { getOrderedTitle } from '^/utilities/annotation-content-util';
import { getMeasurementContentTitlesFromDate } from '^/utilities/content-util';
import { isMobile } from '^/utilities/device';
import Text from './text';

const FEATURE_STROKE_WIDTH: number = 2;
const FEATURE_FILL_ALPHA: number = 0.3;

const sampleVolumeLayerStyle: DesignDxfStyleParam = {
  color: palette.measurements[T.ContentType.VOLUME],
  strokeWidth: FEATURE_STROKE_WIDTH,
  fillAlpha: FEATURE_FILL_ALPHA,
};

const BackgroundClose = styled.div({
  position: 'absolute',
  right: '100px',
  top: '50px',
  width: '31px',
  height: '31px',

  zIndex: 1,

  cursor: 'pointer',
});

const Popup = styled.div({
  position: 'absolute',

  top: '45px',
  left: '100px',
  width: '200px',
  borderRadius: '5px',
  // eslint-disable-next-line no-magic-numbers
  backgroundColor: palette.white.alpha(0.76).toString(),
  // eslint-disable-next-line no-magic-numbers
  boxShadow: `0 0 18px 0 ${palette.black.alpha(0.5)}`,
  backdropFilter: 'blur(6px)',
  zIndex: OutsideMap.SBVC_DBVC_POPUP,

  cursor: 'default',

  padding: '20px',
});

const Close = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',

  transform: 'translate(10px, -10px)',
  height: 0,
  '> svg': {
    transform: 'scale(1.5)',
    '> path': {
      fill: palette.black.toString(),
    },
    ':hover': {
      cursor: 'pointer',
    },
  },
});

const Title = styled.div({
  lineHeight: 1.3,
  fontSize: '13px',
  fontWeight: 'bold',
  color: palette.ContentsList.title.toString(),
});

const Content = styled.div({});
const DropdownWrapper = styled.div({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '37px',
  marginTop: '10px',

  '> span': {
    height: '12px',
    fontSize: '12px',
    fontWeight: 500,
    color: palette.font.toString(),
  },
  '> div': {
    width: '100%',
  },
});

const CheckboxWrapper = styled.div({
  marginTop: '10px',

  display: 'flex',
  alignItems: 'flex-start',
  width: '100%',

  fontSize: '11px',
  fontWeight: 500,
  lineHeight: 1.27,
  color: dsPalette.title.toString(),

  cursor: 'pointer',
  letterSpacing: '-0.3px',
  '> div' : {
    transform: 'scale(0.6875)',
    marginRight: '5px',
    '> svg': {
      '> path': {
        fill: dsPalette.title.toString(),
      },
      '> g > path:first-child': {
        fill: dsPalette.title.toString(),
      },
    },
  },
});

const dropdownStyle: DropdownStyleProps = {
  rootStyle: {
    width: '100%',
    height: '37px',
    borderRadius: '6px',
    // eslint-disable-next-line no-magic-numbers
    boxShadow: `0 2px 4px 0 ${palette.black.alpha(0.29).toString()}`,
  },
};

const ButtonWrapper = styled.div({
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '10px',
});

const ConfirmButton = styled(BaseConfirmButton)({
  width: '92px',
  height: '29px',
  borderRadius: '4px',
  fontSize: '12px',
});

const AnnotationGuideToast = styled.div({
  position: 'absolute',
  bottom: '79px',
  borderRadius: '5px',
  padding: '14px',
  backdropFilter: 'blur(5px)',
  // eslint-disable-next-line no-magic-numbers
  backgroundColor: palette.black.alpha(0.52).toString(),
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 1,

  '> span': {
    fontSize: '14px',
    height: '15px',
    color: palette.white.toString(),
    fontWeight: 500,
  },
});

export interface Props {
  zIndex: number;
}

export const DBVCPopup: FC<OlProps<Props>> = ({
  map, layerGroup,
}) => {
  const {
    Contents: { contents: { byId, allIds } },
    Pages: { Contents: { projectId, creatingVolumeInfo, currentContentTypeFromAnnotationPicker } },
  }: T.State = useSelector((state: T.State) => state);
  const [isEntireDesignCalculation, setIsEntireDesignCalculation]: UseState<boolean> = useState(false);
  const lastSelectedScreen: UseLastSelectedScreen = useLastSelectedScreen();
  /**
   * @desc This for the useLoadingLayer
   */
  const [coordinatesSentToServer, setCoordinatesSentToServer]: UseState<Array<Coordinate> | undefined> = useState();

  const latestDesignDxfId: T.DesignDXFContent['id'] =
    allIds
      .map((id) => byId[id])
      .filter((content) => content.type === T.ContentType.DESIGN_DXF && !contentsSelector.isProcessingOrFailedByContent(content))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].id;
  const [designDxfId, setDesignDxfId]: UseState<T.DesignDXFContent['id'] | undefined> =
    useState(latestDesignDxfId);
  const [l10n]: UseL10n = useL10n();
  const dispatch: Dispatch = useDispatch();

  useEffect(() => {
    dispatch(ChangeCreatingVolume({ info: { designDxfId } }));

    return () => {
      getInteraction(map, Draw)?.setActive(true);
    };
  }, []);

  const checkBox: ReactNode = isEntireDesignCalculation ? <CheckSvg /> : <UnCheckSvg />;

  const commonExitFunc: () => void = () => {
    dispatch(ChangeCreatingVolume({}));
    dispatch(CloseContentPageMapPopup());
    dispatch(ChangeCurrentContentTypeFromAnnotationPicker({}));
  };

  const handleOnCheckClick: () => void = () => {
    setIsEntireDesignCalculation((prev) => !prev);
  };

  useLoadingLayer({
    currentContentTypeFromAnnotationPicker,
    olMap: map,
    layerGroup,
    coordinatesSentToServer,
    setCoordinatesSentToServer,
  });

  useEffect(() => {
    moveCameraPositionByDesignDxf(byId[designDxfId] as T.DesignDXFContent, map);
  }, [designDxfId]);

  useEffect(() => {
    getInteraction(map, Draw)?.setActive(!isEntireDesignCalculation);
    setRootMapCursor(map, isEntireDesignCalculation ? 'auto' : 'crosshair');
  }, [isEntireDesignCalculation]);

  const handleDropdownSelect: (item: DropdownOption) => void = (item) => {
    const contentId: number = item.value as number;
    /**
     * @desc Notify to redux
     */
    dispatch(ChangeCreatingVolume({ info: { designDxfId: contentId } }));
    setDesignDxfId(contentId);
  };

  const handleDropdownItemMouseEnter: (item: DropdownOption, index: number) => void = (item) => {
    const value: number = item.value as number;
    setDesignDxfId(value);
  };

  const handleCalculationButtonClick: () => void = () => {
    if (designDxfId === undefined) return;
    if (projectId === undefined) return;

    const designDxfContent: T.DesignDXFContent = byId[designDxfId] as T.DesignDXFContent;
    const contentTitlesShownOnCurrentDate: Array<string> = getMeasurementContentTitlesFromDate(byId, lastSelectedScreen?.appearAt);

    const designBorderToEPSG3857: Array<T.GeoPoint> = designDxfContent.info.designBorder.map((point) => toLonLat(point));

    dispatch(CreateAndEditMeasurement({
      data: {
        title: getOrderedTitle(l10n(DEFAULT_MEASUREMENT_TEXT.volume.title), contentTitlesShownOnCurrentDate),
        color: palette.measurements[T.ContentType.VOLUME],
        type: T.ContentType.VOLUME,
        info: {
          locations: designBorderToEPSG3857,
          calculatedVolume: {
            calculation: {
              type: T.VolumeCalcMethod.DESIGN,
              volumeAlgorithm: T.BasicCalcBasePlane.CUSTOM,
              volumeElevation: 0,
              designDxfId,
            },
            cut: 0, fill: 0, total: 0,
          },
        },
      },
    }));
    setCoordinatesSentToServer(designBorderToEPSG3857);
    dispatch(ChangeCreatingVolume({}));
    commonExitFunc();
  };

  const calculationButton: ReactNode = isEntireDesignCalculation ? (
    <ButtonWrapper>
      <ConfirmButton onClick={handleCalculationButtonClick}>
        {l10n(Text.calculation)}
      </ConfirmButton>
    </ButtonWrapper>
  ) : undefined;

  const designDxfBoundaryLayer: ReactNode = designDxfId !== undefined ? (
    <OlDesignDXFBorderLayer
      designDxfId={designDxfId}
      zIndex={LayerGroupZIndex.DESIGN_DXF_BOUNDARY}
      hasOutsideBlur={true}
    />
  ) : undefined;

  const sampleVolumeLayer: ReactNode = isEntireDesignCalculation && designDxfId !== undefined ? (
    <OlDesignDXFBorderLayer
      designDxfId={designDxfId}
      zIndex={LayerGroupZIndex.VOLUME}
      isBoundaryFilled={true}
      featureStyle={sampleVolumeLayerStyle}
    />
  ) : undefined;

  const annotaionGuideToast: ReactNode = !creatingVolumeInfo?.isDrawing && !isEntireDesignCalculation ? (
    <AnnotationGuideToast>
      <span>
        {l10n(Text.annotationGuide)}
      </span>
    </AnnotationGuideToast>
  ) : undefined;

  const popup: ReactNode = (
    <Popup>
      <Close onClick={commonExitFunc}>
        <CloseButton />
      </Close>
      <Title>
        {l10n(Text.title)}
      </Title>
      <Content>
        <DropdownWrapper>
          <DesignDXFDropdown
            onSelect={handleDropdownSelect}
            onDropdownItemMouseEnter={handleDropdownItemMouseEnter}
            isSearchEnabled={true}
            defaultValue={designDxfId}
            dropdownStyle={dropdownStyle}
            isDisabled={creatingVolumeInfo?.isDrawing}
          />
        </DropdownWrapper>
        <CheckboxWrapper
          onClick={handleOnCheckClick}
        >
          <div>
            {checkBox}
          </div>
          <span>
            {l10n(Text.label)}
          </span>
        </CheckboxWrapper>
        {calculationButton}
      </Content>
    </Popup>
  );

  const draggablePopup: ReactNode = isMobile() ? (
    <>
      {popup}
    </>
  ) : (
    <Draggable>
      {popup}
    </Draggable>
  );

  return (
    <>
      {annotaionGuideToast}
      <BackgroundClose onClick={commonExitFunc}>
        <CloseSvg />
      </BackgroundClose>
      {draggablePopup}
      {designDxfBoundaryLayer}
      {sampleVolumeLayer}
    </>
  );
};

export default olWrap(DBVCPopup);
