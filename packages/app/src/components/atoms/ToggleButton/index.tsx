import { autobind } from 'core-decorators';
import React, { Component, ReactNode } from 'react';
import styled, { CSSObject } from 'styled-components';

import WrapperHoverable, {
  Props as WrapperHoverableProps,
} from '^/components/atoms/WrapperHoverable';
import palette from '^/constants/palette';

const rootWidth: number = 73;
const rootHeight: number = 26;

const Root = styled.div({
  boxSizing: 'border-box',
  width: rootWidth,
  height: rootHeight,

  alignItems: 'center',
  textAlign: 'center',

  cursor: 'pointer',
  userSelect: 'none',

  borderRadius: rootHeight / 2,
  color: palette.icon.toString(),
  fontSize: 12,
});

const Wrapper = styled.div({
  width: '100%',
  height: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '> div:first-of-type': {
    borderTopLeftRadius: '13px',
    borderBottomLeftRadius: '13px',
  },
  '> div:last-of-type': {
    borderTopRightRadius: '13px',
    borderBottomRightRadius: '13px',
  },
});

interface ValueProps {
  readonly isRight: boolean;
}

const Text = styled.div<ValueProps>(({ isRight }) => ({
  position: 'relative',

  width: '50%',
  height: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  color: isRight ? 'inherit' : palette.white.toString(),
  backgroundColor: isRight ? palette.toggleButtonGray.toString() : 'var(--color-theme-primary)',
}));

const TextWrapper = styled.span({
  lineHeight: 1.1,
  fontWeight: 'bold',
});

const TooltipTargetStyle: CSSObject = {
  display: 'block',
};
const TooltipArrowStyle: CSSObject = {
  left: '19px',
};
const TooltipBalloonStyle: CSSObject = {
  left: '-3px',
  bottom: '-26px',
};
const TooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipTargetStyle: TooltipTargetStyle,
  tooltipArrowStyle: TooltipArrowStyle,
  tooltipBalloonStyle: TooltipBalloonStyle,
};

export interface Props {
  readonly className?: string;
  readonly htmlId?: string;
  readonly isRight?: boolean;
  readonly leftText: string;
  readonly rightText: string;
  readonly leftTextTooltip?: string;
  readonly rightTextTooltip?: string;
  readonly spanCustomStyle?: CSSObject;
  readonly trackAction?: string;
  readonly trackLabel?: string;
  readonly onChange?: ((isLeft: boolean) => void) | undefined;
}

export interface State {
  readonly isRight: boolean;
}

/**
 * @author Junyoung Clare Jang
 * @desc Tue Apr 17 17:02:34 2018 UTC
 * @todo This component is not that reusable.
 * We should extract logic and view, and separate them into different components.
 */
class ToggleButton extends Component<Props, State> {
  public static getDerivedStateFromProps(nextProps: Props): Partial<State> | null {
    if (nextProps.isRight !== undefined) {
      return {
        isRight: nextProps.isRight,
      };
    } else {
      return null;
    }
  }

  public state: State;

  public constructor(props: Props) {
    super(props);

    this.state = {
      isRight: false,
    };
  }

  @autobind
  private handleClick(): void {
    if (this.props.isRight !== undefined) {
      if (this.props.onChange !== undefined) {
        this.props.onChange(!this.props.isRight);
      }
    } else {
      this.setState((prevState) => ({
        isRight: !prevState.isRight,
      }), () => {
        if (this.props.onChange !== undefined) {
          this.props.onChange(this.state.isRight);
        }
      });
    }
  }

  public render(): ReactNode {
    const leftText: ReactNode = this.props.leftTextTooltip === undefined ?
      this.props.leftText :
      (
        <WrapperHoverable
          title={this.props.leftTextTooltip}
          customStyle={TooltipCustomStyle}
        >
          <TextWrapper style={this.props.spanCustomStyle}>{this.props.leftText}</TextWrapper>
        </WrapperHoverable>
      );
    const rightText: ReactNode = this.props.rightTextTooltip === undefined ?
      this.props.rightText :
      (
        <WrapperHoverable
          title={this.props.rightTextTooltip}
          customStyle={TooltipCustomStyle}
        >
          <TextWrapper style={this.props.spanCustomStyle}>{this.props.rightText}</TextWrapper>
        </WrapperHoverable>
      );

    return (
      <Root
        id={this.props.htmlId}
        className={this.props.className}
        onClick={this.handleClick}
        unselectable='on'
        data-testid='toggle-button'
        data-ddm-track-action={this.props.trackAction}
        data-ddm-track-label={this.props.trackLabel}
      >
        <Wrapper>
          <Text isRight={this.state.isRight}>{leftText}</Text>
          <Text isRight={!this.state.isRight}>{rightText}</Text>
        </Wrapper>
      </Root>
    );
  }
}
export default ToggleButton;
