import React, { FC, useCallback, useState, useEffect, useMemo, ReactElement, useContext } from 'react';
import { usePDF } from '@react-pdf/renderer';
import { Dispatch } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import { LineString, Polygon } from 'ol/geom';
import styled, { CSSObject } from 'styled-components';
import html2canvas from 'html2canvas';
import { Cartesian3, Event } from 'cesium';

import Popup from '^/components/molecules/Popup';
import {
  QueryScreenWithContentId,
  useGetScreenOf,
  useL10n,
  UseL10n,
  useLastSelectedScreen,
  UseLastSelectedScreen,
  UseState,
} from '^/hooks';
import Text from './text';
import { CloseContentPagePopup } from '^/store/duck/Pages';
import dsPalette from '^/constants/ds-palette';
import * as T from '^/types';
import { UseAuthedUser, useAuthedUser } from '^/hooks/useAuthedUser';
import Report, { Data } from '^/components/pdf/Report';
import { MediaQuery } from '^/constants/styles';
import { ConfirmButton } from '^/components/atoms/Buttons';
import LoadingIcon from '^/components/atoms/LoadingIcon';
import palette from '^/constants/palette';
import { tryCatch, TryCatchOutput } from '^/utilities/async-util';
import { ApplyOptionIfKorean, formatWithOffset, GetCommonFormat } from '^/utilities/date-format';
import { defaultCoordinateSystem, projectionSystemLabel } from '^/utilities/coordinate-util';
import { UseCurrentProject, useCurrentProject } from '^/hooks/useCurrentProject';
import { contentsSelector } from '^/store/duck/Contents';
import {
  createGeometryFromLocations,
  getImperialMeasurementFromGeometry,
  getImperialMeasurementUnitFromGeometryType,
  getMeasurementFromGeometry,
  getMeasurementUnitFromGeometryType,
} from '^/components/ol/contentTypeSwitch';
import { volumeAlgorithmLabel } from '^/utilities/volume-util';
import { CesiumContext, CesiumContextProps } from '^/components/cesium/CesiumContext';
import { isAvailablePointToPoint } from '^/components/cesium/cesium-util';
import angelswingLogo from '^/assets/logo.png';
import { calculateArea, calculateVolume, determineUnitType, UNIT_SYMBOL, VALUES_PER_METER } from '^/utilities/imperial-unit';

const popupAlpha: number = 0.45;

const headerStyle: CSSObject = {
  padding: '45px 50px 0',
};

const loadingDivCustomStyle: CSSObject = {
  width: '14px',
  height: '14px',
  marginRight: '10px',
  border: `2px solid ${palette.gray.toString()}`,
  borderTop: `2px solid ${dsPalette.themePrimary.toString()}`,
};

const Wrapper = styled.div({
  maxWidth: '313px',
  padding: '24px 50px 35px',

  [MediaQuery[T.Device.MOBILE_L]]: {
    width: '360px',
  },
  [MediaQuery[T.Device.MOBILE_S]]: {
    width: '340px',
  },
});

const Description = styled.div({
  color: dsPalette.typePrimary.toString(),
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '23px',
  wordBreak: 'keep-all',
});

const ButtonWrapper = styled.div({
  display: 'flex',
  justifyContent: 'left',
  marginTop: '30px',

  '& > button': {
    height: '47px',
    width: '100%',
    padding: 0,
    fontWeight: 500,
    fontSize: '15px',
  },
});

const SubmitButton = styled(ConfirmButton)(({ isDisabled }) => ({
  ...(isDisabled ? ({
    color: dsPalette.typePrimary.toString(),
    backgroundColor: palette.pdf.disabledBackground.toString(),
    opacity: 1,
    '&:hover': {
      backgroundColor: palette.pdf.disabledBackground.toString(),
    },
  }) : null),
}));

const Loading = styled.div({
  display: 'flex',
  justifyContent: 'center',
  lineHeight: 1,
});

const Link = styled.a({
  display: 'flex',
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  color: palette.white.toString(),
  textDecorationLine: 'none',
  '&:hover': {
    textDecorationLine: 'none',
  },
});

const REPORT_FILE_NAME = 'Measurement-Report.pdf';
const NOT_APPLICABLE_CHAR = '—';
const VOLUME_CUSTOM_UNIT = 'm';

