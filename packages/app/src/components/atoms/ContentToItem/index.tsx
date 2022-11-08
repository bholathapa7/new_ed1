import React, { FC } from 'react';
import { useSelector } from 'react-redux';

import ContentsListAreaItem from '^/components/molecules/ContentsListAreaItem';
import { ContentsListBlueprintItem } from '^/components/molecules/ContentsListBlueprintItem';
import { ContentsListESSModelItem } from '^/components/molecules/ContentsListESSModelItem';
import { ContentsListESSArrowItem } from '^/components/molecules/ContentsListESSArrowItem';
import { ContentsListESSTextItem } from '^/components/molecules/ContentsListESSTextItem';
import { ContentsListGCPGroupItem } from '^/components/molecules/ContentsListGCPGroupItem';
import ContentsListLengthItem from '^/components/molecules/ContentsListLengthItem';
import { ContentsListMapAndDSMItem } from '^/components/molecules/ContentsListMapAndDSMItem';
import { ContentsListMarkerItem } from '^/components/molecules/ContentsListMarkerItem';
import { ContentsListPointCloudItem } from '^/components/molecules/ContentsListPointCloudItem';
import { ContentsListThreeDMeshItem } from '^/components/molecules/ContentsListThreeDMeshItem';
import { ContentsListThreeDOrthoItem } from '^/components/molecules/ContentsListThreeDOrthoItem';
import { ContentsListVolumeItem } from '^/components/molecules/ContentsListVolumeItem';
import { GroupList } from '^/components/organisms/ContentsTreeList';
import * as T from '^/types';
import { withFeatureToggle } from '^/utilities/withFeatureToggle';
import { isContentPinned } from '^/utilities/content-util';

interface ListItemProps<Content> {
  readonly content: Content;
  readonly isPinned?: boolean;
}

const contentTypeListItem: {
  [K in T.Content['type']]: FC<ListItemProps<T.Content>>
} = {
  [T.ContentType.AREA]: withFeatureToggle(T.Feature.DDM)(ContentsListAreaItem),
  [T.ContentType.LENGTH]: withFeatureToggle(T.Feature.DDM)(ContentsListLengthItem),
  [T.ContentType.MARKER]: withFeatureToggle(T.Feature.DDM)(ContentsListMarkerItem),
  [T.ContentType.VOLUME]: withFeatureToggle(T.Feature.DDM)(ContentsListVolumeItem),
  [T.ContentType.BLUEPRINT_PDF]: withFeatureToggle(T.Feature.DDM)(ContentsListBlueprintItem),
  [T.ContentType.BLUEPRINT_DXF]: withFeatureToggle(T.Feature.DDM)(ContentsListBlueprintItem),
  [T.ContentType.BLUEPRINT_DWG]: withFeatureToggle(T.Feature.DDM)(ContentsListBlueprintItem),
  [T.ContentType.DESIGN_DXF]: withFeatureToggle(T.Feature.DDM)(ContentsListBlueprintItem),
  [T.ContentType.MAP]: withFeatureToggle(T.Feature.DDM)(ContentsListMapAndDSMItem),
  [T.ContentType.DSM]: withFeatureToggle(T.Feature.DDM)(ContentsListMapAndDSMItem),
  [T.ContentType.POINTCLOUD]: withFeatureToggle(T.Feature.DDM)(ContentsListPointCloudItem),
  [T.ContentType.GCP_GROUP]: withFeatureToggle(T.Feature.DDM)(ContentsListGCPGroupItem),
  [T.ContentType.ESS_MODEL]: withFeatureToggle(T.Feature.ESS)(ContentsListESSModelItem),
  [T.ContentType.ESS_ARROW]: withFeatureToggle(T.Feature.ESS)(ContentsListESSArrowItem),
  [T.ContentType.ESS_POLYGON]: withFeatureToggle(T.Feature.ESS)(ContentsListESSArrowItem),
  [T.ContentType.ESS_POLYLINE]: withFeatureToggle(T.Feature.ESS)(ContentsListESSArrowItem),
  [T.ContentType.ESS_TEXT]: withFeatureToggle(T.Feature.ESS)(ContentsListESSTextItem),
  // These two should be available on both ESS and DDM.
  [T.ContentType.THREE_D_MESH]: ContentsListThreeDMeshItem,
  [T.ContentType.THREE_D_ORTHO]: ContentsListThreeDOrthoItem,
  [T.ContentType.GROUP]: GroupList,
};


interface Props {
  contentId?: T.Content['id'];
}

export const ContentToItem: FC<Props> = ({ contentId }) => {
  const content: T.Content | undefined = useSelector((s: T.State) => s.Contents.contents.byId[contentId ?? NaN]);

  if (content === undefined) return <></>;

  const isPinned = isContentPinned(content);
  const ListItem: FC<ListItemProps<T.Content>> = contentTypeListItem[content.type];

  return (<ListItem key={contentId} content={content} isPinned={isPinned} />);
};
