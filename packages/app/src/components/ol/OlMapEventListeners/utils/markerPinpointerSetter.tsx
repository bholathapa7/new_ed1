import { MapBrowserEvent } from 'ol';
import OlMap from 'ol/Map';
import { Coordinate } from 'ol/coordinate';
import { Extent, boundingExtent, containsCoordinate } from 'ol/extent';
import { Draw } from 'ol/interaction';

import MarkerPinPointerPNG from '^/assets/icons/marker-pinpointer.png';
import * as T from '^/types';
import { projectionSystemExtentMap } from '^/utilities/coordinate-util';
import { addMouseAndTouchMoveEventListener, removeMouseAndTouchMoveEventListener } from '^/utilities/mouseTouchAdapter';
import { OlCustomPropertyNames } from '../../constants';

const MARKER_PINPOINT_OVERLAY_OFFSET: number = 12;

export const TAB_KEY_CODE: number = 9;

export const ZERO_KEY_CODE: number = 48;
export const NINE_KEY_CODE: number = 57;

export const ZERO_KEY_CODE_NUMPAD: number = 96;
export const NINE_KEY_CODE_NUMPAD: number = 105;

let isInitialFocus: boolean;

/* eslint-disable no-console */
export function setMarkerPinpointerOn(map: OlMap, projectProjection: T.ProjectionEnum): void {
  addMapPointerMoveListner(map);
  addMouseAndTouchMoveEventListener(document, toggleMarkerPinpointerInputs);
  (document as any).map = map; // Only way to execute removeEventListener properly
  (document as any).projectProjection = projectProjection;
  document.addEventListener('keydown', toggleMarkerPinpointerFocus);

  isInitialFocus = true;
  setCustomCursor(map);
}

export function unsetMarkerPinpointerOn(map: OlMap): void {
  removeMapPointerMoveListner(map);
  removeMouseAndTouchMoveEventListener(document, toggleMarkerPinpointerInputs);
  delete (document as any).map;
  delete (document as any).projectProjection;
  document.removeEventListener('keydown', toggleMarkerPinpointerFocus);

  hideMarkerPinpointer();
}

// Type e better way
function toggleMarkerPinpointerInputs(e: any): void {
  try {
    const rootDiv: HTMLElement | null = document.getElementById(OlCustomPropertyNames.OL_ROOT_DIV);
    if (!rootDiv || e.target === null) return;
    const shouldMarkerPinpointerBeActive: boolean = e.target.className === 'ol-layer' || e.target.tagName === 'CANVAS';
    if (shouldMarkerPinpointerBeActive) showMarkerPinpointer();
    else hideMarkerPinpointer();

    setMarkerPinpointerInputsPosition(e);
  } catch (error) {
    console.error(error);

    return;
  }
}

function toggleMarkerPinpointerFocus(event: any): void {
  try {
    listenNumberKeyDown(event);
    listenTabKeyDown(event);
    listenEnterKeyDown(event);
  } catch (error) {
    console.error(error);

    return;
  }
}

function hideMarkerPinpointer(): void {
  const markerPinPointOverlay: HTMLElement | null = document.getElementById('marker-pinpointer');
  if (!markerPinPointOverlay) return;
  markerPinPointOverlay.style.display = 'none';
}

function showMarkerPinpointer(): void {
  const markerPinPointOverlay: HTMLElement | null = document.getElementById('marker-pinpointer');
  if (!markerPinPointOverlay) return;
  markerPinPointOverlay.style.display = 'block';
  markerPinPointOverlay.style.left = '0';
  markerPinPointOverlay.style.top = '0';
  markerPinPointOverlay.style.willChange = 'transform';
}

function setMarkerPinpointerInputsPosition(e: any): void {
  const markerPinPointOverlay: HTMLElement | null = document.getElementById('marker-pinpointer');
  if (!markerPinPointOverlay) return;
  markerPinPointOverlay.style.transform =
    `translate3D(${Number(e.clientX) + MARKER_PINPOINT_OVERLAY_OFFSET}px, ${Number(e.clientY) + MARKER_PINPOINT_OVERLAY_OFFSET}px, 0)`;
}

function setCustomCursor(map: OlMap): void {
  map.getViewport().style.cursor = `url(${MarkerPinPointerPNG}) 35 35, auto`;
}

function addMapPointerMoveListner(map: OlMap): void {
  map.on('pointermove', updatePinpointerCoords);
}

function removeMapPointerMoveListner(map: OlMap): void {
  map.un('pointermove', updatePinpointerCoords);
}

function updatePinpointerCoords(e: MapBrowserEvent): void {
  if (!isInitialFocus) return;

  const [currentX, currentY]: (HTMLElement | null)[] = getTexts();
  const [newX, newY]: (HTMLElement | null)[] = getNewCoords();

  if (e.dragging || newX === null || newY === null) return;

  if (currentX?.firstChild) currentX.firstChild.textContent = newX.textContent;
  if (currentY?.firstChild) currentY.firstChild.textContent = newY.textContent;
}

