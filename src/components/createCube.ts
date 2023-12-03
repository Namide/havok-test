import * as THREE from 'three';
import { Rapier, getRAPIER } from "../physic/rapier";
import { euler, quaternion } from '../constants';

export default async function createCube ({
  world,
  posX = 0, posY = 0, posZ = 0,
  sizeX = 0.2, sizeY = 0.2, sizeZ = 0.2,
  rotX = Math.random(), rotY = Math.random(), rotZ = Math.random()
}: { world: InstanceType<Rapier['World']>, posX?: number, posY?: number, posZ?: number, sizeX?: number, sizeY?: number, sizeZ?: number, rotX?: number, rotY?: number, rotZ?: number }) {

  const RAPIER = await getRAPIER()

  // Rotation
  quaternion.setFromEuler(euler.set(rotX, rotY, rotZ), true)

  // Physic
  const cubeBodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(posX, posY, posZ)
    .setRotation({ w: quaternion.w, x: quaternion.x, y: quaternion.y, z: quaternion.z })
  const rigidBody = world.createRigidBody(cubeBodyDesc);
  const cubeColliderDesc = RAPIER.ColliderDesc.cuboid(sizeX / 2, sizeY / 2, sizeZ / 2);
  world.createRigidBody(cubeBodyDesc);
  world.createCollider(cubeColliderDesc, rigidBody);

  // Render
  const material = new THREE.MeshNormalMaterial();
  const geometry = new THREE.BoxGeometry( sizeX, sizeY, sizeZ );
  const mesh = new THREE.Mesh( geometry, material );

  // Update
  const update = () => {
    const { x: posX, y: posY, z: posZ } = rigidBody.translation();
    const { x: rotX, y: rotY, z: rotZ, w: rotW } = rigidBody.rotation();
    mesh.position.set(posX, posY, posZ)
    quaternion.set(rotX, rotY, rotZ, rotW)
    mesh.rotation.setFromQuaternion(quaternion)
  }

  return {
    mesh,
    update
  }
}