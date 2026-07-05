// Isometric grid constants derived from Kenney miniature pack Tiled sample:
// tilewidth=256, tileheight=128 → stepX=128, stepY=64
const STEP_X = 128;
const STEP_Y = 64;
const GRID_SIZE = 8;

// Pets stay cheap on purpose: one shared texture, per-instance tint instead
// of unique art, no per-pet update logic beyond a shared idle tween.
// Summoning has no cap — that's the point.
const PET_TINTS = [0xffffff, 0xff9a76, 0x8ad1ff, 0xb98aff, 0x9fe89f, 0xffe08a];

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.camStart = { x: 0, y: 0 };
    this.petCount = 0;
  }

  preload() {
    this.load.image('tileDirt', 'assets/tile_dirt.png');
    this.load.image('tileDirtAlt', 'assets/tile_dirt_alt.png');
    this.load.image('witch', 'assets/witch.png');
    this.load.image('pet', 'assets/pet.png');
  }

  gridToScreen(col, row) {
    return {
      x: this.originX + (col - row) * STEP_X,
      y: this.originY + (col + row) * STEP_Y,
    };
  }

  screenToGrid(sx, sy) {
    const dx = sx - this.originX;
    const dy = sy - this.originY;
    const col = Math.round((dx / STEP_X + dy / STEP_Y) / 2);
    const row = Math.round((dy / STEP_Y - dx / STEP_X) / 2);
    return { col, row };
  }

  create() {
    this.originX = this.scale.width / 2;
    this.originY = 160;

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const { x, y } = this.gridToScreen(col, row);
        const key = (col + row) % 2 === 0 ? 'tileDirt' : 'tileDirtAlt';
        const t = this.add.image(x, y, key);
        t.setOrigin(0.5, 1.0);
        t.setDepth(col + row);
      }
    }

    const witchStart = { col: 3, row: 4 };
    const witchPos = this.gridToScreen(witchStart.col, witchStart.row);
    this.witch = this.add.image(witchPos.x, witchPos.y, 'witch');
    this.witch.setOrigin(0.5, 1.0);
    this.witch.setDepth(witchStart.col + witchStart.row + 0.5);

    this.hud = this.add.text(16, 16, 'Pets summoned: 0', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      color: '#f0e6ff',
      backgroundColor: '#00000088',
      padding: { x: 10, y: 6 },
    });
    this.hud.setScrollFactor(0);
    this.hud.setDepth(1000);

    this.hint = this.add.text(16, 52, 'Tap a tile to summon a pet — no limit. Drag to pan.', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#c9b8ff',
      backgroundColor: '#00000066',
      padding: { x: 8, y: 4 },
    });
    this.hint.setScrollFactor(0);
    this.hint.setDepth(1000);

    let dragMoved = false;

    this.input.on('pointerdown', (ptr) => {
      this.isDragging = true;
      dragMoved = false;
      this.dragStart = { x: ptr.x, y: ptr.y };
      this.camStart = { x: this.cameras.main.scrollX, y: this.cameras.main.scrollY };
    });

    this.input.on('pointermove', (ptr) => {
      if (!this.isDragging) return;
      if (Math.hypot(ptr.x - this.dragStart.x, ptr.y - this.dragStart.y) > 6) dragMoved = true;
      this.cameras.main.scrollX = this.camStart.x - (ptr.x - this.dragStart.x);
      this.cameras.main.scrollY = this.camStart.y - (ptr.y - this.dragStart.y);
    });

    this.input.on('pointerup', (ptr) => {
      this.isDragging = false;
      if (dragMoved) return;

      const world = this.cameras.main.getWorldPoint(ptr.x, ptr.y);
      const { col, row } = this.screenToGrid(world.x, world.y);
      if (col < 0 || row < 0 || col >= GRID_SIZE || row >= GRID_SIZE) return;
      this.summonPet(col, row);
    });
  }

  summonPet(col, row) {
    const { x, y } = this.gridToScreen(col, row);
    const jitterX = (Math.random() - 0.5) * 30;
    const pet = this.add.image(x + jitterX, y, 'pet');
    pet.setOrigin(0.5, 1.0);
    pet.setScale(0.4);
    pet.setDepth(col + row + 0.25);
    pet.setTint(PET_TINTS[Math.floor(Math.random() * PET_TINTS.length)]);

    this.tweens.add({
      targets: pet,
      y: y - 6,
      duration: 500 + Math.random() * 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.petCount += 1;
    this.hud.setText(`Pets summoned: ${this.petCount}`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [GameScene],
};

new Phaser.Game(config);
