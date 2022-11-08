import React, { FC, MouseEvent, ReactNode } from 'react';
import styled, { CSSObject } from 'styled-components';

import { Project, ProjectType } from '^/types';

import MemberSvg from '^/assets/icons/profile.svg';
import palette from '^/constants/palette';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import WrapperHoverable, {
  Props as WrapperHoverableProps,
} from '^/components/atoms/WrapperHoverable';

import { getFormattedDate } from '^/utilities/date-format';
import { l10n } from '^/utilities/l10n';

import Text from './text';

const Root = styled.div({
  position: 'relative',
  boxSizing: 'border-box',
  width: '100%',
  height: '100%',

  ':hover': {
    'div:first-child::after': {
      backgroundColor: palette.black.alpha(0).toString(),
    },
  },
});

interface BackgroundProp {
  readonly background?: string;
}
const Background = styled.div<BackgroundProp>({
  position: 'absolute',
  zIndex: 0,
  width: '100%',
  height: '100%',
  left: 0,
  top: 0,
  overflow: 'hidden',
  borderRadius: '3px',
}, ({ background }) => {
  const emptyAlpha: number = 0.75;
  const backgroundAlpha: number = 0.65;

  return {
    backgroundImage: `url(${background})`,
    backgroundSize: 'cover',

    '::after': {
      content: '\' \'',
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundColor: palette.black.toString(),
      opacity: background !== undefined ? backgroundAlpha : emptyAlpha,
    },
  };
});
Background.displayName = 'Background';

const ContentZIndex: number = 2;
const Content = styled.div({
  position: 'absolute',
  zIndex: ContentZIndex,
  boxSizing: 'border-box',
  padding: '20px',
  width: '100%',
  height: '100%',

  transition: 'background-color 0.1s linear',

  ':hover': {
    // eslint-disable-next-line no-magic-numbers
    backgroundColor: palette.white.alpha(0.65).toString(),
    '& >': {
      'div >': {
        '*, div > i': {
          color: palette.textGray.toString(),
          fill: palette.textGray.toString(),
        },
      },
      h2: {
        color: palette.darkBlack.toString(),
      },
      h3: {
        color: palette.textBlack.toString(),
      },
    },
  },
});

const MemberSvgWrapper = styled.svg({
  verticalAlign: 'middle',
  width: '14px',
  height: '14px',
  fill: palette.white.toString(),
});

const MemberCount = styled.span({
  verticalAlign: 'middle',
  marginLeft: '10px',

  fontSize: '16px',
  lineHeight: 1,
  color: palette.border.toString(),
});

const SharedIcon = styled.span({
  position: 'absolute',
  top: '20px',
  right: '20px',
  padding: '3px 5px',

  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: palette.subColor.toString(),

  fontSize: '10px',
  lineHeight: 1,
  color: palette.subColor.toString(),
});

const Title = styled.h2({
  width: '100%',
  marginTop: '30px',
  marginBottom: '20px',

  fontSize: '18px',
  lineHeight: 1,
  fontWeight: 'bold',
  color: palette.white.toString(),
});

const FormattedDate = styled.h3({
  width: '100%',
  marginTop: '10px',

  fontSize: '13px',
  lineHeight: 1,
  fontWeight: 'normal',
  color: palette.white.toString(),
});

const SettingsIcon = styled.i.attrs({
  className: 'fa fa-cog',
})({
  fontSize: '28px',
  color: palette.white.toString(),

  ':hover': {
    color: palette.subColor.toString(),
  },
});

const TooltipTargetStyle: CSSObject = {
  position: 'absolute',
  bottom: '20px',
  right: '20px',
};
const TooltipBalloonStyle: CSSObject = {
  left: 'auto',
  right: '10px',
  bottom: '-15px',
};
const TooltipArrowStyle: CSSObject = {
  left: 'auto',
  right: '15px',
};
const TooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipTargetStyle: TooltipTargetStyle,
  tooltipBalloonStyle: TooltipBalloonStyle,
  tooltipArrowStyle: TooltipArrowStyle,
};

export interface Props {
  readonly timezoneOffset: number;
  readonly project: Project;
  readonly isShared: boolean;
  readonly isDemo: boolean;
  onClick(): void;
  onSettingClick(): void;
}

/**
 * Component for list item on project page
 */
const ProjectListItem: FC<Props & L10nProps> = ({
  isShared, isDemo, project, timezoneOffset, onClick, onSettingClick, language,
}) => {
  const handleSettingClick = (event: MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    onSettingClick();
  };

  const sharedName: string = l10n((isDemo ? Text.demo : Text.shared), language);
  const sharedIcon: ReactNode = isShared ? (<SharedIcon>{sharedName}</SharedIcon>) : undefined;
  const membersCount: ReactNode = (() => {
    // Do not show the number of users for the demo project
    // since it's technically exposing the number of all users in the app.
    if (project.type === ProjectType.DEMO) {
      return undefined;
    }

    return (
      <div>
        <MemberSvgWrapper><MemberSvg /></MemberSvgWrapper>
        <MemberCount>{project.permissionsCount}</MemberCount>
      </div>
    );
  })();

  const getFormattedDateWithTimezone: (date: Date) => string = getFormattedDate(timezoneOffset, l10n(Text.dateFormat, language));

  return (
    <li onClick={onClick}>
      <Root>
        <Background background={project.thumbnail} data-testid='project-list-item-background' />
        <Content>
          {membersCount}
          {sharedIcon}
          <Title>{project.title}</Title>
          <FormattedDate>{l10n(Text.createdAt, language)}: {getFormattedDateWithTimezone(project.createdAt)}</FormattedDate>
          <FormattedDate>{l10n(Text.updatedAt, language)}: {getFormattedDateWithTimezone(project.updatedAt)}</FormattedDate>
          <WrapperHoverable
            title={l10n(Text.tooltipProjectBoard, language)}
            customStyle={TooltipCustomStyle}
          >
            <SettingsIcon onClick={handleSettingClick} data-testid='setting-button' />
          </WrapperHoverable>
        </Content>
      </Root>
    </li>
  );
};
export default withL10n(ProjectListItem);
