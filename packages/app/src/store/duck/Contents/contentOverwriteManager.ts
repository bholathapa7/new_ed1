import _ from 'lodash-es';

import { QueryContentWithTypeAndScreenId, getShouldOverwriteMapTab, queryContent } from '^/hooks';
import { AttachmentType, Content, ContentType, ContentsQueryParam, MAP_TAB_CONTENTS, Screen, State } from '^/types';
import { ActionsObservable } from 'redux-observable';
import { Observable, concat, from, of } from 'rxjs';
import { ofType } from 'tsdux-observable';
import { filter, map, mergeMap, take } from 'rxjs/operators';

import { TEMP_SCREEN_ID } from '^/utilities/screen-util';
import { PostScreen, AddScreenInStore } from '../Screens';
import { DeleteContent, Action as ContentsAction, FinishDeleteContent } from '.';

interface OverwriteCondition {
  contents: State['Contents']['contents'];
  screenId: Screen['id'];
  attachmentType: AttachmentType;
}

export function getContentOverwriteCondition({
  contents,
  screenId,
  attachmentType,
}: OverwriteCondition): boolean {
  if (screenId === TEMP_SCREEN_ID) return false;
  const getContentByTypeAndScreenId: QueryContentWithTypeAndScreenId =
    queryContent(contents, ContentsQueryParam.TYPE_AND_SCREENID) as QueryContentWithTypeAndScreenId;

  const [hasDSM, hasTwoDOrtho, hasPointCloud, hasThreeDOrtho, hasThreeDMesh]: Array<boolean> =
    [ContentType.DSM, ContentType.MAP, ContentType.POINTCLOUD, ContentType.THREE_D_ORTHO, ContentType.THREE_D_MESH]
      .map((c) => Boolean(getContentByTypeAndScreenId(c, screenId, { processingOrFailed: true })));

  return getShouldOverwriteMapTab(attachmentType, {
    hasDSM, hasTwoDOrtho, hasPointCloud, hasThreeDOrtho, hasThreeDMesh,
  });
}

export const OverwritingContentTypes: {
  [K in AttachmentType.SOURCE | AttachmentType.ORTHO | AttachmentType.POINTCLOUD | AttachmentType.DSM]: ContentType[];
} = {
  [AttachmentType.DSM]: [ContentType.DSM],
  [AttachmentType.ORTHO]: [ContentType.MAP],
  [AttachmentType.POINTCLOUD]: [ContentType.POINTCLOUD],
  [AttachmentType.SOURCE]: MAP_TAB_CONTENTS,
};

export interface ContentOverwriteManagerInput<U> {
  contents: State['Contents']['contents'];
  screen: Screen;
  attachmentType: AttachmentType.DSM | AttachmentType.ORTHO | AttachmentType.POINTCLOUD | AttachmentType.SOURCE;
  action$: U;
  postAndUpload(screenId?: number): Observable<ContentsAction>;
}

export function contentOverwriteManager<U extends ActionsObservable<ContentsAction>>({
  contents: { allIds, byId },
  screen,
  postAndUpload,
  action$,
  attachmentType,
}: ContentOverwriteManagerInput<U>): Observable<ContentsAction> {
  const isNewScreen: boolean = screen.id === TEMP_SCREEN_ID;

  if (isNewScreen) {
    return concat<ContentsAction>(
      [PostScreen(screen)],
      action$.pipe(
        ofType(AddScreenInStore),
        take(1),
        mergeMap(({ screen: s }) => postAndUpload(s.id)),
      ),
    );
  } else {
    const mapContentsThatNeedOverwriting: Content[] =
      allIds
        .map((id) => byId[id])
        .filter(({ screenId, type }) => screenId === screen.id && OverwritingContentTypes[attachmentType].includes(type));

    const deleteContentsIfNeeded: Observable<ContentsAction> = from(mapContentsThatNeedOverwriting).pipe(
      mergeMap(({ id: contentId }) => of(DeleteContent({ contentId }))),
    );

    const toBeDeletedContentsLength: number = mapContentsThatNeedOverwriting.length;

    if (toBeDeletedContentsLength === 0) return postAndUpload(screen.id);

    return concat<ContentsAction>(
      deleteContentsIfNeeded,
      action$.pipe(
        ofType(FinishDeleteContent),
        filter(({ contentId }) => mapContentsThatNeedOverwriting.some(({ id }) => id === contentId)),
        map(({ contentId }) => {
          _.remove(mapContentsThatNeedOverwriting, ({ id }) => id === contentId);
        }),
        take(toBeDeletedContentsLength),
        filter(() => mapContentsThatNeedOverwriting.length === 0),
        mergeMap(() => postAndUpload(screen.id)),
      ),
    );
  }
}
