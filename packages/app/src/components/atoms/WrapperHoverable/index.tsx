import palette from '^/constants/palette';
import { autobind } from 'core-decorators';
import React, { Component, ReactNode, createRef, MutableRefObject } from 'react';
import isEqual from 'react-fast-compare';
import styled, { CSSObject } from 'styled-components';

interface CustomStyleProps {
  readonly customStyle: CSSObject;
}
interface TooltipBalloonProps {
  tooltipArrowStyle: CSSObject;
}

type TextBalloonProps = TooltipBalloonProps & CustomStyleProps;

const Root = styled.div<CustomStyleProps>({},
  ({ customStyle }) => customStyle);

const Target = styled.div.attrs({
  'data-testid': 'wrapperhoverable-target',
})<CustomStyleProps>({},
  ({ customStyle }) => customStyle);

const TooltipBalloon = styled.div<TextBalloonProps>({
  position: 'absolute',
  zIndex: 1000,
  left: 0,
  bottom: '-36px',

  display: 'inline-block',

  padding: '4px 5px 5px 5px',

  maxWidth: '175px',

  borderRadius: '3px',

  pointerEvents: 'none',
}, ({ customStyle, tooltipArrowStyle }) => ({
  ...customStyle,

  '::after': {
    ...tooltipArrowStyle,
  },
}));

const TooltipBalloonBackground = styled.div<CustomStyleProps>({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',

  borderRadius: '2px',

  backgroundColor: palette.tooltipBackground.toString(),
  backdropFilter: 'blur(3px)',
}, ({ customStyle }) => customStyle);

const TooltipTitle = styled.div<CustomStyleProps>({
  position: 'relative',

  fontSize: '12px',
  fontWeight: 500,
  lineHeight: 1,

  color: palette.white.toString(),

  whiteSpace: 'nowrap',
}, ({ customStyle }) => customStyle);

const TooltipContent = styled.div<CustomStyleProps>({
  position: 'relative',
  fontSize: '12px',
  lineHeight: 1.17,

  color: palette.measurements.volume.toString(),

  whiteSpace: 'nowrap',
}, ({ customStyle }) => customStyle);

export interface Props {
  readonly title: string;
  readonly content?: string;
  readonly forceTurnOffHover?: boolean;
  /**
   * Use this when you need to check if mouse is outside of wrapperhoverable
   * for example, to remove tooltip after some screen animation
   */
  readonly allowForceCheckMouseout?: boolean;
  readonly allowForceCheckTouchend?: boolean;

  readonly customStyle: {
    readonly tooltipWrapperStyle?: CSSObject;
    readonly tooltipTargetStyle?: CSSObject;
    readonly tooltipBackgroundStyle?: CSSObject;
    readonly tooltipBalloonStyle?: CSSObject;
    readonly tooltipTextTitleStyle?: CSSObject;
    readonly tooltipTextContentStyle?: CSSObject;
    readonly tooltipArrowStyle?: CSSObject;
  };
}

interface State {
  readonly hovered: boolean;
}

/**
 * Adding hover effect to a component which is wrapped
 */
class WrapperHoverable extends Component<Props, State> {
  private readonly wrapperHoverableRef: MutableRefObject<HTMLDivElement | null>;

  public constructor(props: Props) {
    super(props);
    this.state = { hovered: false };
    this.wrapperHoverableRef = createRef();
  }

  private forceCheckMouseoutFunction: (event: MouseEvent) => void = (_event) => {};
  private forceCheckTouchendFunction: (event: TouchEvent) => void = (_event) => {};

  @autobind
  private turnHoverOn(): void {
    this.setState({ hovered: true });
  }

  @autobind
  private turnHoverOff(): void {
    this.setState({ hovered: false });
  }

  @autobind
  private forceCheckMouseout(divRect: DOMRect): (event: MouseEvent) => void {
    return (event: MouseEvent) => {
      if (!(event.clientX >= divRect.left && event.clientX <= divRect.right &&
          event.clientY >= divRect.top && event.clientY <= divRect.bottom)) {
        this.setState((prevState) => ({ ...prevState, hovered: false }));
      }
    };
  }

