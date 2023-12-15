import createCard from "../elements/createCard";
import createCube from "../elements/createCube";
import createGround from "../elements/createGround";
import createSphere from "../elements/createSphere";
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

  // Ground
  const { mesh: groundMesh } = await createGround({ world });
  scene.add(groundMesh);

  // Sphere
  for (let i = 0; i < 10; i++) {
    const { mesh, update } = await createSphere({
      world,
      posX: Math.random() * 2 - 1,
      posY: Math.random() * 4 + 2,
      posZ: Math.random() * 2 - 1,
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
      posX: Math.random() * 2 - 1,
      posY: Math.random() * 4 + 2,
      posZ: Math.random() * 2 - 1,
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
      posX: Math.random() * 2 - 1,
      posY: Math.random() * 4 + 2,
      posZ: Math.random() * 2 - 1,
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
