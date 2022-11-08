import { Geolocation, View } from 'ol';
import { EventsKey, unlistenByKey } from 'ol/events';
import React, {
  FC,
  Dispatch,
  ReactNode,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import styled from 'styled-components';

import GeolocationActiveSvg from '^/assets/icons/map-controller/geolocation-active.svg';
import GeolocationDefaultSvg from '^/assets/icons/map-controller/geolocation-default.svg';
import GeolocationOrientationSvg from '^/assets/icons/map-controller/geolocation-orientation.svg';
import GeolocationPendingEnableSvg from '^/assets/icons/map-controller/geolocation-pending-enable.svg';
import GeolocationPendingSvg from '^/assets/icons/map-controller/geolocation-pending.svg';
import { OlViewProps, withOlView } from '^/components/atoms/OlViewProvider';
import { ActionTypes, Actions } from '^/components/ol/OlMapEventListeners/store/Actions';
import palette from '^/constants/palette';
import { UseState, UseToast, defaultToastErrorOption, useConstant, useToast } from '^/hooks';
import * as T from '^/types';
import { Coordinate } from 'ol/coordinate';
import Text from './text';

enum GeolocationStatus {
  NONACTIVE = 'NONACTIVE',
  PENDING = 'PENDING',
  PENDING_ENABLED = 'PENDING_ENABLED',
  ACTIVE = 'ACTIVE',
  ORIENTATION = 'ORIENTATION',
}

enum IconStatus {
  PENDING_TWINK = 'PENDING_TWINK',
}

const icons: Record<GeolocationStatus | IconStatus, ReactNode> = {
  [GeolocationStatus.NONACTIVE]: <GeolocationDefaultSvg />,
  [GeolocationStatus.PENDING]: <GeolocationPendingSvg />,
  [IconStatus.PENDING_TWINK]: <GeolocationPendingEnableSvg />,
  [GeolocationStatus.PENDING_ENABLED]: <GeolocationPendingEnableSvg />,
  [GeolocationStatus.ACTIVE]: <GeolocationActiveSvg />,
  [GeolocationStatus.ORIENTATION]: <GeolocationOrientationSvg />,
};

const pendingInterval: number = 300;


const Root = styled.div({
  cursor: 'pointer',
  borderRadius: '4px',
  width: '32px',
  height: '32px',
  boxShadow: palette.insideMap.shadow,
  backgroundColor: palette.insideMap.gray.toString(),

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '&:hover': {
    backgroundColor: palette.insideMap.hoverGray.toString(),
  },
});


type UseGeolocation = (params: {
  view: View;
  status: GeolocationStatus;
  setStatus: Dispatch<SetStateAction<GeolocationStatus>>;
  dispatch: Props['dispatch'];
}) => void;

const useGeolocation: UseGeolocation = ({
  view, status, setStatus, dispatch,
}) => {
  const toast: UseToast = useToast();

  const geolocation: Geolocation = useConstant(() => new Geolocation({
    trackingOptions: {
      enableHighAccuracy: true,
    },
    projection: view?.getProjection(),
  }));

  useLayoutEffect(() => {
    if (!dispatch) return;
    const eventListeners: Array<EventsKey> = [];

    if (status !== GeolocationStatus.NONACTIVE) geolocation.setTracking(true);

    eventListeners.push(
      geolocation.on('change:accuracyGeometry', () => {
        dispatch({
          type: ActionTypes.UPDATE_GEOLOCATION_ACCURACY_GEOMETRY,
          payload: { accuracyGeometry: geolocation.getAccuracyGeometry() },
        });
      }),
      geolocation.on('change:position', () => {
        const currentLocation: Coordinate = geolocation.getPosition();
        dispatch({
          type: ActionTypes.UPDATE_GEOLOCATION_POSITION,
          payload: { position: currentLocation },
        });

        if (status === GeolocationStatus.ORIENTATION) view.setCenter(currentLocation);
      }),
      geolocation.once('change:position', () => {
        view.setCenter(geolocation.getPosition());
        if (status === GeolocationStatus.PENDING) setStatus(GeolocationStatus.ACTIVE);
      }),
      geolocation.on('error', (error) => {
        toast({
          type: T.Toast.ERROR,
          content: Object.values(T.GeolocationError).includes(error.code) ? Text.error[error.code as T.GeolocationError] : Text.error.default,
          option: defaultToastErrorOption,
        });
        dispatch({ type: ActionTypes.INITIAL_GEOLOCATION });
        setStatus(GeolocationStatus.NONACTIVE);
      }),
    );

    return () => {
      eventListeners.forEach(unlistenByKey);
      geolocation.setTracking(false);
    };
  });
};

interface Props {
  readonly dispatch?: Dispatch<Actions>;
}

const GeolocationButton: FC<OlViewProps & Props> = ({ view, dispatch }) => {
  const [status, setStatus]: UseState<GeolocationStatus> = useState<GeolocationStatus>(GeolocationStatus.NONACTIVE);
  const [icon, setIcon]: UseState<GeolocationStatus | IconStatus> = useState<GeolocationStatus | IconStatus>(GeolocationStatus.NONACTIVE);

  useGeolocation({ view, status, setStatus, dispatch });

  const HandleClick: () => void = useCallback(() => {
    setStatus((() => {
      switch (status) {
        case GeolocationStatus.NONACTIVE:
          return GeolocationStatus.PENDING;
        case GeolocationStatus.PENDING:
          return GeolocationStatus.NONACTIVE;
        case GeolocationStatus.ACTIVE:
          return GeolocationStatus.ORIENTATION;
        case GeolocationStatus.ORIENTATION:
          if (dispatch) dispatch({ type: ActionTypes.INITIAL_GEOLOCATION });

          return GeolocationStatus.NONACTIVE;
        default:
          return GeolocationStatus.NONACTIVE;
      }
    })());
  }, [status, setStatus, dispatch]);

  useEffect(() => {
    setIcon(status);

    return () => {
      if (dispatch) dispatch({ type: ActionTypes.INITIAL_GEOLOCATION });
    };
  }, [status]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (status === GeolocationStatus.PENDING) {
      interval = setInterval(() => {
        setIcon((prev) => {
          if (prev === GeolocationStatus.PENDING) return IconStatus.PENDING_TWINK;
          else return GeolocationStatus.PENDING;
        });
      }, pendingInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status === GeolocationStatus.PENDING]);

  return (
    <Root
      data-ddm-track-action='map-controls'
      data-ddm-track-label='btn-geolocation'
      onClick={HandleClick}
    >
      {icons[icon]}
    </Root>
  );
};

export default memo(withOlView(GeolocationButton));
