import { Coordinate } from 'ol/coordinate';
import { Extent, boundingExtent, containsCoordinate } from 'ol/extent';
import React, { MutableRefObject, ReactNode, useEffect, useRef, useState, FC, KeyboardEvent } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { NINE_KEY_CODE, ZERO_KEY_CODE } from '^/components/ol/OlMapEventListeners/utils/markerPinpointerSetter';
import { LAT_LON_FIX_FORMAT, Y_X_FIX_FORMAT, default2DOrthoZIndex } from '^/constants/defaultContent';
import palette from '^/constants/palette';
import { FontFamily, MediaQuery } from '^/constants/styles';
import { UseEditableTextOutput, UseState, useClickOutside, useEditableText, useProjectCoordinateSystem } from '^/hooks';
import { useLatLongYXLabel } from '^/hooks/useLongLatXYLabel';
import { PatchContent, RequestMarkerElevationInfo } from '^/store/duck/Contents';
import * as T from '^/types';
import { LocationLabel, projectionSystemExtentMap } from '^/utilities/coordinate-util';
import { EditableText, Props as EditableTextProps } from '../EditableText';


const Root = styled.div<{isOnMap: boolean}>(({ isOnMap }) => ({
  // eslint-disable-next-line no-magic-numbers
  zIndex: isOnMap ? default2DOrthoZIndex : undefined,
  width: isOnMap ? 'auto' : '165px',
  position: isOnMap ? 'fixed' : 'relative',
  height: isOnMap ? '60px' : '73px',

  left: isOnMap ? '-9999px' : undefined,
  top: isOnMap ? '-9999px' : undefined,

  [MediaQuery[T.Device.MOBILE_L]]: {
    width: isOnMap ? 'auto' : '145px',
  },
}));

const EditableTextWrapper = styled.div<{isOnMap: boolean}>(({ isOnMap }) => ({
  display: 'flex',
  justifyContent: isOnMap ? undefined : 'space-between',
  alignItems: 'center',

  width: isOnMap ? 'auto' : '100%',
  height: isOnMap ? '27px' : '33px',

  paddingLeft: isOnMap ? '8px' : undefined,
  marginBottom: '3px',

  backgroundColor: isOnMap ? 'rgba(255, 255, 255, 0.9)' : undefined,
  borderRadius: isOnMap ? '3px' : undefined,
  border: isOnMap ? `solid 1px ${palette.ContentsList.inputBorder.toString()}` : undefined,

  fontFamily: FontFamily.NOTOSANS,
  fontSize: isOnMap ? '11px' : '13px',

  whiteSpace: 'nowrap',
}));

const EditableTextOnSidebarWrapper = styled.div({
  width: '147px',
  height: '33px',

  overflow: 'hidden',

  marginLeft: '10px',

  boxSizing: 'border-box',
  borderRadius: '5px' ,
  border: `solid 1px ${palette.ContentsList.inputBorder.toString()}`,

  ':hover' : {
    border: `solid 1px ${palette.ContentsList.hoverInputBorder.toString()}`,
  },

  [MediaQuery[T.Device.MOBILE_L]]: {
    width: '120px',
    marginRight: '4px',
  },
});

const LabelTextWrapper = styled.div<{isLatLon: boolean; isOnMap: boolean}>(({ isLatLon, isOnMap }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  // eslint-disable-next-line no-magic-numbers
  fontWeight: isOnMap ? undefined : 600,
  color: palette.ContentsList.title.toString(),
  width: isLatLon ? '24px' : '12px',
}));


interface Props {
  id?: string;
  contentId?: T.MarkerContent['id'];
  location: T.MarkerPinpointerLocation;
  defaultYX?: string[];
}

