export type Rapier = typeof import("@dimforge/rapier3d");

let RAPIER: Rapier;

export async function getRAPIER() {
  if (!RAPIER) {
    RAPIER = await import("@dimforge/rapier3d");
  }
  return RAPIER;
}
