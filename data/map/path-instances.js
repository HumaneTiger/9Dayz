export default {
  paths: [
    // Vertical paths
    { type: 'vertical', x: 18, y1: 2, y2: 44 },
    { type: 'vertical', x: 13, y1: 8, y2: 9 },
    { type: 'vertical', x: 28, y1: 22, y2: 29 },
    { type: 'vertical', x: 41, y1: 26, y2: 33 },
    { type: 'vertical', x: 35, y1: 14, y2: 17 },
    { type: 'vertical', x: 7, y1: 14, y2: 16 },
    { type: 'vertical', x: 7, y1: 34, y2: 38 },
    { type: 'vertical', x: 35, y1: 31, y2: 43 },

    // Horizontal paths
    { type: 'horizontal', x1: 16, x2: 19, y: 3 },
    { type: 'horizontal', x1: 19, x2: 23, y: 37 },
    { type: 'horizontal', x1: 15, x2: 17, y: 15 },
    { type: 'horizontal', x1: 25, x2: 35, y: 37 },
    { type: 'horizontal', x1: 9, x2: 17, y: 10 },
    { type: 'horizontal', x1: 16, x2: 19, y: 8 },
    { type: 'horizontal', x1: 21, x2: 26, y: 5 },
    { type: 'horizontal', x1: 19, x2: 22, y: 14 },
    { type: 'horizontal', x1: 12, x2: 17, y: 21 },
    { type: 'horizontal', x1: 9, x2: 17, y: 32 },
    { type: 'horizontal', x1: 28, x2: 43, y: 30 },
    { type: 'horizontal', x1: 13, x2: 17, y: 41 },
    { type: 'horizontal', x1: 32, x2: 36, y: 41 },

    // Diagonal down paths
    { type: 'diagonalDown', x1: 8, x2: 11, y: 17 },
    { type: 'diagonalDown', x1: 19, x2: 24, y: 31 },
    { type: 'diagonalDown', x1: 4, x2: 12, y: 36 },
    { type: 'diagonalDown', x1: 28, x2: 32, y: 32 },
    { type: 'diagonalDown', x1: 27, x2: 34, y: 6 },
    { type: 'diagonalDown', x1: 26, x2: 27, y: 20 },
    { type: 'diagonalDown', x1: 30, x2: 32, y: 7 },

    // Diagonal up paths
    { type: 'diagonalUp', x1: 8, x2: 10, y: 13 },
    { type: 'diagonalUp', x1: 29, x2: 34, y: 23 },

    // Fill gaps - single points
    { type: 'single', x: 31, y: 9 },
    { type: 'single', x: 8, y: 33 },
    { type: 'single', x: 29, y: 31 },
    { type: 'single', x: 12, y: 42 },
    { type: 'single', x: 20, y: 4 },
    { type: 'single', x: 7, y: 8 },
    { type: 'single', x: 8, y: 9 },

    // Remove paths player shouldn't walk
    { type: 'remove', x: 18, y: 40 },
    { type: 'remove', x: 18, y: 11 },
    { type: 'remove', x: 18, y: 12 },
  ],
};
