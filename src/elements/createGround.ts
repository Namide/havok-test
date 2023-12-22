import * as THREE from "three";
import { getHavok } from "../physic/getHavok";
import { Quaternion, Vector3 } from "../physic/havok/HavokPhysics";
import { PhysicWorld } from "../render/create3DBases";
import { getCheckerTexture } from "../render/textures";

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
  const havok = await getHavok();
  const body = havok.HP_Body_Create()[1];
  havok.HP_Body_SetShape(
    body,
    havok.HP_Shape_CreateBox([0, 0, 0], rotation, size)[1],
  );
  havok.HP_Body_SetQTransform(body, [position, rotation]);
  havok.HP_World_AddBody(physicWorld.world, body, false);
  havok.HP_Body_SetMotionType(body, havok.MotionType.STATIC);

  return {
    mesh,
    body,
  };
}
