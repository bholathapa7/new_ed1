/* eslint-disable max-lines */
import { autobind } from 'core-decorators';
import { inRange } from 'lodash-es';
import ImageTile from 'ol/ImageTile';
import { Coordinate } from 'ol/coordinate';
import { Extent, boundingExtent } from 'ol/extent';
import { addCoordinateTransforms, addProjection, fromLonLat, get, toLonLat } from 'ol/proj';
import Projection from 'ol/proj/Projection';
import { TileCoord } from 'ol/tilecoord';
import React, { Component, ReactNode } from 'react';
import isDeepEqual from 'react-fast-compare';
import { AjaxRequest, ajax } from 'rxjs/ajax';

import * as T from '^/types';

import { defaultBlueprintPDFHeight, defaultBlueprintPDFWidth, tileScaleFactor } from '^/constants/defaultContent';

import { makeS3URL } from '^/store/duck/API';

import OlPinOverlay from '^/components/atoms/OlPinOverlay';
import OlTileLayer from '^/components/atoms/OlTileLayer';

interface BlueprintDimension {
  readonly width: number;
  readonly height: number;
}

const defaultDimension: BlueprintDimension = {
  height: defaultBlueprintPDFHeight,
  width: defaultBlueprintPDFWidth,
};

const imageDimensionOf: (content: T.BlueprintPDFContent) => BlueprintDimension = (
  content,
) => content.info.dimension !== undefined ?
  content.info.dimension :
  defaultDimension;

const calculateInfo: (
  imageDimension: BlueprintDimension,
  imagePoint: [T.Point, T.Point],
  geoPoint: [Coordinate, Coordinate],
) => CalcCache = (
  imageDimension, imagePoint, geoPoint,
) => {
  const coordinate: [Coordinate, Coordinate] = [
    fromLonLat(geoPoint[0]),
    fromLonLat(geoPoint[1]),
  ];
  const imagePointDiff: T.Point = [
    imagePoint[0][0] - imagePoint[1][0],
    imagePoint[0][1] - imagePoint[1][1],
  ];
  const imageVector: [number, number] = [
    imagePointDiff[0] * imageDimension.width,
    imagePointDiff[1] * imageDimension.height,
  ];
  const coordPointDiff: Coordinate = [
    coordinate[0][0] - coordinate[1][0],
    coordinate[0][1] - coordinate[1][1],
  ];
  const coordinateNorm: number = Math.hypot(...coordPointDiff);
  const imageNorm: number = Math.hypot(...imageVector);
  const innerProduct: number =
    (imageVector[0] * coordPointDiff[0]) +
    (imageVector[1] * coordPointDiff[1]);
  const outerProduct: number =
    (imageVector[0] * coordPointDiff[1]) -
    (imageVector[1] * coordPointDiff[0]);

  return {
    /**
     * @desc pixelPerCoord
     */
    zoom: imageNorm !== 0 ? coordinateNorm / imageNorm : 1,
    cos: imageNorm !== 0 && coordinateNorm !== 0 ?
      innerProduct / (imageNorm * coordinateNorm) :
      1,
    sin: imageNorm !== 0 && coordinateNorm !== 0 ?
      outerProduct / (imageNorm * coordinateNorm) :
      0,
  };
};

/**
 * @desc Inverse Longitude coordinate to Tile row number to
 * reproject the coordinates to the Mercator projection (from EPSG:4326 to EPSG:3857)
 * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Derivation_of_tile_names
 */
const getXFromLon: (z: number, lon: number, isMax?: boolean) => number = (
  z, lon, isMax = false, // eslint-disable-next-line no-magic-numbers
) => (lon / 180 + 1) * (2 ** (z - 1)) - (isMax ? 1 : 0);
/**
 * @desc Inverse Latitude coordinate to Tile column number
 * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Derivation_of_tile_names
 * Sign is reversed since the origin is not top-left, but bottom-left.
 */
const getYFromLat: (z: number, lat: number, isMax?: boolean) => number = (
  z, lat, isMax = false,
) => {
  // eslint-disable-next-line no-magic-numbers
  const latInRadian: number = Math.PI * lat / 180;
  const mercatorY: number = Math.log(Math.tan(latInRadian) + Math.cos(latInRadian));

  return 2 ** (z - 1) * ((mercatorY / Math.PI) + 1) - (isMax ? 1 : 0);
};

