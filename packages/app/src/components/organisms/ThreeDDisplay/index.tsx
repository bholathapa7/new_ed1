import { PointCloudOctree, Potree } from '@pnext/three-loader';
import { autobind } from 'core-decorators';
import React, { Component, ReactNode, RefObject, createRef } from 'react';
import { Observable, Subject, animationFrameScheduler, from, interval } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';
import styled from 'styled-components';
import * as THREE from 'three';

import * as T from '^/types';

import { default3DOption } from '^/constants/defaultContent';
import palette from '^/constants/palette';

import { AuthHeader, makeS3URL } from '^/store/duck/API';

import LoadingScreen from '^/components/molecules/LoadingScreen';

import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { EarthControls } from './EarthControls';
import { Fallback } from './fallback';
import { fitCameraToPCO } from './fitCameraToPCO';
/**
 * @todo Please adjust the value interactively.
 */
// eslint-disable-next-line no-magic-numbers
const defaultMaxNumberOfDisplayedPoints: number = default3DOption.pointNumber * 1000000;
/**
 * @desc To load details without zoom-in.
 * @see https://github.com/pnext/three-loader/blob/9d593042bcee90a2ca39c54fa747afb958ec2750/src/potree.ts#L164
 * @todo Please adjust the value interactively.
 */
const minPixelsOfPointsToDisplay: number = 100;
/**
 * @desc This is not in the unit of pixels, even though
 * other settings for `PointCloudMaterial` are in the unit of pixels.
 * @todo Please adjust the value interactively.
 */
const defaultSizeOfDisplayedPoints: number = default3DOption.pointSize;

export const ViewerWrapper = styled.div({
  width: '100%',
  height: '100%',
  overflow: 'hidden',
});

/**
 * @fixme
 * following values are meaningless,
 * since fitCameraToPCO will change those values.
 * Please make this fitfall more clear.
 */
const fov: number = 50;
const near: number = 0.1;
const far: number = 1000;
const initialPos: number = 50;

export interface Props {
  readonly contents: Array<T.PointCloudContent>;
  readonly authHeader?: AuthHeader;
  readonly viewerRedraw?: number;
  readonly pointNumber?: number;
  readonly pointSize?: number;
  logout(): void;
  openWarning(): void;
  unselectExcept(contentIds: Array<number>, exceptionId: number): void;
}

export interface State {
  readonly isLoading: boolean;
}

/**
 * @author Junyoung Clare Jang
 * @desc Fri Apr 13 23:56:49 2018 UTC
 * @todo This component is too complex. One should refactor this into several components.
 */
class ThreeDDisplay extends Component<Props, State> {
  private readonly unmountObs: Subject<0>;

  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private controls: EarthControls | null;
  private readonly viewerRef: RefObject<HTMLDivElement>;
  private readonly potree: Potree;
  private loadedPCO: PointCloudOctree | null;

