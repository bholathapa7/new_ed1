/* eslint-disable max-lines */
import { autobind } from 'core-decorators';
import React, { Component, ReactNode, MouseEvent } from 'react';
import styled from 'styled-components';

import BackArrowSvg from '^/assets/icons/back-arrow.svg';
import BackSmallArrowSvg from '^/assets/icons/back-small-arrow.svg';
import CloseSvg from '^/assets/icons/close-new-thin.svg';
import DeleteSvg from '^/assets/icons/delete.svg';
import InfoSvg from '^/assets/icons/info-white.svg';
import Modal from '^/components/atoms/Modal';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import WrapperHoverable, { Props as WrapperHoverableProps } from '^/components/atoms/WrapperHoverable';
import palette from '^/constants/palette';
import { FontFamily, MediaQuery } from '^/constants/styles';
import * as T from '^/types';
import { ApplyOptionIfKorean, GetCommonFormat, formatWithOffset } from '^/utilities/date-format';
import { l10n } from '^/utilities/l10n';
import Text from './text';

const Root = styled.div({
  position: 'relative',

  width: '100%',
  height: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-end',
});

const Wrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',

  width: '60vw',
  height: '70vh',

  marginBottom: '60.5px',

  [MediaQuery.TABLET]: {
    width: '80vw',
  },
  [MediaQuery.MOBILE_L]: {
    width: '100%',
  },
});

const ToolBar = styled.ul({
  flexShrink: 0,

  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'flex-end',

  width: '100%',
  marginBottom: '14px',

  listStyle: 'none',

  '> li + li': {
    marginLeft: '10px',
  },

  [MediaQuery.MOBILE_L]: {
    marginRight: '10px',
  },
});

const Tool = styled.li({
  cursor: 'pointer',
});

const DeleteButton = styled(DeleteSvg)({
  transform: 'scale(1.385)',

  '> path': {
    fill: palette.white.toString(),
  },
});

const Body = styled.div({
  flexGrow: 1,

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  boxSizing: 'border-box',
  height: '70%',
  paddingLeft: '30px',
  paddingRight: '30px',

  marginBottom: '103.7px',

  [MediaQuery.MOBILE_L]: {
    padding: 0,
  },
});

interface ImageProp {
  readonly src: string;
}
const MainImage = styled.img<ImageProp>({
  flexGrow: 1,

  width: '100%',
  height: '100%',
  objectFit: 'contain',
  marginLeft: '60px',
  marginRight: '60px',
  // eslint-disable-next-line no-magic-numbers
  boxShadow: `3px 3px 19px 0 ${palette.black.alpha(0.5).toString()}`,
  backgroundColor: palette.black.toString(),

  [MediaQuery.MOBILE_L]: {
    margin: 0,
  },
});

const InfoWrapper = styled.div({
  position: 'relative',

  boxSizing: 'border-box',
  marginTop: '20px',
  marginLeft: '110px',
  marginRight: '110px',
  marginBottom: '20px',

  fontSize: '16px',
  lineHeight: 1,
  fontFamily: FontFamily.ROBOTO,
  fontWeight: 500,
  textAlign: 'center',
  color: palette.white.toString(),
});

const ImageListWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  boxSizing: 'border-box',
  marginBottom: '15px',
});

const ImageItem = styled.li({
  display: 'inline-block',
  position: 'relative',

  width: '45.5px',
  height: '45.5px',

  cursor: 'pointer',

  ':not(:first-of-type)': {
    marginLeft: '6px',
  },

  '> img': {
    objectFit: 'cover',
  },
});


const ImageBorder = styled.div<{ isSelected: boolean }>(({ isSelected }) => ({
  position: 'absolute',
  boxSizing: 'border-box',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',

  border: isSelected ? `3px solid ${palette.white.toString()}` : undefined,
  backgroundColor: isSelected ?
    // eslint-disable-next-line no-magic-numbers
    palette.white.alpha(0.44).toString() : palette.transparent.toString(),

  ':hover': {
    border: `3px solid ${palette.white.toString()}`,
  },
}));


interface ArrowProps {
  readonly isRight?: boolean;
  readonly isEnabled: boolean;
}

const BigArrowWrapper = styled.span<ArrowProps>(({ isRight, isEnabled }) => ({
  display: isEnabled ? undefined : 'none',

  content: '\' \'',
  position: 'absolute',
  left: isRight ? 'calc(100% - 55px)' : '55px',
  top: '50%',
  transform: 'translateX(-50%)',

  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: palette.ImagePopup.arrowBackground.toString(),

  cursor: 'pointer',

  '> svg': {
    position: 'absolute',
    left: '50%',
    top: '50%',

    width: '10px',
    height: '17px',

    transform: `translate(-50%, -50%) ${isRight ? 'rotate(180deg)' : ''}`,
  },

  '> svg path': {
    fill: palette.white.toString(),
  },

  ':hover': {
    backgroundColor: palette.white.toString(),

    '> svg path': {
      fill: 'var(--color-theme-primary)',
    },
  },

  [MediaQuery.MOBILE_L]: {
    display: 'none',
  },
}));

