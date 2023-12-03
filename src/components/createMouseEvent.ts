import * as THREE from 'three';
import { createEventEmitter } from './createEventEmitter';

export function createMouseEvent ({
  screenSize,
  scene,
  camera
}: { screenSize: { width: number, height: number }, scene: THREE.Scene, camera: THREE.Camera }) {

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  let meshOver: THREE.Object3D | undefined


  const { on, off, dispatch } = createEventEmitter<
    { name: 'mouseover', callback: (data: THREE.Object3D) => void } |
    { name: 'mouseout', callback: (data: THREE.Object3D) => void } |
    { name: 'click', callback: (data: THREE.Object3D) => void }
  >()

  const { on: onOver, off: offOver, dispatch: dispatchOver } = createEventEmitter<
    { name: THREE.Object3D, callback: (data: THREE.Object3D) => void } |
    { name: THREE.Object3D, callback: (data: THREE.Object3D) => void }
  >()

  const { on: onOut, off: offOut, dispatch: dispatchOut } = createEventEmitter<
    { name: THREE.Object3D, callback: (data: THREE.Object3D) => void } |
    { name: THREE.Object3D, callback: (data: THREE.Object3D) => void }
  >()

  const { on: onClick, off: offClick, dispatch: dispatchClick } = createEventEmitter<
    { name: THREE.Object3D, callback: (data: THREE.Object3D) => void } |
    { name: THREE.Object3D, callback: (data: THREE.Object3D) => void }
  >()


  on('mouseover', (obj: THREE.Object3D) => {
    dispatchOver(obj, obj)
  })

  on('mouseout', (obj: THREE.Object3D) => {
    dispatchOut(obj, obj)
  })

  on('click', (obj: THREE.Object3D) => {
    dispatchClick(obj, obj)
  })


  window.addEventListener('mousemove', mouseMove)
  window.addEventListener('click', click)


  function click () {
    raycaster.setFromCamera(mouse, camera);
    const object3D = raycaster.intersectObject(scene, true)?.[0]?.object;
    if (object3D) {
      dispatch('click', object3D)
    }
  }

  function mouseMove (event: MouseEvent) {
    mouse.x = (event.clientX / screenSize.width) * 2 - 1;
    mouse.y = -(event.clientY / screenSize.height) * 2 + 1;
  }

  function testHover () {
    raycaster.setFromCamera(mouse, camera);
    const object3D = raycaster.intersectObject(scene, true)?.[0]?.object;

    if (object3D !== meshOver) {
      if (meshOver) {
        dispatch('mouseout', meshOver);
      }

      meshOver = object3D;
      if (object3D) {
        dispatch('mouseover', meshOver);
      }
    }

    return object3D
  }


  return {
    testHover,
    onOver,
    offOver,
    onOut,
    offOut,
    onClick,
    offClick
  }
}
