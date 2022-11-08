
import Feature from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import { Point } from 'ol/geom';
import Geometry from 'ol/geom/Geometry';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import proj4 from 'proj4';
import { FC, memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import olWrap, { OlProps } from '^/components/atoms/OlWrap';
import { UseState } from '^/hooks';
import * as T from '^/types';
import { OlCustomPropertyNames } from '../constants';
import { olStyleFunctions } from '../styles';
import dsPalette from '^/constants/ds-palette';


function isPoint(g: Geometry): g is Point {
  return g instanceof Point;
}

interface Props {
  photo: T.Photo;
}

const RawOlPhotoMarkerLayer: FC<OlProps<Props>> = ({ photo, map }) => {
  const [geometry, setGeometry]: UseState<Geometry | undefined> = useState();

  const shouldDrawMarker: boolean = useSelector(
    (s: T.State) => s.Photos.currentPhotoId === undefined && s.Photos.photoTab === T.PhotoTabType.MAP,
  );
  const filenameWithoutExtention: string = photo.originalFilename.split('.').slice(0, -1).join('');
  /**
   * @memo initialize Geometry for Feature / VectorLayer creation
   */
  useEffect(() => {
    const { longitude: lon, latitude: lat }: T.Photo = photo;
    if (lon === null || lat === null) return;

    setGeometry(new Point([lat, lon]));
  }, []);

  useEffect(() => {
    const { longitude: lon, latitude: lat }: T.Photo = photo;
    if (!shouldDrawMarker || !geometry || lon === null || lat === null) return;

    const feature: Feature = new Feature(geometry);
    feature.setId(`${OlCustomPropertyNames.PHOTO_FEATURE}${photo.id}`);

    const source: VectorSource = new VectorSource({ features: [feature] });
    const vector: VectorLayer = new VectorLayer({
      source,
      style: olStyleFunctions.photoMarker(filenameWithoutExtention),
      zIndex: 999999,
    });
    vector.set('id', `${OlCustomPropertyNames.PHOTO_FEATURE}${photo.id}`);
    vector.set(OlCustomPropertyNames.COLOR, dsPalette.themePrimaryLighter.toString());
    vector.set(OlCustomPropertyNames.TITLE, photo.originalFilename);

    const photoCoordinate: Coordinate = proj4('EPSG:4326', 'EPSG:3857').forward([lon, lat]);
    if (isPoint(geometry)) geometry.setCoordinates(photoCoordinate);

    map.addLayer(vector);

    return () => {
      map.removeLayer(vector);
      map.removeOverlay(map.getOverlayById(photo.id));
    };
  }, [shouldDrawMarker, geometry]);

  return null;
};

export const OlPhotoMarkerLayer: FC<Props> = memo(olWrap(RawOlPhotoMarkerLayer));
