import OverlayPositioning from 'ol/OverlayPositioning';
import { Coordinate } from 'ol/coordinate';
import React, { FC, ReactNode, useCallback, useState, ReactText } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled, { CSSObject } from 'styled-components';

import { ContentsListItemTitle as Title } from '^/components/atoms/ContentsListItemTitle';
import { OlCustomPropertyNames } from '^/components/ol/constants';
import { getImperialMeasurementUnitFromGeometryType, getMeasurementUnitFromGeometryType } from '^/components/ol/contentTypeSwitch';
import palette from '^/constants/palette';
import { FontFamily } from '^/constants/styles';
import { UseL10n, UseState, UseUpdateVolume, useIsVolumeOutdated, useL10n, useUpdateVolume } from '^/hooks';
import { SetMarkerPinSelected } from '^/store/duck/Contents';
import { ChangeEditingContent } from '^/store/duck/Pages';
import * as T from '^/types';
import { ContentIcon as RawContentIcon } from '../ContentIcon';
import ContentColor from '../ContentsListItemColor';
import LoadingIcon from '../LoadingIcon';
import OlOverlay from '../OlOverlay';
import { VolumeCalculatedContents } from '../VolumeCalculatedContents';
import Text from './text';
import { determineUnitType } from '^/utilities/imperial-unit';

interface Measurement {
  [key: string]: ReactText;
}
interface ContainerProps {
  readonly isHovering: boolean;
  readonly type: T.MeasurementContent['type'];
}

const comfomfortableTypesIfMarginLeft: Array<T.ContentType> =
  [T.ContentType.LENGTH, T.ContentType.MARKER];

const Container = styled.form<ContainerProps>(({ isHovering, type }) => ({
  position: 'absolute',

  padding: isHovering ? undefined : '8px',
  minWidth: isHovering ? '149px' : undefined,

  display: 'flex',
  justifyContent: isHovering ? undefined : 'center',
  alignItems: isHovering ? undefined : 'center',

  backdropFilter: 'blur(6px)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  boxShadow: palette.OlMeasurementBox.shadow,
  borderRadius: '3px',

  color: palette.OlMeasurementBox.title.toString(),

  fontFamily: FontFamily.NOTOSANS,
  fontSize: 10,
  fontWeight: 'bold',
  fontStretch: 'normal',
  fontStyle: 'normal',
  lineHeight: 'normal',
  letterSpacing: 'normal',
  textAlign: 'center',

  marginLeft: comfomfortableTypesIfMarginLeft.includes(type) ? '15px' : undefined,
}));

const Header = styled.div({
  paddingTop: '8px',
  paddingLeft: '12px',
  paddingRight: '12px',
  paddingBottom: '7px',
  display: 'flex',
  alignItems: 'center',

  fontWeight: 500,
});

const HeaderName = styled.div({
  position: 'relative',
  flex: 1,

  height: '23px',

  margin: '0 5px',
});

const Content = styled.span({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'space-between',
  justifyContent: 'center',

  fontWeight: 'normal',
});

const ContentPart = styled.div({
  padding: '8px 12px 12px 12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexDirection: 'column',
});

const ContentKey = styled.div({
  fontFamily: FontFamily.NOTOSANS,
  fontSize: 10,
  minWidth: 'fit-content',
  fontWeight: 'normal',
  fontStretch: 'normal',
  fontStyle: 'normal',
  lineHeight: 'normal',
  letterSpacing: 'normal',
  color: palette.OlMeasurementBox.title.toString(),
});

const ContentValue = styled.div<{ isMarkerFirstKey: boolean }>(({ isMarkerFirstKey }) => ({
  marginLeft: 'auto',

  fontFamily: FontFamily.ROBOTO,
  fontWeight: 500,
  fontSize: 11,
  fontStretch: 'normal',
  fontStyle: 'normal',
  letterSpacing: 'normal',
  textAlign: 'right',
  color: '#505050',

  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',

  paddingLeft: isMarkerFirstKey ? '12px' : undefined,
}));

const Preview = styled.div({
  maxWidth: '200px',

  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',

});

const ContentIcon = styled(RawContentIcon)({
  width: '16px',
  height: '16px',
  fontSize: '11px',
});

const VolumeWrapper = styled.div({
  padding: '8px 12px 12px 12px',
});

const AnnotationWrapper = styled.section({
  width: '100%',
});


const MeasurementUnit = styled.span({
  fontWeight: 'normal',
});


const Divider = styled.div({
  width: '100%',
  opacity: 0.78,
  borderBottom: `thin solid ${palette.OlMeasurementBox.divider.toString()}`,
});

const ContentKeyValueWrapper = styled.div<{ isMarkerFirstKey: boolean}>(({ isMarkerFirstKey }) => ({
  display: 'flex',
  width: isMarkerFirstKey ? 'max-content' : '100%',
  justifyContent: 'space-around',
}));

const balloonColorCustomStyle: CSSObject = {
  margin: 0,
  zIndex: 1,
};

const VolumeContents: FC<{ content: T.VolumeContent }> = ({ content }) => (
  <VolumeWrapper>
    <VolumeCalculatedContents content={content} />
  </VolumeWrapper>
);

interface ContentPartProps {
  content: T.MeasurementContent;
  measurement?: string | Measurement;
}

