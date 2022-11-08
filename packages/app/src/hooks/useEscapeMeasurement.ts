import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch as ReduxDispatch } from 'redux';

import * as T from '^/types';

import { ChangeSelectedESSModelId } from '^/store/duck/ESSModels';
import {
  ChangeCurrentContentTypeFromAnnotationPicker,
} from '^/store/duck/Pages';
import { useExitCreatingVolume } from './useExitCreatingVolume';


/**
 * @description
 * This allows the state to clear out from any kinds of measurement.
 * Shared between 2D and 3D.
 */
export const useEscapeMeasurement: () => void = () => {
  const contentType: T.ContentType | undefined = useSelector((state: T.State) => state.Pages.Contents.currentContentTypeFromAnnotationPicker);
  const selectedESSModelId: T.ESSModelInstance['id'] | undefined = useSelector((state: T.State) => state.ESSModels.selectedModelId);
  const reduxDispatch: ReduxDispatch = useDispatch();
  const exitCreatingVolume: () => void = useExitCreatingVolume();

  const handleKeyDown: (e: KeyboardEvent) => void = useCallback((e) => {
    if (e.key === 'Escape') {
      if (contentType !== undefined) {
        reduxDispatch(ChangeCurrentContentTypeFromAnnotationPicker({}));

        if (contentType === T.ContentType.VOLUME) {
          exitCreatingVolume();
        }
      } else if (selectedESSModelId !== undefined) {
        reduxDispatch(ChangeSelectedESSModelId({}));
      }
    }
  }, [contentType, selectedESSModelId]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
