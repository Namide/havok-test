import * as THREE from "three";
import { DynamicTween, easeInOutExpo } from "twon";
import { euler, quaternion, vector3 } from "../constants";
import { MouseEmitter, MousePosition } from "../events/createMouseEmitter";
import { PhysicWorld, RenderWorld } from "../render/create3DBases";
import { getHavok } from "./getHavok";
import {
  HP_BodyId,
  QTransform,
  Quaternion,
  Vector3,
} from "./havok/HavokPhysics";

export const createDragElement = async ({
  renderWorld,
  mesh,
  mouseEmitter,
  body,
  autoRotate = true,
}: {
  physicWorld: PhysicWorld;
  renderWorld: RenderWorld;
  mesh: THREE.Mesh;
  body: HP_BodyId;
  mouseEmitter: MouseEmitter;
  autoRotate?: boolean;
}) => {
  const havok = await getHavok();

  let tween: DynamicTween<number> | undefined;

  const DISTANCE = 0.5;
  const VELOCITY_DURATION = 250;

  let transformHistory = [
    {
      time: Date.now(),
      position: mesh.position.toArray() as Vector3,
      rotation: quaternion.setFromEuler(mesh.rotation).toArray() as Quaternion,
    },
  ];

  let endPosition: THREE.Vector3;
  let updatePositionRAF: number;
  const endRotation = autoRotate
    ? quaternion.copy(renderWorld.camera.quaternion).clone()
    : new THREE.Quaternion();

  const onMoveCallback = (mousePosition: MousePosition) => {
    endPosition = screenPointTo3DPoint({
      mousePosition,
      camera: renderWorld.camera,
      distance: DISTANCE,
    });
  };

  const applyVelocity = () => {
    const newTransform = transformHistory.pop();
    const oldTransform = transformHistory.shift();
    if (newTransform && oldTransform) {
      const dt = ((newTransform.time - oldTransform.time) * 10) / 1000;

      const linearVelocity = vector3
        .set(...newTransform.position)
        .clone()
        .sub(vector3.set(...oldTransform.position))
        .multiplyScalar(dt);

      havok.HP_Body_SetMotionType(body, havok.MotionType.DYNAMIC);

      havok.HP_Body_SetLinearVelocity(body, linearVelocity.toArray());

      const angularVelocity = quaternion
        .set(...newTransform.rotation)
        .clone()
        .multiply(quaternion.set(...oldTransform.rotation).invert());
      angularVelocity.x *= dt;
      angularVelocity.y *= dt;
      angularVelocity.z *= dt;
      angularVelocity.w *= dt;

      havok.HP_Body_SetAngularVelocity(
        body,
        euler.setFromQuaternion(angularVelocity).toArray().slice(0, 3) as [
          number,
          number,
          number,
        ] as Vector3,
      );
    }
    transformHistory = [];
  };

  const onUpCallback = () => {
    mouseEmitter.up.off(undefined, onUpCallback);
    mouseEmitter.move.off(undefined, onMoveCallback);
    cancelAnimationFrame(updatePositionRAF);

    if (tween) {
      tween.dispose();
      tween = undefined;
    }

    applyVelocity();
  };

  const onUpdatePosition = () => {
    cancelAnimationFrame(updatePositionRAF);
    refreshPosition();
    updatePositionRAF = requestAnimationFrame(onUpdatePosition);
  };

  const refreshPosition = (
    position: THREE.Vector3 = endPosition,
    rotation: THREE.Quaternion = endRotation,
  ) => {
    // const currentTime = Date.now();

    const time = Date.now();
    transformHistory.push({
      time: Date.now(),
      position: position.toArray(),
      rotation: rotation.toArray() as Quaternion,
    });

    // Reduce memory
    if (transformHistory[0].time < time - VELOCITY_DURATION) {
      transformHistory.shift();
    }

    const qTransform = [position.toArray(), rotation.toArray()] as QTransform;
    havok.HP_Body_SetQTransform(body, qTransform);
  };

  mouseEmitter.down.on(mesh, () => {
    const initPosition = mesh.position;
    const initRotation = mesh.quaternion;

    endPosition = screenPointTo3DPoint({
      mousePosition: mouseEmitter.position,
      camera: renderWorld.camera,
      distance: DISTANCE,
    });

    if (!autoRotate) {
      endRotation.setFromEuler(mesh.rotation);
    }

    havok.HP_Body_SetMotionType(body, havok.MotionType.STATIC);

    mouseEmitter.move.on(undefined, onMoveCallback);
    mouseEmitter.up.on(undefined, onUpCallback);

    tween = new DynamicTween(0 as number, {
      ease: easeInOutExpo,
      duration: 750,
    })
      .to(1)
      .on("update", (value: number) => {
        if (tween) {
          refreshPosition(
            initPosition.lerpVectors(initPosition, endPosition, value),
            initRotation.slerpQuaternions(initRotation, endRotation, value),
          );
        }
      })
      .on("end", () => {
        // Fix end event always called
        if (tween) {
          onUpdatePosition();
        }
      });
  });

  return {};
};

function screenPointTo3DPoint({
  mousePosition,
  camera,
  distance = 0,
}: {
  mousePosition: MousePosition;
  camera: THREE.Camera;
  distance?: number;
}) {
  const worldPoint = new THREE.Vector3(
    mousePosition.x,
    mousePosition.y,
    distance,
  );
  worldPoint.unproject(camera);
  return worldPoint;
}
