// import WorkerURL from "./HavokPhysics?worker";
import { MotionType, type HavokPhysicsWithBindings } from "./HavokPhysics";

type Havok = HavokPhysicsWithBindings;

/*& {
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
}*/

type ValueOf<T> = T[keyof T];

export const havokBash = <T extends ReturnType<ValueOf<Havok>>>(
  ...list: Promise<T>[]
) => Promise.all(list);

export const getHavok = () => {
  const havokWorker = new Worker("/havok/HavokPhysics.js");
  const havok = async <Key extends keyof Havok>(
    name: Key,
    params: Parameters<Havok[Key]>,
  ): Promise<ReturnType<Havok[Key]>> => {
    // console.log("send to worker 1", name, params);
    return new Promise((resolve) => {
      console.log("send to worker 2");
      havokWorker.onmessage = (
        returnedData: MessageEvent<ReturnType<Havok[Key]>>,
      ) => {
        resolve(returnedData.data);
      };
      havokWorker.postMessage({ name, params });
    });
  };

  return {
    havok,
    dispose: () => havokWorker.terminate(),
  };
};
