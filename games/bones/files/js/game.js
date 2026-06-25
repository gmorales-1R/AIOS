// Isometric grid constants derived from Kenney miniature pack Tiled sample:
// tilewidth=256, tileheight=128 → stepX=128, stepY=64
const STEP_X = 128;
const STEP_Y = 64;

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.camStart = { x: 0, y: 0 };
  }

  preload() {
    const DUNGEON = 'raw_assets/kenney_isometric-miniature-dungeon/Isometric/';

    // Floor tiles from dungeon pack (_S face is the standard floor orientation)
    this.load.image('dirt',      DUNGEON + 'dirt_S.png');
    this.load.image('dirtTiles', DUNGEON + 'dirtTiles_S.png');
    this.load.image('stone',     DUNGEON + 'stone_S.png');
    this.load.image('stoneInset',DUNGEON + 'stoneInset_S.png');

    this.load.image('barrel', DUNGEON + 'barrel_N.png');
    this.load.image('chest',  DUNGEON + 'chestClosed_N.png');
    this.load.image('crate',  DUNGEON + 'woodenCrate_N.png');
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = 220;

    // 0=dirt  1=dirtTiles  2=stone  3=stoneInset
    const TILES = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 2, 1, 1, 2, 1, 0],
      [0, 1, 1, 3, 3, 1, 1, 0],
      [0, 1, 1, 3, 3, 1, 1, 0],
      [0, 1, 2, 1, 1, 2, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ];

    const PROPS = [
      [null, null,     null,    null, null,     null,     null, null],
      [null, null,     null,    null, null,     null,     null, null],
      [null, null,     'barrel',null, null,     'crate',  null, null],
      [null, null,     null,    null, null,     null,     null, null],
      [null, null,     null,    null, null,     null,     null, null],
      [null, null,     'chest', null, null,     'barrel', null, null],
      [null, null,     null,    null, null,     null,     null, null],
      [null, null,     null,    null, null,     null,     null, null],
    ];

    const TILE_KEYS = ['dirt', 'dirtTiles', 'stone', 'stoneInset'];

    // Back-to-front (painter's algorithm): sort by col+row ascending
    const SIZE = TILES.length;
    const cells = [];
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        cells.push({ col, row });
      }
    }
    cells.sort((a, b) => (a.col + a.row) - (b.col + b.row));

    for (const { col, row } of cells) {
      const sx = cx + (col - row) * STEP_X;
      const sy = cy + (col + row) * STEP_Y;
      const depth = col + row;

      // Floor tile
      const t = this.add.image(sx, sy, TILE_KEYS[TILES[row][col]]);
      t.setOrigin(0.5, 1.0);
      t.setDepth(depth);

      // Prop (if any)
      const prop = PROPS[row][col];
      if (prop) {
        const p = this.add.image(sx, sy, prop);
        p.setOrigin(0.5, 1.0);
        p.setDepth(depth + 0.5);
      }
    }

    // Drag-to-pan camera
    this.input.on('pointerdown', (ptr) => {
      this.isDragging = true;
      this.dragStart = { x: ptr.x, y: ptr.y };
      this.camStart  = { x: this.cameras.main.scrollX, y: this.cameras.main.scrollY };
    });
    this.input.on('pointermove', (ptr) => {
      if (!this.isDragging) return;
      this.cameras.main.scrollX = this.camStart.x - (ptr.x - this.dragStart.x);
      this.cameras.main.scrollY = this.camStart.y - (ptr.y - this.dragStart.y);
    });
    this.input.on('pointerup', () => { this.isDragging = false; });
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
