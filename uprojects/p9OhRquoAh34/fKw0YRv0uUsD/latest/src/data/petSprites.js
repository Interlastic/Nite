// Pixel art sprite data for all pet states and life stages
// Each sprite is represented as a 16x16 grid of colors

const COLOR_PALETTE = {
  TRANSPARENT: null,
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  EGG_SHELL: '#FFF8DC',
  EGG_SHADOW: '#F5DEB3',
  BODY: '#FFB6C1',
  BODY_DARK: '#FF69B4',
  BELLY: '#FFF0F5',
  EYE: '#2C3E50',
  EYE_HAPPY: '#3498DB',
  EYE_SAD: '#9B59B6',
  EYE_SLEEP: '#95A5A6',
  BLUSH: '#FFB6C1',
  MOUTH: '#E74C3C',
  SICK_GREEN: '#27AE60',
  POOP: '#8B4513',
  STAR: '#F1C40F',
};

// 16x16 grid helpers
function createEmptyGrid() {
  return Array(16).fill(null).map(() => Array(16).fill(COLOR_PALETTE.TRANSPARENT));
}

// EGG STAGE SPRITES
export const EGG_SPRITES = {
  idle: [
    // Frame 1
    [
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,'#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3',null,null,null,null],
      [null,null,'#F5DEB3','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#F5DEB3',null,null,null],
      [null,null,'#F5DEB3','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#F5DEB3',null,null,null],
      [null,null,'#F5DEB3','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#F5DEB3',null,null,null],
      [null,null,'#F5DEB3','#F5DEB3','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#F5DEB3','#F5DEB3',null,null,null],
      [null,null,null,'#F5DEB3','#F5DEB3','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#F5DEB3','#F5DEB3',null,null,null,null],
      [null,null,null,null,'#F5DEB3','#F5DEB3','#FFF8DC','#FFF8DC','#FFF8DC','#F5DEB3','#F5DEB3',null,null,null,null,null],
      [null,null,null,null,null,'#F5DEB3','#F5DEB3','#FFF8DC','#F5DEB3','#F5DEB3',null,null,null,null,null,null],
      [null,null,null,null,null,null,'#F5DEB3','#F5DEB3',null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    ],
    // Frame 2
    [
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,'#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3',null,null,null],
      [null,null,'#F5DEB3','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#F5DEB3',null,null],
      [null,null,'#F5DEB3','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#F5DEB3',null,null],
      [null,null,'#F5DEB3','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#F5DEB3',null,null],
      [null,null,'#F5DEB3','#F5DEB3','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#F5DEB3','#F5DEB3',null,null,null],
      [null,null,null,'#F5DEB3','#F5DEB3','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#FFF8DC','#F5DEB3','#F5DEB3',null,null,null,null],
      [null,null,null,null,'#F5DEB3','#F5DEB3','#FFF8DC','#FFF8DC','#FFF8DC','#F5DEB3','#F5DEB3',null,null,null,null,null],
      [null,null,null,null,null,'#F5DEB3','#F5DEB3','#FFF8DC','#F5DEB3','#F5DEB3',null,null,null,null,null,null],
      [null,null,null,null,null,null,'#F5DEB3','#F5DEB3',null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    ],
  ],
};

