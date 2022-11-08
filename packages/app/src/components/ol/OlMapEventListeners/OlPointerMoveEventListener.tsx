import Color from 'color';
import { Feature, MapBrowserEvent } from 'ol';
import OlMap from 'ol/Map';
import Geometry from 'ol/geom/Geometry';
import Translate from 'ol/interaction/Translate';
import VectorLayer from 'ol/layer/Vector';
import React, { Dispatch as LocalDispatch, FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Observable, Subscriber, Subscription } from 'rxjs';

import * as T from '^/types';
import { getInteraction, isMapModifying } from '../OlLengthSegmentOverlays/util';
import { InteractionEventTypes, ListenerNames, OlCustomPropertyNames, hitTolerance3px } from '../constants';
import { getCoordinatesFromGeometry } from '../contentTypeSwitch';
import { ColorNumbers, olStyleFunctions } from '../styles';
import { ActionTypes, Actions } from './store/Actions';
import { OlEventListenerState } from './store/State';
import { useOlLocationOverlayUpdater } from './useOlLocationOverlayUpdater';

interface Props {
  readonly map: OlMap;
  readonly olEventListenerState: OlEventListenerState;
  readonly localDispatch: LocalDispatch<Actions>;
}

const OlPointerMoveEventListener: FC<Props> = ({
  map,
  localDispatch,
  olEventListenerState: {
    isDrawing,
    isModifying,
    isClickEventRegistered,
    currentlyModifiedLayerId,
  },
}) => {
  const createHandlePointerMove$: () => Observable<MapBrowserEvent> = () => new Observable((
    subscriber: Subscriber<MapBrowserEvent>,
  ) => {
    const handlePointerMove: (e: MapBrowserEvent) => void = (e) => {
      if (e.dragging) return;
      subscriber.next(e);
    };

    map.set(ListenerNames.POINTERMOVE, handlePointerMove);
    map.on(InteractionEventTypes.POINTER_MOVE, handlePointerMove);

    return () => map.un(InteractionEventTypes.POINTER_MOVE, handlePointerMove);
  });

  const allIds: T.ContentsState['contents']['allIds'] = useSelector((s: T.State) => s.Contents.contents.allIds);

  useOlLocationOverlayUpdater(isClickEventRegistered, createHandlePointerMove$);

  useEffect(() => {
    /**
     * this won't work with useState. That's why we use closure here.
     */
    let selectedFeature: Feature<Geometry> | undefined;

    const setHoverInteractionToFeature: (e: MapBrowserEvent) => void = (e) => {
      /**
       * 아이디어는 좋은데 여러 레이어가 겹쳐 있을때 다른 레이어를 선택하지 않음
       */
      // if (selectedFeature && map.getFeaturesAtPixel(e.pixel).includes(selectedFeature)) return;
      if (e.dragging || map.get(OlCustomPropertyNames.SHOULD_KEEP_OL_MEASUREMENT_BOX_ON)) return;
      if (
        selectedFeature
        && !map.getFeaturesAtPixel(e.pixel, hitTolerance3px).includes(selectedFeature)
      ) {
        localDispatch({ type: ActionTypes.END_HOVERING_ON_LAYER });
        localDispatch({ type: ActionTypes.HIDE_LENGTH_SEGMENT_OVERLAYS });
        localDispatch({
          type: ActionTypes.SELECT_LENGTH,
          payload: undefined,
        });
      }

      selectedFeature?.setStyle(null);
      selectedFeature = undefined;

      map.forEachFeatureAtPixel(e.pixel, (feature: Feature, layer: VectorLayer) => {
        /**
         * If you are modfying (dragging), don't show hover effect anywhere
         * If you are drawing, don't bother
         *
         * getActive for translate only: because translate interaction never gets removed
         */
        if (isMapModifying(map) || getInteraction(map, Translate)?.getActive() || isDrawing) return;

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        /**
         * @desc This statement makes mouseHoverInteraction ignore
         */
        if (T.OverlayContentTypes.includes(layer.get(OlCustomPropertyNames.GEOMETRY_TYPE))) return;

        /**
         * If you are modifying and hovering on the layer that's being modified, stop.
         */
        const layerId: number = layer.get('id');
        if (isClickEventRegistered && layerId === currentlyModifiedLayerId) return;

        /**
         * first, hide length segment overalys.
         * Then, if layer hovered on is a length, show length segment
         */
        const isMarker: boolean = layer.get(OlCustomPropertyNames.GEOMETRY_TYPE) === T.ContentType.MARKER && layerId !== undefined;
        const layerColor: Color = new Color(layer.get(OlCustomPropertyNames.COLOR));
        /**
         * Marker svg 다시 만들어야 함 약간 사각형으로 더 넓혀서
         */
        feature.setStyle(
          isMarker ?
            olStyleFunctions.markerWithShadow(layerColor.darken(ColorNumbers.Point02).lighten(ColorNumbers.Point05)) :
            olStyleFunctions.mouseHoverOnLayer(layerColor),
        );

        localDispatch({ type: ActionTypes.START_HOVERING_ON_LAYER, payload: { layerId } });
        if (layer.get(OlCustomPropertyNames.GEOMETRY_TYPE) === T.ContentType.LENGTH) {
          /**
           * Just for optimization purpose. Don't dispatch again if it is already hovering
           */
          localDispatch({ type: ActionTypes.SHOW_LENGTH_SEGMENT_OVERLAYS });
          localDispatch({
            type: ActionTypes.SELECT_LENGTH,
            payload: { coordinates: getCoordinatesFromGeometry(feature.getGeometry(), T.ContentType.LENGTH) },
          });
        }
        selectedFeature = feature;

        return true;
      }, hitTolerance3px);
    };

    const pointerMoveSubscription: Subscription = createHandlePointerMove$().subscribe((e: MapBrowserEvent) => {
      setHoverInteractionToFeature(e);
    });

    return () => {
      pointerMoveSubscription.unsubscribe();
      selectedFeature?.setStyle(null);
    };
  }, [
    isDrawing,
    isModifying,
    isClickEventRegistered,
    currentlyModifiedLayerId,
    /**
     * To apply color to a newly created marker
     */
    allIds.length,
  ]);

  return <></>;
};

export default OlPointerMoveEventListener;
