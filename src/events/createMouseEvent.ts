import { createEventEmitter } from "./createEventEmitter";
import * as THREE from "three";

type MousePosition = { x: number; y: number };

export async function createMouseEvent({
  screenSize,
  scene,
  camera,
  canvas,
}: {
  screenSize: { width: number; height: number };
  scene: THREE.Scene;
  camera: THREE.Camera;
  canvas: HTMLCanvasElement;
}) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  let meshOver: THREE.Object3D | undefined;

  const { on, dispatch } = createEventEmitter<
    | { name: "mouseover"; callback: (data: THREE.Object3D) => void }
    | { name: "mouseout"; callback: (data: THREE.Object3D) => void }
    | { name: "click"; callback: (data: THREE.Object3D) => void }
    | { name: "down"; callback: (data: THREE.Object3D) => void }
    | { name: "up"; callback: () => void }
  >();

  const {
    on: onOver,
    off: offOver,
    dispatch: dispatchOver,
  } = createEventEmitter<{
    name: THREE.Object3D;
    callback: (data: THREE.Object3D) => void;
  }>();

  const {
    on: onOut,
    off: offOut,
    dispatch: dispatchOut,
  } = createEventEmitter<{
    name: THREE.Object3D;
    callback: (data: THREE.Object3D) => void;
  }>();

  const {
    on: onMove,
    off: offMove,
    dispatch: dispatchMove,
  } = createEventEmitter<{
    name: undefined;
    callback: (data: MousePosition) => void;
  }>();

  const {
    on: onClick,
    off: offClick,
    dispatch: dispatchClick,
  } = createEventEmitter<{
    name: THREE.Object3D;
    callback: (data: THREE.Object3D) => void;
  }>();

  const {
    on: onDown,
    off: offDown,
    dispatch: dispatchDown,
  } = createEventEmitter<{
    name: THREE.Object3D;
    callback: (data: THREE.Object3D) => void;
  }>();

  const {
    on: onUp,
    off: offUp,
    dispatch: dispatchUp,
  } = createEventEmitter<{ name: undefined; callback: () => void }>();

  on("mouseover", (obj: THREE.Object3D) => {
    dispatchOver(obj, obj);
  });

  on("mouseout", (obj: THREE.Object3D) => {
    dispatchOut(obj, obj);
  });

  on("click", (obj: THREE.Object3D) => {
    dispatchClick(obj, obj);
  });

  on("down", (obj: THREE.Object3D) => {
    dispatchDown(obj, obj);
  });

  on("up", () => {
    dispatchUp(undefined);
  });

  window.addEventListener("mousemove", mouseMove);
  canvas.addEventListener("click", click);
  canvas.addEventListener("mousedown", down);
  window.addEventListener("mouseup", up);
  window.addEventListener("mouseleave", up);
  canvas.addEventListener("pointerdown", down);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointerleave", up);

  function down(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    raycaster.setFromCamera(mouse, camera);
    const object3D = raycaster.intersectObject(scene, true)?.[0]?.object;
    if (object3D) {
      dispatch("down", object3D);
    }
  }

  function up() {
    dispatch("up");
  }

  function click() {
    raycaster.setFromCamera(mouse, camera);
    const object3D = raycaster.intersectObject(scene, true)?.[0]?.object;
    if (object3D) {
      dispatch("click", object3D);
    }
  }

  function mouseMove(event: MouseEvent) {
    mouse.x = (event.clientX / screenSize.width) * 2 - 1;
    mouse.y = -(event.clientY / screenSize.height) * 2 + 1;
    dispatchMove(undefined, mouse);
  }

  function testHover() {
    raycaster.setFromCamera(mouse, camera);
    const object3D = raycaster.intersectObject(scene, true)?.[0]?.object;

    if (object3D !== meshOver) {
      if (meshOver) {
        dispatch("mouseout", meshOver);
      }

      meshOver = object3D;
      if (object3D) {
        dispatch("mouseover", meshOver);
      }
    }

    return object3D;
  }

  return {
    testHover,
    onOver,
    offOver,
    onOut,
    offOut,
    onClick,
    offClick,
    onDown,
    offDown,
    onUp,
    offUp,
    onMove,
    offMove,
  };
}
