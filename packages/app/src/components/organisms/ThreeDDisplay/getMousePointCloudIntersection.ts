import { PickPoint, PointCloudOctree } from '@pnext/three-loader';
import * as THREE from 'three';

export type GetMousePointCloudeIntersection = (
  event: MouseEvent,
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  pco: PointCloudOctree,
) => PickPoint | null;

export const getMousePointCloudIntersection: GetMousePointCloudeIntersection = (
  event,
  renderer,
  camera,
  pco,
) => {
  const boundingRect: ClientRect = renderer.domElement.getBoundingClientRect();
  const raycaster: THREE.Raycaster = new THREE.Raycaster();
  raycaster.setFromCamera({
    x: 2 * ((event.clientX - boundingRect.left) / boundingRect.width) - 1,
    // eslint-disable-next-line no-magic-numbers
    y: -2 * ((event.clientY - boundingRect.top) / boundingRect.height) + 1,
  }, camera);
  const ray: THREE.Ray = raycaster.ray;

  return pco.pick(renderer, camera, ray);
};
