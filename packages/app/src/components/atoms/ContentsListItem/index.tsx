/* eslint-disable max-lines */
import Tippy from '@tippyjs/react';
import React, { FC, KeyboardEvent, MutableRefObject, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';
import { Action, Dispatch } from 'redux';
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';
import styled from 'styled-components';


import CenteredViewSvg from '^/assets/icons/centered-view.svg';
import TwoDBadgeSvg from '^/assets/icons/contents-list/2d-badge.svg';
import ThreeDBadgeSvg from '^/assets/icons/contents-list/3d-badge.svg';
import ToggleSvg from '^/assets/icons/contents-list/arrow.svg';
import DisabledToggleSvg from '^/assets/icons/contents-list/disabled-arrow.svg';
import DownloadGrayActivatedSvg from '^/assets/icons/download-gray-activated.svg';
import { ContentIcon as RawContentIcon } from '^/components/atoms/ContentIcon';
import { ContentsListItemCheckbox as Checkbox } from '^/components/atoms/ContentsListItemCheckbox';
import ContentColor from '^/components/atoms/ContentsListItemColor';
import { ContentsListItemTitle as Title } from '^/components/atoms/ContentsListItemTitle';
import CopyContentButton from '^/components/atoms/CopyContentButton';
import DeleteContentButton from '^/components/atoms/DeleteContentButton';
import { zoomToCoordinate } from '^/components/cesium/cesium-util';
import { CesiumContext, CesiumContextProps } from '^/components/cesium/CesiumContext';
import { CANCELLABLE_CLASS_NAME } from '^/components/molecules/CreatingVolumeClickEventHandler';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { DISABLED_CONTENT_OPACITY, MediaQuery } from '^/constants/styles';
import {
  UseL10n,
  UseShouldContentDisabled,
  UseState,
  useL10n,
  useProjectCoordinateSystem,
  useShouldContentDisabled,
  isESSContent,
  useDeleteContent,
  UseDeleteContent,
  typeGuardESSContent,
} from '^/hooks';
import { DownloadOverlay, PatchContent, contentsSelector } from '^/store/duck/Contents';
import { ChangeEditingESSContent, CopyESSContent, PatchESSContent } from '^/store/duck/ESSContents';
import {
  ChangeEditingContent,
  ChangeTwoDDisplayCenter,
} from '^/store/duck/Pages';
import * as T from '^/types';
import { getCopiedContentTitle, getHasColor } from '^/utilities/annotation-content-util';
import { getCenterPointByContent, getContentTitlesByType } from '^/utilities/content-util';
import { isMobile } from '^/utilities/device';
import ContentInfo from '../ContentInfo';
import Text from './text';

interface ItemProps {
  isEditing?: boolean;
  isGrouped?: boolean;
}

export const CONTENTSLIST_CTXSORT_KEY = 'ContentsListItem';

export const Root = styled.li({
  position: 'relative',
  listStyle: 'none',

  width: '306px',
  [MediaQuery[T.Device.MOBILE_L]]: {
    width: 'auto',
  },

  [MediaQuery[T.Device.MOBILE_S]]: {
    width: 'auto',
  },

  zIndex: 'auto',
});

export const SelectionBox = styled.div<ItemProps>(({ isEditing, isGrouped }) => ({
  position: 'relative',

  display: 'flex',
  alignItems: 'center',

  boxSizing: 'border-box',
  height: '40px',
  paddingLeft: '24px',
  marginLeft: isGrouped ? '36px' : '0px',
  paddingRight: '22px',
  backgroundColor: isEditing ? palette.ContentsList.titleActiveLightBlue.toString() : undefined,

  cursor: 'pointer',
  userSelect: 'none',

  ' ::after': {
    content: '\'\'',
    position: 'absolute',
    width: '36px',
    height: '100%',
    left: '-36px',
    top: '0',
    backgroundColor: isEditing ? palette.ContentsList.titleActiveLightBlue.toString() : undefined,
  },
}));
SelectionBox.displayName = 'SelectionBox';

const ToggleIconContainer = styled.div<Pick<ItemProps, 'isEditing'>>(({ isEditing }) => ({
  display: 'inline-flex',
  transform: isEditing ? 'rotate(-180deg)' : undefined,
}));

export const TitleWrapper = styled.div({
  position: 'relative',
  flex: 1,

  height: '32px',

  marginLeft: '1.5px',
});

const Balloon = styled.div({
  boxSizing: 'border-box',
  width: '100%',
  padding: '25px',
  margin: 'auto',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  background: palette.white.toString(),
  borderBottom: `1px solid ${palette.toggleButtonGray.toString()}`,
});

const BalloonHeader = styled.div<{ isColorAtEnd: boolean; isMarginOnTitle: boolean }>(({ isColorAtEnd, isMarginOnTitle }) => ({
  boxSizing: 'border-box',

  width: '100%',
  height: '100%',
  padding: isMarginOnTitle ? '0 15px' : undefined,

  display: 'flex',
  justifyContent: isColorAtEnd ? 'flex-end' : 'space-between',

  alignItems: 'center',
}));

const BalloonTitle = styled.div<DisabledProps>(({ isDisabled }) => ({
  display: 'flex',
  alignItems: 'center',

  fontSize: '13px',
  fontWeight: 'bold',
  color: dsPalette.title.toString(),

  span: {
    opacity: isDisabled ? DISABLED_CONTENT_OPACITY : 1,
  },
}));

const BalloonTools =
  styled.div<{ width: string }>(({ width }) => ({
    display: 'flex',
    position: 'relative',
    width,
    height: '13px',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginLeft: '7px',

    'svg, img': {
      cursor: 'pointer',
    },
  }));

export const HorizontalDivider = styled.div<DisabledProps>(({ isDisabled }) => ({
  opacity: isDisabled ? DISABLED_CONTENT_OPACITY : 1,
  width: '100%',
  borderTop: `1px solid ${palette.toggleButtonGray.toString()}`,

  marginTop: '13px',
  marginBottom: '13px',
}));

export const HorizontalWideDivider = styled(HorizontalDivider)({
  marginTop: '23px',
  marginBottom: '23px',
});

export const ContentIcon = styled(RawContentIcon)<{ isProcessingOrFailed?: boolean }>(({ isProcessingOrFailed }) => ({
  marginLeft: isProcessingOrFailed ? '12px' : '18px',
}));

export const FeatureWrapper = styled.div({
  marginLeft: 'auto',

  display: 'flex',
  alignItems: 'center',
});

const ContentButtonWrapper =
  styled.div<{ isProcessingOrFailed: boolean }>(({ isProcessingOrFailed }) => ({
    marginTop: isProcessingOrFailed ? '-2px' : undefined,
  }));

const BadgeWrapper = styled.div({
  paddingTop: '1px',
  marginRight: '10.5px',
});

const ContentCenterButton = styled.div({
  padding: '4.5px',
  borderRadius: '4px',
  marginRight: '8.5px',
  marginLeft: '3px',
  ':hover': {
    backgroundColor: palette.dropdown.dividerColor.toString(),
  },
});

function getDimensionBadge(type: T.ContentType, in3D: boolean): ReactNode {
  const in2D: boolean = !in3D;

  if (in3D && T.MAP_TAB_TWO_D_CONTENTS.includes(type)) {
    return <BadgeWrapper><TwoDBadgeSvg /></BadgeWrapper> ;
  } else if (in2D && T.MAP_TAB_THREE_D_CONTENTS.includes(type)) {
    return <BadgeWrapper><ThreeDBadgeSvg /></BadgeWrapper>;
  }

  return undefined;
}

export interface Props {
  readonly content: T.Content;
  readonly firstBalloonTitle?: string;
  readonly firstBalloonDescription?: ReactNode | string;
  readonly className?: string;
  readonly isPinned?: boolean;
  onClick?(): void;
}

interface DisabledProps {
  isDisabled?: boolean;
}
/**
 * If you pass children, it will be appended into first balloon
 * at the bottom of content title.
 */
export const ContentsListItem: FC<Props> = ({
  content: { id: contentId },
  content, firstBalloonTitle, firstBalloonDescription, children,
  className,
  onClick,
  isPinned = false,
}) => {
  const dispatch: Dispatch = useDispatch();
  const { viewer }: CesiumContextProps = useContext(CesiumContext);

  const [isHovered, setIsHovered]: UseState<boolean> = useState<boolean>(false);

  const isIn3D: T.ContentsPageState['in3D'] = useSelector((s: T.State) => s.Pages.Contents.in3D);
  const isIn3DPointCloud: T.ContentsPageState['in3DPointCloud'] = useSelector((s: T.State) => s.Pages.Contents.in3DPointCloud);
  const currentPointCloudEngine: T.ContentsPageState['currentPointCloudEngine']
    = useSelector((s: T.State) => s.Pages.Contents.currentPointCloudEngine);
  const editingContentId: T.ContentsPageState['editingContentId'] = useSelector((s: T.State) => s.Pages.Contents.editingContentId);
  const printingContentId: T.ContentsPageState['printingContentId'] = useSelector((s: T.State) => s.Pages.Contents.printingContentId);
  const isOverlayContent: boolean = useSelector((s: T.State) => T.OverlayContentTypes.includes(s.Contents.contents.byId[content.id].type));
  const sidebarTab: T.ContentsPageState['sidebarTab'] = useSelector((s: T.State) => s.Pages.Contents.sidebarTab);
  const allContents = useSelector((s: T.State) => s.Contents.contents.byId);

  const [l10n]: UseL10n = useL10n();
  const rootRef: MutableRefObject<HTMLLIElement | null> = useRef(null);
  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();
  const shouldContentDisabled: UseShouldContentDisabled = useShouldContentDisabled(content.type);
  const ESSContent: T.ESSContent | undefined = typeGuardESSContent(content);

  const isEditing: boolean = useMemo(() => content.id === editingContentId, [content.id, editingContentId]);

  const isProcessingOrFailed: boolean = contentsSelector.isProcessingOrFailedByContent(content);
  const isProcessing: boolean = contentsSelector.isProcessing(content);
  const isFailed: boolean = contentsSelector.isFailed(content);
  const isInCesium = isIn3D || (isIn3DPointCloud && currentPointCloudEngine === T.PointCloudEngine.CESIUM);

  const isColorAtEnd: boolean = content.type === T.ContentType.MARKER;
  const isMarginOnTitle: boolean = content.type === T.ContentType.LENGTH
    || content.type === T.ContentType.AREA
    || content.type === T.ContentType.ESS_ARROW
    || content.type === T.ContentType.ESS_POLYGON
    || content.type === T.ContentType.ESS_POLYLINE;

  const handleMouseOver: () => void = useCallback(() => {
    setIsHovered(true);
  }, [isHovered]);

  const handleMouseLeave: () => void = useCallback(() => {
    setIsHovered(false);
  }, [isHovered]);

  const color: string | undefined = getHasColor(content.type) ? content.color.toString() : undefined;

  const handleScrollIntoView: () => void = async () => {
    if (!rootRef?.current) return;
    scrollIntoViewIfNeeded(rootRef.current as Element, {
      scrollMode: 'if-needed',
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  };

  useEffect(() => {
    if (isMobile()) setIsHovered(isEditing);
    // Use window.setTimeout for smoother animation
    if (isEditing) window.setTimeout(handleScrollIntoView);
  }, [isEditing]);

  const handleDownloadOverlay: () => void = useCallback(() => dispatch(DownloadOverlay({ contentId: content.id })), [content.id]);

  const handleToggle: () => void = useCallback(() => {
    if (shouldContentDisabled) return;
    const isGoingToBeEditing: boolean = !isEditing;

    switch (sidebarTab) {
      case T.ContentPageTabType.ESS: {
        dispatch(ChangeEditingESSContent({ contentId: !isGoingToBeEditing ? undefined : contentId }));
        break;
      }
      default: {
        dispatch(ChangeEditingContent({
          contentId: !isGoingToBeEditing ? undefined : contentId,
          // When content is failed is processing,
          // the content list needs to be expanded still (see error message, delete, etc).
          // However, do not actually select them since it might trigger
          // rendering something (e.g. switching to 3D).
          skipSelecting: isProcessingOrFailed,
        }));
      }
    }
  }, [isProcessingOrFailed, shouldContentDisabled, isEditing, contentId]);

  const handleContentCenterClick: () => void = () => {
    const actions: Action[] = [];

    if (content.config?.selectedAt === undefined) {
      if (isESSContent(content)) {
        actions.push(PatchESSContent({
          content: {
            id: contentId,
            config: {
              selectedAt: new Date(),
            },
          },
          skipDBUpdate: true,
        }));
      } else {
        actions.push(PatchContent({
          content: {
            id: contentId,
            config: {
              selectedAt: new Date(),
            },
          },
        }));
      }
    }

    const centerPoint: T.GeoPoint | undefined = getCenterPointByContent(content, projectProjection);
    if (centerPoint !== undefined) {
      if (isInCesium && viewer !== undefined) {
        zoomToCoordinate(viewer, centerPoint);
      } else {
        actions.push(ChangeTwoDDisplayCenter({ twoDDisplayCenter: centerPoint }));
      }
    }

    batch(() => actions.forEach(dispatch));
  };

  const isMapRelatedContent: boolean = T.MAP_TAB_CONTENTS.includes(content.type);
  const dimensionBadge: ReactNode = isMapRelatedContent ? getDimensionBadge(content.type, isIn3D) : undefined;

  const hasNoDownloadAndDelete: boolean = useMemo(
    () => content.type === T.ContentType.THREE_D_ORTHO || content.type === T.ContentType.GCP_GROUP, [content.type],
  );

  const downloadOverlayButton: ReactNode = useMemo(() => (
    !hasNoDownloadAndDelete && isOverlayContent ? (
      <Tippy offset={T.TIPPY_OFFSET} theme='angelsw' placement='bottom' arrow={false} content={l10n(Text.tooltipDownload)}>
        <ContentButtonWrapper
          onClick={handleDownloadOverlay}
          className={CANCELLABLE_CLASS_NAME}
          isProcessingOrFailed={isProcessingOrFailed}
          data-ddm-track-action='map-download'
          data-ddm-track-label={`btn-contents-list-download-overlay-${content.type}`}
        >
          <DownloadGrayActivatedSvg />
        </ContentButtonWrapper>
      </Tippy>
    ) : undefined
  ), [hasNoDownloadAndDelete, isOverlayContent, handleDownloadOverlay, isProcessingOrFailed, content.type]);


  const copySelectedESSContents = () => {
    if (ESSContent === undefined) return;
    if (ESSContent.id !== editingContentId) return;

    const allContentTitlesWithSameType = getContentTitlesByType(allContents, ESSContent.type);
    const copiedContent = {
      ...ESSContent,
      title: getCopiedContentTitle(ESSContent.title, allContentTitlesWithSameType),
    };
    dispatch(CopyESSContent({ content: copiedContent }));
  };

  const copyButton: ReactNode = useMemo(() => {
    if (hasNoDownloadAndDelete || ESSContent === undefined) return null;

    return (
      <Tippy offset={T.TIPPY_OFFSET} theme='angelsw' placement='bottom' arrow={false} content={l10n(Text.tooltipCopy)}>
        <ContentButtonWrapper isProcessingOrFailed={isProcessingOrFailed}>
          <CopyContentButton content={content} isDisabled={Boolean(printingContentId)} />
        </ContentButtonWrapper>
      </Tippy>
    );
  }, [content, hasNoDownloadAndDelete, printingContentId, isProcessingOrFailed, ESSContent]);

  const deleteButton: ReactNode = useMemo(() => {
    if (hasNoDownloadAndDelete) return null;

    return (
      <Tippy offset={T.TIPPY_OFFSET} theme='angelsw' placement='bottom' arrow={false} content={l10n(Text.tooltipDelete)}>
        <ContentButtonWrapper className={CANCELLABLE_CLASS_NAME} isProcessingOrFailed={isProcessingOrFailed}>
          <DeleteContentButton content={content} isDisabled={Boolean(printingContentId)} />
        </ContentButtonWrapper>
      </Tippy>
    );
  }, [content, hasNoDownloadAndDelete, printingContentId, isProcessingOrFailed]);

  const balloonColor: ReactNode = useMemo(() => {
    if (!color) return null;

    return <ContentColor content={content} />;
  }, [content, color]);

  const contentCenterButtonTooltipText: string = useMemo(() => {
    const contentTabString: string = (() => {
      if (T.OverlayContentTypes.includes(content.type)) {
        return l10n(Text.overlay);
      } else if (content.type === T.ContentType.GCP_GROUP) {
        return l10n(Text.gcp);
      } else if (content.category === T.ContentCategory.ESS) {
        return '';
      } else {
        return l10n(Text.measurement);
      }
    })();

    return `${contentTabString}${l10n(Text.tooltipCenter)}`;
  }, [content.type, l10n]);

  const contentCenterButton: ReactNode = useMemo(() => {
    if (
      !isHovered ||
      (content.type !== T.ContentType.GCP_GROUP && isMapRelatedContent) ||
      isProcessingOrFailed ||
      content.type === T.ContentType.DESIGN_DXF
    ) return null;

    if (content.type === T.ContentType.GCP_GROUP && (isIn3D || isIn3DPointCloud)) return null;

    return (
      <Tippy offset={T.TIPPY_OFFSET} theme='angelsw' placement='bottom' arrow={false} content={contentCenterButtonTooltipText}>
        <ContentCenterButton onClick={handleContentCenterClick}>
          <CenteredViewSvg />
        </ContentCenterButton>
      </Tippy>
    );
  }, [isIn3D, isIn3DPointCloud, isHovered, isMapRelatedContent, isProcessingOrFailed, content.type]);

  const toggleIcon: ReactNode = useMemo(() => {
    if (shouldContentDisabled) {
      return <DisabledToggleSvg />;
    }
    return (
      <ToggleIconContainer className={CANCELLABLE_CLASS_NAME} isEditing={isEditing}>
        <ToggleSvg />
      </ToggleIconContainer>
    );
  }, [shouldContentDisabled, isEditing]);

  const title: ReactNode = (
    <TitleWrapper className={CANCELLABLE_CLASS_NAME}>
      <Title
        fromUI={T.EditableTextUI.CONTENT_TITLE}
        content={content}
        isEditing={isEditing}
      />
    </TitleWrapper>
  );

  // This logic is needed because this component is trying to do too much.
  // It wants to have different sizes for different types of content.
  // The design needs to somehow be more consistent than this,
  // or create separate components for each type instead.
  const balloonToolsWidth: string = useMemo(() => {
    if (hasNoDownloadAndDelete) {
      return '13px';
    }

    if (isOverlayContent) {
      return '66px';
    }

    return ESSContent ? '51px' : '39px';
  }, [hasNoDownloadAndDelete, isOverlayContent, ESSContent]);

  const deleteContent: UseDeleteContent = useDeleteContent();

  const handleDeleteContent = () => {
    if (printingContentId) return;
    // Only the user who is admin of project can delete content,
    // so instead of dispatching DeleteESSContent directly,
    // show popup to confirm deleting selected content
    if (content.id === editingContentId) deleteContent(content.id, content.type);
  };

  const handleKeyDown: (e: KeyboardEvent<HTMLElement>) => void = (e) => {
    if ((e.target as HTMLElement).tagName === T.TagName.INPUT || !isEditing) return;
    e.preventDefault();

    if (!isEditing) return;
    if (e.ctrlKey && e.key === T.ShortCut.D) {
      copySelectedESSContents();
    } else if (e.key === T.ShortCut.DELETE) {
      handleDeleteContent();
    }
  };

  const balloon: ReactNode = isEditing ? (
    <Balloon>
      <BalloonHeader data-testid='balloon-header' isColorAtEnd={isColorAtEnd} isMarginOnTitle={isMarginOnTitle}>
        <BalloonTitle isDisabled={isProcessing && isOverlayContent}>
          <span>{firstBalloonTitle}</span>
          {firstBalloonDescription}
          {balloonColor}
        </BalloonTitle>
        <BalloonTools width={balloonToolsWidth}>
          <ContentInfo contentId={content.id} />
          {downloadOverlayButton}
          {copyButton}
          {deleteButton}
        </BalloonTools>
      </BalloonHeader>
      {children}
    </Balloon>
  ) : undefined;

  const trackLabel: string | undefined = useMemo(() => {
    switch (content.type) {
      case T.ContentType.MAP: {
        return '2d';
      }
      case T.ContentType.THREE_D_MESH: {
        return '3d-mesh';
      }
      case T.ContentType.THREE_D_ORTHO: {
        return '3d-ortho';
      }
      case T.ContentType.POINTCLOUD: {
        return '3d-pointcloud';
      }
      case T.ContentType.GCP_GROUP: {
        return 'gcp';
      }
      case T.ContentType.DSM: {
        return 'dsm';
      }
      default: {
        // The rest of the tracking might be more relevant
        // if it has the distinction between being triggered in 2d or 3d,
        // since it behaves pretty differently in these two views.
        return `${content.type}-${isIn3D ? '3d' : '2d'}`;
      }
    }
  }, [content.type, isIn3D]);

  // Only tracks content list click to view
  // when it was not selected previously.
  const trackActionContentsList: string | undefined
    = useMemo(() => content?.config?.selectedAt === undefined && !isEditing ? 'map-view' : undefined, [!!content?.config?.selectedAt, isEditing]);

  // Should differ between toggling on and off the content.
  const trackActionContentsListCheckbox: string | undefined
    = useMemo(() => content?.config?.selectedAt === undefined ? 'map-view' : 'map-view-off', [!!content?.config?.selectedAt]);

  // The only exception for color is ESS text where
  // the color that the icon represents is the font color.
  // It's the requirement.
  const iconColor: string | undefined = content.type === T.ContentType.ESS_TEXT
    ? content.info.fontColor.toString()
    : color;

  return (
    <Root
      id={`contentid-${contentId}`}
      ref={rootRef}
      color={color}
      className={className}
      onClick={onClick}
    >
      <SelectionBox
        isGrouped={content.groupId !== undefined}
        isEditing={isEditing}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        data-testid='content-selection-box'
        data-ctxsort={CONTENTSLIST_CTXSORT_KEY}
        data-ctxsort-key={content.id}
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        data-ddm-track-action={trackActionContentsList}
        data-ddm-track-label={`btn-contents-list-${trackLabel}`}
      >
        <Checkbox
          content={content}
          isProcessingOrFailed={isProcessingOrFailed}
          isFailed={isFailed}
          trackAction={trackActionContentsListCheckbox}
          trackLabel={`btn-contents-list-checkbox-${trackLabel}`}
        />
        <ContentIcon contentType={content.type} color={iconColor} isProcessingOrFailed={isProcessingOrFailed} isPinned={isPinned} />
        {title}
        <FeatureWrapper>
          {dimensionBadge}
          {contentCenterButton}
          {toggleIcon}
        </FeatureWrapper>
      </SelectionBox>
      {balloon}
    </Root >
  );
};