  @autobind
  private forceCheckTouchend(divRect: DOMRect): (event: TouchEvent) => void {
    return (event: TouchEvent) => {
      if (!(event.touches[0].clientX >= divRect.left && event.touches[0].clientX <= divRect.right &&
          event.touches[0].clientY >= divRect.top && event.touches[0].clientY <= divRect.bottom)) {
        this.setState((prevState) => ({ ...prevState, hovered: false }));
      }
    };
  }

  public componentWillUnmount(): void {
    document.body.removeEventListener('mousemove', this.forceCheckMouseoutFunction);
    document.body.removeEventListener('touchmove', this.forceCheckTouchendFunction);
  }

  public shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    if (this.state.hovered && this.props.allowForceCheckMouseout && this.props.allowForceCheckTouchend) {
      const body: HTMLElement = document.body;
      body.removeEventListener('mousemove', this.forceCheckMouseoutFunction);
      body.removeEventListener('touchmove', this.forceCheckTouchendFunction);
      const divRect: DOMRect =
        this.wrapperHoverableRef?.current?.getBoundingClientRect() as DOMRect;
      this.forceCheckMouseoutFunction = this.forceCheckMouseout(divRect);
      body.addEventListener('mousemove', this.forceCheckMouseoutFunction, { once: true });
      this.forceCheckTouchendFunction = this.forceCheckTouchend(divRect);
      body.addEventListener('touchmove', this.forceCheckTouchendFunction, { once: true });
    }

    return !(isEqual(this.props, nextProps) && isEqual(this.state, nextState));
  }

  public render(): ReactNode {
    const { title, content, customStyle }: Props = this.props;

    const tooltipBalloonStyle: CSSObject = customStyle.tooltipBalloonStyle !== undefined ?
      customStyle.tooltipBalloonStyle : {};

    const tooltipArrowStyle: CSSObject = customStyle.tooltipArrowStyle !== undefined ?
      customStyle.tooltipArrowStyle : {};

    const tooltipTextTitleStyle: CSSObject = customStyle.tooltipTextTitleStyle !== undefined ?
      customStyle.tooltipTextTitleStyle : {};

    const tooltipTextContentStyle: CSSObject =
      customStyle.tooltipTextContentStyle !== undefined ? customStyle.tooltipTextContentStyle : {};

    const tooltipBackgroundStyle: CSSObject = customStyle.tooltipBackgroundStyle !== undefined ?
      customStyle.tooltipBackgroundStyle : {};

    const tooltipWrapperStyle: CSSObject = customStyle.tooltipWrapperStyle !== undefined ?
      customStyle.tooltipWrapperStyle : {};

    const tooltipTargetStyle: CSSObject = customStyle.tooltipTargetStyle !== undefined ?
      customStyle.tooltipTargetStyle : {};

    const tooltip: ReactNode = this.state.hovered ?
      (
        <TooltipBalloon customStyle={tooltipBalloonStyle} tooltipArrowStyle={tooltipArrowStyle}>
          <TooltipBalloonBackground customStyle={tooltipBackgroundStyle} />
          <TooltipTitle customStyle={tooltipTextTitleStyle} >
            {title}
          </TooltipTitle>
          <TooltipContent customStyle={tooltipTextContentStyle} >
            {content}
          </TooltipContent>
        </TooltipBalloon>
      ) : undefined;

    /**
     * @info The Tooltip is created outside of the target component to overcome the limitation of
     * property 'overflow: hidden'
     * To use the Tooltip correctly, the holder of the target component should set 'position'
     */

    if (this.props.forceTurnOffHover) this.turnHoverOff();

    return (
      <Root customStyle={tooltipWrapperStyle} >
        <Target
          ref={this.wrapperHoverableRef}
          onMouseEnter={this.turnHoverOn}
          onTouchStart={this.turnHoverOn}
          onMouseLeave={this.turnHoverOff}
          onTouchEnd={this.turnHoverOff}
          customStyle={tooltipTargetStyle}
        >
          {this.props.children}
        </Target>
        {tooltip}
      </Root>
    );
  }
}

export default WrapperHoverable;
