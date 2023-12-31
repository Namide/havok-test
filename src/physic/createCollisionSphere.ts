import { PhysicWorld } from "../render/create3DBases";
import { getHavok } from "./getHavok";
import { Vector3 } from "./havok/HavokPhysics";

export const createCollisionSphere = async ({
  physicWorld,
  position,
  size,
}: {
  physicWorld: PhysicWorld;
  position: Vector3;
  size: number;
}) => {
  const havok = await getHavok();
  const body = havok.HP_Body_Create()[1];
  havok.HP_Body_SetShape(body, havok.HP_Shape_CreateSphere([0, 0, 0], size)[1]);
  havok.HP_Body_SetQTransform(body, [position, [0, 0, 0, 1]]);
  havok.HP_Body_SetMassProperties(body, [
    /* center of mass */ [0, 0, 0],
    /* Mass */ 1,
    /* Inertia for mass of 1*/ [0.001, 0.001, 0.001],
    /* Inertia Orientation */ [0, 0, 0, 1],
  ]);
  havok.HP_World_AddBody(physicWorld.world, body, false);
  havok.HP_Body_SetMotionType(body, havok.MotionType.DYNAMIC);

  const getTransform = () => {
    const [position, quaternion] = havok.HP_Body_GetQTransform(body)[1];
    return { position, quaternion };
  };

  return {
    body,
    getTransform,
  };
};
