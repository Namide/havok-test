import { euler, quaternion } from "../constants";
import { getHavok } from "./getHavok";
import { HP_WorldId } from "./havok/HavokPhysics";

export const createCollisionBox = async ({
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
  }) => {

  // Rotation
  quaternion.setFromEuler(euler.set(rotX, rotY, rotZ), true);


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

  const getTransform = () => {
    const [position, quaternion] = havok.HP_Body_GetQTransform(body)[1];
    return { position, quaternion }
  };

  return {
    body,
    getTransform
  }
}