// BABY STAGE SPRITES
export const BABY_SPRITES = {
  idle: [
    [
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,'#FF69B4','#FF69B4','#FF69B4',null,null,null,null,null,null,null],
      [null,null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFF0F5','#FFF0F5','#FFB6C1','#FFF0F5','#FFF0F5','#FFB6C1','#FFF0F5','#FFF0F5','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFF0F5','#FFF0F5','#FFB6C1','#FFF0F5','#FFF0F5','#FFB6C1','#FFF0F5','#FFF0F5','#FFB6C1','#FF69B4',null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null],
      [null,null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null,null],
      [null,null,null,null,null,'#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4',null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    ],
  ],
  happy: [
    [
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFF0F5','#2C3E50','null','null','2C3E50','#FFF0F5','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFF0F5','null','null','null','null','#FFF0F5','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#E74C3C','null','E74C3C','#E74C3C','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null,null],
      [null,null,null,null,'#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4',null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    ],
  ],
  sad: [
    [
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFF0F5','null','2C3E50','2C3E50','null','#FFF0F5','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFF0F5','null','null','null','null','#FFF0F5','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,null,'#FF69B4','#FFB6C1','null','null','E74C3C','null','null','#FFB6C1','#FFB6C1','#FF69B4',null,null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null,null],
      [null,null,null,null,'#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4',null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    ],
  ],
  hungry: [
    [
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,'#F1C40F','#F1C40F','#F1C40F',null,null,null,null,null,null,null],
      [null,null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFF0F5','null','null','null','null','#FFF0F5','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFF0F5','null','null','null','null','#FFF0F5','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,null,'#FF69B4','#FFB6C1','null','E74C3C','null','null','null','#FFB6C1','#FFB6C1','#FF69B4',null,null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null,null],
      [null,null,null,null,'#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4',null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    ],
  ],
  sleeping: [
    [
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFF0F5','null','95A5A6','95A5A6','null','#FFF0F5','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFF0F5','null','null','null','null','#FFF0F5','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,null,'#FF69B4','#FFB6C1','null','null','null','null','null','#FFB6C1','#FFB6C1','#FF69B4',null,null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null,null],
      [null,null,null,null,'#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4',null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    ],
  ],
  sick: [
    [
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFF0F5','null','null','null','null','#FFF0F5','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFF0F5','null','null','null','null','#FFF0F5','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,null,'#FF69B4','#FFB6C1','null','null','null','null','null','#FFB6C1','#FFB6C1','#FF69B4',null,null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null,null],
      [null,null,null,null,'#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4',null,null,null,null,null,null],
      [null,null,null,'#27AE60','27AE60','27AE60','27AE60','27AE60','27AE60',null,null,null,null,null,null],
      [null,null,null,'#27AE60','27AE60','27AE60','27AE60','27AE60','27AE60','27AE60',null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    ],
  ],
};

// CHILD STAGE SPRITES (similar but larger)
export const CHILD_SPRITES = {
  idle: [
    [
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,'#FF69B4','#FF69B4','#FF69B4','#FF69B4',null,null,null,null,null,null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFF0F5','#FFF0F5','#FFB6C1','#FFF0F5','#FFF0F5','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFF0F5','#FFF0F5','#FFB6C1','#2C3E50','2C3E50','#FFB6C1','#FFF0F5','#FFF0F5','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#E74C3C','null','E74C3C','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null],
      [null,null,null,null,'#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4',null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    ],
  ],
  happy: [
    [
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFF0F5','#FFF0F5','#FFB6C1','#FFF0F5','#FFF0F5','#FFB6C1','#FFF0F5','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','#2C3E50','null','null','null','null','2C3E50','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','null','null','null','null','null','null','null','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','null','E74C3C','null','E74C3C','null','E74C3C','null','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null],
      [null,null,null,null,'#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4',null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    ],
  ],
};

// ADULT STAGE SPRITES
export const ADULT_SPRITES = {
  idle: [
    [
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,'#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4',null,null,null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFF0F5','#FFF0F5','#FFB6C1','#FFF0F5','#FFF0F5','#FFB6C1','#FFF0F5','#FFF0F5','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFF0F5','2C3E50','2C3E50','2C3E50','2C3E50','FFF0F5','FFB6C1','#FF69B4',null,null,null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFB6C1','null','null','null','null','FFB6C1','#FFB6C1','#FF69B4',null,null,null,null],
      [null,null,'#FF69B4','#FFB6C1','null','E74C3C','null','E74C3C','null','null','FFB6C1','#FF69B4',null,null,null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFB6C1','null','null','null','null','FFB6C1','#FFB6C1','#FF69B4',null,null,null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null],
      [null,null,null,null,'#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4',null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    ],
  ],
  happy: [
    [
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFF0F5','null','null','null','null','FFF0F5','#FFB6C1','#FF69B4',null,null,null,null],
      [null,null,'#FF69B4','null','null','2C3E50','null','2C3E50','null','null','null','#FF69B4',null,null,null,null],
      [null,null,'#FF69B4','null','null','null','null','null','null','null','null','null','#FF69B4',null,null,null],
      [null,null,'#FF69B4','null','E74C3C','null','E74C3C','null','E74C3C','null','null','#FF69B4',null,null,null,null],
      [null,null,'#FF69B4','#FFB6C1','null','null','null','null','null','null','FFB6C1','#FF69B4',null,null,null,null],
      [null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null],
      [null,null,null,'#FF69B4','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FFB6C1','#FF69B4',null,null,null,null],
      [null,null,null,null,'#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4',null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    ],
  ],
};

// Get sprite for current state and life stage
export function getSprite(lifeStage, state) {
  const sprites = {
    egg: EGG_SPRITES,
    baby: BABY_SPRITES,
    child: CHILD_SPRITES,
    adult: ADULT_SPRITES,
  };
  
  const stageSprites = sprites[lifeStage] || sprites.baby;
  return stageSprites[state] || stageSprites.idle;
}

// Convert sprite grid to CSS background
export function spriteToCSS(spriteData, pixelSize = 4) {
  const rows = spriteData.length;
  const cols = spriteData[0].length;
  
  let css = '';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const color = spriteData[y][x];
      if (color) {
        css += `background-color: ${color};`;
        css += `position: absolute;`;
        css += `left: ${x * pixelSize}px;`;
        css += `top: ${y * pixelSize}px;`;
        css += `width: ${pixelSize}px;`;
        css += `height: ${pixelSize}px;`;
        css += `box-shadow: 1px 1px 0 rgba(0,0,0,0.1);`;
        css += `}`;
      }
    }
  }
  return css;
}

// Generate SVG from sprite data
export function spriteToSVG(spriteData, scale = 1) {
  const pixelSize = 1;
  const width = spriteData[0].length * pixelSize;
  const height = spriteData.length * pixelSize;
  
  let rects = '';
  for (let y = 0; y < spriteData.length; y++) {
    for (let x = 0; x < spriteData[0].length; x++) {
      const color = spriteData[y][x];
      if (color) {
        rects += `<rect x="${x}" y="${y}" width="${pixelSize}" height="${pixelSize}" fill="${color}"/>`;
      }
    }
  }
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width * scale}" height="${height * scale}">${rects}</svg>`;
}