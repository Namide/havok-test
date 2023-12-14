import { getRAPIER } from "../physic/rapier";

export async function createRapier() {
  const RAPIER = await getRAPIER();
  const gravity = { x: 0.0, y: -9.81, z: 0.0 };
  const world = new RAPIER.World(gravity);

  return {
    world,
    update: () => world.step(),
  };
}
