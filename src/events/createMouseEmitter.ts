import * as THREE from "three";
import { createEventEmitter } from "./createEventEmitter";

export type MousePosition = { x: number; y: number };

export async function createMouseEmitter({
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
  const position = new THREE.Vector2();

  let meshOver: THREE.Object3D | undefined;

  const globalEmitter = createEventEmitter<
    | { name: "mouseover"; callback: (data: THREE.Object3D) => void }
    | { name: "mouseout"; callback: (data: THREE.Object3D) => void }
    | { name: "click"; callback: (data: THREE.Object3D) => void }
    | { name: "down"; callback: (data: THREE.Object3D) => void }
    | { name: "move"; callback: (event: MousePosition) => void }
    | { name: "up"; callback: () => void }
  >();

  const drag = createEventEmitter<{
    name: "start" | "stop";
    callback: () => void;
  }>();

  const over = createEventEmitter<{
    name: THREE.Object3D;
    callback: (data: THREE.Object3D) => void;
  }>();

  const out = createEventEmitter<{
    name: THREE.Object3D;
    callback: (data: THREE.Object3D) => void;
  }>();

  const move = createEventEmitter<{
    name: undefined;
    callback: (data: MousePosition) => void;
  }>();

  const click = createEventEmitter<{
    name: THREE.Object3D;
    callback: (data: THREE.Object3D) => void;
  }>();

  const down = createEventEmitter<{
    name: THREE.Object3D;
    callback: (data: THREE.Object3D) => void;
  }>();

  const up = createEventEmitter<{
    name: undefined;
    callback: () => void;
  }>();

  globalEmitter.on("mouseover", (obj: THREE.Object3D) => {
    over.dispatch(obj, obj);
  });

  globalEmitter.on("mouseout", (obj: THREE.Object3D) => {
    out.dispatch(obj, obj);
  });

  globalEmitter.on("click", (obj: THREE.Object3D) => {
    click.dispatch(obj, obj);
  });

  globalEmitter.on("down", (obj: THREE.Object3D) => {
    down.dispatch(obj, obj);
  });

  globalEmitter.on("up", () => {
    up.dispatch(undefined);
  });

  globalEmitter.on("move", (position: MousePosition) => {
    move.dispatch(undefined, position);
  });

  window.addEventListener("mousemove", onMove);
  canvas.addEventListener("click", onClick);
  canvas.addEventListener("mousedown", onDown);
  window.addEventListener("mouseup", onUp);
  window.addEventListener("mouseleave", onUp);
  // canvas.addEventListener("pointerdown", onDown);
  // window.addEventListener("pointerup", onUp);
  // window.addEventListener("pointerleave", onUp);

  function onDown() {
    // event.preventDefault();
    // event.stopPropagation();
    raycaster.setFromCamera(position, camera);
    const object3D = raycaster.intersectObject(scene, true)?.[0]?.object;
    if (object3D) {
      globalEmitter.dispatch("down", object3D);
    }
  }

  function onUp() {
    globalEmitter.dispatch("up");
  }

  function onClick() {
    raycaster.setFromCamera(position, camera);
    const object3D = raycaster.intersectObject(scene, true)?.[0]?.object;
    if (object3D) {
      globalEmitter.dispatch("click", object3D);
    }
  }

  function onMove(event: MouseEvent) {
    position.x = (event.clientX / screenSize.width) * 2 - 1;
    position.y = -(event.clientY / screenSize.height) * 2 + 1;
    globalEmitter.dispatch("move", position);
  }

  function testHover() {
    raycaster.setFromCamera(position, camera);
    const object3D = raycaster.intersectObject(scene, true)?.[0]?.object;

    if (object3D !== meshOver) {
      if (meshOver) {
        globalEmitter.dispatch("mouseout", meshOver);
      }

      meshOver = object3D;
      if (object3D) {
        globalEmitter.dispatch("mouseover", meshOver);
      }
    }

    return object3D;
  }

  function dispose() {
    globalEmitter.dispose();
    over.dispose();
    move.dispose();
    click.dispose();
    up.dispose();
    down.dispose();
    out.dispose();
  }

  return {
    position,
    testHover,
    drag,
    over,
    out,
    click,
    down,
    up,
    move,
    dispose,
  };
}

export type MouseEmitter = Awaited<ReturnType<typeof createMouseEmitter>>;
