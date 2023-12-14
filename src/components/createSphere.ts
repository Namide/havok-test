import * as THREE from "three";
import { euler, quaternion } from "../constants";
import { getHavok } from "../physic/havok";
import { HP_WorldId } from "../havok/HavokPhysics";
// import { Rapier, getRAPIER } from "../physic/rapier";

export default async function createSphere({
  world,
  posX = 0,
  posY = 0,
  posZ = 0,
  size = Math.random() / 4 + 0.1,
  rotX = Math.random(),
  rotY = Math.random(),
  rotZ = Math.random(),
}: {
  world: HP_WorldId; // InstanceType<Rapier["World"]>;
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

  // Rotation
  quaternion.setFromEuler(euler.set(rotX, rotY, rotZ), true);

  // Rapier
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
  // const cubeColliderDesc = RAPIER.ColliderDesc.ball(size);
  // world.createRigidBody(cubeBodyDesc);
  // world.createCollider(cubeColliderDesc, rigidBody);

  // Havok
  const havok = await getHavok();
  const body = havok.HP_Body_Create()[1];
  havok.HP_Body_SetShape(
    body,
    havok.HP_Shape_CreateSphere([0, 0, 0], size)[1],
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
  const offset = havok.HP_Body_GetWorldTransformOffset(body)[1];


  // Render
  const material = new THREE.MeshNormalMaterial();
  const geometry = new THREE.SphereGeometry(size);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.matrixAutoUpdate = false

  
  // Update
  const update = () => {
    const bodyBuffer = havok.HP_World_GetBodyBuffer(world)[1];
    const transformBuffer = new Float32Array(
      havok.HEAPU8.buffer /* havok.HEAPU8.buffer */,
      bodyBuffer + offset,
      16,
    );

    // mesh.matrix.fromArray(transformBuffer);
    for (let mi = 0; mi < 15; mi++) {
      if ((mi & 3) !== 3) {
        mesh.matrix.elements[mi] = transformBuffer[mi];
      }
    }
    mesh.matrix.elements[15] = 1.0;


    // mesh.rotation.setFromRotationMatrix(mesh.matrix);
    // mesh.position.setFromMatrixPosition(mesh.matrix);
    // mesh.scale.setFromMatrixScale(mesh.matrix);

  
    // // Update Rapier
    // const { x: posX, y: posY, z: posZ } = rigidBody.translation();
    // const { x: rotX, y: rotY, z: rotZ, w: rotW } = rigidBody.rotation();
    // mesh.position.set(posX, posY, posZ);
    // quaternion.set(rotX, rotY, rotZ, rotW);
    // mesh.rotation.setFromQuaternion(quaternion);
  };

  return {
    mesh,
    update,
  };
}
