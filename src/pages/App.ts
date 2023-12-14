import { create3DBases } from "../components/create3DBases";
import createCard from "../components/createCard";
import createCube from "../components/createCube";
import createGround from "../components/createGround";
import createSphere from "../components/createSphere";

// Rapier example https://github.com/viridia/demo-rapier-three/tree/main
export default async () => {
  const {
    renderer,
    scene,
    world,
    update: update3DBases,
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
  // {
  //   const { mesh, update } = await createSphere({
  //     world,
  //     posX: 0,
  //     posY: 3,
  //     posZ: 2,
  //   });
  //   scene.add(mesh);
  //   updates.push(update);

  //   onOver(mesh, (target) => {
  //     renderer.domElement.style.cursor = "grab";
  //     console.log("over:", target);
  //   });

  //   onOut(mesh, (target) => {
  //     renderer.domElement.style.cursor = "auto";
  //     console.log("out:", target);
  //   });

  //   onClick(mesh, (target) => {
  //     console.log("click:", target);
  //   });
  // }

  // {
  //   const { mesh: card, update } = await createCard({
  //     world,
  //     posX: Math.random() * 2 - 1,
  //     posY: Math.random() * 4 + 2,
  //     posZ: Math.random() * 2 - 1,
  //     onDown,
  //     onUp,
  //   });
  //   scene.add(card);
  //   updates.push(update);
  // }

  // Cube
  for (let i = 0; i < 1; i++) {
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
    // Ste the simulation forward.

    // Get and print the rigid-body's position.
    for (const update of updates) {
      update();
    }

    // required if controls.enableDamping or controls.autoRotate are set to true
    update3DBases();
  }
};
