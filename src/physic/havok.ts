import HavokPhysics, { MotionType, type HavokPhysicsWithBindings } from "../havok/HavokPhysics";

let havok: HavokPhysicsWithBindings & {
  HEAPU8: Uint8Array;
  MotionType: { STATIC: MotionType.STATIC, DYNAMIC: MotionType.DYNAMIC, KINEMATIC: MotionType.KINEMATIC }
}

export async function getHavok() {
  if (!havok) {
    havok = await HavokPhysics();
  }
  return havok;
}