function listenNumberKeyDown(event: any): void {
  const [, yText]: (HTMLElement | null)[] = getTexts();
  const [xInput, yInput]: (HTMLElement | null)[] = getInputs();

  const isAlreadyFocused: boolean = document.activeElement === xInput || document.activeElement === yInput;
  if (yText === null || isAlreadyFocused) return;

  const isNumberClicked: boolean = ZERO_KEY_CODE <= event.which && event.which <= NINE_KEY_CODE;
  const isNumberPadClicked: boolean = ZERO_KEY_CODE_NUMPAD <= event.which && event.which <= NINE_KEY_CODE_NUMPAD;
  if (isNumberClicked || isNumberPadClicked) yText.focus();
}

function listenTabKeyDown(event: any): void {
  if (event.which !== TAB_KEY_CODE) return;
  event.preventDefault();

  const [xText, yText]: (HTMLElement | null)[] = getTexts();

  if (isOutOfMapExtent(xText, yText, event.currentTarget.projectProjection as T.ProjectionEnum)) {
    return;
  }

  const isXInputActivated: boolean = xText === null;
  const isYInputActivated: boolean = yText === null;
  const isNoInputActivated: boolean = !isXInputActivated && !isYInputActivated;

  if (isNoInputActivated) yText?.focus();

  if (isXInputActivated) yText?.focus();
  if (isYInputActivated) {
    xText?.focus();
    isInitialFocus = false;
  }
}

function listenEnterKeyDown(event: any): void {
  if (event.key !== 'Enter') return;
  event.preventDefault();

  const [xText, yText]: (HTMLElement | null)[] = getTexts();
  const [xInput, yInput]: (HTMLElement | null)[] = getInputs();

  if (isOutOfMapExtent(xText, yText, event.currentTarget.projectProjection as T.ProjectionEnum)) {
    return;
  }

  const map: OlMap = event.currentTarget.map as OlMap;

  const coords: number[] = [getXCoordFrom(xText, xInput), getYCoordFrom(yText, yInput)];

  dispatchDrawEndEventWith(coords, map);
}

function isOutOfMapExtent(xText: HTMLElement | null, yText: HTMLElement | null, projectProjection: T.ProjectionEnum): boolean {
  try {
    const isBothInputsNotActivated: boolean = xText !== null && yText !== null;
    if (isBothInputsNotActivated) return false;

    const editingCoords: Coordinate = getEditingCoordsFrom(xText, yText);

    const extent: Extent = boundingExtent(projectionSystemExtentMap[projectProjection]);

    return !containsCoordinate(extent, editingCoords);
  } catch (e) {
    console.error(e);

    return true;
  }
}

function getInputs(): (HTMLElement | null)[] {
  return [
    document.getElementById('marker-pinpointer-x-input'),
    document.getElementById('marker-pinpointer-y-input'),
  ];
}

function getTexts(): (HTMLElement | null)[] {
  return [
    document.getElementById('marker-pinpointer-x-text'),
    document.getElementById('marker-pinpointer-y-text'),
  ];
}

function getNewCoords(): (HTMLElement | null)[] {
  return [
    document.getElementById('coordX'),
    document.getElementById('coordY'),
  ];
}

function dispatchDrawEndEventWith(coords: Coordinate, map: OlMap): void {
  map.getInteractions().forEach((interaction) => {
    if (interaction instanceof Draw) {
      const drawEvent: any = {
        type: 'drawend',
        target: interaction,
        unprojectedLocation: [coords],
      };
      interaction.dispatchEvent(drawEvent);
    }
  });
}

/* eslint-disable @typescript-eslint/strict-boolean-expressions */
function getXCoordFrom(xText: HTMLElement | null, xInput: HTMLElement | null): number {
  return xText !== null ?
    parseFloat(xText.textContent || '') :
    xInput instanceof HTMLInputElement ? parseFloat(xInput.value) : 0;
}

function getYCoordFrom(yText: HTMLElement | null, yInput: HTMLElement | null): number {
  return yText !== null ?
    parseFloat(yText.textContent || '') :
    yInput instanceof HTMLInputElement ? parseFloat(yInput.value) : 0;
}

function getEditingCoordsFrom(xText: HTMLElement | null, yText: HTMLElement | null): Coordinate {
  const [xInput, yInput]: (HTMLElement | null)[] = getInputs();

  const isXInputActivated: boolean = xText === null;
  const isYInputActivated: boolean = yText === null;

  if (isXInputActivated && !isYInputActivated) {
    const xInputValue: number = xInput instanceof HTMLInputElement ? parseFloat(xInput.value.trim()) : 0;
    if (isNaN(xInputValue)) throw new Error('X input value is not a number');

    return [xInputValue, parseFloat((yText?.textContent || '').trim())];
  } else if (isYInputActivated && !isXInputActivated) {
    const yInputValue: number = yInput instanceof HTMLInputElement ? parseFloat(yInput.value.trim()) : 0;
    if (isNaN(yInputValue)) throw new Error('Y input value is not a number');

    return [parseFloat((xText?.textContent || '').trim()), yInputValue];
  }

  throw new Error('One Input must be activated here');
}
// eslint-enable @typescript-eslint/strict-boolean-expressions
