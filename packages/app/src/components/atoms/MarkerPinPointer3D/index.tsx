import React, { FC, MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { MARKER_PINPOINTER_ID } from '^/constants/cesium';
import { LAT_LON_FIX_FORMAT, Y_X_FIX_FORMAT, default2DOrthoZIndex } from '^/constants/defaultContent';
import palette from '^/constants/palette';
import { FontFamily, MediaQuery } from '^/constants/styles';
import { UseEditableTextOutput, UseState, useEditableText, useProjectCoordinateSystem } from '^/hooks';
import * as T from '^/types';
import { addMouseAndTouchMoveEventListener, removeMouseAndTouchMoveEventListener } from '^/utilities/mouseTouchAdapter';
import { EditableText, Props as EditableTextProps } from '../EditableText';

const HIDDEN_POS_PX: number = -9999;
const MARKER_MARGIN_X: number = 12;
const MARKER_MARGIN_Y: number = 8;


const Root = styled.div({
  // eslint-disable-next-line no-magic-numbers
  zIndex: default2DOrthoZIndex,
  width: 'auto',
  position: 'fixed',
  height: '60px',

  left: `${HIDDEN_POS_PX}px`,
  top: `${HIDDEN_POS_PX}px`,

  [MediaQuery[T.Device.MOBILE_L]]: {
    width: 'auto',
  },

  pointerEvents: 'none',
});

const EditableTextWrapper = styled.div({
  display: 'flex',
  justifyContent: undefined,
  alignItems: 'center',

  width: 'auto',
  height: '27px',

  paddingLeft: '8px',
  marginBottom: '3px',

  // eslint-disable-next-line no-magic-numbers
  backgroundColor: palette.white.alpha(0.9).toString(),
  borderRadius: '3px',
  border: `solid 1px ${palette.ContentsList.inputBorder.toString()}`,

  fontFamily: FontFamily.NOTOSANS,
  fontSize: '11px',

  whiteSpace: 'nowrap',
});

const LabelTextWrapper = styled.div<{isLatLon: boolean}>(({ isLatLon }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  color: palette.ContentsList.title.toString(),
  width: isLatLon ? '24px' : '12px',
}));


interface CustomEvent extends MouseEvent {
  target: HTMLElement;
}

interface Props {
  id?: string;
  contentId?: T.MarkerContent['id'];
  defaultYX?: string[];
  /**
   * Determines the value to show on the input text field for the x value.
   */
  xValue?: number;
  /**
   * Determines the value to show on the input text field for the y value.
   */
  yValue?: number;
}

