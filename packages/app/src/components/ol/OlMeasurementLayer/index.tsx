import olWrap, { OlProps } from '^/components/atoms/OlWrap';
import route from '^/constants/routes';
import { UseState, isLonLat, useProjectCoordinateSystem, useRouteIsMatching } from '^/hooks';
import * as T from '^/types';
import { getEPSGfromProjectionLabel } from '^/utilities/coordinate-util';
import { getLayerById } from '^/utilities/ol-layer-util';
import Color from 'color';
import { Map as OlMap } from 'ol';
import Feature from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import { Point } from 'ol/geom';
import Geometry from 'ol/geom/Geometry';
import Modify from 'ol/interaction/Modify';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import proj4 from 'proj4';
import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { deleteAllLengthSegmentOverlays, getInteraction } from '../OlLengthSegmentOverlays/util';
import { OlCustomPropertyNames } from '../constants';
import {
  createGeometryFromLocations,
  initVectorLayer,
} from '../contentTypeSwitch';
import { olStyleFunctions } from '../styles';

const useGeometry: (type: T.MeasurementContent['type'], locations: Array<Coordinate>) => [Geometry | undefined] = (
  type, locations,
) => {
  const isOnSharePage: boolean = useRouteIsMatching(route.share.main);
  const projectProjection: T.ProjectionEnum =
    isOnSharePage ? useSelector((state: T.State) => state.SharedContents.projection) : useProjectCoordinateSystem();
  const [geometry, setGeometry]: UseState<Geometry | undefined> = useState();

  useEffect(() => {
    setGeometry(createGeometryFromLocations({ locations, geometryType: type, projectProjection }));
  }, []);

  return [geometry];
};

type UseOlMeasurementCreation = (params: {
  location?: Coordinate;
  geometry?: Geometry;
  map: OlMap;
  color: Color;
  id: T.Content['id'];
  title: T.Content['title'];
  geometryType: T.MeasurementContent['type'];
}) => void;

const useOlMeasurementCreation: UseOlMeasurementCreation = ({
  location, geometry, map, color, id, title, geometryType,
}) => {
  const colorStr: string = color.toString();
  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();

  useEffect(() => {
    if (!geometry) return;

    const feature: Feature<Geometry> = new Feature(geometry);

    /**
     * Assigning id in order to differentiate from (white/plus) point features.
     * This is the main LineString/Polygon on the source.
     */
    feature.setId(OlCustomPropertyNames.MAIN_FEATURE);

    const source: VectorSource = new VectorSource({
      features: [feature],
    });

    const vector: VectorLayer = initVectorLayer({ source, color, geometryType, text: title });

    /**
     * For the use in OlMapEventListener
     */
    vector.set('id', id);
    vector.set(OlCustomPropertyNames.GEOMETRY_TYPE, geometryType);
    vector.set(OlCustomPropertyNames.COLOR, color.toString());
    vector.set(OlCustomPropertyNames.TITLE, title);

    map.addLayer(vector);

    return () => {
      map.removeLayer(vector);
    };
  }, [geometry]);

  useEffect(() => {
    const vector: VectorLayer | undefined = getLayerById({ olMap: map, id });
    if (!vector) return;

    if (geometryType === T.ContentType.MARKER) {
      if (!vector.get(OlCustomPropertyNames.IS_MAKRER_READY_TO_TRANSLATE)) vector.setStyle(olStyleFunctions.markerWithShadow(color, title));
    } else {
      const feat: Feature | undefined =
        vector.getSource().getFeatures().find((f) => f.get(OlCustomPropertyNames.TO_BE_DELETED_POINT)?.toString().length > 0);
      feat?.setStyle(olStyleFunctions.clickedWhitePoint(color));
      vector.setStyle(olStyleFunctions.defaultLayerStyle(color, getInteraction(map, Modify) ? undefined : title));
    }

    vector.set(OlCustomPropertyNames.COLOR, color.toString());
    vector.set(OlCustomPropertyNames.TITLE, title);
  }, [colorStr, title]);

  useEffect(() => {
    try {
      if (location === undefined) return;
      if (geometryType !== T.ContentType.MARKER) return;

      const vector: VectorLayer | undefined = getLayerById({ olMap: map, id });
      if (!vector) return;

      const markerFeature: Feature[] = vector.getSource().getFeatures();
      if (markerFeature.length > 1) throw new Error('More than two marker features exist');

      const markerGeometry: Geometry = markerFeature[0].getGeometry();
      if (!isPoint(markerGeometry)) throw new Error('marker feature geometry is not a Point');

      const newLocation: T.GeoPoint = isLonLat(location) ?
        proj4('EPSG:4326', 'EPSG:3857').forward(location) :
        proj4(getEPSGfromProjectionLabel(projectProjection), 'EPSG:3857').forward(location);

      markerGeometry.setCoordinates(newLocation);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }, [location?.toString()]);
};

interface Props {
  content: T.MeasurementContent;
}

/**
 * @todo
 * Please separate this component to each content type.
 */
const RawOlMeasurementLayer: FC<OlProps<Props>> = ({
  map, content: { color, type, id, title, info, type: geometryType },
}) => {
  const [geometry]: [Geometry | undefined] = useGeometry(
    type,
    (info as T.LengthAreaVolumeContent['info']).locations !== undefined ?
      (info as T.LengthAreaVolumeContent['info']).locations :
      [(info as T.MarkerContent['info']).location],
  );

  useOlMeasurementCreation({
    location: type === T.ContentType.MARKER ? (info as T.MarkerContent['info']).location : undefined,
    geometry,
    map,
    color,
    id,
    title,
    geometryType,
  });

  useEffect(() => {
    if (!geometry) return;

    return () => {
      map.removeOverlay(map.getOverlayById(id));
      if (geometryType === T.ContentType.LENGTH) deleteAllLengthSegmentOverlays(map);
    };
  }, [geometry]);

  return null;
};

export const OlMeasurementLayer: FC<Props> = olWrap(RawOlMeasurementLayer);

function isPoint(g: Geometry): g is Point {
  return g instanceof Point;
}
