import { getHavok } from "../physic/getHavok";
import { HP_WorldId, Quaternion, Vector3 } from "../physic/havok/HavokPhysics";
import * as THREE from "three";
import { getCheckerTexture } from "../render/textures";

export default async function createGround({
  world,
  position,
  rotation,
  size,
}: {
  world: HP_WorldId;
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
  havok.HP_World_AddBody(world, body, false);
  havok.HP_Body_SetMotionType(body, havok.MotionType.STATIC);

  return {
    mesh,
    body,
  };
}
