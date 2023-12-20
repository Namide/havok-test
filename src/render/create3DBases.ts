import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createMouseEmitter } from "../events/createMouseEmitter";
import { createHavok } from "../physic/createHavok";

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
  camera.position.z = 5;
  camera.position.y = 10;
  camera.lookAt(new THREE.Vector3(0, 1, 0));

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector("canvas") as HTMLCanvasElement,
  });
  // const controls = new OrbitControls(camera, renderer.domElement);
  const clock = new THREE.Clock();
  // controls.update();
  renderer.setSize(screenSize.width, screenSize.height, false);

  const mouseEmitter = await createMouseEmitter({
    screenSize,
    scene,
    camera,
    canvas: renderer.domElement,
  });

  window.addEventListener("resize", resize);

  function update() {
    const delta = clock.getDelta();
    mouseEmitter.testHover();
    // controls.update();
    updatePhysic(delta);
  }

  function render() {
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
    renderWorld: {
      camera,
      renderer,
      scene,
    },
    physicWorld: {
      world,
    },
    mouseEmitter,
    update,
    render,
  };
}

export type RenderWorld = Awaited<
  ReturnType<typeof create3DBases>
>["renderWorld"];
export type PhysicWorld = Awaited<
  ReturnType<typeof create3DBases>
>["physicWorld"];