const SmallArrowWrapper = styled.span<{ isRight?: boolean; isEnabled: boolean }>(({ isRight, isEnabled }) => ({
  display: isEnabled ? undefined : 'none',

  content: '\' \'',
  position: 'relative',

  width: '22.5px',
  height: '22.5px',

  borderRadius: '50%',
  cursor: 'pointer',
  margin: '9.3px',

  ':hover': {
    // eslint-disable-next-line no-magic-numbers
    backgroundColor: palette.white.alpha(0.2).toString(),
  },

  '> svg': {
    position: 'absolute',

    left: '50%',
    bottom: '50%',
    transform: `translate(-50%, 50%) ${isRight ? 'rotate(180deg)' : ''}`,
  },
}));

const CloseIconWrapper = styled.span({
  content: '\' \'',
  position: 'absolute',

  top: '38.7px',
  right: '40.3px',

  width: '67.4px',
  height: '67.4px',

  borderRadius: '50%',
  cursor: 'pointer',

  '> svg': {
    position: 'absolute',
    left: '50%',
    top: '50%',

    transform: 'translate(-50%, -50%)',
  },

  ':hover': {
    // eslint-disable-next-line no-magic-numbers
    backgroundColor: palette.white.alpha(0.2).toString(),
  },
});

const tooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: { position: 'relative' },
  tooltipTargetStyle: {
    display: 'flex',
    justifyCenter: 'center',
  },
  tooltipArrowStyle: {
    left: '50%',
    transform: 'translate(-50%)',
  },
  tooltipBalloonStyle: {
    left: '50%',
    transform: 'translate(-50%, 6px)',
    bottom: 'auto',
  },
};

const tooltipInfoStyle: WrapperHoverableProps['customStyle'] = {
  ...tooltipCustomStyle,
  tooltipBackgroundStyle: {
    borderRadius: '6px',
  },
  tooltipBalloonStyle: {
    ...tooltipCustomStyle.tooltipBalloonStyle,

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',

    padding: '13.5px 15px 14.5px 15px',
  },
  tooltipTextTitleStyle: {
    marginBottom: '4px',

    fontSize: '12px',
    fontWeight: 'normal',
  },
  tooltipTextContentStyle: {
    fontSize: '12px',
    fontWeight: 'bold',

    color: palette.white.toString(),
  },
};

