import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const GRID = 12;
const TILE = 1;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f14);
scene.fog = new THREE.Fog(0x0b0f14, 14, 30);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(8, 9, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(GRID * TILE / 2, 0, GRID * TILE / 2);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2 - 0.02;
controls.minDistance = 3;
controls.maxDistance = 30;
controls.update();

scene.add(new THREE.AmbientLight(0x8899bb, 0.6));
const sun = new THREE.DirectionalLight(0xffe9c7, 1.2);
sun.position.set(10, 16, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

const tileGeo = new THREE.BoxGeometry(TILE * 0.96, 0.2, TILE * 0.96);
const tiles = [];
const tileGroup = new THREE.Group();

for (let x = 0; x < GRID; x++) {
  for (let z = 0; z < GRID; z++) {
    const isDark = (x + z) % 2 === 0;
    const mat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1c2a3a : 0x24384c,
      roughness: 0.9,
    });
    const tile = new THREE.Mesh(tileGeo, mat);
    tile.position.set(x * TILE, 0, z * TILE);
    tile.receiveShadow = true;
    tile.userData = { gx: x, gz: z, baseColor: mat.color.clone() };
    tileGroup.add(tile);
    tiles.push(tile);
  }
}
scene.add(tileGroup);

function spawnToken(gx, gz, color) {
  const token = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 0.6, 6),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
  );
  token.position.set(gx * TILE, 0.4, gz * TILE);
  token.castShadow = true;
  token.userData.bobPhase = Math.random() * Math.PI * 2;
  scene.add(token);
  return token;
}

const tokens = [
  spawnToken(3, 4, 0xff5f5f),
  spawnToken(8, 7, 0x5fb2ff),
  spawnToken(5, 9, 0xffd25f),
];

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selected = null;
const selectedLabel = document.getElementById('selected');

function setPointer(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

renderer.domElement.addEventListener('click', (event) => {
  setPointer(event);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(tiles)[0];
  if (!hit) return;

  if (selected) selected.material.color.copy(selected.userData.baseColor);
  selected = hit.object;
  selected.material.color.set(0x7CFC9A);
  const { gx, gz } = selected.userData;
  selectedLabel.textContent = `Selected tile: (${gx}, ${gz})`;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  for (const token of tokens) {
    token.position.y = 0.4 + Math.sin(t * 2 + token.userData.bobPhase) * 0.06;
    token.rotation.y = t * 0.6;
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();
