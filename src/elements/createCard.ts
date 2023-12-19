import * as THREE from "three";
import { MouseEvents } from "../events/createMouseEvents";
import { createDragElement } from "../physic/createDragElement";
import { Quaternion, Vector3 } from "../physic/havok/HavokPhysics";
import { PhysicWorld, RenderWorld } from "../render/create3DBases";
import { getCheckerTexture } from "../render/textures";

export default async function createCard({
  physicWorld,
  position,
  rotation,
  size,
  mouseEvents,
  renderWorld,
}: {
  physicWorld: PhysicWorld;
  renderWorld: RenderWorld;
  position: Vector3;
  rotation: Quaternion;
  size: Vector3;
  mouseEvents: MouseEvents;
}) {
  // Havok
  const body = (await physicWorld.havok("HP_Body_Create", []))[1];
  const box = (
    await physicWorld.havok("HP_Shape_CreateBox", [
      [0, 0, 0],
      [0, 0, 0, 1],
      size,
    ])
  )[1];

  await physicWorld.havok("HP_Body_SetShape", [body, box]);
  await physicWorld.havok("HP_Body_SetQTransform", [
    body,
    [position, rotation],
  ]);
  await physicWorld.havok("HP_Body_SetMassProperties", [
    body,
    [
      /* center of mass */ [0, 0, 0],
      /* Mass */ 1,
      /* Inertia for mass of 1*/ [1, 1, 1],
      /* Inertia Orientation */ [0, 0, 0, 1],
    ],
  ]);
  await physicWorld.havok("HP_Body_SetMotionType", [
    body,
    "MotionType.DYNAMIC",
  ]);
  await physicWorld.havok("HP_World_AddBody", [physicWorld.world, body, false]);

  // Render
  const map = await getCheckerTexture();
  const material = new THREE.MeshBasicMaterial({
    map,
  });
  const geometry = new THREE.BoxGeometry(...size);
  const mesh = new THREE.Mesh(geometry, material);

  // Drag and drop
  await createDragElement({
    body,
    physicWorld,
    mesh,
    mouseEvents,
    renderWorld,
  });

  // Update
  const updatePhysic = async () => {
    const [position, rotation] = (
      await physicWorld.havok("HP_Body_GetQTransform", [body])
    )[1];
    mesh.position.set(...position);
    mesh.quaternion.set(...rotation);
  };

  return {
    mesh,
    updatePhysic,
  };
}
