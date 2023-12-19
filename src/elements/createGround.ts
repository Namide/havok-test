import * as THREE from "three";
import { Quaternion, Vector3 } from "../physic/havok/HavokPhysics";
import { PhysicWorld } from "../render/create3DBases";
import { getCheckerTexture } from "../render/textures";
import { havokBash } from "../physic/havok/havokWorkerClient";

export default async function createGround({
  physicWorld,
  position,
  rotation,
  size,
}: {
  physicWorld: PhysicWorld;
  position: Vector3;
  rotation: Quaternion;
  size: Vector3;
}) {
  const map = await getCheckerTexture();
  const material = new THREE.MeshBasicMaterial({
    map,
  });
  const geometry = new THREE.BoxGeometry(...size);
  const mesh = new THREE.Mesh(geometry, material);

  // Havok
  const body = (await physicWorld.havok("HP_Body_Create", []))[1];
  const shape = (
    await physicWorld.havok("HP_Shape_CreateBox", [[0, 0, 0], rotation, size])
  )[1];

  havokBash(
    physicWorld.havok("HP_Body_SetShape", [body, shape]),
    physicWorld.havok("HP_Body_SetQTransform", [body, [position, rotation]]),
    physicWorld.havok("HP_World_AddBody", [physicWorld.world, body, false]),
    physicWorld.havok("HP_Body_SetMotionType", [body, "MotionType.STATIC"]),
  );

  return {
    mesh,
    body,
  };
}
