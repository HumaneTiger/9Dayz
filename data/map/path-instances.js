export default {
  paths: {
    // Vertical paths
    vertical: [
      { x: 18, y1: 2, y2: 44 },
      { x: 13, y1: 8, y2: 9 },
      { x: 28, y1: 22, y2: 29 },
      { x: 41, y1: 26, y2: 33 },
      { x: 35, y1: 14, y2: 17 },
      { x: 7, y1: 14, y2: 16 },
      { x: 7, y1: 34, y2: 38 },
      { x: 35, y1: 31, y2: 43 },
    ],
    // Horizontal paths
    horizontal: [
      { x1: 16, x2: 19, y: 3 },
      { x1: 19, x2: 23, y: 37 },
      { x1: 15, x2: 17, y: 15 },
      { x1: 25, x2: 35, y: 37 },
      { x1: 9, x2: 17, y: 10 },
      { x1: 16, x2: 19, y: 8 },
      { x1: 21, x2: 26, y: 5 },
      { x1: 19, x2: 22, y: 14 },
      { x1: 12, x2: 17, y: 21 },
      { x1: 9, x2: 17, y: 32 },
      { x1: 28, x2: 43, y: 30 },
      { x1: 13, x2: 17, y: 41 },
      { x1: 32, x2: 36, y: 41 },
    ],
    // Diagonal down paths
    diagonalDown: [
      { x1: 8, x2: 11, y: 17 },
      { x1: 19, x2: 24, y: 31 },
      { x1: 4, x2: 12, y: 36 },
      { x1: 28, x2: 32, y: 32 },
      { x1: 27, x2: 34, y: 6 },
      { x1: 26, x2: 27, y: 20 },
      { x1: 30, x2: 32, y: 7 },
    ],
    // Diagonal up paths
    diagonalUp: [
      { x1: 8, x2: 10, y: 13 },
      { x1: 29, x2: 34, y: 23 },
    ],
    // Fill gaps - single points
    single: [
      { x: 31, y: 9 },
      { x: 8, y: 33 },
      { x: 29, y: 31 },
      { x: 12, y: 42 },
      { x: 20, y: 4 },
      { x: 7, y: 8 },
      { x: 8, y: 9 },
    ],
    // Remove paths player shouldn't walk
    remove: [
      { x: 18, y: 40 },
      { x: 18, y: 11 },
      { x: 18, y: 12 },
    ],
  },
};
