import {
  Cartesian3, Cesium3DTileset, Cesium3DTileStyle,
} from 'cesium';
import React, { FC, memo, useContext, useEffect, useRef, MutableRefObject } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setThreeDTilesetCenter } from '^/components/cesium/cesium-util';

import { CesiumContext, CesiumContextProps } from '^/components/cesium/CesiumContext';
import { CesiumPrimitivesIndex } from '^/constants/map-display';
import { typeGuardPointCloud } from '^/hooks';
import { makeS3URL } from '^/store/duck/API';
import { ChangeThreeDTilesetBounds } from '^/store/duck/Pages';
import * as T from '^/types';

const DEFAULT_POINT_SIZE = 3;

export interface Props {
  readonly contentId: T.ThreeDMeshContent['id'];
}

export const CesiumPointCloud: FC<Props> = memo(({
  contentId,
}) => {
  const dispatch = useDispatch();
  const { viewer }: CesiumContextProps = useContext(CesiumContext);
  const content: T.PointCloudContent | undefined = useSelector((state: T.State) => typeGuardPointCloud(state.Contents.contents.byId[contentId]));
  const tilesetRef: MutableRefObject<Cesium3DTileset | undefined> = useRef();

  if (content === undefined) {
    throw new Error('Should have given Point cloud contentId');
  }

  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed()) return;

    const tileset: Cesium3DTileset = viewer.scene.primitives.add(new Cesium3DTileset({
      url: makeS3URL(contentId, 'cesium-tiles', 'tileset.json'),
      // Go for the lowest MSSE due to this current issue with CesiumJS.
      // The higher the value, the better for performance, but the tileset will disappear.
      // https://github.com/CesiumGS/cesium/issues/9228#issuecomment-724896572
      maximumScreenSpaceError: 4,
      pointCloudShading: {
        maximumAttenuation: 4,
        geometricErrorScale: 16,
        attenuation: true,
      },
    }), CesiumPrimitivesIndex.THREE_D_MESH);
    viewer.scene.requestRender();

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    tileset.readyPromise.then(() => {
      const bounds: number[] | undefined = tileset.asset.ept.bounds;

      // The bounds are derived from tileset.json of the pointcloud content.
      // It containts the information necessary to get the center of the tileset.
      // Without it, the code below won't work.
      // eslint-disable-next-line no-magic-numbers
      if (bounds === undefined || bounds.length !== 6) return;

      // eslint-disable-next-line no-magic-numbers
      const maxBounds = new Cartesian3(bounds[3], bounds[4], bounds[5]);
      const minBounds = new Cartesian3(bounds[0], bounds[1], bounds[2]);

      dispatch(ChangeThreeDTilesetBounds({ threeDTilesetBounds: { min: minBounds, max: maxBounds } }));
      setThreeDTilesetCenter({ viewer, minBounds, maxBounds });
    });

    tilesetRef.current = tileset;

    return () => {
      if (viewer.isDestroyed()) return;

      viewer.scene.primitives.remove(tileset);
      tilesetRef.current = undefined;

      dispatch(ChangeThreeDTilesetBounds({ threeDTilesetBounds: undefined }));

      viewer.scene.requestRender();
    };
  }, [viewer]);

  useEffect(() => {
    if (tilesetRef.current) {
      tilesetRef.current.style = new Cesium3DTileStyle({
        pointSize: content.config?.points?.sizeOfPoint ?? DEFAULT_POINT_SIZE,
      });
    }
  }, [content.config?.points?.sizeOfPoint, content.config?.points?.numberOfPointsInMil]);

  return <></>;
});
