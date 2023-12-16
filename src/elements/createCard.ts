// import { DynamicTween, easeInOutCubic } from "twon";
import { euler, quaternion } from "../constants";
import { getHavok } from "../physic/getHavok";
import { HP_WorldId, Quaternion, Vector3 } from "../physic/havok/HavokPhysics";
import type { create3DBases } from "../render/create3DBases";
import * as THREE from "three";
import { getCheckerTexture } from "../render/textures";
import { createDragElement } from "../physic/createDragElement";

export default async function createCard({
  world,
  position,
  rotation,
  size,
  onDown,
  onUp,
  offUp,
  scene,
}: {
  world: HP_WorldId;
  position: Vector3;
  rotation: Quaternion;
  scene: THREE.Scene;
  size: Vector3;
  onDown: Awaited<ReturnType<typeof create3DBases>>["onDown"];
  onUp: Awaited<ReturnType<typeof create3DBases>>["onUp"];
  offUp: Awaited<ReturnType<typeof create3DBases>>["offUp"];
}) {
  // Havok
  const havok = await getHavok();
  const body = havok.HP_Body_Create()[1];
  havok.HP_Body_SetShape(
    body,
    havok.HP_Shape_CreateBox([0, 0, 0], [0, 0, 0, 1], size)[1],
  );
  havok.HP_Body_SetQTransform(body, [position, rotation]);
  havok.HP_Body_SetMassProperties(body, [
    /* center of mass */ [0, 0, 0],
    /* Mass */ 1,
    /* Inertia for mass of 1*/ [1, 1, 1],
    /* Inertia Orientation */ [0, 0, 0, 1],
  ]);
  havok.HP_Body_SetMotionType(body, havok.MotionType.DYNAMIC);
  havok.HP_World_AddBody(world, body, false);

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
    world,
    mesh,
    onDown,
    onUp,
    offUp,
    scene,
  });

  // Update
  const update = () => {
    const [position, rotation] = havok.HP_Body_GetQTransform(body)[1];
    mesh.position.set(...position);
    mesh.quaternion.set(...rotation);
  };

  return {
    mesh,
    update,
  };
}
