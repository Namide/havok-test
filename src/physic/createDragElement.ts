import * as THREE from "three";
import {
  HP_BodyId,
  HP_WorldId,
  QTransform,
  Quaternion,
  Vector3,
} from "./havok/HavokPhysics";
import { getHavok } from "./getHavok";
import { create3DBases } from "../render/create3DBases";
import { euler, quaternion } from "../constants";
import { DynamicTween, easeInOutExpo } from "twon";
import { MouseEvents } from "../events/createMouseEvents";

export const createDragElement = async ({
  world,
  mesh,
  mouseEvents,
  body,
  scene,
}: {
  world: HP_WorldId;
  mesh: THREE.Mesh;
  body: HP_BodyId;
  scene: THREE.Scene;
  mouseEvents: MouseEvents;
}) => {
  const havok = await getHavok();
  // let parent: HP_BodyId | undefined;
  let tween: DynamicTween<number> | undefined;

  let oldPosition: THREE.Vector3;
  let currentPosition: THREE.Vector3;
  let oldTime: number;

  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 4);

  // const finalRotation = quaternion
  //   .setFromEuler(euler.set(Math.PI / 2, 0, Math.PI / 2), true)
  //   .toArray() as Quaternion;
  const endRotation = quaternion
    .setFromEuler(euler.set(Math.PI / 2, 0, Math.PI / 2), true)
    .clone();

  mouseEvents.onDown(mesh, () => {
    const initPosition = mesh.position;
    const initRotation = mesh.quaternion;
    const endPosition = initPosition.clone();
    endPosition.y = 4;

    havok.HP_Body_SetMotionType(body, havok.MotionType.STATIC);

    tween = new DynamicTween(0 as number, {
      ease: easeInOutExpo,
      duration: 750,
    })
      .to(1)
      .on("update", (value: number) => {
        oldTime = Date.now();
        oldPosition = currentPosition?.clone();
        currentPosition = initPosition.lerpVectors(
          initPosition,
          endPosition,
          value,
        );
        const qTransform = [
          currentPosition.toArray(),
          initRotation
            .slerpQuaternions(initRotation, endRotation, value)
            .toArray(),
        ] as QTransform;

        havok.HP_Body_SetQTransform(body, qTransform);
      })
      .on("end", (value: number) => {
        console.log("end");
      });

    const onUpCallback = () => {
      mouseEvents.offUp(undefined, onUpCallback);

      if (tween) {
        tween.dispose();
        tween = undefined;
      }

      // const dt = 1000 / Date.now() - oldTime;
      // const linearVelocity = currentPosition
      //   .sub(oldPosition)
      //   .multiplyScalar(dt);
      // const angularVelocity = havok.HP_Body_GetAngularVelocity(body)[1];

      havok.HP_Body_SetMotionType(body, havok.MotionType.DYNAMIC);

      // havok.HP_Body_SetLinearVelocity(body, linearVelocity.toArray());

      // console.log(linearVelocity.toArray());

      // havok.HP_Body_SetAngularVelocity(
      //   body,
      //   angularVelocity.map((val) => val * 100) as Vector3,
      // );
    };

    mouseEvents.onUp(undefined, onUpCallback);
  });

  return {};
};