interface TileBoundary {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
interface TileBoundaries {
  [zoom: number]: TileBoundary | undefined;
}

const getTileBoundaries: (
  boundaries: T.MapBoundaries,
) => TileBoundaries = (
  boundaries,
) => Object.keys(boundaries)
  .map((zoom) => parseInt(zoom, 10))
  .reduce<TileBoundaries>((tileBoundaries, zoom) => {
    const {
      minLon, minLat, maxLon, maxLat, minX, minY, maxX, maxY,
    }: T.MapBoundary = boundaries[zoom];

    return {
      ...tileBoundaries,
      [zoom]: {
        minX: minX ? minX : getXFromLon(zoom, minLon),
        minY: minY ? minY : getYFromLat(zoom, minLat),
        maxX: maxX ? maxX : getXFromLon(zoom, maxLon, true),
        maxY: maxY ? maxY : getYFromLat(zoom, maxLat, true),
      },
    };
  }, {});

/**
 * @desc src in format s3_url/{content_id}/tiles/z/x/y
 */
const isTileXYZValid: (
  boundaries: TileBoundaries,
  z: number,
  x: number,
  y: number,
) => boolean = (
  boundaries,
  z,
  x,
  y,
) => {
  const boundary: TileBoundary | undefined = boundaries[z];
  if (boundary === undefined) {
    return false;
  }

  return (
    inRange(x, boundary.minX, boundary.maxX + 1) &&
    inRange(y, boundary.minY, boundary.maxY + 1)
  );
};

interface CalcCache {
  readonly zoom: number;
  readonly cos: number;
  readonly sin: number;
}

export interface Props {
  readonly content: T.BlueprintPDFContent;
  readonly edit: boolean;
  readonly isAligning: boolean;
  readonly zIndex: number;
  readonly opacity?: number;
  updatePoint(geoPoint: T.BlueprintPDFContent['info']['geoPoint']): void;
}
export interface State {
  readonly projection: Projection | null;
  readonly revision: number;
}

/**
 * Wrapper component of the Openlayers to display blueprint
 */
class OlBlueprintLayer extends Component<Props, State> {
  private calcCache: CalcCache;
  private tileBoundary: { [zoom: number]: TileBoundary | undefined } = {};

  private get projectionCode(): string {
    return `CUSTOM:${this.props.content.id}`;
  }
  private get coordinate(): [Coordinate, Coordinate] {
    return [
      fromLonLat(this.props.content.info.geoPoint[0]),
      fromLonLat(this.props.content.info.geoPoint[1]),
    ];
  }

  public constructor(props: Props) {
    super(props);
    this.state = {
      projection: get(this.projectionCode),
      revision: 0,
    };

    this.calcCache = calculateInfo(
      imageDimensionOf(props.content),
      props.content.info.imagePoint,
      props.content.info.geoPoint,
    );
    if (props.content.info.tms) {
      this.tileBoundary = getTileBoundaries(props.content.info.tms.boundaries);
    }
  }

  public componentDidMount(): void {
    this.setState((prevState) => {
      let customProjection: Projection | null = prevState.projection;
      if (!customProjection) {
        const earthRadius: number = 6378137;
        const halfSize: number = Math.PI * earthRadius;
        customProjection = new Projection({
          code: this.projectionCode,
          units: 'm',
          extent: [-halfSize, -halfSize, halfSize, halfSize],
          getPointResolution(resolution: number, [__, pointY]: [number, number]): number {
            return resolution / Math.cosh(pointY / earthRadius);
          },
        });
        addProjection(customProjection);
      }

      addCoordinateTransforms(
        'EPSG:3857',
        this.projectionCode,
        this.fromEPSG3857,
        this.toEPSG3857,
      );

      return {
        projection: customProjection,
      };
    });

    this.setState((prev) => ({ revision: prev.revision + 1 }));
  }

  public componentDidUpdate({
    content: prevContent,
    opacity: prevOpacity,
  }: Props): void {
    const {
      content,
    }: Props = this.props;
    if (prevContent.info !== content.info) {
      this.calcCache = calculateInfo(
        imageDimensionOf(content),
        content.info.imagePoint,
        content.info.geoPoint,
      );
      if (content.info.tms) {
        this.tileBoundary = getTileBoundaries(content.info.tms.boundaries);
      }
      if (prevOpacity === this.props.opacity) this.setState((prevState) => ({ revision: prevState.revision + 1 }));
    }
  }

  @autobind
  private fromEPSG3857(target: Coordinate): Coordinate {
    const content: T.BlueprintPDFContent = this.props.content;
    const imageDimension: BlueprintDimension = imageDimensionOf(content);
    const coordinate: [Coordinate, Coordinate] = this.coordinate;
    const { zoom, cos, sin }: CalcCache = this.calcCache;
    const offset: Coordinate = [
      imageDimension.width * content.info.imagePoint[0][0],
      imageDimension.height * content.info.imagePoint[0][1],
    ];
    const relativePos: Coordinate = [
      target[0] - coordinate[0][0],
      target[1] - coordinate[0][1],
    ];

    return [
      (cos * relativePos[0] + sin * relativePos[1]) / zoom + offset[0],
      (-sin * relativePos[0] + cos * relativePos[1]) / zoom + offset[1],
    ];
  }

