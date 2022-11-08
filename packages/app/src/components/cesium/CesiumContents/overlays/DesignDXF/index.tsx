import { Color as CesiumColor, GeoJsonDataSource, Viewer } from 'cesium';
import React, { FC, useCallback, useContext, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { IOverlayBehavior } from '^/components/cesium/CesiumBehaviors/overlays';
import { commonConstants } from '^/constants/map-display';
import { contentSelector, usePrevProps } from '^/hooks';
import { makeS3URL } from '^/store/duck/API';
import * as T from '^/types';
import { CesiumContext, CesiumContextProps } from '../../../CesiumContext';
import { getSpecificDataSourcefrom, makeCesiumId } from '../../../cesium-util';
import { CesiumContentProps } from '../../PropTypes/props';
import { withFeatureToggle } from '^/utilities/withFeatureToggle';

type Props = CesiumContentProps<T.DesignDXFContent, IOverlayBehavior>;

const RawCesiumDesignDXF: FC<Props> = ({ contentId }) => {
  const { viewer }: CesiumContextProps = useContext(CesiumContext);

  const selectedAt: T.DesignDXFConfigPerUser['selectedAt'] | undefined =
    useSelector((s: T.State) => contentSelector(s, contentId)?.config?.selectedAt, (p, n) => p?.getTime() === n?.getTime());

  const prevSelectedAt: Date | undefined = usePrevProps(selectedAt);
  const prevViewer: Viewer | undefined = usePrevProps(viewer);

  const DESIGN_DXF_NAME: string = useMemo(() => makeCesiumId(contentId), [contentId]);

  const cleanup: (viewer: Viewer) => void = useCallback((v) => {
    const geojson: GeoJsonDataSource | null = getSpecificDataSourcefrom<GeoJsonDataSource>({
      dataSourceCollection: v.dataSources, dataSourceName: DESIGN_DXF_NAME, Constructor: GeoJsonDataSource,
    });
    if (geojson) {
      v.dataSources.remove(geojson, true);
      v.scene.requestRender();
    }
  }, [DESIGN_DXF_NAME]);

  const loadGeojson: () => Promise<GeoJsonDataSource> = useCallback(async () => GeoJsonDataSource.load(
    makeS3URL(contentId, 'downloads', 'design_vector.geojson'),
    {
      stroke: CesiumColor.fromAlpha(CesiumColor.DARKVIOLET, commonConstants.designDXFOpacity),
      fill: CesiumColor.fromAlpha(CesiumColor.VIOLET, commonConstants.designDXFOpacity),
      strokeWidth: 3,
      markerSymbol: '?',
      clampToGround: true,
    },
  ), [contentId]);

  useEffect(() => {
    if (viewer === undefined) return;

    return () => {
      if (!viewer.isDestroyed()) {
        cleanup(viewer);
      }
    };
  }, []);

  useEffect(() => {
    const isViewerFirstMounted: boolean = prevViewer === undefined && viewer !== undefined;
    if (!isViewerFirstMounted && viewer === undefined) return;
    const shouldGeojsonBeAdded: boolean = selectedAt !== undefined;
    const shouldGeojsonBeRemoved: boolean = !(viewer === undefined || prevSelectedAt?.getTime() === selectedAt?.getTime());

    if (shouldGeojsonBeAdded) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      (async () => {
        const geojson: GeoJsonDataSource = await loadGeojson();
        geojson.name = DESIGN_DXF_NAME;
        if (viewer?.dataSources?.getByName(DESIGN_DXF_NAME).length === 0) {
          await viewer?.dataSources.add(geojson);
          // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
          viewer?.scene.requestRender();
        }
      })();
    } else if (shouldGeojsonBeRemoved) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      cleanup(viewer!);
    }
  }, [selectedAt, viewer]);

  return (<></>);
};

export const CesiumDesignDXF = withFeatureToggle<Props>(T.Feature.DDM)(RawCesiumDesignDXF);
