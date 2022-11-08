import { FeatureLike } from 'ol/Feature';
import Select, { SelectEvent } from 'ol/interaction/Select';
import { FC, memo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import olWrap, { OlProps } from '^/components/atoms/OlWrap';
import { SetCurrentPhotoId } from '^/store/duck/Photos';
import * as T from '^/types';
import { OlCustomPropertyNames } from '../constants';

/**
 * @const OlPhotoMarkerInteractionProvider
 * @description inject click interaction to move to PhotoViewer page
 */
const OlPhotoMarkerInteractionProvider: FC<OlProps<{}>> = ({ map }) => {
  const dispatch: Dispatch = useDispatch();

  const shouldDrawMarker: boolean = useSelector(
    (s: T.State) => s.Photos.currentPhotoId === undefined && s.Photos.photoTab === T.PhotoTabType.MAP,
  );

  const handleMapClick: (e: SelectEvent) => void = useCallback((e) => {
    const firstFeature: FeatureLike | undefined = e.selected[0];
    /* eslint-disable @typescript-eslint/strict-boolean-expressions */
    if (firstFeature) {
      const featureId: string = `${firstFeature.getId()}`;
      if (featureId.includes(OlCustomPropertyNames.PHOTO_FEATURE)) {
        const photoId: T.Photo['id'] = Number(featureId.replace(OlCustomPropertyNames.PHOTO_FEATURE, ''));

        dispatch(SetCurrentPhotoId({ photoId }));
      }
    }
  }, []);

  useEffect(() => {
    const select: Select = new Select();
    select.on('select', handleMapClick);

    map.addInteraction(select);

    return () => {
      select.un('select', handleMapClick);
      map.removeInteraction(select);
    };
  }, [shouldDrawMarker]);

  return null;
};

export default memo(olWrap(OlPhotoMarkerInteractionProvider));
