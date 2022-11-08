import { vec2 } from 'gl-matrix';
import _ from 'lodash-es';
import { Collection, Feature, View } from 'ol';
import { unByKey } from 'ol/Observable';
import { Coordinate } from 'ol/coordinate';
import { EventsKey } from 'ol/events';
import PointGeom from 'ol/geom/Point';
import PolygonGeom from 'ol/geom/Polygon';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import FillStyle from 'ol/style/Fill';
import StrokeStyle from 'ol/style/Stroke';
import Style, { StyleFunction } from 'ol/style/Style';

import React, { FC, useEffect, useRef, MutableRefObject } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import { defaultMapZoom } from '^/constants/defaultContent';
import palette from '^/constants/palette';
import * as T from '^/types';
import { attachLayer, detachLayer } from '^/utilities/ol-layer-util';

import { ChangePrintingAngle, ChangePrintingSquare } from '^/store/duck/Pages';

import olWrap, { OlProps } from '^/components/atoms/OlWrap';
import { PrintInteraction } from '^/components/ol/OlCustomInteractions/printInteraction';
import { getRotatePoint, radToDeg, toCoordinate, toVec2 } from '^/components/ol/OlCustomInteractions/printInteraction/utils';
import { olStyleFunctions } from '^/components/ol/styles';
import { isCADContent } from '^/hooks';
import { lastDSMOrMapContentSelector } from '^/hooks/useLastContent';
import { contentsSelector } from '^/store/duck/Contents';
import { OlCustomPropertyNames } from '../constants';

const LAYER_ALPHA: number = 0.24;
const LINE_LENGTH: number = 8;
const LINE_SPACE_LENGTH: number = 4;
const layerStyle: StyleFunction = () => new Style({
  stroke: new StrokeStyle({
    lineDash: [LINE_LENGTH, LINE_SPACE_LENGTH],
    color: 'var(--color-theme-primary)',
    width: 1.5,
  }),
  fill: new FillStyle({
    color: palette.white.alpha(LAYER_ALPHA).toString(),
  }),
  image: olStyleFunctions.plainWhitePoint().getImage(),
});

/**
 * Find the biggest possible area of the initial map boundary and the overlays.
 *
 * @param initialBoundary
 * @param overlays
 */
function calculateOverallBoundary(initialBoundary: T.MapBoundary, overlays: Array<T.CADContent>): T.MapBoundary {
  let overallMinLon: number = initialBoundary.minLon;
  let overallMinLat: number = initialBoundary.minLat;
  let overallMaxLon: number = initialBoundary.maxLon;
  let overallMaxLat: number = initialBoundary.maxLat;

  if (overlays.length) {
    overlays.forEach((overlay) => {
      if (overlay.info.tms?.bounds) {
        const [
          overlayMinLon,
          overlayMinLat,
          overlayMaxLon,
          overlayMaxLat,
        ]: [number, number, number, number] = overlay.info.tms?.bounds;

        overallMinLon = Math.min(overallMinLon, overlayMinLon);
        overallMinLat = Math.min(overallMinLat, overlayMinLat);
        overallMaxLon = Math.max(overallMaxLon, overlayMaxLon);
        overallMaxLat = Math.max(overallMaxLat, overlayMaxLat);
      }
    });
  }

  return {
    minLon: overallMinLon,
    minLat: overallMinLat,
    maxLon: overallMaxLon,
    maxLat: overallMaxLat,
  };
}

