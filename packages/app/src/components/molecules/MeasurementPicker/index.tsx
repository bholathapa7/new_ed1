/* eslint-disable max-lines */
import { autobind } from 'core-decorators';
import React, { Component, ReactNode } from 'react';
import isEqual from 'react-fast-compare';
import styled, { CSSObject } from 'styled-components';

import AreaSvg from '^/assets/icons/annotation/area.svg';
import CursorSvg from '^/assets/icons/annotation/cursor.svg';
import ESSArrowSvg from '^/assets/icons/annotation/ess-arrow-tool.svg';
import ESSPolygonSvg from '^/assets/icons/annotation/ess-polygon-tool.svg';
import ESSPolylineSvg from '^/assets/icons/annotation/ess-polyline-tool.svg';
import ESSTextSvg from '^/assets/icons/annotation/ess-text-tool.svg';
import LengthSvg from '^/assets/icons/annotation/length.svg';
import MarkerSvg from '^/assets/icons/annotation/marker.svg';
import VolumeSvg from '^/assets/icons/annotation/volume.svg';
import ArrowSvg from '^/assets/icons/arrow.svg';
import BasicCalculationSVG from '^/assets/icons/contents-list/volume-picker-basic.svg';
import DesignCalculationSVG from '^/assets/icons/contents-list/volume-picker-dbvc.svg';
import SurveyCalculationSVG from '^/assets/icons/contents-list/volume-picker-sbvc.svg';
import { Props as TutorialWrapperHoverableProps, TutorialPosition, TutorialWrapperHoverable } from '^/components/atoms/TutorialWrapperHoverable';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import WrapperHoverable, {
  Props as WrapperHoverableProps,
} from '^/components/atoms/WrapperHoverable';
import palette from '^/constants/palette';
import { DeviceWidth } from '^/constants/styles';
import Tutorial from '^/constants/tutorial';
import { OutsideMap } from '^/constants/zindex';
import * as T from '^/types';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { l10n } from '^/utilities/l10n';
import { arePropsEqual } from '^/utilities/react-util';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { createHasFeature, DEFAULT_USER_FEATURE_PERMISSION, HasFeature } from '^/utilities/withFeatureToggle';
import { VolumeTutorialImage } from '../ContentsListVolumeItem';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import { Fallback } from './fallback';
import Text from './text';

const TUTORIAL_WIDTH: number = 226;
const TUTORIAL_MARGIN: number = 3;

type PointerContentType = 'pointer';
export const SelectDefaultContent: PointerContentType = 'pointer';

export type SelectContentType = NonNullable<T.ContentsPageState['currentContentTypeFromAnnotationPicker']> | PointerContentType;


export const Root = styled.ul({
  position: 'absolute',

  top: '85px',
  left: '35px',
  zIndex: 1,

  listStyle: 'none',
  borderRadius: '4px',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 0 12px 0 rgba(0, 0, 0, 0.65)',

  '> li + li': {
    borderTopWidth: '0.5px',
    borderTopStyle: 'solid',
    borderTopColor: palette.divider.toString(),
  },

  '> li:first-of-type': {
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
  },
  '> li:last-of-type': {
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px',
  },
});

interface ToolButtonProps {
  readonly isSelected?: boolean;
  readonly isHoverStyleIgnored?: boolean;
  readonly isVolumeHovered?: boolean;
}

/**
 * @todo Define simplified Type
 */
export const ToolButton = styled.li<ToolButtonProps>(({ isVolumeHovered, isSelected }) => ({
  position: 'relative',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  width: '45px',
  height: '45px',
  backgroundColor: (
    isVolumeHovered ? palette.insideMap.volumeHoveredGray :
      isSelected ? palette.white : palette.insideMap.gray
  ).toString(),
  textAlign: 'center',

  cursor: 'pointer',

  ':hover': {
    backgroundColor: (
      isVolumeHovered ? palette.insideMap.volumeHoveredGray :
        isSelected ? palette.white : palette.insideMap.hoverGray
    ).toString(),
  },

  '& > i': {
    lineHeight: '56px',
  },
}), ({ isHoverStyleIgnored }) => (isHoverStyleIgnored ? {
  ':hover': {
    backgroundColor: palette.insideMap.gray.toString(),
  },
} : {}));

