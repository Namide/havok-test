import { PhysicWorld } from "../render/create3DBases";
import { Vector3 } from "./havok/HavokPhysics";
import { havokBash } from "./havok/havokWorkerClient";

export const createCollisionSphere = async ({
  physicWorld,
  position,
  size,
}: {
  physicWorld: PhysicWorld;
  position: Vector3;
  size: number;
}) => {
  console.log("--------------");
  const body = (await physicWorld.havok("HP_Body_Create", []))[1];
  const shape = (
    await physicWorld.havok("HP_Shape_CreateSphere", [[0, 0, 0], size])
  )[1];
  console.log(body, shape);
  havokBash(
    physicWorld.havok("HP_Body_SetShape", [body, shape]),
    physicWorld.havok("HP_Body_SetQTransform", [
      body,
      [position, [0, 0, 0, 1]],
    ]),
    physicWorld.havok("HP_Body_SetMassProperties", [
      body,
      [
        /* center of mass */ [0, 0, 0],
        /* Mass */ 1,
        /* Inertia for mass of 1*/ [0.001, 0.001, 0.001],
        /* Inertia Orientation */ [0, 0, 0, 1],
      ],
    ]),
    physicWorld.havok("HP_World_AddBody", [physicWorld.world, body, false]),
    physicWorld.havok("HP_Body_SetMotionType", [body, "MotionType.DYNAMIC"]),
  );

  const getTransform = async () => {
    const [position, quaternion] = (
      await physicWorld.havok("HP_Body_GetQTransform", [body])
    )[1];
    return { position, quaternion };
  };

  return {
    body,
    getTransform,
  };
};
