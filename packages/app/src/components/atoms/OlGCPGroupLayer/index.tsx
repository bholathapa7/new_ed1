import { Collection, Feature } from 'ol';
import { Coordinate } from 'ol/coordinate';
import Geometry from 'ol/geom/Geometry';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import proj4 from 'proj4';
import React, { ReactElement, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { OlCustomPropertyNames } from '^/components/ol/constants';
import { olStyleFunctions } from '^/components/ol/styles';
import * as T from '^/types';
import { getEPSGfromProjectionLabel } from '^/utilities/coordinate-util';
import { Point } from 'ol/geom';
import olWrap, { OlProps } from '../OlWrap';

export interface Props {
  readonly gcps: T.GCP[];
  readonly crs: T.CoordinateSystem;
}

function OlGCPGroupLayer({
  map, gcps, crs,
}: OlProps<Props>): ReactElement {
  const editingGCPIndex: number | undefined = useSelector((s: T.State) => s.Pages.Contents.editingGCPIndex);

  const features: Collection<Feature<Geometry>> | undefined = useMemo(() => {
    if (gcps.length === 0) return;

    return new Collection(gcps
      .map(({ label, easting, northing }, index) => {
        const coordinate: Coordinate = proj4(getEPSGfromProjectionLabel(T.ProjectionEnum[crs]), 'EPSG:3857').forward([easting, northing]);
        const feature: Feature = new Feature(new Point(coordinate));

        feature.setId(`${OlCustomPropertyNames.GCP_ID}${index}`);
        feature.set(OlCustomPropertyNames.GCP_LABEL, label);

        return feature;
      }),
    );
  }, [gcps, crs]);

  useEffect(() => {
    const vector: VectorLayer = new VectorLayer({
      source: new VectorSource({ features }),
      zIndex: 9999999999999,
      style: olStyleFunctions.gcp(),
    });

    map.addLayer(vector);

    return () => {
      map.removeLayer(vector);
    };
  }, [features]);

  useEffect(() => {
    features?.getArray().forEach((feature) => {
      if (editingGCPIndex !== undefined) {
        if (feature.getId() === `${OlCustomPropertyNames.GCP_ID}${editingGCPIndex}`) {
          feature.setStyle(olStyleFunctions.blueGCP());

          return;
        }
      }

      feature.setStyle(olStyleFunctions.gcp());
    });
  }, [editingGCPIndex]);

  return <></>;
}

export default olWrap(OlGCPGroupLayer);
