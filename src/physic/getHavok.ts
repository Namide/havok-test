import HavokPhysics, {
  ActivationState,
  ConstraintAxis,
  ConstraintAxisLimitMode,
  type HavokPhysicsWithBindings,
  MotionType,
} from "./havok/HavokPhysics";

let havok: HavokPhysicsWithBindings & {
  HEAPU8: Uint8Array;
  MotionType: {
    STATIC: MotionType.STATIC;
    DYNAMIC: MotionType.DYNAMIC;
    KINEMATIC: MotionType.KINEMATIC;
  };
  ActivationState: {
    ACTIVE: ActivationState.ACTIVE;
    INACTIVE: ActivationState.INACTIVE;
  };
  ConstraintAxisLimitMode: {
    FREE: ConstraintAxisLimitMode.FREE;
    LIMITED: ConstraintAxisLimitMode.LIMITED;
    LOCKED: ConstraintAxisLimitMode.LOCKED;
  };
  ConstraintAxis: {
    LINEAR_X: ConstraintAxis.LINEAR_X;
    LINEAR_Y: ConstraintAxis.LINEAR_Y;
    LINEAR_Z: ConstraintAxis.LINEAR_Z;
    ANGULAR_X: ConstraintAxis.ANGULAR_X;
    ANGULAR_Y: ConstraintAxis.ANGULAR_Y;
    ANGULAR_Z: ConstraintAxis.ANGULAR_Z;
    LINEAR_DISTANCE: ConstraintAxis.LINEAR_DISTANCE;
  };
};

export async function getHavok() {
  if (!havok) {
    havok = await HavokPhysics();
  }
  return havok;
}