  /**
   * Convert from custom Projection to EPSG:3857
   * The custom project defined in function projectionCode(), implemented in componentDidMount()
   */
  @autobind
  private toEPSG3857(target: Coordinate): Coordinate {
    const content: T.BlueprintPDFContent = this.props.content;
    const imageDimension: BlueprintDimension = imageDimensionOf(content);
    const coordinate: [Coordinate, Coordinate] = this.coordinate;
    const { zoom, cos, sin }: CalcCache = this.calcCache;
    const offset: Coordinate = [
      imageDimension.width * content.info.imagePoint[0][0],
      imageDimension.height * content.info.imagePoint[0][1],
    ];
    const relativePos: Coordinate = [target[0] - offset[0], target[1] - offset[1]];

    return [
      (cos * relativePos[0] + -sin * relativePos[1]) * zoom + coordinate[0][0],
      (sin * relativePos[0] + cos * relativePos[1]) * zoom + coordinate[0][1],
    ];
  }

  /* istanbul ignore next: It's hard to test OL tile loading function */
  @autobind
  private loadTile(tile: ImageTile, url: string): void {
    const imageElement: HTMLImageElement = tile.getImage() as HTMLImageElement;
    /**
     * @desc revise y value in the frontend instead of the backend
     * to make the request has values `z/x/y` same with the response `z/x/y`
     * Ref. https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
     */
    const [z, x, y]: TileCoord = tile.getTileCoord();
    /**
     * @desc the conversion steps are
     * const wmsY2: number = 2 ** z - y - 1;
     */
    const wmsY: number = 2 ** z - y - 1;
    if (!isTileXYZValid(this.tileBoundary, z, x, wmsY)) {
      imageElement.src = '';

      return;
    }

    const request: AjaxRequest = {
      method: 'GET',
      url,
      responseType: 'blob',
      withCredentials: true,
    };
    ajax(request).subscribe({
      next: ({ response }) => {
        imageElement.src = window.URL.createObjectURL(response);
      },
      error: () => imageElement.src = '',
    });
  }

  @autobind
  private handleMouseUp(index: number, position: Coordinate): void {
    const content: T.BlueprintPDFContent = this.props.content;
    const geoPoint: [Coordinate, Coordinate] = [
      [...content.info.geoPoint[0]],
      [...content.info.geoPoint[1]],
    ];
    geoPoint[index] = toLonLat(position);
    this.props.updatePoint(geoPoint);
    this.calcCache = calculateInfo(
      imageDimensionOf(content),
      content.info.imagePoint,
      geoPoint,
    );
    if (content.info.tms) {
      this.tileBoundary = getTileBoundaries(content.info.tms.boundaries);
    }
    this.setState((prevState) => ({ revision: prevState.revision + 1 }));
  }

  @autobind
  private handleFirstPinMouseUp(position: Coordinate): void {
    this.handleMouseUp(0, position);
  }

  @autobind
  private handleSecondPinMouseUp(position: Coordinate): void {
    this.handleMouseUp(1, position);
  }

  public shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    /**
     * Only update for pin setting or opacity
     * Otherwise it keeps rendering on zoom in/out, map drag/move
     */
    return (
      nextProps.content.config?.selectedAt?.getTime() !== this.props.content.config?.selectedAt?.getTime() ||
      /**
       * Pin setting in the left side
       */
      !isDeepEqual(nextProps.content.info.imagePoint, this.props.content.info.imagePoint) ||
      /**
       * Pin setting in the right side
       */
      nextState.revision !== this.state.revision ||
      /**
       * Opacity
       */
      nextProps.content.config?.opacity !== this.props.content.config?.opacity
    );
  }

  public render(): ReactNode {
    if (this.state.projection === null) return null;

    const imageDimension: BlueprintDimension = imageDimensionOf(this.props.content);
    const w: number = imageDimension.width * tileScaleFactor;
    const h: number = imageDimension.height * tileScaleFactor;

    /**
     * @desc Build an extent that includes all given coordinates.
     * Ref. http://openlayers.org/en/latest/apidoc/ol.extent.html#.boundingExtent
     */
    const tileExtent: Extent = boundingExtent([
      this.toEPSG3857([0, 0]),
      this.toEPSG3857([0, h]),
      this.toEPSG3857([w, 0]),
      this.toEPSG3857([w, h]),
    ]);

    const tileOpacity: number = this.props.content.config?.opacity !== undefined ?
    // eslint-disable-next-line no-magic-numbers
      (this.props.content.config.opacity / 100) : 1;

    const pinPoints: ReactNode = !this.props.isAligning ? undefined : (
      <>
        <OlPinOverlay
          pinDesign={0}
          position={this.props.content.info.geoPoint[0]}
          onMouseUp={this.handleFirstPinMouseUp}
        />
        <OlPinOverlay
          pinDesign={1}
          position={this.props.content.info.geoPoint[1]}
          onMouseUp={this.handleSecondPinMouseUp}
        />
      </>
    );

    return (
      <OlTileLayer
        url={makeS3URL(this.props.content.id, 'tiles', '{z}', '{x}', '{-y}.png')}
        projection={this.state.projection}
        loadTile={this.loadTile}
        preload={0}
        zIndex={this.props.zIndex}
        revision={this.state.revision}
        extent={tileExtent}
        opacity={tileOpacity}
        crossOrigin='use-credentials'
      >
        {pinPoints}
      </OlTileLayer>
    );
  }
}
export default OlBlueprintLayer;
