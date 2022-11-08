import { useCallback } from 'react';
import { batch, useDispatch } from 'react-redux';
import { Dispatch as ReduxDispatch } from 'redux';

import {
  ChangeCreatingVolume,
  CloseContentPageMapPopup,
} from '^/store/duck/Pages';

/**
 * @description
 * This allows exiting the volume measurement creation.
 */
export const useExitCreatingVolume: () => () => void = () => {
  const reduxDispatch: ReduxDispatch = useDispatch();

  return useCallback(() => {
    batch(() => {
      reduxDispatch(CloseContentPageMapPopup());
      reduxDispatch(ChangeCreatingVolume({}));
    });
  }, []);
};