  public constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: true,
    };

    this.unmountObs = new Subject();

    this.viewerRef = createRef();

    this.renderer = new THREE.WebGLRenderer({
      alpha: false,
      // @todo antialias: Math.min(1.7, window.devicePixelRatio) <= 1,
      // @todo devicePixelRatio: Math.min(1.7, window.devicePixelRatio),
      logarithmicDepthBuffer: false,
      precision: 'highp',
      preserveDrawingBuffer: false,
    });
    this.renderer.autoClear = false;
    this.renderer.setSize(0, 0);
    this.renderer.context.getShaderInfoLog = () => '';

    /**
     * @desc Unit for `fov` is degree
     */
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(palette.mapBackgroundColorGrey.toString());
    this.camera = new THREE.PerspectiveCamera(fov, NaN, near, far);
    this.camera.up.set(0, 0, 1);
    this.camera.position.setScalar(initialPos);
    this.controls = null;

    this.potree = new Potree();
    this.potree.pointBudget = this.props.pointNumber || defaultMaxNumberOfDisplayedPoints;
    this.loadedPCO = null;
  }

  public componentDidMount(): void {
    const { authHeader, contents }: Props = this.props;

    if (contents.length !== 0) {
      this.props.unselectExcept(contents.map((content) => content.id), contents[0].id);
    }

    const viewerDiv: HTMLElement | null = this.viewerRef.current;

    if (viewerDiv !== null) {
      this.controls = new EarthControls(this.renderer, this.camera, this.scene, viewerDiv);

      this.resize();
      window.addEventListener('resize', this.resize);

      viewerDiv.appendChild(this.renderer.domElement);
    } else {
      throw new Error('Cannot find a ref in ThreeDDisplay');
    }

    this.renderLoop().pipe(
      takeUntil(this.unmountObs),
    )
      .subscribe();

    if (authHeader === undefined) {
      this.props.logout();

      return;
    }

    if (contents.length > 0) {
      this.loadPOC(contents[0]);
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    const { authHeader, contents, viewerRedraw }: Props = this.props;
    const {
      authHeader: prevAuthHeader,
      contents: prevContents,
      viewerRedraw: prevViewerRedraw,
    }: Props = prevProps;

    if (viewerRedraw !== prevViewerRedraw) {
      this.resize();
    }

    if (contents.length > 1) {
      this.props.unselectExcept(contents.map((content) => content.id), contents[0].id);
    }

    if (authHeader === undefined) {
      this.props.logout();

      return;
    }

    if (contents.length === 0) {
      if (this.loadedPCO !== null) {
        this.scene.remove(this.loadedPCO);
        this.loadedPCO = null;
      }
      this.camera.up.set(0, 0, 1);
      this.camera.position.setScalar(initialPos);

      return;
    }

    if (
      prevContents.length === 0 ||
      prevAuthHeader === undefined ||
      contents[0].id !== prevContents[0].id ||
      authHeader.Authorization !== prevAuthHeader.Authorization
    ) {
      if (this.loadedPCO !== null) {
        this.scene.remove(this.loadedPCO);
        this.loadedPCO = null;
      }
      this.camera.up.set(0, 0, 1);
      this.camera.position.setScalar(initialPos);

      this.loadPOC(contents[0]);
    }

    if (
      this.loadedPCO &&
      this.props.pointSize !== undefined &&
      this.props.pointSize !== prevProps.pointSize
    ) {
      this.loadedPCO.material.setUniform('size', this.props.pointSize);
    }

    if (
      this.props.pointNumber !== undefined &&
      this.props.pointNumber !== prevProps.pointNumber
    ) {
      this.potree.pointBudget = this.props.pointNumber;
    }
  }

  public componentWillUnmount(): void {
    this.unmountObs.next(0);
    window.removeEventListener('resize', this.resize);
  }

  @autobind
  private resize(): void {
    const viewerDiv: HTMLElement | null = this.viewerRef.current;

    if (viewerDiv !== null) {
      const { width, height }: ClientRect | DOMRect = viewerDiv.getBoundingClientRect();

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  @autobind
  private loadPOC(content: T.PointCloudContent): void {
    this.setState({
      isLoading: true,
    });

    from(this.potree.loadPointCloud('cloud.js', async (path) => {
      const url: string = makeS3URL(content.id, '3d', path);
      const response: Response = await fetch(url, { credentials: 'include' });

      if (!response.ok) {
        throw new Error(`3D is not included in ${content.id}`);
      }

      return URL.createObjectURL(await response.blob());
    })).pipe(
      tap((pco) => {
        this.loadedPCO = pco;

        pco.material.setUniform('size', this.props.pointSize || defaultSizeOfDisplayedPoints);
        pco.minNodePixelSize = minPixelsOfPointsToDisplay;
        pco.position.setScalar(0);
        pco.updateMatrixWorld(true);

        if (this.controls !== null) {
          this.controls.setPointCloudOctree(pco);
        }
        this.scene.add(pco);

        const cameraZoomOffset: number = 1.1;
        fitCameraToPCO(this.scene, this.camera, pco, cameraZoomOffset);
      }),
      /**
       * @todo
       * Handling error for unprocessed content
       */
      catchError((err) => {
        // eslint-disable-next-line no-console
        console.error(err);

        this.setState({
          isLoading: false,
        });

        return [];
      }),
      takeUntil(this.unmountObs),
    )
      .subscribe();
  }

  @autobind
  private renderLoop(): Observable<void> {
    return interval(0, animationFrameScheduler).pipe(
      map(() => {
        if (this.loadedPCO !== null) {
          const pco: PointCloudOctree = this.loadedPCO;

          this.potree.updatePointClouds([pco], this.camera, this.renderer);

          this.setState(({ isLoading: isPrevLoading }) => ({
            isLoading: isPrevLoading && pco.children.length > 0 ?
              false :
              isPrevLoading,
          }));
        }

        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
      }),
    );
  }

  public render(): ReactNode {
    const loading: ReactNode = this.state.isLoading ? (
      <LoadingScreen
        backgroundColor={palette.white}
        textColor={palette.textBlack}
      />
    ) : undefined;

    return (
      <ViewerWrapper id='as-3d-view-wrapper' ref={this.viewerRef}>
        {loading}
      </ViewerWrapper>
    );
  }
}

export default withErrorBoundary(ThreeDDisplay)(Fallback);
