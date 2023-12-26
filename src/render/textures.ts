import * as THREE from "three";

let checkerTexture: THREE.Texture;

export const getCheckerTexture = async () => {
  if (!checkerTexture) {
    checkerTexture = await loadTexture("assets/checker-map.webp");
  }
  return checkerTexture;
};

function loadTexture(url: string): Promise<THREE.Texture> {
  const loader = new THREE.TextureLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      resolve,
      // onProgress callback currently not supported
      undefined,
      reject,
    );
  });
}
