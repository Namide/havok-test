import * as THREE from 'three';
import { getRAPIER } from '../physic/rapier';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createMouseEvent } from './createMouseEvent';

export async function create3DBases () {

  const RAPIER = await getRAPIER()
  const screenSize = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  const gravity = new THREE.Vector3(0.0, -9.81, 0.0);
  const world = new RAPIER.World(gravity);

  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera( 70, screenSize.width / screenSize.height, 1, 1000 );
  camera.position.z = 10;
  camera.position.y = 3
  camera.lookAt(new THREE.Vector3(0, 1, 0))

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector('canvas')!
  });
  const controls = new OrbitControls( camera, renderer.domElement )
  controls.update();

  renderer.setSize( screenSize.width, screenSize.height, false );

  const mouseEvent = createMouseEvent({ screenSize, scene, camera })

  window.addEventListener('resize', resize)

  function update () {

    mouseEvent.update()
    
    controls.update();
    world.step();

    renderer.render( scene, camera );
  }

  function resize () {
    screenSize.width = window.innerWidth
    screenSize.height = window.innerHeight
    renderer.setSize( screenSize.width, screenSize.height, false );
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
    
  }
}
