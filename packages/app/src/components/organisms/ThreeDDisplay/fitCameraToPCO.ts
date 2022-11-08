import { PointCloudOctree } from '@pnext/three-loader';
import * as THREE from 'three';

const defaultOffset: number = 1.25;
const degreeOfHalfCircle: number = 180;
const degreeToRadian: (degree: number) => number = (
  degree,
) => degree * (Math.PI / degreeOfHalfCircle);

export const fitCameraToPCO: (
  scene: THREE.Scene, camera: THREE.PerspectiveCamera,
  pco: PointCloudOctree,
  offset: number,
) => void = (
  scene, camera, pco, offset = defaultOffset,
) => {
  const boundingBox: THREE.Box3 = pco.pcoGeometry.tightBoundingBox;
  const boundaryCenter: THREE.Vector3 = new THREE.Vector3();
  const boundarySize: THREE.Vector3 = new THREE.Vector3();
  boundingBox.getCenter(boundaryCenter);
  boundingBox.getSize(boundarySize);

  const maxDim: number = Math.max(boundarySize.x, boundarySize.y, boundarySize.z);

  const radianFov: number = degreeToRadian(camera.fov);
  const bothSide: number = 2;
  const halfMaxDim: number = maxDim / bothSide;
  const cameraZ: number = Math.abs(halfMaxDim * Math.tan(radianFov * bothSide)) * offset;

  scene.updateMatrixWorld(true);
  const pcoWorldPosition: THREE.Vector3 = new THREE.Vector3();
  pcoWorldPosition.setFromMatrixPosition(pco.matrixWorld);

  camera.position.sub(pcoWorldPosition).setLength(cameraZ);
  camera.lookAt(pcoWorldPosition);

  camera.far = Number.MAX_SAFE_INTEGER;
  camera.updateProjectionMatrix();

  camera.lookAt(boundaryCenter);
};
