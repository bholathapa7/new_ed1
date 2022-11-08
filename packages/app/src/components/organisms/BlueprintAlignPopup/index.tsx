import Color from 'color';
import { Coordinate } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import { toLonLat } from 'ol/proj';
import React, {
  FC, useState, useEffect, ReactNode, useRef, MutableRefObject,
} from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

import { OlMapProvider } from '^/components/atoms/OlMapProvider';
import OlViewProvider from '^/components/atoms/OlViewProvider';
import OlBlueprintAlignLayer from '^/containers/atoms/OlBlueprintAlignLayer';

import * as T from '^/types';

import { defaultBlueprintPDFHeight, defaultBlueprintPDFWidth } from '^/constants/defaultContent';
import palette from '^/constants/palette';
import { UseState } from '^/hooks';


const LeftRoot = styled.div.attrs<{ dd: string }>({
  'data-testid': 'blueprintalignpopup-root',
})({
  position: 'absolute',
  left: '0px',
  top: '0px',
  width: '50%',
  height: '100%',
});

const MapTarget = styled.div({
  width: '100%',
  height: '100%',
});

interface BackgroundProps {
  readonly backgroundColor: Color;
  readonly zIndex: number;
}

const Background = styled.div<BackgroundProps>({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,

  height: '100%',
  width: '50%',
}, ({ backgroundColor, zIndex }) => ({
  backgroundColor: backgroundColor.toString(),
  zIndex,
}));

const ZOOM_FOR_SMALL_BLUEPRINT: number = 17;
const ZOOM_FOR_BIG_BLUEPRINT: number = 16;

/**
 * @fixme this constant is arbitrary one, for fixing bug of incorrect Center of Blueprint
 * default imagePoint (deprecated) using value [0.5, 0.5],
 * half of [imageWidth, imageHeight] of the image,
 * to center the blueprint, however in practice it does not work.
 * But [0.05, 0.05] of the [imageWidth, imageHeight] works correctly.
 */
const CENTER_OF_IMAGE: number = 0.05;
const DEFAULT_CENTER: T.GeoPoint = [0, 0];

export interface Image {
  // The width & height of a Blueprint image
  readonly width: number;
  readonly height: number;
}

export interface Props {
  readonly zIndex: number;
}

const BlueprintAlignPopup: FC<Props> = ({ zIndex }) => {
  const content: T.BlueprintPDFContent | undefined = useSelector((state: T.State) => (
    (
      state.Pages.Contents.editingContentId !== undefined &&
      state.Contents.contents.byId[state.Pages.Contents.editingContentId].type === T.ContentType.BLUEPRINT_PDF
    ) ?
      state.Contents.contents.byId[state.Pages.Contents.editingContentId] as T.BlueprintPDFContent :
      undefined
  ));

  const zoom: MutableRefObject<number> = useRef(ZOOM_FOR_BIG_BLUEPRINT);
  const center: MutableRefObject<Coordinate> = useRef(DEFAULT_CENTER);

  const getBlueprintDimension: () => Image = () => {
    /**
     * @desc Help to return default (width x height) of a blueprint if no Content loaded
     * Also help to set the Center and Zoom level of the view according to the loaded Content
     */
    let imageWidth: number = defaultBlueprintPDFWidth;
    let imageHeight: number = defaultBlueprintPDFHeight;

    if (content !== undefined && content.info.dimension !== undefined) {
      imageWidth = content.info.dimension.width;
      imageHeight = content.info.dimension.height;

      /**
       * @desc Determine the center geolocation of Blueprint image (longitude, latitude)
       * and update according to the image dimension just one time
       */
      if (center.current === DEFAULT_CENTER) {
        center.current = toLonLat([
          imageWidth * CENTER_OF_IMAGE,
          imageHeight * CENTER_OF_IMAGE,
        ]);
      }
    }

    // Revise zoom level for different size (big/small) of blueprints
    if (
      imageWidth < defaultBlueprintPDFWidth ||
      imageHeight < defaultBlueprintPDFHeight
    ) {
      zoom.current = ZOOM_FOR_SMALL_BLUEPRINT;
    }

    return {
      width: imageWidth,
      height: imageHeight,
    };
  };

  const [image, setImage]: UseState<Image> = useState(getBlueprintDimension());

  useEffect(() => {
    setImage(getBlueprintDimension());
  }, [content]);

  const extent: Extent = [
    -image.width,
    -image.height,
    image.width,
    image.height,
  ];

  const blueprintLayer: ReactNode =
    content !== undefined ?
      <OlBlueprintAlignLayer content={content} /> :
      undefined;

  return (
    <Background
      backgroundColor={palette.white}
      zIndex={zIndex}
      data-testid='modal-background'
    >
      <OlViewProvider
        Wrapper={LeftRoot}
        center={center.current}
        extent={extent}
        zoom={zoom.current}
      >
        <OlMapProvider MapTarget={MapTarget}>
          {blueprintLayer}
        </OlMapProvider>
      </OlViewProvider>
    </Background>
  );
};

export default BlueprintAlignPopup;
