import { AjaxRequest } from 'rxjs/ajax';

export const enum AJAX_METHOD {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  BASIC = 'BASIC',
  RAW = 'RAW',
}

export type AjaxMethod =
  AJAX_METHOD.GET | AJAX_METHOD.POST | AJAX_METHOD.PATCH | AJAX_METHOD.DELETE | AJAX_METHOD.BASIC | AJAX_METHOD.RAW;

export interface AjaxParams {
  url: string;
  headers?: object;
  body?: any;
}

export interface MsgFromMainThread {
  ajaxParams: AjaxParams | (string | AjaxRequest);
  method: AjaxMethod;
}

export interface BasicAjaxParams {
  urlOrRequest?: string | AjaxRequest;
}

export interface AjaxWorkerEvent extends MessageEvent {
  data: AjaxParams;
}
