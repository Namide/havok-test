import * as THREE from 'three';
import { Rapier, getRAPIER } from "../physic/rapier";
import { euler, quaternion } from '../constants';
import type { create3DBases } from './create3DBases';

export default async function createCard ({
    world,
    posX = 0, posY = 0, posZ = 0,
    sizeX = 3/2, sizeY = 1, sizeZ = 0.05,
    rotX = Math.random(), rotY = Math.random(), rotZ = Math.random(),
    onDown,
    onUp
  }: {
    world: InstanceType<Rapier['World']>,
    posX?: number,
    posY?: number,
    posZ?: number,
    sizeX?: number,
    sizeY?: number,
    sizeZ?: number,
    rotX?: number,
    rotY?: number,
    rotZ?: number,
    onDown: Awaited<ReturnType<typeof create3DBases>>['onDown'],
    onUp: Awaited<ReturnType<typeof create3DBases>>['onUp'],
  }) {

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

  onDown(mesh, (target) => {
    console.log('down:', target)
  })
  
  onUp(undefined, () => {
    console.log('up:')
  })

  // Update
  const update = () => {

    // console.log(cubeBodyDesc.rotation)
    
    // cubeBodyDesc.translation.x = 0
    // cubeBodyDesc.translation.y = 0
    // cubeBodyDesc.translation.z = 0

    rigidBody.setAdditionalMass(1000, true)
    rigidBody.setTranslation({ x: 0, y: 2, z: 0 }, true)
    rigidBody.setRotation({ x: 0.75, y: 0, z: 0, w: 1 }, true)


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