export interface Props {
  readonly zIndex?: number;
}
const OlPrintLayer: FC<OlProps<Props>> = ({ zIndex, map }) => {
  const dispatch: Dispatch = useDispatch();
  const printingSquare: T.PagesState['Contents']['printingSquare'] = useSelector((state: T.State) => state.Pages.Contents.printingSquare);
  const lastMapBoundary: T.MapBoundary | undefined = useSelector((state: T.State) => {
    const lastMap: T.MapContent | undefined = lastDSMOrMapContentSelector(state, T.ContentType.MAP);
    if (lastMap && lastMap.info.tms) {
      return lastMap.info.tms.boundaries[_.max(lastMap.info.tms.zoomLevels) || defaultMapZoom];
    }

    return undefined;
  });

  // overallBoundary is a selector because
  // it needs to update every time the overlays are being toggled on/off.
  // This might be cost ineffective and could use some memoization.
  // https://react-redux.js.org/next/api/hooks#using-memoizing-selectors.
  const overallBoundary: T.MapBoundary | undefined = useSelector(({ Contents, ProjectConfigPerUser }: T.State) => {
    if (lastMapBoundary) {
      // Filter out overlays that are currently selected,
      // to include them in the initial printing rectangle area.
      const selectedOverlays: Array<T.CADContent> = Contents.contents.allIds
        .filter((id) => {
          const content: T.Content = Contents.contents.byId[id];

          // Overlays that are enabled for printing are dxf, dwg overlays.
          return (isCADContent(content)) && contentsSelector.isSelected(Contents, ProjectConfigPerUser)(id);
        })
        .map((id) => Contents.contents.byId[id] as T.CADContent);


      return calculateOverallBoundary(lastMapBoundary, selectedOverlays);
    }

    return undefined;
  });

  // Interaction instance is a ref because
  // it needs to run a side effect to update
  // the combined boundaries whenever it is changed.
  const interactionRef: MutableRefObject<PrintInteraction | undefined> = useRef();

  // invokes first time only
  useEffect(() => {
    const view: View = map.getView();
    view.setZoom(defaultMapZoom);

    let coordinates: number[][];
    if (printingSquare !== undefined) {
      coordinates = printingSquare;
    } else if (lastMapBoundary) {
      // Use the map's boundary as the initial printing area.
      coordinates = [
        [lastMapBoundary.minLon, lastMapBoundary.maxLat],
        [lastMapBoundary.maxLon, lastMapBoundary.maxLat],
        [lastMapBoundary.maxLon, lastMapBoundary.minLat],
        [lastMapBoundary.minLon, lastMapBoundary.minLat],
      ].map((lonlat) => fromLonLat(lonlat));
    } else {
      coordinates = [[0, 0], [0, 0], [0, 0], [0, 0]];
    }

    // By default for now, going to print view will use the default setup,
    // which is to fill the printing area with the allowed boundaries
    // and set the angle of the area to the default (0).
    dispatch(ChangePrintingSquare({ printingSquare: coordinates }));
    dispatch(ChangePrintingAngle({ printingAngle: 0 }));

    const rotatePointCoordinate: Coordinate = toCoordinate(
      getRotatePoint(coordinates.map(toVec2), view.getResolution()),
    );
    const rotatePointFeature: Feature<PointGeom> = new Feature(new PointGeom(rotatePointCoordinate));
    rotatePointFeature.set('id', OlCustomPropertyNames.PRINT_ROTATE_POINT);
    rotatePointFeature.setStyle(olStyleFunctions.rotateDefaultPoint);

    const rectangleGeom: Feature<PolygonGeom> = new Feature(new PolygonGeom([coordinates]));
    rectangleGeom.set('id', OlCustomPropertyNames.PRINT_RECT);
    const features: Collection<Feature<PointGeom | PolygonGeom>> = new Collection(
      [
        ...coordinates
          .map((xy, idx) => {
            const pointFeature: Feature<PointGeom> = new Feature(new PointGeom(xy));
            pointFeature.set('id', `${OlCustomPropertyNames.PRINT_POINT}${idx}`);
            pointFeature.setStyle(olStyleFunctions.blueCircle);

            return pointFeature;
          }),
        rectangleGeom,
        rotatePointFeature,
      ],
    );

    const vectorLayer: VectorLayer = new VectorLayer({
      style: layerStyle,
      source: new VectorSource({ features }),
      zIndex,
    });

    interactionRef.current = new PrintInteraction({
      features,
      onDone(coord: NonNullable<T.ContentsPageState['printingSquare']>, angle: NonNullable<T.ContentsPageState['printingAngle']>): void {
        dispatch(ChangePrintingSquare({ printingSquare: coord }));
        dispatch(ChangePrintingAngle({ printingAngle: radToDeg(angle) }));
        rotatePointFeature.setStyle(olStyleFunctions.rotateDefaultPoint);
      },
    });

    attachLayer({ map, layer: vectorLayer, interactions: [interactionRef.current] });

    // Sync rotate point position with the rectangle when zooming in/out.
    const key: EventsKey = view.on('change:resolution', () => {
      const rectCoordinates: vec2[] = rectangleGeom.getGeometry().getCoordinates()[0].map(toVec2);
      const zoomedCoordinates: Coordinate = toCoordinate(getRotatePoint(rectCoordinates, view.getResolution()));
      rotatePointFeature.getGeometry().setCoordinates(zoomedCoordinates);
    });

    return () => {
      detachLayer({
        map,
        layer: vectorLayer,
        interactions: interactionRef.current ? [interactionRef.current] : undefined,
      });
      unByKey(key);

      interactionRef.current = undefined;
    };
  }, []);

  // Invokes every time the overall boundaries change,
  // i.e. when one of the overlays are toggled,
  // update the allowed boundaries.
  useEffect(() => {
    if (interactionRef.current && overallBoundary) {
      interactionRef.current.boundaries = [
        [overallBoundary.minLon, overallBoundary.maxLat],
        [overallBoundary.maxLon, overallBoundary.maxLat],
        [overallBoundary.maxLon, overallBoundary.minLat],
        [overallBoundary.minLon, overallBoundary.minLat],
      ].map((lonlat) => fromLonLat(lonlat));
    }

    return () => {
      if (interactionRef.current) {
        interactionRef.current.boundaries = [];
      }
    };
  }, [interactionRef, overallBoundary]);

  return (<></>);
};

export default olWrap(OlPrintLayer);
