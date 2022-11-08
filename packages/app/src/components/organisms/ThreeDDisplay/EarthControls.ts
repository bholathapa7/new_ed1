import { PickPoint, PointCloudOctree } from '@pnext/three-loader';
import { autobind } from 'core-decorators';
import * as THREE from 'three';

import {
  getMousePointCloudIntersection,
} from './getMousePointCloudIntersection';

const defaultPivotSize: number = 10;

/**
 * @author Junyoung Clare Jang
 * @desc Fri May 25 16:58:46 2018 UTC
 * @todo Add new class for converting various input events to normalized events.
 */
export class EarthControls extends THREE.EventDispatcher {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly camera: THREE.PerspectiveCamera;
  private cameraOfStartPoint: THREE.PerspectiveCamera;
  private readonly scene: THREE.Scene;
  private readonly screenElement: HTMLElement;
  private pco: PointCloudOctree | null;

  private readonly pivotIndicator: THREE.Object3D;

  private lastDragEvent: MouseEvent | null;

  public constructor(
    renderer: THREE.WebGLRenderer,
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    screenElement: HTMLElement,
  ) {
    super();
    this.renderer = renderer;
    this.camera = camera;
    this.cameraOfStartPoint = camera;
    this.scene = scene;
    this.screenElement = screenElement;
    this.attachEventListeners(screenElement);
    this.pco = null;

    const sphereSegments: number = 16;
    this.pivotIndicator = new THREE.Mesh(
      new THREE.SphereGeometry(1, sphereSegments, sphereSegments),
      new THREE.MeshNormalMaterial({}),
    );
    this.pivotIndicator.visible = false;
    this.pivotIndicator.scale.setScalar(defaultPivotSize);
    this.scene.add(this.pivotIndicator);

    this.lastDragEvent = null;
  }

  public setPointCloudOctree(pco: PointCloudOctree): void {
    this.pco = pco;
  }

  @autobind
  private attachEventListeners(screenElement: HTMLElement): void {
    screenElement.addEventListener('contextmenu', (event) => event.preventDefault());
    screenElement.addEventListener('mousedown', this.handleMouseDown);
    screenElement.addEventListener('mousemove', this.handleMouseMove);
    screenElement.addEventListener('mouseup', this.handleMouseUp);
    screenElement.addEventListener('wheel', this.handleWheel);
    screenElement.addEventListener('dblclick', this.handleDblClick);
  }

  @autobind
  private handleMouseDown(event: MouseEvent): void {
    event.preventDefault();

    if (this.pco === null) {
      return;
    }

    const point: PickPoint | null =
      getMousePointCloudIntersection(event, this.renderer, this.camera, this.pco);

    if (point === null ||
        point.position === undefined) {
      return;
    }

    const distance: number = this.camera.position.distanceTo(point.position);
    const sizeAdjustor: number = 100;

    this.lastDragEvent = event;
    this.cameraOfStartPoint = this.camera.clone();
    this.pivotIndicator.visible = true;
    this.pivotIndicator.position.copy(point.position);
    this.pivotIndicator.scale.setScalar(distance / sizeAdjustor);
  }

  @autobind
  private handleMouseMove(event: MouseEvent): void {
    if (this.lastDragEvent === null) {
      return;
    }

    if (!this.pivotIndicator.visible) {
      return;
    }

    event.preventDefault();

    switch (event.buttons) {
      case 1:
        this.handleLeftDrag(event);
        break;
      case 2:
        this.handleRightDrag(event);
        break;
      default:
    }
  }

