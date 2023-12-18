import { HP_WorldId, Quaternion, Vector3 } from "../physic/havok/HavokPhysics";
import { createCollisionBox } from "../physic/createCollisionBox";
import * as THREE from "three";
import { getCheckerTexture } from "../render/textures";
import { PhysicWorld } from "../render/create3DBases";

export default async function createCube({
  physicWorld,
  position,
  rotation,
  size,
}: {
  physicWorld: PhysicWorld;
  position: Vector3;
  rotation: Quaternion;
  size: Vector3;
}) {
  const { getTransform } = await createCollisionBox({
    physicWorld,
    position,
    rotation,
    size,
  });

  // Render
  const map = await getCheckerTexture();
  const material = new THREE.MeshBasicMaterial({
    map,
  });
  const geometry = new THREE.BoxGeometry(...size);
  const mesh = new THREE.Mesh(geometry, material);

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
