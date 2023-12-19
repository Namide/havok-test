import { getHavok } from "./havok/havokWorkerClient";

// https://github.com/N8python/havokDemo
export async function createHavok() {
  const { havok } = getHavok();
  const world = (await havok("HP_World_Create", []))[1];
  await havok("HP_World_SetGravity", [world, [0, -9.81, 0]]);

  return {
    havok,
    world,
    updatePhysic: async (delta: number) => {
      await havok("HP_World_Step", [world, delta]);
    },
  };
}
