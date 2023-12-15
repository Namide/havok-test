import * as THREE from "three";
import { euler, quaternion } from "../constants";
// import { MotionType } from "havok/HavokPhysics";
// import { Rapier, getRAPIER } from "physic/rapier";
import { getHavok } from "../physic/getHavok";
import { HP_WorldId } from "../physic/havok/HavokPhysics";

export default async function createCube({
  world,
  posX = 0,
  posY = 0,
  posZ = 0,
  sizeX = Math.random() / 4 + 0.05,
  sizeY = Math.random() / 4 + 0.05,
  sizeZ = Math.random() / 4 + 0.05,
  rotX = Math.random(),
  rotY = Math.random(),
  rotZ = Math.random(),
}: {
  world: HP_WorldId; // InstanceType<Rapier["World"]>;
  posX?: number;
  posY?: number;
  posZ?: number;
  sizeX?: number;
  sizeY?: number;
  sizeZ?: number;
  rotX?: number;
  rotY?: number;
  rotZ?: number;
}) {
  // Rotation
  quaternion.setFromEuler(euler.set(rotX, rotY, rotZ), true);

  // Physic
  // const RAPIER = await getRAPIER();
  // const cubeBodyDesc = RAPIER.RigidBodyDesc.dynamic()
  //   .setTranslation(posX, posY, posZ)
  //   .setRotation({
  //     w: quaternion.w,
  //     x: quaternion.x,
  //     y: quaternion.y,
  //     z: quaternion.z,
  //   });
  // const rigidBody = world.createRigidBody(cubeBodyDesc);
  // const cubeColliderDesc = RAPIER.ColliderDesc.cuboid(
  //   sizeX / 2,
  //   sizeY / 2,
  //   sizeZ / 2,
  // );
  // world.createRigidBody(cubeBodyDesc);
  // world.createCollider(cubeColliderDesc, rigidBody);

  // Havok
  const havok = await getHavok();
  const body = havok.HP_Body_Create()[1];
  havok.HP_Body_SetShape(
    body,
    havok.HP_Shape_CreateBox([0, 0, 0], [0, 0, 0, 1], [sizeX, sizeY, sizeZ])[1],
  );
  havok.HP_Body_SetQTransform(body, [
    [posX, posY, posZ],
    [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
  ]);
  havok.HP_Body_SetMassProperties(body, [
    /* center of mass */ [0, 0, 0],
    /* Mass */ 1,
    /* Inertia for mass of 1*/ [0.001, 0.001, 0.001],
    /* Inertia Orientation */ [0, 0, 0, 1],
  ]);
  havok.HP_World_AddBody(world, body, false);
  havok.HP_Body_SetMotionType(body, havok.MotionType.DYNAMIC);

  // Render
  const material = new THREE.MeshNormalMaterial();
  const geometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
  const mesh = new THREE.Mesh(geometry, material);

  // Update
  const update = () => {
    const [position, rotation] = havok.HP_Body_GetQTransform(body)[1];
    mesh.position.set(...position);
    mesh.quaternion.set(...rotation);

    // mesh.rotation.setFromRotationMatrix(mesh.matrix);
    // mesh.position.setFromMatrixPosition(mesh.matrix);
    // mesh.scale.setFromMatrixScale(mesh.matrix);

    /* Rapier
    const { x: posX, y: posY, z: posZ } = rigidBody.translation();
    const { x: rotX, y: rotY, z: rotZ, w: rotW } = rigidBody.rotation();
    mesh.position.set(posX, posY, posZ);
    quaternion.set(rotX, rotY, rotZ, rotW);
    mesh.rotation.setFromQuaternion(quaternion);
    */
  };

  return {
    mesh,
    update,
  };
}