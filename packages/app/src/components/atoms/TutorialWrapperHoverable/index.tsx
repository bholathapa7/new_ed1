import React, { FC, ReactNode, memo, useCallback, useEffect, useMemo, useRef, useState, RefObject } from 'react';
import styled, { CSSObject } from 'styled-components';

import DetailArrow from '^/assets/icons/tutorial/detail-arrow.svg';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { Global } from '^/constants/zindex';
import { UseGoToZendesk, UseL10n, UseState, useGoToZendesk, useL10n } from '^/hooks';
import { isMobile } from '^/utilities/device';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import Portal from '../Portal';
import Text from './text';

export const TUTORIAL_PORTAL_ID: string = 'Tutorial';
export const RETRY_TIMEOUT: number = 20;

const getTargetCSSByPosition: (params: ({
  position: TutorialPosition;
  margin: NonNullable<Props['margin']>;
})) => CSSObject = ({ position, margin }) => {
  switch (position) {
    case TutorialPosition.TOP_RIGHT:
      return {
        width: '100%',
        height: margin,

        left: 0,
        top: '100%',
      };
    case TutorialPosition.RIGHT_BOTTOM:
      return {
        width: margin,
        height: '100%',

        top: 0,
        right: '100%',
      };
    case TutorialPosition.MIDDLE_TOP:
      return {
        width: '100%',
        height: margin,

        left: '50%',
        top: '100%',
        transform: 'translateX(-50%)',
      };
    case TutorialPosition.TOP_LEFT:
      return {
        width: '100%',
        height: margin,

        top: '100%',
        right: 0,
      };

    default:
      return exhaustiveCheck(position);
  }
};

const getWrapperCSSByPosition: (params: ({
  width: Props['width'];
  target: DOMRect;
  position: TutorialPosition;
  margin: NonNullable<Props['margin']>;
})) => CSSObject = ({ width, target, position, margin }) => {
  switch (position) {
    case TutorialPosition.TOP_RIGHT:
      return {
        left: target.left,
        bottom: `calc(100% - ${target.bottom - target.height - margin}px)`,
      };
    case TutorialPosition.RIGHT_BOTTOM:
      return {
        top: target.top,
        left: target.width + target.left + margin,
      };
    case TutorialPosition.MIDDLE_TOP:
      return {
        left: target.left + (target.width / 2) - (width / 2),
        bottom: `calc(100% - ${target.y - margin}px)`,
      };
    case TutorialPosition.TOP_LEFT:
      return {
        bottom: `calc(100% + ${margin - target.y}px`,
        right: `calc(100% - ${target.right}px)`,
      };

    default:
      return exhaustiveCheck(position);
  }
};


interface PositionProp {
  readonly position: Props['position'];
}

interface MarginProp {
  readonly margin: NonNullable<Props['margin']>;
}

interface HoverProp {
  readonly isHovering: boolean;
}

const Root = styled.div.attrs({
  'data-testid': 'TutorialRoot',
})({
  position: 'relative',
  display: 'inline-block',
});

const Target = styled.div.attrs({
  'data-testid': 'TutorialTarget',
})({
  position: 'relative',
  display: 'inline-block',
});

const Wrapper = styled.div<HoverProp & PositionProp & MarginProp & { width: Props['width'] }>(({ width, isHovering, position, margin }) => ({
  position: 'absolute',
  width,

  display: isHovering ? 'flex' : 'none',
  flexDirection: 'column',

  boxSizing: 'border-box',
  backgroundColor: palette.itemBackground.toString(),
  padding: '15px',
  borderRadius: '6px',

  zIndex: Global.TUTORIAL,

  '::after': {
    content: '\' \'',

    position: 'absolute',

    zIndex: Global.TUTORIAL,
    ...getTargetCSSByPosition({ position, margin }),
  },
}));

const Title = styled.p({
  color: dsPalette.title.toString(),
  fontSize: '12px',
  fontWeight: 'bold',
});

const Description = styled.span({
  color: dsPalette.title.toString(),
  fontSize: '11px',
  fontWeight: 500,
  lineHeight: 1.52,
  wordBreak: 'keep-all',
});

