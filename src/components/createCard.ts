import * as THREE from "three";
import { Tween } from "twon";
import { euler, quaternion } from "../constants";
import { HP_WorldId } from "../havok/HavokPhysics";
// import { Rapier, getRAPIER } from "../physic/rapier";
import type { create3DBases } from "./create3DBases";
import { getHavok } from "../physic/havok";

export default async function createCard({
  world,
  posX = 0,
  posY = 0,
  posZ = 0,
  sizeX = 3 / 2,
  sizeY = 1,
  sizeZ = 0.05,
  rotX = Math.random(),
  rotY = Math.random(),
  rotZ = Math.random(),
  onDown,
  onUp,
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
  onDown: Awaited<ReturnType<typeof create3DBases>>["onDown"];
  onUp: Awaited<ReturnType<typeof create3DBases>>["onUp"];
}) {

  // Rotation
  quaternion.setFromEuler(euler.set(rotX, rotY, rotZ), true);

  // // Rapier
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
    /* Mass */ 0.1,
    /* Inertia for mass of 1*/ [0.001, 0.001, 0.001],
    /* Inertia Orientation */ [0, 0, 0, 1],
  ]);
  havok.HP_World_AddBody(world, body, false);
  havok.HP_Body_SetMotionType(body, havok.MotionType.DYNAMIC);
  const offset = havok.HP_Body_GetWorldTransformOffset(body)[1];



  // Render
  const material = new THREE.MeshNormalMaterial();
  const geometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.matrixAutoUpdate = false



  onDown(mesh, (target) => {
    console.log("down:", target);
  });

  onUp(undefined, () => {
    console.log("up:");
  });

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


    // rigidBody.setAdditionalMass(1000, true);
    // rigidBody.setTranslation({ x: 0, y: 2, z: 0 }, true);
    // rigidBody.setRotation({ x: 0.75, y: 0, z: 0, w: 1 }, true);

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
