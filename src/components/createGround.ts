import * as THREE from 'three';
import { Rapier, getRAPIER } from "../physic/rapier";

export default async function createGround ({ world }: { world: InstanceType<Rapier['World']> }) {

  const RAPIER = await getRAPIER()

  const material = new THREE.MeshNormalMaterial();
  const body = RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0);
  const geometry = new THREE.BoxGeometry(20.0, 0.2, 20.0)
  const mesh = new THREE.Mesh(geometry, material)

  world.createCollider(body);

  return {
    mesh,
    body
  }
}