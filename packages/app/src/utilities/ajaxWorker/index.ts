import { Observable, from } from 'rxjs';
import * as RxjsAjax from 'rxjs/ajax';
import { AjaxCreationMethod } from 'rxjs/internal/observable/dom/AjaxObservable';
import Worker from 'worker-loader!./worker';
import { AJAX_METHOD, AjaxMethod, AjaxParams } from './types';

function createAjaxFromWorker(w: Worker, method: AjaxMethod): Observable<AjaxResponse> {
  return from(new Promise<AjaxResponse>((resolve, reject) => {
    w.onmessage = ({ data }: MessageEvent) => {
      const resp: AjaxResponse = method === AJAX_METHOD.RAW ? data : JSON.parse(data);

      resolve(resp);
      w.terminate();
    };
    w.onerror = (msgEvent: ErrorEvent) => {
      reject(JSON.parse(msgEvent.error));
      w.terminate();
    };
  }));
}


function initializeWorker(ajaxParams: AjaxParams | (string | AjaxRequest), method: AjaxMethod): Observable<AjaxResponse> {
  const worker: Worker = new Worker();
  worker.postMessage(JSON.stringify({ ajaxParams, method }));

  return createAjaxFromWorker(worker, method);
}

export const ajax: {
  get: AjaxCreationMethod['get'];
  post: AjaxCreationMethod['post'];
  delete: AjaxCreationMethod['delete'];
  patch: AjaxCreationMethod['patch'];
  basic(urlOrRequest: string | AjaxRequest): Observable<AjaxResponse>;
  raw(urlOrRequest: string | AjaxRequest): Observable<AjaxResponse>;
} = {
  raw: (urlOrRequest) => initializeWorker(urlOrRequest, AJAX_METHOD.RAW),
  basic: (urlOrRequest) => initializeWorker(urlOrRequest, AJAX_METHOD.BASIC),
  get: (url, headers) => initializeWorker({ url, headers }, AJAX_METHOD.GET),
  post: (url, body, headers) => initializeWorker({ url, headers, body }, AJAX_METHOD.POST),
  delete: (url, headers) => initializeWorker({ url, headers }, AJAX_METHOD.DELETE),
  patch: (url, body, headers) => initializeWorker({ url, headers, body }, AJAX_METHOD.PATCH),
};

export type AjaxError = RxjsAjax.AjaxError;
export type AjaxRequest = RxjsAjax.AjaxRequest;
export type AjaxResponse = RxjsAjax.AjaxResponse;