export interface Props {
  readonly zIndex: number;
}

const ReportDownloadPopup: FC<Props> = ({ zIndex }) => {
  const dispatch: Dispatch = useDispatch();
  const [l10n, lang]: UseL10n = useL10n();

  const [IsScreenBeingCaptured, setIsScreenBeingCaptured]: UseState<boolean> = useState(false);
  const [image, setImage]: UseState<string> = useState('');
  const in3D: T.ContentsPageState['in3D'] = useSelector((state: T.State) => state.Pages.Contents.in3D);
  const { viewer }: CesiumContextProps = useContext(CesiumContext);

  const handle3DCameraClick: () => void = () => {
    const removePostRender: Event.RemoveCallback | undefined =
      viewer?.scene.postRender.addEventListener(async () => {
        removePostRender?.();
        const view: Element | null = document.getElementsByClassName('cesium-viewer')[0];

        const { data, error }: TryCatchOutput<HTMLCanvasElement> = await tryCatch(html2canvas(view as HTMLElement, {
          allowTaint: true,
          useCORS: true,
        }));

        if (!error && data) {
          setImage(data.toDataURL());
        }
      });
    viewer?.scene.requestRender();
  };

  const handle2DCameraClick: () => void = async () => {
    const view: HTMLElement | null = document.getElementById('as-ol-view-wrapper');
    if (view === null) return;

    const { data, error }: TryCatchOutput<HTMLCanvasElement> = await tryCatch(html2canvas(view, {
      allowTaint: true,
      useCORS: true,
    }));

    if (!error && data) {
      setImage(data.toDataURL());
    }
  };

  useEffect(() => {
    if (in3D) handle3DCameraClick();
    else handle2DCameraClick();
  }, []);

  const onClose: () => void = useCallback(() => {
    dispatch(CloseContentPagePopup());
  }, []);

  const currentProject: UseCurrentProject = useCurrentProject();
  const lastSelectedScreen: UseLastSelectedScreen = useLastSelectedScreen();
  const authedUser: UseAuthedUser = useAuthedUser();
  const getScreenOfContentId: QueryScreenWithContentId = useGetScreenOf(T.ScreensQueryParam.CONTENT_ID);

  if (currentProject === undefined || lastSelectedScreen === undefined || authedUser === undefined) return null;

  const contentsById = useSelector((state: T.State) => state.Contents.contents.byId);
  const selectedMeasurementContents: T.Content[] = useSelector(
    ({ Contents, ProjectConfigPerUser }: T.State) =>
      Contents.contents.allIds.filter((contentId) => {
        const content = Contents.contents.byId[contentId];

        return (content.screenId === undefined || content.screenId === ProjectConfigPerUser.config?.lastSelectedScreenId)
          && contentsSelector.isSelected(Contents, ProjectConfigPerUser)(contentId) && T.MeasurementContentTypes.includes(content.type);
      }).map((contentId) => Contents.contents.byId[contentId])
  );

  const screenAppearDate = formatWithOffset(
    0,
    lastSelectedScreen.appearAt,
    GetCommonFormat({ lang, hasDay: true }),
    ApplyOptionIfKorean(lang),
  );
  const dataset = `${screenAppearDate} | ${lastSelectedScreen?.title}`;

  const needsCustomization: boolean = useSelector((state: T.State) => !!state.PlanConfig.config?.slug);

  const customPlanLogoUrl: T.PlanConfig['navbarLogoUrl'] = useSelector((state: T.State) => state.PlanConfig.config?.navbarLogoUrl);

  const customPlanCompanyName: T.PlanConfig['companyName'] = useSelector((state: T.State) => state.PlanConfig.config?.companyName);

  const logo = needsCustomization ? customPlanLogoUrl : angelswingLogo;
  const companyName = needsCustomization ? customPlanCompanyName : l10n(Text.angelswing);

  const frame: Data['frame'] = {
    url: `${window.location.origin}/project/${currentProject.id}/content`,
    dataset,
    logo,
    companyName,
  };

  const project: Data['project'] = {
    title: currentProject.title,
    dataset,
    projectCreatedDate: formatWithOffset(
      0,
      currentProject.createdAt,
      GetCommonFormat({ lang, hasDay: true }),
      ApplyOptionIfKorean(lang),
    ),
    reportCreatedDate: formatWithOffset(
      0,
      new Date(),
      GetCommonFormat({ lang, hasDay: true }),
      ApplyOptionIfKorean(lang),
    ),
    userName: lang === T.Language.KO_KR ?
      `${authedUser.lastName} ${authedUser.firstName}` :
      `${authedUser.firstName} ${authedUser.lastName}`,
    coordinate: l10n(projectionSystemLabel[currentProject.coordinateSystem ?? defaultCoordinateSystem]),
    description: currentProject.description,
    logo: currentProject.logo,
  };

  const photo: Data['photo'] = { image };

  const {
    projectId,
    projectById,
  } = useSelector((s: T.State) => ({
    projectById: s.Projects.projects.byId,
    projectId: s.Pages.Contents.projectId,
  }));

  if (projectId === undefined) throw new Error(' No Project Id in Pages.Contents.projectId');

  const unitType: T.ValidUnitType = determineUnitType(projectById[projectId].unit);

  const measurement: Data['measurement'] = useMemo(() => ({
    [T.ContentType.MARKER]: selectedMeasurementContents.filter((c) => c.type === T.ContentType.MARKER).map((c: T.MarkerContent) => {
      const { color, title, info } = c;
      const { elevationInfo } = info;
      return [
        color.hex(),
        title,
        (!elevationInfo || !elevationInfo.value) ?
          NOT_APPLICABLE_CHAR :
          `${elevationInfo.value * VALUES_PER_METER[unitType]} ${UNIT_SYMBOL[unitType]}`,
        info.location[0],
        info.location[1],
      ];
    }),
    [T.ContentType.LENGTH]: selectedMeasurementContents.filter((c) => c.type === T.ContentType.LENGTH).map((c: T.LengthContent) => {
      const { color, title, info, type } = c;
      const { metrics } = info;

      const distance: string = (() => {
        const len: LineString = createGeometryFromLocations({
          locations: info.locations, geometryType: type }
        ) as LineString;

        return (unitType === T.UnitType.IMPERIAL) ?
          getImperialMeasurementFromGeometry({ geometry: len, geometryType: c.type }) :
          getMeasurementFromGeometry({ geometry: len, geometryType: c.type });
      })();

      const unit = (unitType === T.UnitType.IMPERIAL) ?
        getImperialMeasurementUnitFromGeometryType({ geometryType: type }) :
        getMeasurementUnitFromGeometryType({ geometryType: type });

      const pointToPoint: string = (() => {
        if (isAvailablePointToPoint(info.locations)) {
          const positions: Cartesian3[] = info.locations
            .map((location) => Cartesian3.fromDegrees(location[0], location[1], location[2]));

          let total: number = 0;
          positions.forEach((position, index) => {
            const nextIdx = index + 1;
            if (nextIdx < positions.length) {
              total += Cartesian3.distance(position, positions[nextIdx]);
            }
          });

          return `${String((total * VALUES_PER_METER[unitType]).toFixed(2))} ${UNIT_SYMBOL[unitType]}`;
        }

        return metrics?.pointToPoint ?
          `${(metrics.pointToPoint * VALUES_PER_METER[unitType]).toFixed(2)} ${UNIT_SYMBOL[unitType]}` :
          NOT_APPLICABLE_CHAR;
      })();

      return [
        color.hex(),
        title,
        `${distance} ${unit}`,
        metrics?.surface ?
          `${(metrics.surface * VALUES_PER_METER[unitType]).toFixed(2)} ${UNIT_SYMBOL[unitType]}` :
          NOT_APPLICABLE_CHAR,
        pointToPoint,
      ];
    }),
    [T.ContentType.AREA]: selectedMeasurementContents.filter((c) => c.type === T.ContentType.AREA).map((c: T.AreaContent) => {
      const { color, title, info, type } = c;

      const horizontalArea: string = (() => {
        const polygon: Polygon = createGeometryFromLocations({
          locations: c.info.locations, geometryType: c.type,
        }) as Polygon;

        return (unitType === T.UnitType.IMPERIAL) ?
          getImperialMeasurementFromGeometry({ geometry: polygon, geometryType: c.type }) :
          getMeasurementFromGeometry({ geometry: polygon, geometryType: c.type });
      })();

      const unit = (unitType === T.UnitType.IMPERIAL) ?
        getImperialMeasurementUnitFromGeometryType({ geometryType: type }) :
        getMeasurementUnitFromGeometryType({ geometryType: type });

      return [
        color.hex(),
        title,
        `${horizontalArea} ${unit}`,
        info?.surface ? `${calculateArea(info.surface, unitType).toFixed(2)} ${unit}` : NOT_APPLICABLE_CHAR,
      ];
    }),
    [T.ContentType.VOLUME]: (() => {
      const volume: Data['measurement'][T.ContentType.VOLUME] = {
        [T.VolumeCalcMethod.BASIC]: [],
        [T.VolumeCalcMethod.DESIGN]: [],
        [T.VolumeCalcMethod.SURVEY]: [],
      };

      selectedMeasurementContents.filter((c) => c.type === T.ContentType.VOLUME).forEach((c: T.VolumeContent) => {
        const { color, title, info, type } = c;
        const { calculatedVolume } = info;

        const unit = (unitType === T.UnitType.IMPERIAL) ?
          getImperialMeasurementUnitFromGeometryType({ geometryType: type }) :
          getMeasurementUnitFromGeometryType({ geometryType: type });

        volume[calculatedVolume.calculation.type].push([
          color.hex(),
          title,
          (() => {
            switch (calculatedVolume.calculation.type) {
              case T.VolumeCalcMethod.BASIC:
                return calculatedVolume.calculation.volumeAlgorithm === T.BasicCalcBasePlane.CUSTOM ?
                  `${l10n(Text.custom)} : ${calculatedVolume.calculation.volumeElevation} ${VOLUME_CUSTOM_UNIT}`
                  : l10n(volumeAlgorithmLabel[calculatedVolume.calculation.volumeAlgorithm]);
              case T.VolumeCalcMethod.DESIGN:
                return contentsById[calculatedVolume.calculation.designDxfId].title;
              case T.VolumeCalcMethod.SURVEY:
                const screen: T.Screen | undefined = getScreenOfContentId(calculatedVolume.calculation.previousDsmId);
                if (screen === undefined) return NOT_APPLICABLE_CHAR;
                const date = formatWithOffset(
                  0,
                  screen.appearAt,
                  GetCommonFormat({ lang, hasDay: true }),
                  ApplyOptionIfKorean(lang),
                );
                return `${date} | ${screen.title}`;
              default:
                return NOT_APPLICABLE_CHAR;
            }
          })(),
          `${calculateVolume(calculatedVolume.cut, unitType).toFixed(2)} ${unit}`,
          `${calculateVolume(calculatedVolume.fill, unitType).toFixed(2)} ${unit}`,
          `${calculateVolume(calculatedVolume.total, unitType).toFixed(2)} ${unit}`,
        ]);
      });

      return volume;
    })(),
  }), []);

  const data: Data = { frame, project, photo, measurement };

  const PDFDocument: ReactElement = <Report data={data} lang={lang} />;
  const [instance, updateInstance] = usePDF({ document: PDFDocument });

  useEffect(() => {
    if (!image) return;

    updateInstance();
    setIsScreenBeingCaptured(true);
  }, [image]);

  const download = useMemo(() => !IsScreenBeingCaptured || instance.loading || !instance.url || !image ? (
    <Loading>
      <LoadingIcon loadingDivCustomStyle={loadingDivCustomStyle} />
      {l10n(Text.loading)}
    </Loading>
  ) : (
    <Link href={instance.url} download={REPORT_FILE_NAME}>
      {l10n(Text.submit)}
    </Link>
  ), [IsScreenBeingCaptured, instance.loading, instance.url, image]);

  return (
    <Popup
      title={l10n(Text.title)}
      alpha={popupAlpha}
      zIndex={zIndex}
      onCloseClick={onClose}
      headerStyle={headerStyle}
    >
      <Wrapper>
        <Description>
          {l10n(Text.description)}
        </Description>
        <ButtonWrapper>
          <SubmitButton
            data-ddm-track-action='earthwork-report'
            data-ddm-track-label='btn-download-report'
            isDisabled={!IsScreenBeingCaptured || instance.loading || !instance.url || !image}
          >
            {download}
          </SubmitButton>
        </ButtonWrapper>
      </Wrapper>
    </Popup>
  );
};

export default ReportDownloadPopup;
