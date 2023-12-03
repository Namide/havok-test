
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getRAPIER } from '../physic/rapier';
import createGround from '../components/createGround';
import createCube from '../components/createCube';

// Rapier example https://github.com/viridia/demo-rapier-three/tree/main
export default async () => {

  const RAPIER = await getRAPIER()
  
  const gravity = new THREE.Vector3(0.0, -9.81, 0.0);
  const world = new RAPIER.World(gravity);

  const width = window.innerWidth
  const height = window.innerHeight

  const scene = new THREE.Scene();

  const updates: (() => void)[] = []

  // Ground
  const { mesh: groundMesh } = await createGround({ world })
  scene.add(groundMesh)

  // Cube
  for (let i = 0; i < 50; i++) {
    const { mesh, update } = await createCube({ world, posX: Math.random() * 2 - 1, posY: Math.random() + 2, posZ: Math.random() * 2 - 1 })
    scene.add( mesh );
    updates.push(update)
  }

  const camera = new THREE.PerspectiveCamera( 70, width / height, 1, 30 );
  camera.position.z = 10;
  camera.position.y = 3
  camera.lookAt(new THREE.Vector3(0, 1, 0))

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector('canvas')!
  });
  const controls = new OrbitControls( camera, renderer.domElement )
  controls.update();

  renderer.setSize( width, height, false );
  renderer.setAnimationLoop( animation );

  window.addEventListener('resize', resize)

  // animation
  function animation( /* time: number */ ) {

    // Ste the simulation forward.  
    world.step();

    // Get and print the rigid-body's position.
    updates.forEach(update => update())

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    // scene.rotation.x = time / 2000;
    // scene.rotation.y = time / 1000;
    renderer.render( scene, camera );
  }

  function resize() {
    const width = window.innerWidth
    const height = window.innerHeight
    renderer.setSize( width, height, false );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
}