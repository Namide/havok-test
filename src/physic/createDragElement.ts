import * as THREE from "three";
import { DynamicTween, easeInOutExpo } from "twon";
import { euler, quaternion } from "../constants";
import { MouseEvents, MousePosition } from "../events/createMouseEvents";
import { PhysicWorld, RenderWorld } from "../render/create3DBases";
import { getHavok } from "./getHavok";
import { HP_BodyId, QTransform, Vector3 } from "./havok/HavokPhysics";

export const createDragElement = async ({
  renderWorld,
  mesh,
  mouseEvents,
  body,
}: {
  physicWorld: PhysicWorld;
  renderWorld: RenderWorld;
  mesh: THREE.Mesh;
  body: HP_BodyId;
  mouseEvents: MouseEvents;
}) => {
  const havok = await getHavok();
  // let parent: HP_BodyId | undefined;
  let tween: DynamicTween<number> | undefined;

  const DISTANCE = 0;

  const transform = {
    oldTime: 0,
    currentTime: 0,
    oldPosition: mesh.position.clone(),
    currentPosition: mesh.position,
    oldAngle: mesh.quaternion.clone(),
    currentAngle: mesh.quaternion,
  };

  // let oldPosition: THREE.Vector3;
  // let currentPosition: THREE.Vector3;
  // let oldTime: number;
  let endPosition: THREE.Vector3;
  let updatePositionRAF: number;

  // const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 4);

  // const finalRotation = quaternion
  //   .setFromEuler(euler.set(Math.PI / 2, 0, Math.PI / 2), true)
  //   .toArray() as Quaternion;

  // const endRotation = quaternion
  //   .setFromEuler(euler.set(Math.PI / 2, 0, Math.PI / 2), true)
  //   .clone();

  // const endRotation = quaternion
  //   .setFromEuler(
  //     euler.setFromVector3(
  //       renderWorld.camera
  //         .getWorldDirection(vector3)
  //         .applyEuler(euler.set(Math.PI / 2, 0, Math.PI / 2)),

  //       // vector3
  //       //   .set(0, 0, 0)
  //       //   .applyEuler(
  //       //     euler.setFromVector3(renderWorld.camera.getWorldDirection(vector3)),
  //       //   ),
  //     ),
  //     true,
  //   )
  //   .clone();

  const endRotation = quaternion.copy(renderWorld.camera.quaternion).clone();

  const onMoveCallback = (mousePosition: MousePosition) => {
    endPosition = screenPointTo3DPoint({
      mousePosition,
      camera: renderWorld.camera,
      distance: DISTANCE,
    });
  };

  const applyVelocity = () => {
    const dt = (Date.now() - transform.oldTime) / 1000;
    console.log(
      "Why 0?",
      dt,
      transform.currentPosition.toArray(),
      transform.oldPosition.toArray(),
    );
    const linearVelocity = transform.currentPosition
      .subVectors(transform.currentPosition, transform.oldPosition)
      .multiplyScalar(dt);
    // const angularVelocity = transform.currentAngle
    //   .sub(transform.oldAngle)
    //   .multiplyScalar(dt);
    // const angularVelocity = havok.HP_Body_GetAngularVelocity(body)[1];
    havok.HP_Body_SetMotionType(body, havok.MotionType.DYNAMIC);

    havok.HP_Body_SetLinearVelocity(
      body,
      // [0, 0, 0],
      linearVelocity.toArray(),
    );

    const angularVelocity = transform.currentAngle.multiply(
      transform.oldAngle.invert(),
    );
    angularVelocity.x *= dt * 5;
    angularVelocity.y *= dt * 5;
    angularVelocity.z *= dt * 5;
    angularVelocity.w *= dt * 5;

    console.log(
      "vel:",
      linearVelocity.toArray(),
      "ang:",
      euler.setFromQuaternion(angularVelocity).toArray(),
    );
    // .multiplyScalar(dt);
    havok.HP_Body_SetAngularVelocity(
      body,
      euler.setFromQuaternion(angularVelocity).toArray().slice(0, 3) as [
        number,
        number,
        number,
      ] as Vector3,
    );

    // console.log(linearVelocity.toArray());

    // havok.HP_Body_SetAngularVelocity(
    //   body,
    //   angularVelocity.map((val) => val * 100) as Vector3,
    // );
  };

  const onUpCallback = () => {
    mouseEvents.offUp(undefined, onUpCallback);
    mouseEvents.offMove(undefined, onMoveCallback);
    cancelAnimationFrame(updatePositionRAF);

    if (tween) {
      tween.dispose();
      tween = undefined;
    }

    applyVelocity();
  };

  const onUpdatePosition = () => {
    cancelAnimationFrame(updatePositionRAF);
    console.log("update");
    refreshPosition();
    updatePositionRAF = requestAnimationFrame(onUpdatePosition);
  };

  const refreshPosition = (
    position: THREE.Vector3 = endPosition,
    rotation: THREE.Quaternion = endRotation,
  ) => {
    const currentTime = Date.now();
    if (currentTime - transform.oldTime > 250) {
      transform.oldTime = transform.currentTime;
      transform.currentTime = Date.now();
      transform.oldPosition.copy(transform.currentPosition);
      transform.oldAngle.copy(transform.currentAngle);
      transform.currentPosition = position;
      transform.currentAngle = rotation;
    }
    const qTransform = [position.toArray(), rotation.toArray()] as QTransform;
    console.log(
      "refresh",
      transform.currentPosition.toArray(),
      transform.oldPosition.toArray(),
    );
    havok.HP_Body_SetQTransform(body, qTransform);
  };

  mouseEvents.onDown(mesh, () => {
    const initPosition = mesh.position;
    const initRotation = mesh.quaternion;
    endPosition = screenPointTo3DPoint({
      mousePosition: mouseEvents.position,
      camera: renderWorld.camera,
      distance: DISTANCE,
    });

    havok.HP_Body_SetMotionType(body, havok.MotionType.STATIC);

    mouseEvents.onMove(undefined, onMoveCallback);
    mouseEvents.onUp(undefined, onUpCallback);

    tween = new DynamicTween(0 as number, {
      ease: easeInOutExpo,
      duration: 750,
    })
      .to(1)
      .on("update", (value: number) => {
        if (tween) {
          console.log(
            "tween",
            initPosition
              .lerpVectors(initPosition, endPosition, value)
              .toArray(),
          );
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
