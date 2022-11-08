import View from 'ol/View';
import { Coordinate } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import { fromLonLat } from 'ol/proj';
import React, { FC, useEffect, MutableRefObject, useRef } from 'react';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { StyledComponent } from 'styled-components';

import { ObjectEvent } from 'ol/Object';
import { OlViewProps as OVP, Provider } from './context';
import { usePrevProps } from '^/hooks';
export { withOlView } from './context';
export type OlViewProps = OVP;

type Zoom = number;
type OlViewWrapperComponent = StyledComponent<'div', {}>;

export interface Props {
  readonly Wrapper: OlViewWrapperComponent;
  readonly center: Coordinate;
  readonly zoom: Zoom;
  readonly extent?: Extent;
  readonly minZoom?: Zoom;
  readonly maxZoom?: Zoom;
  readonly rotation?: number;
  onRotationChange?(rotation: number): void;
}

/**
 * Component providing an ol view as context
 */
const OlViewProvider: FC<Props> = ({
  Wrapper, children, center,
  zoom, rotation, maxZoom, minZoom, extent,
  onRotationChange,
}) => {
  const prevCenter = usePrevProps(center);
  const rotationSubscription: MutableRefObject<Subscription | null> = useRef(null);
  const view: MutableRefObject<View> = useRef(new View({
    center: fromLonLat(center),
    zoom,
    extent,
    maxZoom,
    minZoom,
    rotation,
  }));

  useEffect(() => {
    const debounceInMilliSec: number = 100;

    rotationSubscription.current = new Observable((subscriber: Subscriber<number>) => {
      const rotationListener: (evt: ObjectEvent) => void =
        (evt) => subscriber.next(evt.target.get(evt.key));
      view.current.on('change:rotation', rotationListener);

      return () => view.current.un('change:rotation', rotationListener);
    }).pipe(
      debounceTime(debounceInMilliSec),
    ).subscribe((_rotation: number) => onRotationChange?.(_rotation));

    return () => {
      rotationSubscription.current?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (center[0] !== prevCenter?.[0] || center[1] !== prevCenter?.[1]) view.current.setCenter(fromLonLat(center));
  }, [center]);

  useEffect(() => {
    if (minZoom !== undefined) view.current.setMinZoom(minZoom);
  }, [minZoom]);

  useEffect(() => {
    if (maxZoom !== undefined) view.current.setMaxZoom(maxZoom);
  }, [maxZoom]);

  useEffect(() => {
    if (rotation !== undefined) view.current.setRotation(rotation);
  }, [rotation]);

  useEffect(() => {
    view.current.setZoom(zoom);
  }, [zoom]);

  return (
    <Provider value={view.current}>
      <Wrapper id='as-ol-view-wrapper'>
        {children}
      </Wrapper>
    </Provider>
  );
};

export default OlViewProvider;
