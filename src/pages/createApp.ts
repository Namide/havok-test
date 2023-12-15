import { euler, quaternion } from "../constants";
import createCard from "../elements/createCard";
import createCube from "../elements/createCube";
import createGround from "../elements/createGround";
import createSphere from "../elements/createSphere";
import { Quaternion } from "../physic/havok/HavokPhysics";
import { create3DBases } from "../render/create3DBases";

// Rapier example https://github.com/viridia/demo-rapier-three/tree/main
export const createApp = async () => {
  const {
    renderer,
    scene,
    world,
    update: update3DBases,
    render,
    onOver,
    onOut,
    onClick,
    onDown,
    onUp,
  } = await create3DBases();

  const updates: (() => void)[] = [];

  const getRandomRotation = () =>
    quaternion
      .setFromEuler(
        euler.set(
          Math.random() * 2 * Math.PI,
          Math.random() * 2 * Math.PI,
          Math.random() * 2 * Math.PI,
        ),
        true,
      )
      .toArray() as Quaternion;

  // Ground
  const { mesh: groundMesh } = await createGround({
    world,
    size: [20, 0.2, 20],
    position: [0, 0, 0],
    rotation: [0, 0, 0, 1],
  });
  scene.add(groundMesh);

  // Sphere
  for (let i = 0; i < 10; i++) {
    const { mesh, update } = await createSphere({
      world,
      position: [
        Math.random() * 2 - 1,
        Math.random() * 4 + 2,
        Math.random() * 2 - 1,
      ],
      size: Math.random() / 10 + 0.1,
    });
    scene.add(mesh);
    updates.push(update);

    onOver(mesh, (target) => {
      renderer.domElement.style.cursor = "grab";
      console.log("over:", target);
    });

    onOut(mesh, (target) => {
      renderer.domElement.style.cursor = "auto";
      console.log("out:", target);
    });

    onClick(mesh, (target) => {
      console.log("click:", target);
    });
  }

  // Cards
  for (let i = 0; i < 5; i++) {
    const { mesh: card, update } = await createCard({
      world,
      position: [
        Math.random() * 2 - 1,
        Math.random() * 4 + 2,
        Math.random() * 2 - 1,
      ],
      rotation: quaternion
        .setFromEuler(
          euler.set(
            Math.random() * 2 * Math.PI,
            Math.random() * 2 * Math.PI,
            Math.random() * 2 * Math.PI,
          ),
          true,
        )
        .toArray() as Quaternion,
      size: [3 / 2, 1, 0.01],
      onDown,
      onUp,
    });
    scene.add(card);
    updates.push(update);
  }

  // Cube
  for (let i = 0; i < 100; i++) {
    const { mesh, update } = await createCube({
      world,
      position: [
        Math.random() * 2 - 1,
        Math.random() * 4 + 2,
        Math.random() * 2 - 1,
      ],
      size: [
        Math.random() / 4 + 0.05,
        Math.random() / 4 + 0.05,
        Math.random() / 4 + 0.05,
      ],
      rotation: getRandomRotation(),
    });
    scene.add(mesh);
    updates.push(update);
  }

  renderer.setAnimationLoop(tick);

  function tick(/* time: number */) {
    // required if controls.enableDamping or controls.autoRotate are set to true
    update3DBases();

    // Ste the simulation forward.

    // Get and print the rigid-body's position.
    for (const update of updates) {
      update();
    }

    render();
  }
};
