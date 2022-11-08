import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import OlGCPGroupLayer from '^/components/atoms/OlGCPGroupLayer';
import { PatchContent, contentsSelector } from '^/store/duck/Contents';
import * as T from '^/types';
import { getSingleContentId } from '^/utilities/state-util';

function OlCreatingGCPGroupLayer(): ReactElement | null {
  const dispatch: Dispatch = useDispatch();

  const creatingGCPGroupInfo: T.ContentsPageState['creatingGCPGroupInfo'] = useSelector((s: T.State) => s.Pages.Contents.creatingGCPGroupInfo);
  const gcpGroupContentId: T.GCPGroupContent['id'] | undefined = useSelector(
    (s: T.State) => getSingleContentId(s.Contents, s.Pages, s.ProjectConfigPerUser, T.ContentType.GCP_GROUP),
  );
  const isGCPGroupContentSelected: boolean = useSelector(
    (s: T.State) => contentsSelector.isSelected(s.Contents, s.ProjectConfigPerUser)(gcpGroupContentId),
  );

  useEffect(() => {
    if (creatingGCPGroupInfo === undefined) return;

    if (gcpGroupContentId !== undefined && isGCPGroupContentSelected) {
      dispatch(PatchContent({ content: { id: gcpGroupContentId, config: { selectedAt: undefined } } }));
    }
  }, [creatingGCPGroupInfo]);

  return (() => {
    if (creatingGCPGroupInfo === undefined) return null;

    return (
      <OlGCPGroupLayer
        gcps={creatingGCPGroupInfo.gcps}
        crs={creatingGCPGroupInfo.crs}
      />
    );
  })();
}

export default OlCreatingGCPGroupLayer;
