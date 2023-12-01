
import * as THREE from 'three';


export default () => {
  const width = window.innerWidth
  const height = window.innerHeight

  const camera = new THREE.PerspectiveCamera( 70, width / height, 0.01, 10 );
  camera.position.z = 1;

  const scene = new THREE.Scene();

  const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
  const material = new THREE.MeshNormalMaterial();

  const mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector('canvas')!
  });

  renderer.setSize( width, height, false );
  renderer.setAnimationLoop( animation );

  window.addEventListener('resize', resize)

  // animation
  function animation( time: number ) {
    mesh.rotation.x = time / 2000;
    mesh.rotation.y = time / 1000;
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