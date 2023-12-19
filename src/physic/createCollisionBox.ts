import { PhysicWorld } from "../render/create3DBases";
import { Quaternion, Vector3 } from "./havok/HavokPhysics";
import { getHavok, havokBash } from "./havok/havokWorkerClient";

export const createCollisionBox = async ({
  physicWorld,
  position,
  rotation,
  size,
}: {
  physicWorld: PhysicWorld;
  position: Vector3;
  rotation: Quaternion;
  size: Vector3;
}) => {
  const { havok } = getHavok();
  const body = (await havok("HP_Body_Create", []))[1];
  const shape = (
    await havok("HP_Shape_CreateBox", [[0, 0, 0], [0, 0, 0, 1], size])
  )[1];

  havokBash(
    havok("HP_Body_SetShape", [body, shape]),
    havok("HP_Body_SetQTransform", [body, [position, rotation]]),
    havok("HP_Body_SetMassProperties", [
      body,
      [
        /* center of mass */ [0, 0, 0],
        /* Mass */ 1,
        /* Inertia for mass of 1*/ [0.001, 0.001, 0.001],
        /* Inertia Orientation */ [0, 0, 0, 1],
      ],
    ]),
    havok("HP_World_AddBody", [physicWorld.world, body, false]),
    havok("HP_Body_SetMotionType", [body, "MotionType.DYNAMIC"]),
  );

  const getTransform = async () => {
    const [position, quaternion] = (
      await havok("HP_Body_GetQTransform", [body])
    )[1];
    return { position, quaternion };
  };

  return {
    body,
    getTransform,
  };
};