const tooltipTrashStyle: WrapperHoverableProps['customStyle'] = {
  ...tooltipCustomStyle,
  tooltipTargetStyle: {
    width: '18px', // For Transform
    height: '18px',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipBalloonStyle: {
    ...tooltipCustomStyle.tooltipBalloonStyle,
    fontWeight: 'bold',
  },
};

/**
 * Ids Enum for Small Arrow Buttons
 */
enum SmallArrowButtonId {
  LEFT = 'image-popup-arrow-left',
  RIGHT = 'image-popup-arrow-right',
}

const backgroundAlpha: number = 0.5;
const imagesPerPage: number = 10;

export interface Props {
  readonly zIndex: number;
  readonly timezoneOffset: number;
  readonly attachments: Array<Pick<T.Attachment, 'id' | 'file'>>;
  readonly selected: T.Attachment;
  readonly sidebarTab: T.ContentsPageState['sidebarTab'];
  readonly editingId?: number;
  readonly isAllowMarkerAttachOrDelete?: boolean;
  onClick(id: number): void;
  onClose(): void;
  onDelete(attachmentId: T.Attachment['id'], type: T.ContentsPageState['sidebarTab']): void;
  onNoPermission(): void;
}

/**
 * Component for marker image viewer
 * @todo This component is too big (or have too complex DOM). It should be decomposed.
 */
class ContentImagePopup extends Component<Props & L10nProps> {
  private get selectedIndex(): number {
    return this.props.attachments.findIndex((attachment) =>
      attachment.id === this.props.selected.id,
    );
  }

  public constructor(props: Props & L10nProps) {
    super(props);
  }

  @autobind
  private handleLeftClick(): void {
    if (this.selectedIndex > 0) {
      this.props.onClick(this.props.attachments[this.selectedIndex - 1].id);
    }
  }

  @autobind
  private handleRightClick(): void {
    if (this.selectedIndex < this.props.attachments.length - 1) {
      this.props.onClick(this.props.attachments[this.selectedIndex + 1].id);
    }
  }

  @autobind
  private attachmentToImage(attachment: Pick<T.Attachment, 'id' | 'file'>): ReactNode {
    const isSelected: boolean = this.props.selected.id === attachment.id;
    const handleClick: () => void = () => this.props.onClick(attachment.id);

    return (
      <ImageItem key={attachment.id} onClick={handleClick}>
        <img src={attachment.file.markerThumb?.url ?? attachment.file.photoThumb?.url} width='100%' height='100%' />
        <ImageBorder isSelected={isSelected} />
      </ImageItem>
    );
  }

  @autobind
  private attachmentsToImages(attachments: Array<Pick<T.Attachment, 'id' | 'file'>>): ReactNode {
    const page: number = Math.floor(this.selectedIndex / imagesPerPage);

    const startIndex: number = page * imagesPerPage;

    return attachments
      .slice(startIndex, startIndex + imagesPerPage)
      .map(this.attachmentToImage);
  }

  @autobind
  private handleDelete(): void {
    if (!this.props.isAllowMarkerAttachOrDelete) {
      this.props.onNoPermission();

      return;
    }
    const selectedId: number = this.props.selected.id;
    if (this.props.attachments.length > 1) {
      if (this.selectedIndex >= 1) this.handleLeftClick();
      else this.handleRightClick();
    } else {
      this.props.onClose();
    }
    this.props.onDelete(selectedId, this.props.sidebarTab);
  }

  @autobind
  private handleSmallArrowClick(e: MouseEvent<HTMLSpanElement>): void {
    e.preventDefault();

    const id: SmallArrowButtonId = e.currentTarget.id as SmallArrowButtonId;
    const page: number = Math.floor(this.selectedIndex / imagesPerPage);
    const goingPage: number = (id === SmallArrowButtonId.LEFT ? page - 1 : page + 1);
    const goingIndex: number = goingPage * imagesPerPage;

    const attachmentId: T.Attachment['id'] | undefined
      = this.props.attachments[goingIndex]?.id;

    if (attachmentId === undefined) {
      throw new Error('try to load removed attachment');
    }

    this.props.onClick(attachmentId);
  }


  public render(): ReactNode {
    const createdDateString: string = formatWithOffset(
      this.props.timezoneOffset,
      this.props.selected.createdAt,
      GetCommonFormat({ lang: this.props.language, hasDay: true }),
      ApplyOptionIfKorean(this.props.language),
    );
    const selectedIndex: number = this.selectedIndex;

    const deleteButton: ReactNode = this.props.editingId === this.props.selected.contentId ? (
      <Tool>
        <WrapperHoverable
          title={l10n(Text.delete, this.props.language)}
          customStyle={tooltipTrashStyle}
        >
          <DeleteButton onClick={this.handleDelete} />
        </WrapperHoverable>
      </Tool>
    ) : undefined;

    const page: number = Math.floor(this.selectedIndex / imagesPerPage);

    const leftSmallArrow: ReactNode = (
      <SmallArrowWrapper
        id={SmallArrowButtonId.LEFT}
        isEnabled={page > 0}
        onClick={this.handleSmallArrowClick}
      >
        <BackSmallArrowSvg />
      </SmallArrowWrapper>
    );
    const isRightSmallArrowEnabled: boolean =
      Boolean(this.props.attachments[(page + 1) * imagesPerPage]);
    const rightSmallArrow: ReactNode = (
      <SmallArrowWrapper
        id={SmallArrowButtonId.RIGHT}
        isEnabled={isRightSmallArrowEnabled}
        isRight={true}
        onClick={this.handleSmallArrowClick}
      >
        <BackSmallArrowSvg />
      </SmallArrowWrapper>
    );

    return (
      <Modal
        hasBlur={true}
        backgroundColor={palette.black.alpha(backgroundAlpha)}
        zIndex={this.props.zIndex}
      >
        <Root>
          <Wrapper data-testid='content-image-popup'>
            <Body>
              <ToolBar>
                <Tool>
                  <WrapperHoverable
                    title={l10n(Text.uploadedAt, this.props.language)}
                    content={createdDateString}
                    customStyle={tooltipInfoStyle}
                  >
                    <svg width='18px' height='18px'><InfoSvg /></svg>
                  </WrapperHoverable>
                </Tool>
                {deleteButton}
              </ToolBar>
              <MainImage
                src={this.props.selected.file.url}
                data-testid='main-image'
                loading='lazy'
              />
            </Body>
            <InfoWrapper>
              {selectedIndex + 1}/{this.props.attachments.length}
            </InfoWrapper>
            <ImageListWrapper data-testid='image-list-wrapper'>
              {leftSmallArrow}
              {this.attachmentsToImages(this.props.attachments)}
              {rightSmallArrow}
            </ImageListWrapper>
          </Wrapper>
          <CloseIconWrapper onClick={this.props.onClose}>
            <CloseSvg />
          </CloseIconWrapper>
          <BigArrowWrapper
            isEnabled={selectedIndex > 0}
            onClick={this.handleLeftClick}
          >
            <BackArrowSvg />
          </BigArrowWrapper>
          <BigArrowWrapper
            isEnabled={selectedIndex < this.props.attachments.length - 1}
            onClick={this.handleRightClick}
            isRight={true}
          >
            <BackArrowSvg />
          </BigArrowWrapper>
        </Root>
      </Modal>
    );
  }
}

export default withL10n(ContentImagePopup);
