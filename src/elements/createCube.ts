import * as THREE from "three";
import { createCollisionBox } from "../physic/createCollisionBox";
import { Quaternion, Vector3 } from "../physic/havok/HavokPhysics";
import { PhysicWorld } from "../render/create3DBases";
import { getCheckerTexture } from "../render/textures";

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
  const updatePhysic = async () => {
    const { position, quaternion } = await getTransform();
    mesh.position.set(...position);
    mesh.quaternion.set(...quaternion);
  };

  return {
    mesh,
    updatePhysic,
  };
}
