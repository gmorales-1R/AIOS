import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- constants mirroring docs.md decisions -------------------------------
const GRID = 10;
const TILE = 1;
const TICK_MS = 100; // matches the decided 0.1s / 10-ticks-per-sec tick rate
const BASE_DAMAGE = 10;
const BLOCK_REDUCTION_PCT = 0.5;
const FLANK_MULTIPLIER = 1.5;
const NPC_WINDUP_TICKS = 3; // telegraph window before an NPC attack resolves
const NPC_ATTACK_COOLDOWN_TICKS = 15;
const BLOCK_WINDOW_TICKS = 5; // how long a queued block stays armed

// --- scene setup -----------------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f14);
scene.fog = new THREE.Fog(0x0b0f14, 14, 30);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(7, 9, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(GRID * TILE / 2, 0, GRID * TILE / 2);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2 - 0.02;
controls.update();

scene.add(new THREE.AmbientLight(0x8899bb, 0.7));
const sun = new THREE.DirectionalLight(0xffe9c7, 1.1);
sun.position.set(10, 16, 6);
scene.add(sun);

const tileGeo = new THREE.BoxGeometry(TILE * 0.96, 0.2, TILE * 0.96);
const tiles = [];
for (let x = 0; x < GRID; x++) {
  for (let z = 0; z < GRID; z++) {
    const mat = new THREE.MeshStandardMaterial({
      color: (x + z) % 2 === 0 ? 0x1c2a3a : 0x24384c,
      roughness: 0.9,
    });
    const tile = new THREE.Mesh(tileGeo, mat);
    tile.position.set(x * TILE, 0, z * TILE);
    tile.userData = { gx: x, gz: z };
    scene.add(tile);
    tiles.push(tile);
  }
}

// --- entities ----------------------------------------------------------
const CLAN_COLOR = { blue: 0x5fb2ff, red: 0xff5f5f };

function makeEntityMesh(clan) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.28, 0.5, 4, 8),
    new THREE.MeshStandardMaterial({ color: CLAN_COLOR[clan], roughness: 0.5 })
  );
  body.position.y = 0.55;
  group.add(body);
  return group;
}

let nextId = 1;
function makeEntity({ clan, gx, gz, hp, isPlayer = false, aggressive = false }) {
  const mesh = makeEntityMesh(clan);
  mesh.position.set(gx * TILE, 0, gz * TILE);
  scene.add(mesh);
  return {
    id: nextId++,
    clan,
    gx, gz,
    hp, maxHp: hp,
    mesh,
    facing: { dx: 0, dz: 1 },
    isPlayer,
    aggressive,
    alive: true,
    windup: 0,
    cooldown: aggressive ? 5 : 0,
  };
}

const player = makeEntity({ clan: 'blue', gx: 5, gz: 5, hp: 100, isPlayer: true });
const ally = makeEntity({ clan: 'blue', gx: 6, gz: 5, hp: 100 });
const enemy1 = makeEntity({ clan: 'red', gx: 5, gz: 6, hp: 40 });
const enemy2 = makeEntity({ clan: 'red', gx: 4, gz: 5, hp: 60, aggressive: true });
const entities = [player, ally, enemy1, enemy2];

function entityAt(gx, gz) {
  return entities.find((e) => e.alive && e.gx === gx && e.gz === gz);
}

function chebyshev(a, b) {
  return Math.max(Math.abs(a.gx - b.gx), Math.abs(a.gz - b.gz));
}

// --- HUD ------------------------------------------------------------------
const logEl = document.getElementById('log');
function log(msg) {
  const line = document.createElement('div');
  line.textContent = msg;
  logEl.prepend(line);
  while (logEl.children.length > 30) logEl.removeChild(logEl.lastChild);
}

const barsEl = document.getElementById('bars');
function barRow(entity, label) {
  const row = document.createElement('div');
  row.className = 'bar-row';
  row.innerHTML = `<div>${label}: <span class="hp">${entity.hp}</span>/${entity.maxHp}</div><div class="bar-track"><div class="bar-fill${entity.clan === 'red' ? ' enemy' : ''}" style="width:100%"></div></div>`;
  barsEl.appendChild(row);
  return {
    update() {
      const pct = Math.max(0, entity.hp / entity.maxHp) * 100;
      row.querySelector('.hp').textContent = Math.max(0, entity.hp);
      row.querySelector('.bar-fill').style.width = `${pct}%`;
      row.style.opacity = entity.alive ? '1' : '0.4';
    },
  };
}
const bars = [
  barRow(player, 'You'),
  barRow(enemy1, 'Red Grunt A'),
  barRow(enemy2, 'Red Grunt B (aggressive)'),
];
function refreshBars() { bars.forEach((b) => b.update()); }
refreshBars();

