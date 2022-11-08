import Tippy from '@tippyjs/react';
import React, { FC, ReactNode, MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import CheckSvg from '^/assets/icons/contents-list/check.svg';
import DisabledUncheckSvg from '^/assets/icons/contents-list/disabled-uncheck.svg';
import FailedStatusSvg from '^/assets/icons/contents-list/red-alert.svg';
import UncheckSvg from '^/assets/icons/contents-list/uncheck.svg';
import { UseL10n, UseShouldContentDisabled, useL10n, useShouldContentDisabled } from '^/hooks';
import { PatchContent, contentsSelector } from '^/store/duck/Contents';
import { PatchESSContent } from '^/store/duck/ESSContents';
import { ChangeIn3D, ChangeIn3DPointCloud, OpenContentPagePopup } from '^/store/duck/Pages';
import * as T from '^/types';
import { getSingleContentId } from '^/utilities/state-util';
import LoadingIcon, { Props as LoadingIconProps } from '../LoadingIcon';
import Text from './text';

const isReallyShowChecked: (args: {
  type: T.ContentType;
  in3D: boolean;
  in3DPointCloud: boolean;
}) => boolean = ({
  type, in3D, in3DPointCloud,
}) => {
  switch (type) {
    case T.ContentType.MAP:
    case T.ContentType.DSM:
    case T.ContentType.GCP_GROUP:
      return (!in3D && !in3DPointCloud);
    case T.ContentType.THREE_D_ORTHO:
      return (in3D && !in3DPointCloud);
    case T.ContentType.THREE_D_MESH:
      return (in3D && !in3DPointCloud);
    case T.ContentType.POINTCLOUD:
      return (in3D && in3DPointCloud);
    default:
      return true;
  }
};

const RelativeDiv = styled.div({ position: 'relative' });
export const CheckBox = styled.div({
  cursor: 'pointer',
});

const FailedStatusIcon =
  styled(FailedStatusSvg)({
    marginRight: '1px',
  });

const loadingDivCustomStyle: LoadingIconProps['loadingDivCustomStyle'] = {
  width: '14px',
  height: '14px',
};

export interface Props {
  readonly content: T.Content;
  readonly isProcessingOrFailed: boolean;
  readonly isFailed: boolean;
  readonly trackAction?: string;
  readonly trackLabel?: string;
}

export const ContentsListItemCheckbox: FC<Props> = ({
  content, isProcessingOrFailed: isProcessing, isFailed, trackAction, trackLabel,
}) => {
  const [l10n]: UseL10n = useL10n();
  const dispatch: Dispatch = useDispatch();
  const {
    Contents, ProjectConfigPerUser, Pages, Pages: { Contents: { in3D, in3DPointCloud } },
  }: T.State = useSelector((state: T.State) => state);
  const shouldContentDisabled: UseShouldContentDisabled = useShouldContentDisabled(content.type);
  const contentId: T.Content['id'] = content.id;
  const isSelected: boolean = contentsSelector.isSelected(Contents, ProjectConfigPerUser)(content.id);
  const isReallyDisplayChecked: boolean = isReallyShowChecked({
    type: content.type, in3D, in3DPointCloud,
  });
  const isShowChecked: boolean = isSelected && isReallyDisplayChecked;

  const handleSelect: (e: MouseEvent) => void = (e) => {
    e.stopPropagation();
    if (shouldContentDisabled) return;

    if (isFailed) {
      dispatch(OpenContentPagePopup({
        popup: T.ContentPagePopupType.PROGRESS_BAR, contentId,
      }));

      return;
    }

    if (isProcessing) {
      dispatch(OpenContentPagePopup({
        popup: T.ContentPagePopupType.PROGRESS_BAR, contentId,
      }));

      return;
    }

    switch (content.type) {
      case T.ContentType.ESS_MODEL:
      case T.ContentType.ESS_ARROW:
      case T.ContentType.ESS_POLYLINE:
      case T.ContentType.ESS_POLYGON:
      case T.ContentType.ESS_TEXT: {
        dispatch(PatchESSContent({
          content: {
            id: contentId,
            config: {
              selectedAt: isSelected ? undefined : new Date(),
            },
          },
          skipDBUpdate: true,
        }));
        break;
      }
      default: {
        dispatch(PatchContent({
          content: {
            id: contentId,
            config: {
              selectedAt: isSelected ? undefined : new Date(),
            },
          },
        }));
      }
    }

    if (!isSelected) {
      /**
       * @todo This switch should be in the correct component
       */
      switch (content.type) {
        case T.ContentType.MARKER:
        case T.ContentType.LENGTH:
        case T.ContentType.AREA:
        case T.ContentType.VOLUME:
          break;
        case T.ContentType.MAP:
        case T.ContentType.DSM:
        case T.ContentType.GCP_GROUP:
          unSelect(T.ContentType.THREE_D_ORTHO);
          unSelect(T.ContentType.THREE_D_MESH);
          unSelect(T.ContentType.POINTCLOUD);
          if (in3D) dispatch(ChangeIn3D({ in3D: false }));
          if (in3DPointCloud) dispatch(ChangeIn3DPointCloud({ in3DPointCloud: false }));
          break;
        case T.ContentType.THREE_D_ORTHO:
          unSelect(T.ContentType.THREE_D_MESH);
          unSelect(T.ContentType.POINTCLOUD);
          if (in3DPointCloud) dispatch(ChangeIn3DPointCloud({ in3DPointCloud: false }));
          if (!in3D) dispatch(ChangeIn3D({ in3D: true }));
          break;
        case T.ContentType.THREE_D_MESH:
          unSelect(T.ContentType.THREE_D_ORTHO);
          unSelect(T.ContentType.POINTCLOUD);
          if (in3DPointCloud) dispatch(ChangeIn3DPointCloud({ in3DPointCloud: false }));
          if (!in3D) dispatch(ChangeIn3D({ in3D: true }));
          break;
        case T.ContentType.POINTCLOUD:
          unSelect(T.ContentType.THREE_D_ORTHO);
          unSelect(T.ContentType.THREE_D_MESH);
          if (!in3DPointCloud) dispatch(ChangeIn3DPointCloud({ in3DPointCloud: true }));
          if (!in3D) dispatch(ChangeIn3D({ in3D: true }));
          break;
        default:
      }
    }
  };

  function unSelect(another3DContentType: T.Content['type']): void {
    const another3DContentId: T.PointCloudContent['id'] | T.ThreeDOrthoContent['id'] | undefined = getSingleContentId(
      Contents, Pages, ProjectConfigPerUser, another3DContentType,
    );
    if (another3DContentId === undefined) return;

    const isAnother3DContentSelected: boolean = contentsSelector.isSelected(Contents, ProjectConfigPerUser)(another3DContentId);
    if (isAnother3DContentSelected) {
      dispatch(PatchContent({
        content: {
          id: another3DContentId,
          config: {
            selectedAt: undefined,
          },
        },
      }));
    }
  }

  const alternativeIcon: ReactNode = isFailed ?
    <FailedStatusIcon /> :
    isProcessing ?
      <LoadingIcon loadingDivCustomStyle={loadingDivCustomStyle} /> :
      undefined;

  const checkBoxSvg: ReactNode = isShowChecked ? <CheckSvg /> : <UncheckSvg />;
  const checkBox: ReactNode = isProcessing ?
    <LoadingIcon loadingDivCustomStyle={loadingDivCustomStyle} /> :
    <CheckBox onClick={handleSelect}>{shouldContentDisabled ? <DisabledUncheckSvg /> : checkBoxSvg}</CheckBox>;

  const checkboxTooltipText: string = l10n(isShowChecked ? Text.tooltipUnselectText : Text.tooltipSelectText);
  const result: ReactNode = alternativeIcon !== undefined ?
    alternativeIcon :
    (<RelativeDiv>
      <Tippy
        offset={T.TIPPY_OFFSET}
        theme='angelsw'
        placement='bottom'
        arrow={false}
        content={checkboxTooltipText}
      >
        <CheckBox
          onClick={handleSelect}
          data-ddm-track-action={trackAction}
          data-ddm-track-label={trackLabel}
        >
          {checkBox}
        </CheckBox>
      </Tippy>
    </RelativeDiv>);

  return (
    <>{result}</>
  );
};
