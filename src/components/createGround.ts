import * as THREE from "three";
import { HP_WorldId } from "../havok/HavokPhysics";
import { Rapier, getRAPIER } from "../physic/rapier";
import { getHavok } from "../physic/havok";

export default async function createGround({
  world,
}: { world: HP_WorldId /* InstanceType<Rapier["World"]> */ }) {

  const material = new THREE.MeshNormalMaterial();
  const geometry = new THREE.BoxGeometry(20.0, 0.2, 20.0);
  const mesh = new THREE.Mesh(geometry, material);


  // Rapier
  // const RAPIER = await getRAPIER();
  // const body = RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0);
  // world.createCollider(body);



  // Havok
  const havok = await getHavok()
  const body = havok.HP_Body_Create()[1];
  havok.HP_Body_SetShape(
      body,
      havok.HP_Shape_CreateBox(
          [0, 0, 0], [0, 0, 0, 1], [20.0, 0.2, 20.0]
      )[1]
  );
  havok.HP_Body_SetQTransform(
      body, [
          [0, 0, 0],
          [0, 0, 0, 1]
      ]
  )
  havok.HP_World_AddBody(world, body, false);
  havok.HP_Body_SetMotionType(body, havok.MotionType.STATIC);
  const offset = havok.HP_Body_GetWorldTransformOffset(body)[1]

  return {
    mesh,
    body,
  };
}