  @autobind
  private handleLeftDrag(event: MouseEvent): void {
    const boundingRect: ClientRect =
      this.screenElement.getBoundingClientRect();
    const raycaster: THREE.Raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({
      x: 2 * ((event.clientX - boundingRect.left) / this.screenElement.clientWidth) - 1,
      // eslint-disable-next-line no-magic-numbers
      y: -2 * ((event.clientY - boundingRect.top) / this.screenElement.clientHeight) + 1,
    }, this.camera);
    const ray: THREE.Ray = raycaster.ray;

    const pivotPosition: THREE.Vector3 = this.pivotIndicator.position;
    const cameraOfStartPosition: THREE.Vector3 = this.cameraOfStartPoint.position;

    const plane: THREE.Plane = new THREE.Plane()
      .setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), pivotPosition);
    const distanceToPlane: number = ray.distanceToPlane(plane);

    if (distanceToPlane > 0) {
      const movedPoint: THREE.Vector3 = new THREE.Vector3()
        .addVectors(
          cameraOfStartPosition,
          ray.direction.clone().multiplyScalar(distanceToPlane),
        );
      const positionDelta: THREE.Vector3 = new THREE.Vector3()
        .subVectors(movedPoint, pivotPosition);

      this.camera.position.copy(
        cameraOfStartPosition.clone().sub(positionDelta),
      );
    }
  }

  @autobind
  private handleRightDrag(event: MouseEvent): void {
    if (this.lastDragEvent === null) {
      return;
    }

    const xDelta: number = event.clientX - this.lastDragEvent.clientX;
    const yDelta: number = event.clientY - this.lastDragEvent.clientY;
    this.lastDragEvent = event;

    const yawSpeed: number = 10;
    const pitchSpeed: number = 5;
    const yawDelta: number =
      - yawSpeed * xDelta / this.screenElement.clientWidth;
    const pitchDelta: number =
      pitchSpeed * yDelta / this.screenElement.clientHeight;

    const pivot: THREE.Vector3 = this.pivotIndicator.position;
    const pivotToCamera: THREE.Vector3 = new THREE.Vector3()
      .subVectors(this.camera.position, pivot);

    pivotToCamera.applyAxisAngle(new THREE.Vector3(0, 0, 1), yawDelta);

    const directionToCamera: THREE.Vector3 = this.camera
      .getWorldDirection(new THREE.Vector3());

    const angleLimit: number = 0.1;
    const canDetermineOrthogonalDirection: boolean = yDelta < 0 ?
      directionToCamera.angleTo(new THREE.Vector3(0, 0, 1)) > angleLimit :
      directionToCamera.angleTo(new THREE.Vector3(0, 0, -1)) > angleLimit;

    if (canDetermineOrthogonalDirection) {
      const OrthogonalDirectionToCamera: THREE.Vector3 = directionToCamera
        .setZ(0)
        .normalize()
        .applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);

      pivotToCamera.applyAxisAngle(OrthogonalDirectionToCamera, pitchDelta);
      this.camera.position.copy(new THREE.Vector3().addVectors(pivot, pivotToCamera));
      this.camera.rotateOnWorldAxis(OrthogonalDirectionToCamera, pitchDelta);
      this.camera.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), yawDelta);
    } else {
      this.camera.position.copy(new THREE.Vector3().addVectors(pivot, pivotToCamera));
      this.camera.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), yawDelta);
    }
  }

  @autobind
  private handleMouseUp(event: MouseEvent): void {
    event.preventDefault();
    this.lastDragEvent = null;
    this.pivotIndicator.visible = false;
  }

  @autobind
  private handleWheel(event: WheelEvent): void {
    event.preventDefault();

    if (this.pco === null) {
      return;
    }

    const point: PickPoint | null =
      getMousePointCloudIntersection(event, this.renderer, this.camera, this.pco);

    if (point === null ||
        point.position === undefined) {
      return;
    }

    const pointToCamera: THREE.Vector3 = new THREE.Vector3()
      .subVectors(this.camera.position, point.position);

    const zoomFactor: number = 1.2;
    pointToCamera.multiplyScalar(Math.pow(zoomFactor, Math.sign(event.deltaY)));

    this.camera.position
      .copy(new THREE.Vector3().addVectors(point.position, pointToCamera));
  }

  @autobind
  private handleDblClick(event: MouseEvent): void {
    event.preventDefault();
    /**
     * @todo implement this handler
     */
  }
}