export const ToggleButton = styled.li({
  height: '11px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',

  backgroundColor: palette.insideMap.gray.toString(),

  '&:hover': {
    backgroundColor: palette.insideMap.hoverGray.toString(),
  },
});

export const ToggleIconContainer = styled.div<{ isClicked: boolean }>(({ isClicked }) => ({
  display: 'inline-flex',
  transform: isClicked ? undefined : 'rotate(180deg)',
}));

const VolumeAlgorithmRoot = styled.div({
  position: 'absolute',

  left: '80px',
  top: '269px',
  zIndex: OutsideMap.VOLUME_ALGORITHM,
  backdropFilter: 'blur(13px)',

  cursor: 'pointer',

  borderTopRightRadius: '4px',
  borderBottomRightRadius: '4px',
  borderBottomLeftRadius: '4px',

  '> div:first-of-type > div > div': {
    borderTopRightRadius: '4px',
  },
  '> div:last-of-type > div > div': {
    borderBottomRightRadius: '4px',
    borderBottomLeftRadius: '4px',
  },
});

const VolumeAlgorithmItem = styled.div<{ isWrapperHoverableNeeded: boolean }>({
  width: '100%',

  display: 'flex',
  alignItems: 'center',

  height: '31px',
  backgroundColor: palette.insideMap.gray.toString(),
  color: palette.MapTopBar.title.toString(),
  fontSize: '11px',
  fontWeight: 500,

  padding: '0px 12.5px',
}, ({ isWrapperHoverableNeeded }) => isWrapperHoverableNeeded ? ({
  '> span': {
    opacity: 0.5,
  },
  '> div > svg': {
    opacity: 0.5,
    '> g > path:not(:first-of-type)': {
      fill: palette.ContentsList.title.toString(),
    },
  },
}) : ({
  ':hover': {
    backgroundColor: palette.insideMap.volumeHoveredGray.toString(),
    '> svg > g > path:first-of-type': {
      fill: palette.insideMap.volumeHoveredGray.toString(),
    },
  },
  '> div > svg': {
    '> g > path:not(:first-of-type)': {
      fill: palette.ContentsList.title.toString(),
    },
  },
}));

const SVGWrapper = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: '6.4px',

  '> svg': {
    transform: 'scale(0.807)',
  },
});
const VolumeAlgorithmSpliter = styled.div({
  width: '100%',
  height: '1px',
  backgroundColor: palette.dividerLight.toString(),
});

const UnclickableVolumeIcon = styled(VolumeSvg)({
  ' > path ': {
    fillOpacity: 0.5,
  },
});

const TooltipWrapperStyle: CSSObject = {
  display: 'block',
  width: '100%',
};

const TooltipTargetStyle: CSSObject = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const TooltipBalloonStyle: CSSObject = {
  left: '51px',
  bottom: '12px',
};

const TooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: TooltipWrapperStyle,
  tooltipTargetStyle: TooltipTargetStyle,
  tooltipBalloonStyle: TooltipBalloonStyle,
};

const TooltipToggleStyle: WrapperHoverableProps['customStyle'] = {
  ...TooltipCustomStyle,
  tooltipBalloonStyle: {
    ...TooltipBalloonStyle,
    bottom: '-5px',
  },
};

const DBVCTooltipToggleStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: TooltipWrapperStyle,
  tooltipTargetStyle: {
    ...TooltipTargetStyle,
    justifyContent: undefined,
  },
  tooltipBalloonStyle: {
    left: 'calc(100% + 3px)',
    bottom: '30px',
  },
  tooltipTextTitleStyle: {
    height: 'auto',
    position: 'relative',
    fontSize: '10px',
    lineHeight: 1.3,

    color: palette.white.toString(),
    whiteSpace: 'unset',
    wordBreak: 'keep-all',
    width: '124px',
    textAlign: 'left',
    fontWeight: 400,
  },
};

const SBVCTooltipToggleStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: TooltipWrapperStyle,
  tooltipTargetStyle: {
    ...TooltipTargetStyle,
    justifyContent: undefined,
  },
  tooltipBalloonStyle: {
    ...DBVCTooltipToggleStyle.tooltipBalloonStyle,
    bottom: '0px',
  },
  tooltipTextTitleStyle: {
    ...DBVCTooltipToggleStyle.tooltipTextTitleStyle,
    width: '163px',
  },
};

const volumeDisabletooltipStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: TooltipWrapperStyle,
  tooltipTargetStyle: TooltipTargetStyle,
  tooltipBalloonStyle: {
    left: '51px',
    bottom: '4px',
  },
  tooltipTextTitleStyle: {
    ...DBVCTooltipToggleStyle.tooltipTextTitleStyle,
    width: '158px',
  },
};

const tutorialCustomStyle: TutorialWrapperHoverableProps['customStyle'] = {
  root: {
    width: '100%',
  },
  target: {
    width: '100%',

    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
};

export const typeToIcon: Record<SelectContentType, ReactNode> = {
  pointer: <CursorSvg />,
  [T.ContentType.MARKER]: <MarkerSvg />,
  [T.ContentType.LENGTH]: <LengthSvg />,
  [T.ContentType.AREA]: <AreaSvg />,
  [T.ContentType.VOLUME]: <VolumeSvg />,
  [T.ContentType.ESS_ARROW]: <ESSArrowSvg />,
  [T.ContentType.ESS_POLYLINE]: <ESSPolylineSvg />,
  [T.ContentType.ESS_POLYGON]: <ESSPolygonSvg />,
  [T.ContentType.ESS_TEXT]: <ESSTextSvg />,
};

/**
 * @desc Retrieve tooltip text regarding to the Annotation Type
 */
function typeToTooltip(annotationType: SelectContentType, language: T.Language): string {
  /* istanbul ignore next */
  switch (annotationType) {
    case SelectDefaultContent:
      return l10n(Text.tooltipPointer, language);
    case T.ContentType.MARKER:
      return l10n(Text.tooltipMarker, language);
    case T.ContentType.LENGTH:
      return l10n(Text.tooltipLength, language);
    case T.ContentType.AREA:
      return l10n(Text.tooltipArea, language);
    case T.ContentType.ESS_ARROW:
      return l10n(Text.tooltipESSArrow, language);
    case T.ContentType.ESS_POLYLINE:
      return l10n(Text.tooltipESSPolyline, language);
    case T.ContentType.ESS_POLYGON:
      return l10n(Text.tooltipESSPolygon, language);
    case T.ContentType.ESS_TEXT:
      return l10n(Text.tooltipESSText, language);
    case T.ContentType.VOLUME:
    default:
      return '';
  }
}

export interface OnMeasurementContentTypeSelectParamType {
  role: T.PermissionRole;
  type?: T.ContentsPageState['currentContentTypeFromAnnotationPicker'];
  mapPopupType?: T.ContentPagePopupOnMapType;
  volumeType?: T.VolumeCalcMethod;
}

export interface Props {
  readonly role: T.PermissionRole;
  readonly currentMeasurementType?: T.ContentsPageState['currentContentTypeFromAnnotationPicker'];
  readonly className?: string;
  readonly dsmContentId?: T.DSMContent['id'];
  readonly isDesignDxfExist: boolean;
  readonly isAvailableSBVC: boolean;
  readonly isIn3D: boolean;
  readonly shouldShowESSWorkTool: boolean;
  readonly userFeaturePermission: T.User['featurePermission'];
  onMeasurementContentTypeSelect(param: OnMeasurementContentTypeSelectParamType): void;
}

export interface State {
  readonly isToggled: boolean;
  readonly isHovered: boolean;
  readonly isVolumePanelOpened: boolean;
}

/**
 * Measurement picker in content page
 */
class MeasurementPicker extends Component<Props & L10nProps, State> {
  public constructor(props: Props & L10nProps) {
    super(props);

    this.state = {
      isToggled: true,
      isHovered: false,
      isVolumePanelOpened: false,
    };
  }

  @autobind
  private handleVolumeBasicAlgorithmClick(): void {
    this.props.onMeasurementContentTypeSelect({
      role: this.props.role,
      type: T.ContentType.VOLUME,
      volumeType: T.VolumeCalcMethod.BASIC,
    });
    this.handleVolumeMouseLeave();
  }

  @autobind
  private handleVolumeSurveyAlgorithmClick(): void {
    if (this.props.isAvailableSBVC) {
      this.props.onMeasurementContentTypeSelect({
        role: this.props.role,
        type: T.ContentType.VOLUME,
        mapPopupType: T.ContentPagePopupOnMapType.SURVEY_SELECT,
        volumeType: T.VolumeCalcMethod.SURVEY,
      });
      this.handleVolumeMouseLeave();
    }
  }

  @autobind
  private handleVolumeDesignAlgorithmClick(): void {
    if (!this.props.isIn3D && this.props.isDesignDxfExist) {
      this.props.onMeasurementContentTypeSelect({
        role: this.props.role,
        type: T.ContentType.VOLUME,
        mapPopupType: T.ContentPagePopupOnMapType.DESIGN_DXF_SELECT,
        volumeType: T.VolumeCalcMethod.DESIGN,
      });
      this.handleVolumeMouseLeave();
    }
  }

  @autobind
  private handleVolumeMouseEnter(): void {
    this.setState({
      isHovered: true,
      isVolumePanelOpened: true,
    });
  }

  @autobind
  private handleVolumeMouseLeave(): void {
    this.setState({
      isHovered: false,
      isVolumePanelOpened: false,
    });
  }

  @autobind
  private handleMouseEnter(): void {
    this.setState({ isHovered: true });
  }

  @autobind
  private handleMouseLeave(): void {
    this.setState({ isHovered: false });
  }

  @autobind
  private handleMouseClick(): void {
    this.setState({ isToggled: !this.state.isToggled });
  }

  @autobind
  private typeToButton(type: SelectContentType): ReactNode {
    const { dsmContentId }: Props = this.props;

    const handleClick: () => void = () => {
      this.props.onMeasurementContentTypeSelect({
        role: this.props.role,
        type: type === SelectDefaultContent ? undefined : type,
      });
    };

    const selected: boolean =
    this.props.currentMeasurementType === undefined ?
      type === SelectDefaultContent :
      this.props.currentMeasurementType === type;

    const trackingAction: string = this.props.shouldShowESSWorkTool
      ? 'ess-worktool-create'
      : 'measurement-create';

    switch (type) {
      case T.ContentType.VOLUME:
        return dsmContentId !== undefined ? (
          <ToolButton
            key={type}
            isVolumeHovered={this.state.isVolumePanelOpened}
            onMouseEnter={this.handleVolumeMouseEnter}
            onMouseLeave={this.handleVolumeMouseLeave}
            onClick={this.handleVolumeMouseEnter}
          >
            {typeToIcon[type]}
          </ToolButton>
        ) : (
          <ToolButton key={type} isHoverStyleIgnored={true}>
            <WrapperHoverable
              title={l10n(Text.tooltipVolume.disabled, this.props.language)}
              customStyle={volumeDisabletooltipStyle}
            >
              <UnclickableVolumeIcon />
            </WrapperHoverable >
          </ToolButton >
        );
      default:
        return (
          <ToolButton
            key={type}
            isSelected={selected}
            onClick={handleClick}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
            data-ddm-track-action={trackingAction}
            data-ddm-track-label={`btn-create-${type}-${this.props.isIn3D ? '3d' : '2d'}`}
          >
            <WrapperHoverable
              title={typeToTooltip(type, this.props.language)}
              customStyle={TooltipCustomStyle}
            >
              {typeToIcon[type]}
            </WrapperHoverable>
          </ToolButton>
        );
    }
  }

  public componentDidMount(): void {
    if (window.innerWidth < DeviceWidth.MOBILE_L) {
      this.setState({ isToggled: false });
    }
  }
  /**
   * @desc
   * Why should use sCU here?
   * 1. PureComponent does not work, because:
   *    PureComponent only runs a shallow comparison between this.props and nextProps.
   *    But annotation picker has a function in its props.
   *    Shallow comparison of functions always returns false.
   *    This means that there needs to be a customization in comparing functions.
   * 2. React.memo does not work, because it's not a functional component
   * 3. Leaving it as-is does not work too, because this component is going to re-render
   *    if its parent component re-renders under special conditions.
   *    See https://github.com/9oelM/react-re-render-test for more.
   *
   * The reason for using sCUs in other files are the same.
   */
  public shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    return !(arePropsEqual(this.props, nextProps) && isEqual(this.state, nextState));
  }

  public render(): ReactNode {
    const hasFeature: HasFeature = createHasFeature(this.props.userFeaturePermission ?? DEFAULT_USER_FEATURE_PERMISSION);

    const typeList: Array<SelectContentType> = hasFeature(T.Feature.DDM)
      ? (
        this.props.shouldShowESSWorkTool
          ? [
            SelectDefaultContent,
            T.ContentType.ESS_ARROW,
            T.ContentType.ESS_POLYLINE,
            T.ContentType.ESS_POLYGON,
            T.ContentType.ESS_TEXT,
          ] : [
            SelectDefaultContent,
            T.ContentType.MARKER,
            T.ContentType.LENGTH,
            T.ContentType.AREA,
            T.ContentType.VOLUME,
          ]
      )
      : [SelectDefaultContent];

    if (hasFeature(T.Feature.ESS) && this.props.shouldShowESSWorkTool) {
      typeList.push(
        T.ContentType.ESS_ARROW,
        T.ContentType.ESS_POLYLINE,
        T.ContentType.ESS_POLYGON,
        T.ContentType.ESS_TEXT,
      );
    }

    const selectedType: SelectContentType =
      this.props.currentMeasurementType === undefined ?
        SelectDefaultContent :
        this.props.currentMeasurementType;

    const toolButtonList: ReactNode = this.state.isToggled || this.state.isHovered ?
      typeList.map(this.typeToButton) :
      this.typeToButton(selectedType);

    const isToggled: boolean = this.state.isToggled || this.state.isHovered;

    const toggleButton: ReactNode = (
      <ToggleButton onClick={this.handleMouseClick}>
        <WrapperHoverable
          title={l10n(Text.tooltipToogle[isToggled ? 'fold' : 'unfold'], this.props.language)}
          customStyle={TooltipToggleStyle}
        >
          <ToggleIconContainer isClicked={isToggled}>
            <ArrowSvg />
          </ToggleIconContainer>
        </WrapperHoverable>
      </ToggleButton>
    );

    const volumeAlgorithmMethodToNode: (type: T.VolumeCalcMethod) => ReactNode = (type) => {
      const { isAvailableSBVC, isDesignDxfExist, language }: Props & L10nProps = this.props;
      const tutorial: TutorialWrapperHoverableProps = {
        width: TUTORIAL_WIDTH,
        margin: TUTORIAL_MARGIN,
        title: l10n(Text.tutorial[type].title, language),
        image: (<VolumeTutorialImage type={type} />),
        description: l10n(Text.tutorial[type].description, language),
        position: TutorialPosition.RIGHT_BOTTOM,
        link: Tutorial.volumeCalculation,
        isZendesk: true,
      };

      const paramToNode: (param: {
        SVG: ReactNode;
        text: string;
        tooltip?: {
          text: string;
          style: WrapperHoverableProps['customStyle'];
        };
        onClick(): void;
      }) => ReactNode = ({ SVG, text, tooltip, onClick }) => {
        const commonNode: ReactNode = (
          <>
            <SVGWrapper>
              {SVG}
            </SVGWrapper>
            <span>
              {text}
            </span>
          </>
        );

        return tooltip !== undefined ? (
          <WrapperHoverable
            title={tooltip.text}
            customStyle={tooltip.style}
          >
            <VolumeAlgorithmItem
              onClick={onClick}
              isWrapperHoverableNeeded={true}
              data-ddm-track-action='measurement-create'
              data-ddm-track-label={`btn-create-${T.ContentType.VOLUME}-${type}-${this.props.isIn3D ? '3d' : '2d'}`}
            >
              {commonNode}
            </VolumeAlgorithmItem>
          </WrapperHoverable>
        ) : (
          <TutorialWrapperHoverable {...tutorial} customStyle={tutorialCustomStyle}>
            <VolumeAlgorithmItem
              onClick={onClick}
              isWrapperHoverableNeeded={false}
              data-ddm-track-action='measurement-create'
              data-ddm-track-label={`btn-create-${T.ContentType.VOLUME}-${type}-${this.props.isIn3D ? '3d' : '2d'}`}
            >
              {commonNode}
            </VolumeAlgorithmItem>
          </TutorialWrapperHoverable>
        );
      };

      switch (type) {
        case T.VolumeCalcMethod.BASIC:
          return paramToNode({
            SVG: BasicCalculationSVG,
            text: l10n(Text.volumeAlgorithm.basic, language),
            onClick: this.handleVolumeBasicAlgorithmClick,
          });
        case T.VolumeCalcMethod.DESIGN:
          return paramToNode({
            SVG: DesignCalculationSVG,
            text: l10n(Text.volumeAlgorithm.design, language),
            tooltip: (() => {
              if (this.props.isIn3D || !isDesignDxfExist) {
                return {
                  text: l10n(Text.tooltipVolume[this.props.isIn3D ? 'disabledIn3d' : 'dbvcDisabled'], language),
                  style: DBVCTooltipToggleStyle,
                };
              }

              return undefined;
            })(),
            onClick: this.handleVolumeDesignAlgorithmClick,
          });
        case T.VolumeCalcMethod.SURVEY:
          return paramToNode({
            SVG: SurveyCalculationSVG,
            text: l10n(Text.volumeAlgorithm.survey, language),
            tooltip: !isAvailableSBVC ? {
              text: l10n(Text.tooltipVolume.sbvcDisabled, language),
              style: SBVCTooltipToggleStyle,
            } : undefined,
            onClick: this.handleVolumeSurveyAlgorithmClick,
          });
        default:
          return exhaustiveCheck(type);
      }
    };

    const volumeAlgorithmSelect: ReactNode = this.state.isVolumePanelOpened ? (
      <VolumeAlgorithmRoot
        className={CANCELLABLE_CLASS_NAME}
        onMouseEnter={this.handleVolumeMouseEnter}
        onMouseLeave={this.handleVolumeMouseLeave}
      >
        {volumeAlgorithmMethodToNode(T.VolumeCalcMethod.BASIC)}
        <VolumeAlgorithmSpliter />
        {volumeAlgorithmMethodToNode(T.VolumeCalcMethod.DESIGN)}
        <VolumeAlgorithmSpliter />
        {volumeAlgorithmMethodToNode(T.VolumeCalcMethod.SURVEY)}
      </VolumeAlgorithmRoot>
    ) : undefined;

    return (
      <>
        <Root
          className={this.props.className}
        >
          {toolButtonList}
          {toggleButton}
        </Root>
        {volumeAlgorithmSelect}
      </>
    );
  }
}
export default withL10n(withErrorBoundary(MeasurementPicker)(Fallback));
