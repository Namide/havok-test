import { HP_WorldId, Vector3 } from "../physic/havok/HavokPhysics";
import { createCollisionSphere } from "../physic/createCollisionSphere";
import * as THREE from "three";
import { getCheckerTexture } from "../render/textures";

export default async function createSphere({
  world,
  position,
  size,
}: {
  world: HP_WorldId;
  position: Vector3;
  size: number;
}) {
  // Havok
  const { getTransform } = await createCollisionSphere({
    world,
    position,
    size,
  });

  // Render
  const map = await getCheckerTexture();
  const material = new THREE.MeshBasicMaterial({
    map,
  });
  const geometry = new THREE.SphereGeometry(size);
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
