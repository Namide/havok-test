import * as THREE from "three";
import { HP_WorldId } from "../physic/havok/HavokPhysics";
import { createCollisionBox } from "../physic/createCollisionBox";

export default async function createCube({
  world,
  posX = 0,
  posY = 0,
  posZ = 0,
  sizeX = Math.random() / 4 + 0.05,
  sizeY = Math.random() / 4 + 0.05,
  sizeZ = Math.random() / 4 + 0.05,
  rotX = Math.random(),
  rotY = Math.random(),
  rotZ = Math.random(),
}: {
  world: HP_WorldId; // InstanceType<Rapier["World"]>;
  posX?: number;
  posY?: number;
  posZ?: number;
  sizeX?: number;
  sizeY?: number;
  sizeZ?: number;
  rotX?: number;
  rotY?: number;
  rotZ?: number;
}) {
  const { getTransform } = await createCollisionBox({
    world,
    posX,
    posY,
    posZ,
    sizeX,
    sizeY,
    sizeZ,
    rotX,
    rotY,
    rotZ,
  })

  // Render
  const material = new THREE.MeshNormalMaterial();
  const geometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
  const mesh = new THREE.Mesh(geometry, material);

  // Update
  const update = () => {
    const { position, quaternion } = getTransform()
    mesh.position.set(...position);
    mesh.quaternion.set(...quaternion);
  };

  return {
    mesh,
    update,
  };
}
