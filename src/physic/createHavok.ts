import { getHavok } from "./getHavok";

// https://github.com/N8python/havokDemo
export async function createHavok() {
  const havok = await getHavok();
  const world = havok.HP_World_Create()[1];
  havok.HP_World_SetGravity(world, [0, -9.81, 0]);

  return {
    world,
    update: (delta: number) => {
      havok.HP_World_Step(world, delta);
    },
  };
}
