import { autobind } from 'core-decorators';
import React, { Component, ReactNode } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

const DEFAULT_WIDTH: number = 18;
const DEFAULT_HEIGHT: number = 12;

interface ValueProps {
  readonly isRight: boolean;
  readonly width: number;
  readonly height: number;
}

const Root = styled.button<ValueProps>(({ width, height }) => ({
  boxSizing: 'border-box',
  width,
  height,

  alignItems: 'center',

  borderRadius: height / 2,

  overflow: 'hidden',
  color: palette.icon.toString(),

  cursor: 'pointer',

  transitionDuration: '100ms',
}), ({ isRight }) => ({
  backgroundColor: isRight ? 'var(--color-theme-secondary)' : palette.slider.unfilledColor.toString(),
}));

const Wrapper = styled.div<Omit<ValueProps, 'isRight'>>(({ width, height }) => ({
  position: 'relative',
  width,
  height,
}));

const Marker = styled.div<ValueProps>(({ height }) => ({
  position: 'absolute',
  margin: 2,

  width: height - 2 * 2,
  height: height - 2 * 2,
  flexShrink: 0,

  borderRadius: (height - 2 * 2) / 2,

  background: palette.white.toString(),

  transitionDuration: '100ms',
}), ({ isRight, height, width }) => ({
  left: isRight ? (height - 2 * 2) - ((height - 2 * 2) * 2 - width + 2 * 2) : 0,
}));
Marker.displayName = 'Marker';

export interface Props {
  readonly className?: string;
  readonly isRight?: boolean;
  readonly onChange?: ((isLeft: boolean) => void) | undefined;
  readonly width?: number;
  readonly height?: number;
}
export interface State {
  readonly isRight: boolean;
}

/**
 * @author Junyoung Clare Jang
 * @desc Tue Apr 17 17:02:34 2018 UTC
 * @todo
 * Remove (at least logic of) this fxxking component after making ToggleButton reusable.
 */
class MiniToggleButton extends Component<Props, State> {
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
    // eslint-disable-next-line no-magic-numbers
    const rootWidth: number = this.props.width !== undefined ? this.props.width : DEFAULT_WIDTH;
    // eslint-disable-next-line no-magic-numbers
    const rootHeight: number = this.props.height !== undefined ? this.props.height : DEFAULT_HEIGHT;

    return (
      <Root
        className={this.props.className}
        onClick={this.handleClick}
        isRight={this.state.isRight}
        width={rootWidth}
        height={rootHeight}
      >
        <Wrapper width={rootWidth} height={rootHeight}>
          <Marker
            isRight={this.state.isRight}
            data-testid='minitogglebutton-marker'
            width={rootWidth}
            height={rootHeight}
          />
        </Wrapper>
      </Root>
    );
  }
}
export default MiniToggleButton;
