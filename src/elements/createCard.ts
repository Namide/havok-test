import * as THREE from "three";
import { DynamicTween, easeInOutCubic } from "twon";
import { euler, matrix4, quaternion } from "../constants";
import { getHavok } from "../physic/getHavok";
import {
  ActivationState,
  HP_WorldId,
  MotionType,
  Quaternion,
  Vector3,
} from "../physic/havok/HavokPhysics";
// import { Rapier, getRAPIER } from "../physic/rapier";
import type { create3DBases } from "../render/create3DBases";

export default async function createCard({
  world,
  posX = 0,
  posY = 0,
  posZ = 0,
  sizeX = 3 / 2,
  sizeY = 1,
  sizeZ = 0.01,
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
    /* Mass */ 1,
    /* Inertia for mass of 1*/ [1, 1, 1],
    /* Inertia Orientation */ [0, 0, 0, 1],
  ]);
  havok.HP_Body_SetMotionType(body, havok.MotionType.DYNAMIC);
  havok.HP_World_AddBody(world, body, false);
  // const offset = havok.HP_Body_GetWorldTransformOffset(body)[1];

  // Render
  const material = new THREE.MeshNormalMaterial();
  const geometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
  const mesh = new THREE.Mesh(geometry, material);
  // mesh.matrixAutoUpdate = false

  // constraint
  // https://github.com/BabylonJS/Babylon.js/blob/7ed1a73bc34a136e77dcaf8b34fb0578cc25bc4b/packages/dev/core/src/Physics/v2/Plugins/havokPlugin.ts#L1395
  const parent = havok.HP_Body_Create()[1];
  havok.HP_Body_SetMotionType(parent, havok.MotionType.STATIC);
  havok.HP_World_AddBody(world, parent, false);
  havok.HP_Body_SetShape(
    parent,
    havok.HP_Shape_CreateBox([0, 0, 0], [0, 0, 0, 1], [1, 1, 1])[1],
  );
  havok.HP_Body_SetQTransform(parent, [
    [posX, posY, posZ],
    [0, 0, 0, 1],
  ]);
  const constraint = havok.HP_Constraint_Create()[1];
  havok.HP_Constraint_SetCollisionsEnabled(constraint, 0);
  havok.HP_Constraint_SetParentBody(constraint, parent);
  havok.HP_Constraint_SetChildBody(constraint, body);
  havok.HP_Constraint_SetAnchorInChild(
    constraint,
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
  );
  havok.HP_Constraint_SetAxisMode(
    constraint,
    havok.ConstraintAxis.LINEAR_DISTANCE,
    havok.ConstraintAxisLimitMode.LIMITED,
  );
  havok.HP_Constraint_SetAxisMinLimit(
    constraint,
    havok.ConstraintAxis.LINEAR_DISTANCE,
    0.25,
  );
  havok.HP_Constraint_SetAxisMaxLimit(
    constraint,
    havok.ConstraintAxis.LINEAR_DISTANCE,
    0.25,
  );

  // let isDragging = false
  // let dynamicTween: DynamicTween<number[]> | undefined
  // let flatQTransform: number[] | undefined
  onDown(mesh, (target) => {
    // console.log("down:", target);
    // isDragging = true
    // havok.HP_Body_SetTargetQTransform(body, [
    //   /* translation */ [0, 4, 0],
    //   /* rotation */ [0, 0, 0, 1]
    // ])
    // havok.HP_Body_SetQTransform (body, [
    //   /* translation */ [0, 4, 0],
    //   /* rotation */ [0, 0, 0, 1]
    // ])
    // matrix4.identity()
    // matrix4.setPosition(new THREE.Vector3(0, 4, 0))
    // havok.HP_Body_SetMotionType(body, havok.MotionType.STATIC)
    // const qTransform = havok.HP_Body_GetQTransform(body)[1]
    // const qTransformTarget = [
    //   /* translation */ [ 0, 4, 0 ],
    //   /* rotation */ [0, 0, 0, 1]
    // ];
    // flatQTransform = [...qTransform[0], ...qTransform[1]]
    // const constraint = havok.HP_Constraint_Create()[1]
    // havok.HP_Body_SetQTransform(constraint, qTransform)
    // havok.HP_Constraint_SetChildBody(constraint, body)
    // // const flatTransform = [...qTransform[0], ...qTransform[1]]
    // dynamicTween = new DynamicTween(
    //   flatQTransform,
    //   { duration: 3000, ease: easeInOutCubic }
    // )
    //   .on('update', (transform: number[]) => {
    //     // flatQTransform = transform
    //     havok.HP_Body_SetQTransform (
    //       constraint, [
    //         /* translation */ transform.filter((_, index) => index < 3) as Vector3,
    //         /* rotation */ transform.filter((_, index) => index > 2) as Quaternion
    //       ]
    //     )
    //     console.log(transform)
    //     // console.log(transform)
    //   })
    //   .on('end', () => {
    //   })
    //   .to([...qTransformTarget[0], ...qTransformTarget[1]])
  });

  onUp(undefined, () => {
    // console.log('end')
    // isDragging = false
    // dynamicTween?.dispose()
    // flatQTransform = undefined
    // dynamicTween = undefined
    // havok.HP_Body_SetMotionType(body, havok.MotionType.DYNAMIC)
    // console.log("up:");
  });

  // Update
  const arc = Math.random() * 2 * Math.PI;
  const dist = Math.random() * 5;
  const update = () => {
    // if(isDragging && flatQTransform) {
    //   // console.log(flatQTransform)

    // }

    const [position, rotation] = havok.HP_Body_GetQTransform(body)[1];
    mesh.position.set(...position);
    mesh.quaternion.set(...rotation);

    havok.HP_Body_SetQTransform(parent, [
      [
        Math.cos(arc + Date.now() / 1000) * dist,
        posY,
        Math.sin(arc + Date.now() / 1000) * dist,
      ],
      [0, 0, 0, 1],
    ]);

    // const bodyBuffer = havok.HP_World_GetBodyBuffer(world)[1];
    // const transformBuffer = new Float32Array(
    //   havok.HEAPU8.buffer /* havok.HEAPU8.buffer */,
    //   bodyBuffer + offset,
    //   16,
    // );

    // mesh.matrix.fromArray(transformBuffer);
    // for (let mi = 0; mi < 15; mi++) {
    //   if ((mi & 3) !== 3) {
    //     mesh.matrix.elements[mi] = transformBuffer[mi];
    //   }
    // }
    // mesh.matrix.elements[15] = 1.0;

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
