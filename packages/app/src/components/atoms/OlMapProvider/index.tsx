import OlMap from 'ol/Map';
import BaseEvent from 'ol/events/Event';
import { defaults as defaultInteractions } from 'ol/interaction';
import React, { PropsWithChildren, ReactElement, useEffect, useRef, useState, MutableRefObject, ComponentClass } from 'react';
import { Dispatch } from 'redux';
import { StyledComponent } from 'styled-components';
import { fromLonLat, toLonLat } from 'ol/proj';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';

import { OlViewProps, withOlView } from '^/components/atoms/OlViewProvider';
import { RightDragRotate } from '^/components/ol/OlCustomInteractions/rightDragRotate';
import { UseState, typeGuardBlueprintPDF } from '^/hooks';
import { ChangeTwoDDisplayCenter, ChangeTwoDDisplayZoom, SetUpdateTwoDDisplayCenter, SetUpdateTwoDDisplayZoom } from '^/store/duck/Pages';
import * as T from '^/types';
import { Provider } from './context';


export { withOlMap, OlMapProps } from './context';

const preventOpenContextMenuFromClicking: (e: BaseEvent) => boolean = (e) => {
  e.preventDefault();

  return false;
};

export interface SelectorState {
  readonly aligningBlueprintId: T.ContentsPageState['aligningBlueprintId'];
  readonly twoDDisplayZoom: T.ContentsPageState['twoDDisplayZoom'];
  readonly twoDDisplayCenter: T.ContentsPageState['twoDDisplayCenter'];
  readonly shouldUpdateTwoDDisplayZoom: T.ContentsPageState['shouldUpdateTwoDDisplayZoom'];
  readonly shouldUpdateTwoDDisplayCenter: T.ContentsPageState['shouldUpdateTwoDDisplayCenter'];
}

export type MapTargetComponent = StyledComponent<'div', {}>;

export interface Props {
  readonly MapTarget: MapTargetComponent;
  readonly redraw?: number;
}

export interface State {
  readonly map: OlMap;
}
function RawOlMapProvider({
  MapTarget, redraw: mapSizeRevision, children, view,
}: PropsWithChildren<Props & OlViewProps>): ReactElement {
  const dispatch: Dispatch = useDispatch();

  const mapTarget: MutableRefObject<HTMLDivElement | null> = useRef(null);

  const {
    aligningBlueprintId,
    twoDDisplayZoom,
    twoDDisplayCenter,
    shouldUpdateTwoDDisplayZoom,
    shouldUpdateTwoDDisplayCenter,
  }: SelectorState = useSelector((s: T.State) => ({
    aligningBlueprintId: s.Pages.Contents.aligningBlueprintId,
    twoDDisplayZoom: s.Pages.Contents.twoDDisplayZoom,
    twoDDisplayCenter: s.Pages.Contents.twoDDisplayCenter,
    shouldUpdateTwoDDisplayZoom: s.Pages.Contents.shouldUpdateTwoDDisplayZoom,
    shouldUpdateTwoDDisplayCenter: s.Pages.Contents.shouldUpdateTwoDDisplayCenter,
  }), shallowEqual);
  const isBlueprintAligning: boolean = useSelector((s: T.State) => {
    const editingContentId: T.ContentsPageState['editingContentId'] = s.Pages.Contents.editingContentId;

    const content: T.BlueprintPDFContent | undefined = editingContentId !== undefined ?
      typeGuardBlueprintPDF(s.Contents.contents.byId[editingContentId]) : undefined;

    return content !== undefined && aligningBlueprintId === editingContentId;
  });

  const [olMap]: UseState<OlMap | undefined> = useState(new OlMap({
    view, controls: [],
    interactions: defaultInteractions({
      altShiftDragRotate: false,

    }).extend([new RightDragRotate()]),
  }));

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    olMap?.updateSize();
  }, [mapSizeRevision]);

  /**
   * @desc this should be only called when manually setting center & zoom with current view
   * @param shouldUpdateTwoDDisplay series should be only set to true outside this component,
   * since it turns into false in below
   */
  /**
   * @warning if you want to dispatch for changing center and zoom, which are the same as one in the store, it won't be worked
   * @todo change the approach
   */
  useEffect(() => {
    if (!shouldUpdateTwoDDisplayCenter) return;
    batch(() => {
      dispatch(ChangeTwoDDisplayCenter({ twoDDisplayCenter: toLonLat(view.getCenter()) }));
      dispatch(SetUpdateTwoDDisplayCenter({ shouldUpdateTwoDDisplayCenter: false }));
    });
  }, [shouldUpdateTwoDDisplayCenter]);

  useEffect(() => {
    if (!shouldUpdateTwoDDisplayZoom) return;
    batch(() => {
      dispatch(ChangeTwoDDisplayZoom({ twoDDisplayZoom: view.getZoom() }));
      dispatch(SetUpdateTwoDDisplayZoom({ shouldUpdateTwoDDisplayZoom: false }));
    });
  }, [shouldUpdateTwoDDisplayZoom]);

  useEffect(() => {
    if (isBlueprintAligning) return;
    view.setZoom(twoDDisplayZoom);
  }, [twoDDisplayZoom]);

  useEffect(() => {
    if (isBlueprintAligning) return;
    view.setCenter(fromLonLat(twoDDisplayCenter));
  }, [twoDDisplayCenter]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    if (mapTarget.current) olMap?.setTarget(mapTarget.current);

    olMap.addEventListener('contextmenu', preventOpenContextMenuFromClicking);

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      olMap?.removeEventListener('contextmenu', preventOpenContextMenuFromClicking);
      batch(() => {
        dispatch(ChangeTwoDDisplayCenter({ twoDDisplayCenter: toLonLat(view.getCenter()) }));
        dispatch(ChangeTwoDDisplayZoom({ twoDDisplayZoom: view.getZoom() }));
      });
    };
  }, []);

  return (
    <Provider value={olMap}>
      <MapTarget
        ref={mapTarget}
      >
        {children}
      </MapTarget>
    </Provider>
  );
}

export const OlMapProvider: ComponentClass<Props, any> = withOlView(RawOlMapProvider);
