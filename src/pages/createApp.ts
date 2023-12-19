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
    renderWorld,
    physicWorld,
    updatePhysic: tickPhysicEngine,
    updateEvents,
    render,
    mouseEvents,
  } = await create3DBases();

  const updatePhysicList: (() => void)[] = [];

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

  // Sphere
  for (let i = 0; i < 10; i++) {
    const { mesh, updatePhysic } = await createSphere({
      physicWorld,
      position: [
        Math.random() * 2 - 1,
        Math.random() * 4 + 2,
        Math.random() * 2 - 1,
      ],
      size: Math.random() / 10 + 0.1,
    });
    renderWorld.scene.add(mesh);
    updatePhysicList.push(updatePhysic);

    mouseEvents.onOver(mesh, () => {
      renderWorld.renderer.domElement.style.cursor = "grab";
    });

    mouseEvents.onOut(mesh, () => {
      renderWorld.renderer.domElement.style.cursor = "auto";
    });

    mouseEvents.onClick(mesh, (target) => {
      console.log("click:", target);
    });
  }

  // Ground
  const { mesh: groundMesh } = await createGround({
    physicWorld,
    size: [20, 0.2, 20],
    position: [0, 0, 0],
    rotation: [0, 0, 0, 1],
  });
  renderWorld.scene.add(groundMesh);

  // Cards
  for (let i = 0; i < 5; i++) {
    const { mesh: card, updatePhysic } = await createCard({
      physicWorld,
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
      size: [1, 3 / 2, 0.01],
      mouseEvents,
      renderWorld,
    });
    renderWorld.scene.add(card);
    updatePhysicList.push(updatePhysic);
  }

  // Cube
  for (let i = 0; i < 100; i++) {
    const { mesh, updatePhysic } = await createCube({
      physicWorld,
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
    renderWorld.scene.add(mesh);
    updatePhysicList.push(updatePhysic);
  }

  renderWorld.renderer.setAnimationLoop(tick);

  async function tick(/* time: number */) {
    updateEvents();
    render();
  }

  let renderRAF: number;
  let renderTime = Date.now();
  const renderPhysic = async () => {
    const time = Date.now();
    const dt = time - renderTime;
    renderTime = time;
    cancelAnimationFrame(renderRAF);

    // Get and print the rigid-body's position.
    for (const update of updatePhysicList) {
      await update();
    }

    // required if controls.enableDamping or controls.autoRotate are set to true
    await tickPhysicEngine(dt);
    requestAnimationFrame(renderPhysic);
  };
  renderPhysic();
};