const MarkerPinpointer: FC<Props> = ({ id, contentId, location, defaultYX }) => {
  const dispatch: Dispatch = useDispatch();
  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();
  const rootRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  const isLatLon: boolean = projectProjection === T.ProjectionEnum.WGS84_EPSG_4326_LL;

  const isOnMap: boolean = location === T.MarkerPinpointerLocation.MAP;

  const [yLabelOnMap, xLabelOnMap]: string[] = isLatLon ? ['Lat', 'Lon'] : ['Y', 'X'];
  const [yLabelOnSidebar, xLabelOnSidebar]: LocationLabel = useLatLongYXLabel({ proj: projectProjection });

  const [xCoordHasError, setXCoordHasError]: UseState<Readonly<boolean>> = useState(false);
  const [yCoordHasError, setYCoordHasError]: UseState<Readonly<boolean>> = useState(false);
  const [isXcoordEditing, setXcoordEditing]: UseState<Readonly<boolean>> = useState(false);
  const [isYcoordEditing, setYcoordEditing]: UseState<Readonly<boolean>> = useState(false);

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const [defaultY, defaultX]: string[] = defaultYX === undefined ? ['', ''] : defaultYX;

  const {
    textRef: textRefX,
    editingTextRef: editingTextRefX,
    editingText: editingXcoordText,
    setEditingText: setXcoordEditingText,
    ...otherPropsX
  }: UseEditableTextOutput = useEditableText({
    handleTextSave: handleXcoordSave, defaultText: defaultX, isEditing: isXcoordEditing, setIsEditing: setXcoordEditing,
    hasCustomUseClickOutside: !isOnMap,
  });

  const {
    textRef: textRefY,
    editingTextRef: editingTextRefY,
    editingText: editingYcoordText,
    setEditingText: setYcoordEditingText,
    ...otherPropsY
  }: UseEditableTextOutput = useEditableText({
    handleTextSave: handleYcoordSave, defaultText: defaultY, isEditing: isYcoordEditing, setIsEditing: setYcoordEditing,
    hasCustomUseClickOutside: !isOnMap,
  });

  useClickOutside<HTMLDivElement>({ ref: rootRef, callback: () => {
    if (!isOnMap && (isYcoordEditing || isXcoordEditing)) {
      const isXInputActivated: boolean = textRefX.current === null;
      if (isXInputActivated) handleXcoordSave();
      else handleYcoordSave();
    }
  } });

  useEffect(() => {
    if (textRefY.current === null) return;
    const editingCoords: Coordinate = getEditingCoords();
    if (isNaN(parseFloat(editingXcoordText.trim()))) {
      setXCoordHasError(true);

      return;
    }
    setXCoordHasError(isOutOfMapExtent(editingCoords));
  }, [editingXcoordText]);

  useEffect(() => {
    if (textRefX.current === null) return;
    const editingCoords: Coordinate = getEditingCoords();
    if (isNaN(parseFloat(editingYcoordText.trim()))) {
      setYCoordHasError(true);

      return;
    }
    setYCoordHasError(isOutOfMapExtent(editingCoords));
  }, [editingYcoordText]);

  useEffect(() => {
    setXcoordEditingText(defaultX);
    setYcoordEditingText(defaultY);
  }, [defaultYX]);

  function handleXcoordSave(): void {
    if (!isOnMap && xCoordHasError) {
      resetFocusAndTextToDefault();

      return;
    }
    setXcoordEditing(false);
    updateCoords();
  }

  function handleYcoordSave(): void {
    if (!isOnMap && yCoordHasError) {
      resetFocusAndTextToDefault();

      return;
    }
    setYcoordEditing(false);
    updateCoords();
  }

  function handleCoordKeyPress(e: any): void {
    const isNumberClicked: boolean = ZERO_KEY_CODE <= e.which && e.which <= NINE_KEY_CODE;
    const isOtherNecessaryKeyClicked: boolean = e.key === '-' || e.key === '.';

    if (!isNumberClicked && !isOtherNecessaryKeyClicked) e.preventDefault();
  }

  function handleCoordKeyDown(e: KeyboardEvent<HTMLDivElement>): void {
    if (isOnMap) return;
    const isXInputActivated: boolean = textRefX.current === null;
    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        if (xCoordHasError || yCoordHasError) return;
        if (isXInputActivated) switchFocusToY();
        else switchFocusToX();
        break;
      case 'Escape' :
        resetFocusAndTextToDefault();
        break;
      case 'Enter' :
        if (isXInputActivated) handleXcoordSave();
        else handleYcoordSave();
        break;
      default: return;
    }
  }

  function handleXTextDivClick(): void {
    if (isOnMap) return;
    if (yCoordHasError) resetErrorAndTextToDefault();
    switchFocusToX();
  }

  function handleYTextDivClick(): void {
    if (isOnMap) return;
    if (xCoordHasError) resetErrorAndTextToDefault();
    switchFocusToY();
  }

  function handleXCoordFocus(): void {
    if (!isOnMap) return;
    switchFocusToX();
  }

  function handleYCoordFocus(): void {
    if (!isOnMap) return;
    switchFocusToY();
  }

  function switchFocusToX(): void {
    if (!yCoordHasError) setYcoordEditingText(getTextWithPrecision(editingYcoordText));
    setYcoordEditing(false);
    setXcoordEditing(true);
    setXcoordEditingText(getCurrentText(textRefX));
  }

  function switchFocusToY(): void {
    const isFirstFocus: boolean = textRefX.current !== null && textRefY.current !== null;
    if (!isFirstFocus) {
      if (!xCoordHasError) setXcoordEditingText(getTextWithPrecision(editingXcoordText));
      setXcoordEditing(false);
    }
    setYcoordEditing(true);
    setYcoordEditingText(getCurrentText(textRefY));
  }

  function updateCoords(): void {
    if (isOnMap || contentId === undefined) return;

    const coords: Coordinate = getEditingCoords();
    if (!isChanged(coords)) return;

    dispatch(PatchContent({ content: { id: contentId, info: { location: coords } } }));
    dispatch(RequestMarkerElevationInfo({ contentId }));
  }

  function resetErrorAndTextToDefault(): void {
    const isXInputActivated: boolean = textRefX.current === null;
    if (isXInputActivated) {
      setXcoordEditingText(defaultX);
      setXCoordHasError(false);
    } else {
      setYcoordEditingText(defaultY);
      setYCoordHasError(false);
    }
  }

  function resetFocusAndTextToDefault(): void {
    const isXInputActivated: boolean = textRefX.current === null;
    if (isXInputActivated) {
      setXcoordEditingText(defaultX);
      setXcoordEditing(false);
    } else {
      setYcoordEditingText(defaultY);
      setYcoordEditing(false);
    }
  }

  function isOutOfMapExtent(editingCoords: Coordinate): boolean {
    const extent: Extent = boundingExtent(projectionSystemExtentMap[projectProjection]);

    return !containsCoordinate(extent, editingCoords);
  }

  function isChanged(coords: Coordinate): boolean {
    return coords[0] !== parseFloat(defaultX) || coords[1] !== parseFloat(defaultY);
  }

  function getEditingCoords(): Coordinate {
    return [
      parseFloat(textRefX.current?.textContent || editingXcoordText),
      parseFloat(textRefY.current?.textContent || editingYcoordText),
    ];
  }

  function getTextWithPrecision(t: string): string {
    const precision: number = isLatLon ? LAT_LON_FIX_FORMAT : Y_X_FIX_FORMAT;

    return parseFloat(t).toFixed(precision);
  }

  function getCurrentText(textRef: MutableRefObject<HTMLParagraphElement | null>): string {
    return textRef.current?.textContent !== null && textRef.current?.textContent !== undefined ?
      textRef.current?.textContent : '';
  }

  const editableTextPropsX: EditableTextProps = {
    ...otherPropsX,
    id: id ? `${id}-x` : undefined,
    textRef: textRefX,
    editingText: editingXcoordText,
    isTextEditing: isXcoordEditing,
    fromUI: isOnMap ? T.EditableTextUI.MARKER_PINPOINTER_MAP : T.EditableTextUI.MARKER_PINPOINTER_SIDEBAR,
    hasError: xCoordHasError,
    textTabIndex: isOnMap ? 0 : undefined,
    text: editingXcoordText,
    editingTextRef: editingTextRefX,
    handleFocus: isOnMap ? handleXCoordFocus : undefined,
    handleTextKeyPress: handleCoordKeyPress,
    handleTextDivClick: handleXTextDivClick,
    handleKeyDown: isOnMap ? undefined : handleCoordKeyDown,
  };

  const editableTextPropsY: EditableTextProps = {
    ...otherPropsY,
    id: id ? `${id}-y` : undefined,
    textRef: textRefY,
    isTextEditing: isYcoordEditing,
    editingText: editingYcoordText,
    fromUI: isOnMap ? T.EditableTextUI.MARKER_PINPOINTER_MAP : T.EditableTextUI.MARKER_PINPOINTER_SIDEBAR,
    hasError: yCoordHasError,
    textTabIndex: isOnMap ? 0 : undefined,
    text: editingYcoordText,
    editingTextRef: editingTextRefY,
    handleFocus: isOnMap ? handleYCoordFocus : undefined,
    handleTextKeyPress: handleCoordKeyPress,
    handleTextDivClick: handleYTextDivClick,
    handleKeyDown: isOnMap ? undefined : handleCoordKeyDown,
  };

  const xLabelText: string = isOnMap ? xLabelOnMap : xLabelOnSidebar;
  const yLabelText: string = isOnMap ? yLabelOnMap : yLabelOnSidebar;

  const labelColon: string = isOnMap ? ':' : '';

  const editableTextY: ReactNode = isOnMap ? (
    <EditableText {...editableTextPropsY} />
  ) : (
    <EditableTextOnSidebarWrapper >
      <EditableText {...editableTextPropsY} />
    </EditableTextOnSidebarWrapper>
  );

  const editableTextX: ReactNode = isOnMap ? (
    <EditableText {...editableTextPropsX} />
  ) : (
    <EditableTextOnSidebarWrapper >
      <EditableText {...editableTextPropsX} />
    </EditableTextOnSidebarWrapper>
  );

  return (
    <Root id={id} isOnMap={isOnMap} ref={rootRef}>
      <EditableTextWrapper isOnMap={isOnMap}>
        <LabelTextWrapper isOnMap={isOnMap} isLatLon={isLatLon}><div>{yLabelText}</div><div>{labelColon}</div></LabelTextWrapper>
        {editableTextY}
      </EditableTextWrapper>
      <EditableTextWrapper isOnMap={isOnMap}>
        <LabelTextWrapper isOnMap={isOnMap} isLatLon={isLatLon}><div>{xLabelText}</div><div>{labelColon}</div></LabelTextWrapper>
        {editableTextX}
      </EditableTextWrapper>
    </Root>
  );
};

export default MarkerPinpointer;