// --- damage resolution (docs.md: no dice, fully deterministic) ------------
function resolveAttack(attacker, defender) {
  const toAttacker = { dx: attacker.gx - defender.gx, dz: attacker.gz - defender.gz };
  const mag = Math.hypot(toAttacker.dx, toAttacker.dz) || 1;
  const dot = (toAttacker.dx / mag) * defender.facing.dx + (toAttacker.dz / mag) * defender.facing.dz;
  const isFlank = dot < -0.3;
  const positionModifier = isFlank ? FLANK_MULTIPLIER : 1.0;

  let dmg = BASE_DAMAGE * positionModifier;
  let blockNote = '';
  if (defender.isPlayer && playerBlockTicksLeft > 0) {
    dmg *= 1 - BLOCK_REDUCTION_PCT;
    blockNote = ' (blocked -50%)';
    playerBlockTicksLeft = 0; // one use per queued block
  }
  dmg = Math.round(dmg);
  defender.hp -= dmg;

  log(`Tick ${tickCount}: ${nameOf(attacker)} hits ${nameOf(defender)} for ${dmg}${isFlank ? ' (flank +50%)' : ''}${blockNote}`);

  if (defender.hp <= 0 && defender.alive) {
    defender.alive = false;
    defender.mesh.visible = false;
    log(`${nameOf(defender)} has fallen — permadeath.`);
  }
  refreshBars();
}

function nameOf(e) {
  if (e === player) return 'You';
  if (e === ally) return 'Ally';
  if (e === enemy1) return 'Red Grunt A';
  if (e === enemy2) return 'Red Grunt B';
  return `#${e.id}`;
}

// --- input: click grid to queue a move or attack intent -------------------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let queuedIntent = null; // { type: 'move'|'attack', gx, gz, target }

renderer.domElement.addEventListener('click', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(tiles)[0];
  if (!hit) return;
  const { gx, gz } = hit.object.userData;

  if (!player.alive) return;
  if (chebyshev(player, { gx, gz }) !== 1) {
    log('Too far — you can only act on an adjacent tile.');
    return;
  }

  const occupant = entityAt(gx, gz);
  if (occupant) {
    if (occupant.clan === player.clan) {
      log(`Can't attack ${nameOf(occupant)} — same clan.`);
      return;
    }
    queuedIntent = { type: 'attack', target: occupant };
    log(`Queued: attack ${nameOf(occupant)} (resolves next tick).`);
  } else {
    queuedIntent = { type: 'move', gx, gz };
  }
});

let playerBlockTicksLeft = 0;
const blockBtn = document.getElementById('block-btn');
function armBlock() {
  playerBlockTicksLeft = BLOCK_WINDOW_TICKS;
  blockBtn.classList.add('armed');
  log(`Tick ${tickCount}: block armed for ${BLOCK_WINDOW_TICKS} ticks.`);
}
blockBtn.addEventListener('click', armBlock);
window.addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'b') armBlock(); });

// --- fixed tick loop (docs.md: authoritative tick, deterministic order) ---
let tickCount = 0;
setInterval(() => {
  tickCount += 1;

  if (queuedIntent) {
    if (queuedIntent.type === 'move' && player.alive && !entityAt(queuedIntent.gx, queuedIntent.gz)) {
      player.facing = {
        dx: Math.sign(queuedIntent.gx - player.gx) || player.facing.dx,
        dz: Math.sign(queuedIntent.gz - player.gz) || player.facing.dz,
      };
      player.gx = queuedIntent.gx;
      player.gz = queuedIntent.gz;
      player.mesh.position.set(player.gx * TILE, 0, player.gz * TILE);
    } else if (queuedIntent.type === 'attack' && player.alive && queuedIntent.target.alive) {
      if (chebyshev(player, queuedIntent.target) === 1) {
        resolveAttack(player, queuedIntent.target);
      }
    }
    queuedIntent = null;
  }

  if (playerBlockTicksLeft > 0) {
    playerBlockTicksLeft -= 1;
    if (playerBlockTicksLeft === 0) blockBtn.classList.remove('armed');
  }

  for (const npc of entities) {
    if (!npc.aggressive || !npc.alive || !player.alive) continue;

    if (npc.cooldown > 0) { npc.cooldown -= 1; continue; }

    if (npc.windup > 0) {
      npc.windup -= 1;
      const flash = npc.windup % 2 === 0;
      npc.mesh.children[0].material.emissive = new THREE.Color(flash ? 0x552222 : 0x000000);
      if (npc.windup === 0) {
        npc.mesh.children[0].material.emissive = new THREE.Color(0x000000);
        if (chebyshev(npc, player) === 1) resolveAttack(npc, player);
        npc.cooldown = NPC_ATTACK_COOLDOWN_TICKS;
      }
      continue;
    }

    if (chebyshev(npc, player) === 1) {
      npc.windup = NPC_WINDUP_TICKS;
      log(`Tick ${tickCount}: ${nameOf(npc)} winds up an attack — block now!`);
    } else {
      const dx = Math.sign(player.gx - npc.gx);
      const dz = Math.sign(player.gz - npc.gz);
      const nx = npc.gx + dx, nz = npc.gz + dz;
      if (!entityAt(nx, nz)) {
        npc.facing = { dx: dx || npc.facing.dx, dz: dz || npc.facing.dz };
        npc.gx = nx; npc.gz = nz;
        npc.mesh.position.set(nx * TILE, 0, nz * TILE);
      }
      npc.cooldown = 2;
    }
  }
}, TICK_MS);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// exposed for headless verification only — not a gameplay feature
window.__poc = { player, ally, enemy1, enemy2, camera, renderer, getTick: () => tickCount };