const DetailWrapper = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  marginTop: '5px',
});

const DetailButton = styled.button({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  padding: '6px 6px 6px 9px',

  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 500,
  color: palette.lightNavyBlue.toString(),
  wordBreak: 'keep-all',
  textDecoration: 'underline',

  cursor: 'pointer',

  '> svg': {
    marginLeft: '5px',
  },

  ':hover': {
    backgroundColor: palette.hoverGray.toString(),
  },
});


// Middle Top, Top Right,
export enum TutorialPosition {
  RIGHT_BOTTOM = 'RIGHT_BOTTOM',
  TOP_LEFT = 'TOP_LEFT',
  TOP_RIGHT = 'TOP_RIGHT',
  MIDDLE_TOP = 'MIDDLE_TOP',
}

export interface Props {
  readonly width: number;
  readonly margin?: number;
  readonly position: TutorialPosition;

  readonly title: string;
  readonly description: string;

  readonly image?: ReactNode;
  readonly link?: string;
  readonly isZendesk?: boolean;

  readonly customStyle?: {
    root?: CSSObject;
    target?: CSSObject;
    wrapper?: CSSObject;
  };
}

export const TutorialWrapperHoverable: FC<Props> = memo(({
  width, margin = 0, position,
  title, description, image, link, isZendesk = false, customStyle,
  children,
}) => {
  const [l10n]: UseL10n = useL10n();
  const goToZendesk: UseGoToZendesk = useGoToZendesk();

  const targetRef: RefObject<HTMLDivElement> | undefined | null = useRef(null);
  const [isHovering, setIsHovering]: UseState<boolean> = useState<boolean>(false);
  const [, setTimeoutRef]: UseState<number | undefined> = useState<number | undefined>(undefined);
  const [, setScrollCount]: UseState<number> = useState<number>(0);

  const container: HTMLElement | null = useMemo(() => document.getElementById(TUTORIAL_PORTAL_ID), []);
  const target: DOMRect | undefined = targetRef.current?.getBoundingClientRect();

  const handleScroll: () => void = useCallback(() => {
    setScrollCount((prevScrollCount) => prevScrollCount + 1);
  }, []);

  useEffect(() => {
    if (isHovering) {
      window.addEventListener('scroll', handleScroll, true);
    } else {
      setScrollCount(0);
      window.removeEventListener('scroll', handleScroll, true);
    }

    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isHovering]);

  const handleMouseEnter: () => void = useCallback(() => {
    if (isMobile()) return;
    setTimeoutRef((prevTimeoutRef) => {
      if (prevTimeoutRef !== undefined) clearTimeout(prevTimeoutRef);

      return undefined;
    });
    setIsHovering(true);
  }, []);
  const handleMouseLeave: () => void = useCallback(() => {
    if (isMobile()) return;
    setTimeoutRef(window.setTimeout(() => {
      setIsHovering(false);
    }, RETRY_TIMEOUT));
  }, []);

  const handleDetailButtonClick: () => void = useCallback(() => {
    if (link === undefined) return;

    if (!isZendesk) {
      window.open(link);

      return;
    }

    goToZendesk(link);
  }, [link]);

  const tutorial: ReactNode = useMemo(() => container === null || target === undefined ? null : (
    <Portal node={container}>
      <Wrapper
        style={{ ...getWrapperCSSByPosition({ width, target, position, margin }), ...customStyle?.wrapper }}
        width={width}
        position={position}
        margin={margin}
        isHovering={isHovering}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Title>{title}</Title>
        {image}
        <Description>{description}</Description>
        <DetailWrapper>
          <DetailButton onClick={handleDetailButtonClick}>
            {l10n(Text.detail)}
            <DetailArrow />
          </DetailButton>
        </DetailWrapper>
      </Wrapper>
    </Portal>
  ), [container, target, width, position, margin, isHovering, title, image, description]);

  return (
    <Root style={customStyle?.root}>
      <Target
        style={customStyle?.target}
        ref={targetRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </Target>
      {tutorial}
    </Root>
  );
});
