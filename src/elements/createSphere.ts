import * as THREE from "three";
import { createCollisionSphere } from "../physic/createCollisionSphere";
import { Vector3 } from "../physic/havok/HavokPhysics";
import { PhysicWorld } from "../render/create3DBases";
import { getCheckerTexture } from "../render/textures";

export default async function createSphere({
  physicWorld,
  position,
  size,
}: {
  physicWorld: PhysicWorld;
  position: Vector3;
  size: number;
}) {
  // Havok
  const { getTransform } = await createCollisionSphere({
    physicWorld,
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
  const update = async () => {
    const { position, quaternion } = await getTransform();
    mesh.position.set(...position);
    mesh.quaternion.set(...quaternion);
  };

  return {
    mesh,
    update,
  };
}