const ContentPartContainer: FC<ContentPartProps> = ({ content, measurement }) => {
  const [l10n]: UseL10n = useL10n();

  const {
    projectId,
    projectById,
  } = useSelector((s: T.State) => ({
    projectById: s.Projects.projects.byId,
    projectId: s.Pages.Contents.projectId,
  }));

  if (projectId === undefined) throw new Error(' No Project Id in Pages.Contents.projectId');

  const unitType: T.ValidUnitType = determineUnitType(projectById[projectId].unit);

  const contentKeyValues: ReactNode = l10n(Text.contentKeys[content.type]).map((key: string, idx: number) => {
    const isMarkerFirstKey: boolean = (content.type === T.ContentType.MARKER) && (key === 'Y, X' || key === '위도, 경도');
    const measurementKey: string = isMarkerFirstKey && !isLatLongLabelYX(measurement) ?
      getGivenLatLongLabel(measurement as Measurement) :
      key;

    const unit: string = (unitType === T.UnitType.IMPERIAL) ? (
      getImperialMeasurementUnitFromGeometryType({ geometryType: content.type })
    ) : (
      getMeasurementUnitFromGeometryType({ geometryType: content.type })
    );

    return (
      <ContentKeyValueWrapper isMarkerFirstKey={isMarkerFirstKey} key={`contentkeyvalue-${idx}`} >
        <ContentKey >
          {measurementKey}
        </ContentKey>
        <ContentValue isMarkerFirstKey={isMarkerFirstKey}>
          {getContentValue(measurementKey, measurement)}
          <MeasurementUnit>
            {isMarkerFirstKey ? '' : ` ${unit}`}
          </MeasurementUnit>
        </ContentValue>
      </ContentKeyValueWrapper>
    );
  });

  return (
    <ContentPart>
      {contentKeyValues}
    </ContentPart>
  );
};

const getContentValue: (
  measurementKey: string, measurement?: string | Measurement,
) => (ReactText | ReactNode) = (measurementKey, measurement) => {
  if (measurement === undefined) {
    throw new Error('No measurement passed');
  }

  return typeof measurement === 'string' ?
    measurement :
    measurement[measurementKey]; // Marker
};

const isLatLongLabelYX: (
  measurement?: string | Measurement,
) => boolean = (measurement) => {
  if (measurement === undefined) throw new Error('No Measurement passed');

  return Object.keys(measurement).includes('Y, X');
};

const getGivenLatLongLabel: (
  measurement: Measurement,
) => string = (measurement) => {
  for (const key of Object.keys(measurement)) {
    if (
      !measurement[key].toString().includes('m') &&
      measurement[key].toString().match(/\d+/g)
    ) return key;
  }
  throw new Error('No lat long label detected');
};

function isVolume(content: T.Content): content is T.VolumeContent {
  return content.type === T.ContentType.VOLUME;
}

export interface Props {
  readonly content: T.MeasurementContent;
  readonly measurement?: string | Measurement;
  readonly position: Coordinate;
}

const OlMeasurementBox: FC<Props> = ({
  position, content, measurement,
}) => {
  const dispatch: Dispatch = useDispatch();

  const isVolumeCalcInProgress: boolean = useSelector((state: T.State) =>
    state.Contents.requestVolumeCalculation[content.id]?.status === T.APIStatus.PROGRESS);

  const [isHovering, setIsHovering]: UseState<boolean> = useState<boolean>(false);

  const updateVolume: UseUpdateVolume = useUpdateVolume(content);
  const isVolumeOutdated: boolean = useIsVolumeOutdated(content);

  const handleOnClickMemo: () => void = useCallback(handleOnClick(content.type), [content.type]);
  function handleOnClick(type: string): () => void {
    return () => {
      if (type === T.ContentType.MARKER) {
        dispatch(SetMarkerPinSelected({ contentId: content.id, move: true }));
      }
      dispatch(ChangeEditingContent({ contentId: content.id }));
    };
  }

  const annotationContents: ReactNode =
    isVolume(content) ?
      <VolumeContents content={content} /> :
      <ContentPartContainer content={content} measurement={measurement} />;

  const handleMouseEnter: () => void = useCallback(() => {
    setIsHovering(true);

    if (isVolume(content) && isVolumeOutdated) {
      updateVolume();
    }
  }, [content.type === T.ContentType.VOLUME, isVolumeOutdated, updateVolume]);

  const handleMouseLeave: () => void = useCallback(() => {
    setIsHovering(false);
  }, []);

  const annotation: ReactNode = isHovering ?
    (<AnnotationWrapper onClick={handleOnClickMemo}>
      <Header>
        <ContentIcon contentType={content.type} />
        <HeaderName>
          <Title
            content={content}
            fromUI={T.EditableTextUI.OL_CONTENT_TITLE}
          />
        </HeaderName>
        <ContentColor content={content} balloonColorCustomStyle={balloonColorCustomStyle} />
      </Header>
      <Divider />
      <Content>
        {annotationContents}
      </Content>
    </AnnotationWrapper>) : (
      <Preview>
        {content.title}
      </Preview>
    );

  return (content.type === T.ContentType.VOLUME) && isVolumeCalcInProgress ? (
    <OlOverlay
      positioning={OverlayPositioning.CENTER_CENTER}
      position={position}
    >
      <div className={`${OlCustomPropertyNames.OL_REALTIME_MEASUREMENT_TOOLTIP_CLASSNAME} ${OlCustomPropertyNames.OL_LOADING_TOOLTIP}`}>
        <LoadingIcon />
      </div>
    </OlOverlay>
  ) : (
    <OlOverlay
      positioning={OverlayPositioning.CENTER_CENTER}
      position={position}
      passEvent={isHovering}
      insertFirst={false}
      stopEvent={!isHovering}
      id={content.id}
    >
      <Container
        isHovering={isHovering}
        type={content.type}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {annotation}
      </Container>
    </OlOverlay>
  );
};

export default OlMeasurementBox;
