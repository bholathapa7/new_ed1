import { Observable, of } from 'rxjs';
import { AjaxRequest, AjaxResponse, ajax } from 'rxjs/ajax';
import { catchError, first } from 'rxjs/operators';
import { exhaustiveCheck } from '../exhaustive-check';
import { AJAX_METHOD, AjaxParams, MsgFromMainThread } from './types';

self.addEventListener('message', async ({ data }) => {
  const parsedData: MsgFromMainThread = JSON.parse(data);
  let ajax$: Observable<AjaxResponse>;
  switch (parsedData.method) {
    case AJAX_METHOD.GET: {
      const { url, headers }: AjaxParams = parsedData.ajaxParams as AjaxParams;
      ajax$ = ajax.get(url, headers);
      break;
    }
    case AJAX_METHOD.POST: {
      const { url, body, headers }: AjaxParams = parsedData.ajaxParams as AjaxParams;
      ajax$ = ajax.post(url, body, headers);
      break;
    }
    case AJAX_METHOD.DELETE: {
      const { url, headers }: AjaxParams = parsedData.ajaxParams as AjaxParams;
      ajax$ = ajax.delete(url, headers);
      break;
    }
    case AJAX_METHOD.PATCH: {
      const { url, body, headers }: AjaxParams = parsedData.ajaxParams as AjaxParams;
      ajax$ = ajax.patch(url, body, headers);
      break;
    }
    case AJAX_METHOD.BASIC:
      ajax$ = ajax(parsedData.ajaxParams as string | AjaxRequest);
      break;
    case AJAX_METHOD.RAW:
      const response: AjaxResponse = await ajax(parsedData.ajaxParams as string | AjaxRequest).toPromise();
      self.postMessage(response.response);

      return;
      break;
    default:
      exhaustiveCheck(parsedData.method);
  }
  const resp: AjaxResponse = await ajax$.pipe(
    first(),
    catchError((error) => {
      self.postMessage(JSON.stringify({ error }));

      return of(error);
    }),
  ).toPromise();

  self.postMessage(JSON.stringify(resp));
});
