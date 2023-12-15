import { getHavok } from "./getHavok";
import { HP_WorldId, Quaternion, Vector3 } from "./havok/HavokPhysics";

export const createCollisionBox = async ({
  world,
  position,
  rotation,
  size,
}: {
  world: HP_WorldId;
  position: Vector3;
  rotation: Quaternion;
  size: Vector3;
}) => {
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
    /* Inertia for mass of 1*/ [0.001, 0.001, 0.001],
    /* Inertia Orientation */ [0, 0, 0, 1],
  ]);
  havok.HP_World_AddBody(world, body, false);
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
