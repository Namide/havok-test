import * as THREE from "three";
import { euler, quaternion } from "../constants";
import { Rapier, getRAPIER } from "../physic/rapier";

export default async function createSphere({
  world,
  posX = 0,
  posY = 0,
  posZ = 0,
  size = 0.25,
  rotX = Math.random(),
  rotY = Math.random(),
  rotZ = Math.random(),
}: {
  world: InstanceType<Rapier["World"]>;
  posX?: number;
  posY?: number;
  posZ?: number;
  size?: number;
  sizeY?: number;
  sizeZ?: number;
  rotX?: number;
  rotY?: number;
  rotZ?: number;
}) {
  const RAPIER = await getRAPIER();

  // Rotation
  quaternion.setFromEuler(euler.set(rotX, rotY, rotZ), true);

  // Physic
  const cubeBodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(posX, posY, posZ)
    .setRotation({
      w: quaternion.w,
      x: quaternion.x,
      y: quaternion.y,
      z: quaternion.z,
    });
  const rigidBody = world.createRigidBody(cubeBodyDesc);
  const cubeColliderDesc = RAPIER.ColliderDesc.ball(size);
  world.createRigidBody(cubeBodyDesc);
  world.createCollider(cubeColliderDesc, rigidBody);

  // Render
  const material = new THREE.MeshNormalMaterial();
  const geometry = new THREE.SphereGeometry(size);
  const mesh = new THREE.Mesh(geometry, material);

  // Update
  const update = () => {
    const { x: posX, y: posY, z: posZ } = rigidBody.translation();
    const { x: rotX, y: rotY, z: rotZ, w: rotW } = rigidBody.rotation();
    mesh.position.set(posX, posY, posZ);
    quaternion.set(rotX, rotY, rotZ, rotW);
    mesh.rotation.setFromQuaternion(quaternion);
  };

  return {
    mesh,
    update,
  };
}
