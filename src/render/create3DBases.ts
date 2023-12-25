import * as THREE from "three";
import { createMouseEmitter } from "../events/createMouseEmitter";
import { createHavok } from "../physic/createHavok";
import { ORBIT_CONTROL, SOFT_SHADOW, SHADOW, DEBUG } from "../config";
import pcssGetShadowFragment from "./pcssGetShadow.fragment.glsl";
import pcssFragment from "./pcss.fragment.glsl";
import { OrbitControls } from "three/examples/jsm/Addons.js";

// Soft shadows
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_shadowmap_pcss.html
// https://threejs.org/examples/?q=shado#webgl_shadowmap_pcss

export async function create3DBases() {
  const { world, update: updatePhysic } = await createHavok();

  const screenSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Scene
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

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector("canvas") as HTMLCanvasElement,
  });
  const clock = new THREE.Clock();
  renderer.setSize(screenSize.width, screenSize.height, false);

  // Shadow
  if (SOFT_SHADOW && SHADOW) {
    const shader = THREE.ShaderChunk.shadowmap_pars_fragment
      .replace(
        "#ifdef USE_SHADOWMAP",
        `#ifdef USE_SHADOWMAP
${pcssFragment}`,
      )
      .replace(
        "#if defined( SHADOWMAP_TYPE_PCF )",
        `${pcssGetShadowFragment}
#if defined( SHADOWMAP_TYPE_PCF )`,
      );

    THREE.ShaderChunk.shadowmap_pars_fragment = shader;
  }
  if (SHADOW) {
    renderer.shadowMap.enabled = true;
  }

  const mouseEmitter = await createMouseEmitter({
    screenSize,
    scene,
    camera,
    canvas: renderer.domElement,
  });

  // Orbit control
  let controls: OrbitControls;
  if (ORBIT_CONTROL) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
    mouseEmitter.drag.on("start", () => {
      controls.enabled = false;
    });
    mouseEmitter.drag.on("stop", () => {
      controls.enabled = true;
    });
  }

  // Lights
  scene.add(new THREE.AmbientLight(0xaaaaaa, 3));

  const light = new THREE.DirectionalLight(0xf0f6ff, 4.5);
  light.position.set(2, 8, 4);
  if (SHADOW) {
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.far = 15;
    light.shadow.camera.near = 1;
    light.shadow.camera.top = 15;
    light.shadow.camera.bottom = -15;
    light.shadow.camera.left = 15;
    light.shadow.camera.right = -15;

    if (DEBUG) {
      scene.add(new THREE.CameraHelper(light.shadow.camera));
    }
  } else if (DEBUG) {
    scene.add(new THREE.DirectionalLightHelper(light));
  }
  scene.add(light);

  window.addEventListener("resize", resize);

  function update() {
    const delta = clock.getDelta();
    mouseEmitter.testHover();
    if (ORBIT_CONTROL) {
      controls.update();
    }
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
