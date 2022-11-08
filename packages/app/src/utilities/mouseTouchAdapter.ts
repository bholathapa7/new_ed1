/*
 * Why use this adapter instead of PointerEvent? (https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
 * -----------------------------------------------------------------------------------------------------------------
 * Because the pointermove event is fired when a pointer changes coordinates,
 * and the pointer has not been canceled by a browser touch-action.
 * See details in https://stackoverflow.com/questions/48124372/pointermove-event-not-working-with-touch-why-not
 */

import * as T from '^/types';

export const getFirstMouseOrTouchLocation: (e: T.MouseOrTouchEvent) => T.MouseOrTouchEventLocation = (e) => {
  if ((e as MouseEvent).type === 'mousemove') return e as MouseEvent;

  return (e as TouchEvent).targetTouches[0];
};

type MouseOrTouchEventListener = (target: HTMLElement | Document, cb: (e: T.MouseOrTouchEvent) => void) => void;

function attachMouseAndTouchEventListenerCreator(mouseType: string, touchType?: string): MouseOrTouchEventListener {
  return (target, cb) => {
    target.addEventListener(mouseType, cb);
    if (touchType) {
      target.addEventListener(touchType, cb);
    }
  };
}

function detachMouseAndTouchEventListenerCreator(mouseType: string, touchType?: string): MouseOrTouchEventListener {
  return (target, cb) => {
    target.removeEventListener(mouseType, cb);

    if (touchType) {
      target.removeEventListener(touchType, cb);
    }
  };
}

export const addMouseAndTouchStartEventListener: MouseOrTouchEventListener = attachMouseAndTouchEventListenerCreator(
  'mousedown', 'touchstart',
);
export const removeMouseAndTouchStartEventListener: MouseOrTouchEventListener = detachMouseAndTouchEventListenerCreator(
  'mousedown', 'touchstart',
);

export const addMouseAndTouchMoveEventListener: MouseOrTouchEventListener = attachMouseAndTouchEventListenerCreator(
  'mousemove', 'touchmove',
);
export const removeMouseAndTouchMoveEventListener: MouseOrTouchEventListener = detachMouseAndTouchEventListenerCreator(
  'mousemove', 'touchmove',
);

export const addMouseAndTouchEndEventListener: MouseOrTouchEventListener = attachMouseAndTouchEventListenerCreator(
  'mouseup', 'touchend',
);
export const removeMouseAndTouchEndEventListener: MouseOrTouchEventListener = detachMouseAndTouchEventListenerCreator(
  'mouseup', 'touchend',
);
