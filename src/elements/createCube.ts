import * as THREE from "three";
import { SHADOW } from "../config";
import { MouseEmitter } from "../events/createMouseEmitter";
import { createCollisionBox } from "../physic/createCollisionBox";
import { createDragElement } from "../physic/createDragElement";
import { Quaternion, Vector3 } from "../physic/havok/HavokPhysics";
import { PhysicWorld, RenderWorld } from "../render/create3DBases";
import { getCheckerTexture } from "../render/textures";

export default async function createCube({
  physicWorld,
  renderWorld,
  position,
  rotation,
  size,
  mouseEmitter,
}: {
  physicWorld: PhysicWorld;
  renderWorld: RenderWorld;
  position: Vector3;
  rotation: Quaternion;
  size: Vector3;
  mouseEmitter: MouseEmitter;
}) {
  const { getTransform, body } = await createCollisionBox({
    physicWorld,
    position,
    rotation,
    size,
  });

  // Render
  const map = await getCheckerTexture();
  const material = new THREE.MeshLambertMaterial({
    map,
  });
  const geometry = new THREE.BoxGeometry(...size);
  const mesh = new THREE.Mesh(geometry, material);
  if (SHADOW) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }

  // Drag and drop
  await createDragElement({
    body,
    physicWorld,
    mesh,
    mouseEmitter,
    renderWorld,
    autoRotate: false,
  });

  // Update
  const update = () => {
    const { position, quaternion } = getTransform();
    mesh.position.set(...position);
    mesh.quaternion.set(...quaternion);
  };

  return {
    mesh,
    update,
  };
}
