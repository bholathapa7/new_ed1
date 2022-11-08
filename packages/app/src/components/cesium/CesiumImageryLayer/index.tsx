import {
  ImageryLayer,
  TileMapServiceImageryProvider,
  Viewer,
} from 'cesium';
import * as _ from 'lodash-es';
import React, { FC, memo, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { CesiumContext, CesiumContextProps } from '^/components/cesium/CesiumContext';
import {
  CesiumImageryLayersOrder as CILO,
} from '^/constants/map-display';
import { makeS3URL } from '^/store/duck/API';
import { contentsSelector } from '^/store/duck/Contents';

import * as T from '^/types';
import { getSingleContentId } from '^/utilities/state-util';

export const makeS3TileImageryProvider: (threeDOrthoMapId: number) => TileMapServiceImageryProvider =
  (threeDOrthoMapId) => new TileMapServiceImageryProvider({
    url: makeS3URL(threeDOrthoMapId, 'tiles'),
  });

/**
 * Component for Cesium ImageryLayer
 */
const RawCesiumImageryLayer: FC = () => {
  const { viewer }: CesiumContextProps = useContext(CesiumContext);

  const threeDOrthoId: T.ThreeDOrthoContent['id'] | undefined = useSelector(({ Contents, Pages, ProjectConfigPerUser }: T.State) =>
    getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.THREE_D_ORTHO));

  const [threeDOrthoOpacity, threeDOrthoMapId]: Array<number | undefined> = useSelector(({ Contents }: T.State) => {
    if (threeDOrthoId === undefined) return [undefined, undefined];

    const targetThreeDOrtho: T.ThreeDOrthoContent | undefined = (Contents.contents.byId[threeDOrthoId] as T.ThreeDOrthoContent | undefined);

    return [targetThreeDOrtho?.config?.opacity, targetThreeDOrtho?.info.map];
  });

  const is3DOrthoSelected: boolean = useSelector(({ Contents, ProjectConfigPerUser }: T.State) =>
    contentsSelector.isSelected(Contents, ProjectConfigPerUser)(threeDOrthoId));

  const setImageryOpacity: (cesiumViewer?: Viewer, opacity?: number) => void = (cesiumViewer, opacity) => {
    if (opacity === undefined || !cesiumViewer) return;
    const imageryLayerOpacity: number | undefined = cesiumViewer?.imageryLayers.get(CILO.S3_TILES_MAP)?.alpha;
    if (imageryLayerOpacity === undefined || imageryLayerOpacity === null) return;

    // eslint-disable-next-line no-magic-numbers
    cesiumViewer.imageryLayers.get(CILO.S3_TILES_MAP).alpha = opacity / 100;
    cesiumViewer.scene.requestRender();
  };

  useEffect(() => {
    if (viewer === undefined || viewer?.isDestroyed()) return;
    setImageryOpacity(viewer, threeDOrthoOpacity);
  }, [viewer?.imageryLayers.length, threeDOrthoOpacity]);

  useEffect(() => {
    if (threeDOrthoMapId === undefined || viewer === undefined || viewer.isDestroyed()) return;
    const imagery: ImageryLayer | undefined = viewer?.imageryLayers
      .addImageryProvider(makeS3TileImageryProvider(threeDOrthoMapId)) as ImageryLayer | undefined;

    if (imagery !== undefined) {
      imagery.show = is3DOrthoSelected;
    }

    return () => {
      if (imagery && !viewer.isDestroyed()) viewer?.imageryLayers.remove(imagery);
    };
  }, [viewer, threeDOrthoMapId]);

  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed()) return;

    const s3TilesMap: ImageryLayer | undefined = viewer.imageryLayers.get(CILO.S3_TILES_MAP) as ImageryLayer | undefined;

    if (s3TilesMap === undefined) return;

    s3TilesMap.show = is3DOrthoSelected;
  }, [viewer, is3DOrthoSelected]);

  return (<></>);
};

export const CesiumImageryLayer: FC = memo(RawCesiumImageryLayer);
