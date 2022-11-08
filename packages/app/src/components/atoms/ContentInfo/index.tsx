import Tippy from '@tippyjs/react';
import { UseL10n, useL10n } from '^/hooks';
import React, { ReactElement, ReactNode, memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Placement as TippyPlacement } from 'tippy.js';

import ContentInfoSvg from '^/assets/icons/contents-list/content-info.svg';
import * as T from '^/types';
import { ApplyOptionIfKorean, GetCommonFormat, formatWithOffset } from '^/utilities/date-format';
import { L10nDictionary } from '^/utilities/l10n';
import Text from './text';
import palette from '^/constants/palette';

const CREATED_AT_TITLE_MAP: { [key in T.ContentType]: L10nDictionary } = {
  [T.ContentType.AREA]: Text.tooltipCreatedAt,
  [T.ContentType.LENGTH]: Text.tooltipCreatedAt,
  [T.ContentType.MARKER]: Text.tooltipCreatedAt,
  [T.ContentType.VOLUME]: Text.tooltipCreatedAt,
  [T.ContentType.BLUEPRINT_PDF]: Text.tooltipUploadedAt,
  [T.ContentType.BLUEPRINT_DXF]: Text.tooltipUploadedAt,
  [T.ContentType.BLUEPRINT_DWG]: Text.tooltipUploadedAt,
  [T.ContentType.DESIGN_DXF]: Text.tooltipUploadedAt,
  [T.ContentType.MAP]: Text.tooltipCreatedUploadedAt,
  [T.ContentType.DSM]: Text.tooltipCreatedUploadedAt,
  [T.ContentType.THREE_D_ORTHO]: Text.tooltipAutoCreatedAt,
  [T.ContentType.POINTCLOUD]: Text.tooltipCreatedUploadedAt,
  [T.ContentType.THREE_D_MESH]: Text.tooltipCreatedUploadedAt,
  [T.ContentType.GCP_GROUP]: Text.tooltipCreatedUploadedAt,
  [T.ContentType.ESS_MODEL]: Text.tooltipCreatedAt,
  [T.ContentType.ESS_ARROW]: Text.tooltipCreatedAt,
  [T.ContentType.ESS_POLYGON]: Text.tooltipCreatedAt,
  [T.ContentType.ESS_POLYLINE]: Text.tooltipCreatedAt,
  [T.ContentType.ESS_TEXT]: Text.tooltipCreatedAt,
  [T.ContentType.GROUP]: Text.tooltipCreatedAt,
};


const Content = styled.span({
  fontWeight: 'bold',
});

export interface Props {
  readonly contentId: T.Content['id'];
  readonly tooltipPlacement?: TippyPlacement;
}

const InfoIcon = styled(ContentInfoSvg)({
  width: '13px',
  height: '13px',
  fill: palette.ContentsList.balloonHeaderIconGray.toString(),
});

function ContentInfo({ contentId, tooltipPlacement: placement = 'bottom' }: Props): ReactElement {
  const [l10n, lang]: UseL10n = useL10n();

  const contentType: T.ContentType = useSelector((s: T.State) => s.Contents.contents.byId[contentId].type);
  const createdAt: string = useSelector((s: T.State) =>
    formatWithOffset(
      s.Pages.Common.timezoneOffset,
      s.Contents.contents.byId[contentId].createdAt,
      GetCommonFormat({ lang, hasDay: true }),
      ApplyOptionIfKorean(lang),
    ));
  const createdBy: string | undefined = useSelector((s: T.State) => {
    if (T.MAP_TAB_CONTENTS.includes(contentType)) return;

    return s.Contents.contents.byId[contentId].createdBy?.name;
  });

  const tooltipCreatedBy: ReactNode = useMemo(() => createdBy !== undefined ? (
    <div>
      <span>{`${l10n(Text.tooltipCreatedBy)}: `}</span>
      <Content>{createdBy}</Content>
    </div>
  ) : null, [createdBy, l10n]);

  const tooltipContent: ReactNode = useMemo(() => (
    <>
      <div>
        <span>{`${l10n(CREATED_AT_TITLE_MAP[contentType])}: `}</span>
        <Content>{createdAt}</Content>
      </div>
      {tooltipCreatedBy}
    </>
  ), [contentType, createdAt, tooltipCreatedBy, l10n]);

  // Do not remove <div>. Without the <div>, the tooltip won't work.
  const icon = (
    <div>
      <InfoIcon />
    </div>
  );

  return (
    <Tippy theme='angelsw' offset={T.TIPPY_OFFSET} arrow={false} placement={placement} content={tooltipContent}>
      {icon}
    </Tippy>
  );
}

export default memo(ContentInfo);
