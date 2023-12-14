import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createHavok } from "./createHavok";
import { createMouseEvent } from "./createMouseEvent";

export async function create3DBases() {
  const { world, update: updatePhysic } = await createHavok();

  const screenSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    70,
    screenSize.width / screenSize.height,
    1,
    1000,
  );
  camera.position.z = 10;
  camera.position.y = 3;
  camera.lookAt(new THREE.Vector3(0, 1, 0));

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector("canvas") as HTMLCanvasElement,
  });
  const controls = new OrbitControls(camera, renderer.domElement);
  const clock = new THREE.Clock();
  controls.update();
  renderer.setSize(screenSize.width, screenSize.height, false);

  const mouseEvent = createMouseEvent({
    screenSize,
    scene,
    camera,
    canvas: renderer.domElement,
  });

  window.addEventListener("resize", resize);

  function update() {
    const delta = clock.getDelta();
    mouseEvent.testHover();
    controls.update();
    updatePhysic(delta);
    renderer.render(scene, camera);
  }

  function resize() {
    screenSize.width = window.innerWidth;
    screenSize.height = window.innerHeight;
    renderer.setSize(screenSize.width, screenSize.height, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  return {
    ...mouseEvent,
    update,
    camera,
    renderer,
    world,
    scene,
  };
}
