import * as Sentry from '@sentry/browser';
import * as T from '^/types';
import { calculateHash } from '^/utilities/file-util';
import { ActionsObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { AjaxError } from 'rxjs/ajax';
import { catchError, filter, mergeMapTo, take } from 'rxjs/operators';
import { ofType } from 'tsdux-observable';
import { ActionType } from 'typesafe-actions';
import { Action as ContentsAction, AddContent, ChangeUploadContent, FinishUploadContent, PatchContent } from '.';
import { getRequestErrorType } from '../API';
import { FinishPostAttachmentNew, PostAttachmentNew } from '../Attachments';
import { ChangeContentsSidebarTab, OpenContentPagePopup } from '../Pages';
import { GetScreens } from '../Screens';
import { AddContentToTree } from '../Groups';

interface ComposableActionsBaseParams {
  content: T.Content;
  file: File;
  attachmentType: T.AttachmentType;
}

type ComposableAction<U> = Array<ActionType<U>>;

type CABP = ComposableActionsBaseParams;

export interface AddContentComposableParams {
  content: CABP['content'];
}

export function AddContentComposable({ content }: AddContentComposableParams): ComposableAction<typeof AddContent | typeof AddContentToTree> {
  return [
    AddContent({ content }),
    AddContentToTree({ content, moveOption: T.MoveOption.FIRST }),
  ];
}

export type ChangeUploadContentComposableParams = CABP;

export function ChangeUploadContentComposable({
  content,
  attachmentType,
  file,
}: ChangeUploadContentComposableParams): ComposableAction<typeof ChangeUploadContent> {
  return [ChangeUploadContent({
    content: {
      id: content.id,
      type: attachmentType,
      file: [{ size: file.size, hash: calculateHash(file) }],
      uploadedAt: new Date(),
      status: T.APIStatus.PROGRESS,
    },
  })];
}

export type OpenContentPagePopupComposableParams = AddContentComposableParams;

export function OpenContentPagePopupComposable({
  content,
}: OpenContentPagePopupComposableParams): ComposableAction<typeof OpenContentPagePopup> {
  return [OpenContentPagePopup({
    popup: T.ContentPagePopupType.PROGRESS_BAR, contentId: content.id,
  })];
}

export type PostAttachmentNewComposableParams = CABP;

export function PostAttachmentNewComposable({
  content,
  attachmentType,
  file,
}: PostAttachmentNewComposableParams): ComposableAction<typeof PostAttachmentNew> {
  return [PostAttachmentNew({
    contentId: content.id,
    file,
    attachmentType,
    s3FileName: attachmentType === T.AttachmentType.POINTCLOUD ? 'data.las' : undefined,
  })];
}

export interface FinishPostAttachmentNewComposableParams<U> {
  action$: U;
  content: CABP['content'];
}

export function FinishPostAttachmentNewComposable<U extends ActionsObservable<ContentsAction>>({
  action$, content,
}: FinishPostAttachmentNewComposableParams<U>): Observable<ContentsAction> {
  return action$.pipe(
    ofType(FinishPostAttachmentNew),
    filter(({ contentId }) => contentId === content.id),
    take(1),
    mergeMapTo([]),
    catchError((ajaxError: AjaxError) => {
      Sentry.captureException(ajaxError);

      return [
        FinishUploadContent({ contentId: content.id, error: getRequestErrorType(ajaxError) }),
      ];
    }),
  );
}

/**
 * Update availableDates only when you are making DSM, Map contents, or overlay contents
 */
export const GetScreensIfNeeded: (
  params: {
    content: T.Content;
    projectId: T.Project['id'];
  }) => ComposableAction<typeof GetScreens> = ({
    content: { type },
    projectId,
  }) => [...T.DSMorMapContentTypes].includes(type) ? [GetScreens({ projectId })] : [];

export function OpenOverlayTabIfNeededComposable({ content }: {
  content: T.Content;
}): ComposableAction<typeof ChangeContentsSidebarTab | typeof PatchContent> {
  if (content.category === T.ContentCategory.OVERLAY) {
    const actions: ComposableAction<typeof ChangeContentsSidebarTab | typeof PatchContent> = [
      ChangeContentsSidebarTab({ sidebarTab: T.ContentPageTabType.OVERLAY }),
    ];

    if (content.groupId !== undefined) {
      return actions.concat([
        PatchContent({ content: { id: content.groupId, info: { isOpened: true } } }),
      ]);
    }
  }

  return [];
}

export interface ContentUploadManager<U> extends CABP, FinishPostAttachmentNewComposableParams<U> {}

export type ContentUploadManagerOutput = Readonly<[
  ComposableAction<typeof AddContent | typeof AddContentToTree>,
  ComposableAction<typeof ChangeUploadContent>,
  ComposableAction<typeof OpenContentPagePopup>,
  ComposableAction<typeof PostAttachmentNew>,
  ComposableAction<typeof ChangeContentsSidebarTab | typeof PatchContent>,
  Observable<ContentsAction>,
]>;

export function contentUploadManager<
  U extends ActionsObservable<ContentsAction>
>({
  action$, content,
  file, attachmentType,
}: ContentUploadManager<U>): ContentUploadManagerOutput {
  return [
    AddContentComposable({ content }),
    ChangeUploadContentComposable({ content, attachmentType, file }),
    OpenContentPagePopupComposable({ content }),
    PostAttachmentNewComposable({ content, attachmentType, file }),
    OpenOverlayTabIfNeededComposable({ content }),
    FinishPostAttachmentNewComposable({ action$, content }),
  ];
}