const MarkerPinPointer3D: FC<Props> = ({
  id,
  defaultYX,
  xValue = 0,
  yValue = 0,
}) => {
  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();
  const rootRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const isLatLon: boolean = projectProjection === T.ProjectionEnum.WGS84_EPSG_4326_LL;
  const [yLabelText, xLabelText]: string[] = isLatLon ? ['Lat', 'Lon'] : ['Y', 'X'];
  const [defaultY, defaultX]: string[] = defaultYX === undefined ? ['', ''] : defaultYX;

  const [isXcoordEditing, setXcoordEditing]: UseState<Readonly<boolean>> = useState(false);
  const [isYcoordEditing, setYcoordEditing]: UseState<Readonly<boolean>> = useState(false);
  const [xCoordHasError]: UseState<Readonly<boolean>> = useState(false);
  const [yCoordHasError]: UseState<Readonly<boolean>> = useState(false);

  const coordXRef: MutableRefObject<HTMLElement | null> = useRef(null);
  const coordYRef: MutableRefObject<HTMLElement | null> = useRef(null);
  const pinpointerXRef: MutableRefObject<HTMLElement | null> = useRef(null);
  const pinpointerYRef: MutableRefObject<HTMLElement | null> = useRef(null);

  // TODO: These callbacks will be handled in a separate PR.
  // For now, this component has no interactivity.
  const handleXcoordSave: () => void = () => undefined;
  const handleYcoordSave: () => void = () => undefined;
  const handleCoordKeyPress: () => void = () => undefined;
  const handleXCoordFocus: () => void = () => undefined;
  const handleYCoordFocus: () => void = () => undefined;
  const handleXTextDivClick: () => void = () => undefined;
  const handleYTextDivClick: () => void = () => undefined;

  const getFixedNumber: (n: number) => string = (n) => {
    const precision: number = isLatLon ? LAT_LON_FIX_FORMAT : Y_X_FIX_FORMAT;

    return n.toFixed(precision);
  };

  const {
    textRef: textRefX,
    editingTextRef: editingTextRefX,
    editingText: editingXcoordText,
    setEditingText: setXcoordEditingText,
    ...otherPropsX
  }: UseEditableTextOutput = useEditableText({
    handleTextSave: handleXcoordSave,
    defaultText: defaultX,
    isEditing: isXcoordEditing,
    setIsEditing: setXcoordEditing,
  });

  const {
    textRef: textRefY,
    editingTextRef: editingTextRefY,
    editingText: editingYcoordText,
    setEditingText: setYcoordEditingText,
    ...otherPropsY
  }: UseEditableTextOutput = useEditableText({
    handleTextSave: handleYcoordSave,
    defaultText: defaultY,
    isEditing: isYcoordEditing,
    setIsEditing: setYcoordEditing,
  });

  const editableTextPropsX: EditableTextProps = {
    ...otherPropsX,
    id: id ? `${id}-x` : undefined,
    textRef: textRefX,
    editingText: editingXcoordText,
    isTextEditing: isXcoordEditing,
    fromUI: T.EditableTextUI.MARKER_PINPOINTER_MAP,
    hasError: xCoordHasError,
    textTabIndex: 0,
    text: isXcoordEditing ? editingXcoordText : getFixedNumber(xValue),
    editingTextRef: editingTextRefX,
    handleFocus: handleXCoordFocus,
    handleTextKeyPress: handleCoordKeyPress,
    handleTextDivClick: handleXTextDivClick,
  };

  const editableTextPropsY: EditableTextProps = {
    ...otherPropsY,
    id: id ? `${id}-y` : undefined,
    textRef: textRefY,
    isTextEditing: isYcoordEditing,
    editingText: editingYcoordText,
    fromUI: T.EditableTextUI.MARKER_PINPOINTER_MAP,
    hasError: yCoordHasError,
    textTabIndex: 0,
    text: isYcoordEditing ? editingYcoordText : getFixedNumber(yValue),
    editingTextRef: editingTextRefY,
    handleFocus: handleYCoordFocus,
    handleTextKeyPress: handleCoordKeyPress,
    handleTextDivClick: handleYTextDivClick,
  };

  const onMouseMove: (e: CustomEvent) => void = (e) => {
    if (!rootRef.current) return;

    // Do not show the popup if the mouse is not over the canvas elements.
    if (e.target.tagName === 'CANVAS') {
      rootRef.current.style.transform = `translate3d(${e.clientX + MARKER_MARGIN_X}px, ${e.clientY + MARKER_MARGIN_Y}px, 0)`;
      rootRef.current.style.left = '0px';
      rootRef.current.style.top = '0px';
    } else {
      rootRef.current.style.transform = '';
      rootRef.current.style.left = `${HIDDEN_POS_PX}px`;
      rootRef.current.style.top = `${HIDDEN_POS_PX}px`;
    }

    if (coordXRef.current === null || coordYRef.current === null || pinpointerXRef.current === null || pinpointerYRef.current === null) {
      return;
    }

    if (pinpointerXRef.current.firstChild) pinpointerXRef.current.firstChild.textContent = coordXRef.current.textContent;
    if (pinpointerYRef.current.firstChild) pinpointerYRef.current.firstChild.textContent = coordYRef.current.textContent;
  };

  useLayoutEffect(() => {
    addMouseAndTouchMoveEventListener(document, onMouseMove);

    return () => {
      removeMouseAndTouchMoveEventListener(document, onMouseMove);
    };
  }, []);

  // This hook is needed to retrieve the DOM only once,
  // there is no need to query everytime it needs to change.
  useEffect(() => {
    const coordX: HTMLElement | null = document.getElementById('coordX');
    const coordY: HTMLElement | null = document.getElementById('coordY');
    const pinpointerX: HTMLElement | null = document.getElementById(`${MARKER_PINPOINTER_ID}-x-text`);
    const pinpointerY: HTMLElement | null = document.getElementById(`${MARKER_PINPOINTER_ID}-y-text`);

    if (coordX === null || coordY === null || pinpointerX === null || pinpointerY === null) {
      return;
    }

    coordXRef.current = coordX;
    coordYRef.current = coordY;
    pinpointerXRef.current = pinpointerX;
    pinpointerYRef.current = pinpointerY;
  }, []);

  return (
    <Root id={id} ref={rootRef}>
      <EditableTextWrapper>
        <LabelTextWrapper isLatLon={isLatLon}><div>{yLabelText}</div><div>:</div></LabelTextWrapper>
        <EditableText {...editableTextPropsY} />
      </EditableTextWrapper>
      <EditableTextWrapper>
        <LabelTextWrapper isLatLon={isLatLon}><div>{xLabelText}</div><div>:</div></LabelTextWrapper>
        <EditableText {...editableTextPropsX} />
      </EditableTextWrapper>
    </Root>
  );
};

export default MarkerPinPointer3D;
