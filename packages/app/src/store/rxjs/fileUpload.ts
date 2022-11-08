import { Observable, Subject, Subscriber, merge } from 'rxjs';
import {
  AjaxRequest,
  AjaxResponse,
  ajax,
} from 'rxjs/ajax';
import { tap } from 'rxjs/operators';

export type FileUploadProgress = Readonly<{
  progress: number;
  total: number;
}>;
export type FileUploadResponse = FileUploadProgress | AjaxResponse;

type IsFileUploadProgress = (
  response: FileUploadResponse,
) => response is FileUploadProgress;
export const isFileUploadProgress: IsFileUploadProgress = (
  response: FileUploadResponse,
): response is FileUploadProgress => !((response as AjaxResponse).request as boolean);

type FileUpload = (
  url: Exclude<AjaxRequest['url'], undefined>,
  body: FormData,
  headers?: AjaxRequest['headers'],
  responseType?: AjaxRequest['responseType'],
) => Observable<FileUploadResponse>;
export const fileUpload: FileUpload = (
  url, body, headers?, responseType?,
): Observable<FileUploadResponse> => {
  const transferSubject: Subject<FileUploadProgress> =
    new Subject<FileUploadProgress>();

  const request: AjaxRequest = {
    method: 'POST',
    url,
    body,
    headers,
    progressSubscriber: Subscriber.create((event: ProgressEvent) => {
      transferSubject.next({
        progress: event.loaded,
        total: event.total,
      });
    }),
    responseType: (responseType !== undefined ? responseType : 'json'),
  };

  return merge(
    ajax(request).pipe(
      tap(() => transferSubject.complete()),
    ),
    transferSubject,
  );
};
