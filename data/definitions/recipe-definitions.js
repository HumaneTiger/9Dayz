export default {
  cookingRecipes: {
    'roasted-meat': ['meat', 'sharp-stick', 1, 'roast'],
    'roasted-pepper': ['pepper', 'sharp-stick', 1, 'roast'],
    'roasted-mushroom': ['mushroom-1-2', 'sharp-stick', 1, 'roast'],
    'roasted-pumpkin': ['pumpkin', 'knife', 4, 'roast'],
    glue: ['bones', 'drink-1-2', 1, 'cook'],
  },

  craftingRecipes: {
    'wooden-club': {
      items: [['fail', 'hacksaw'], ['stump']],
      exclusive: true,
      result: 'weapon',
    },
    'improvised-axe': {
      items: [['tape'], ['branch'], ['stone']],
      exclusive: true,
      result: 'weapon',
    },
    'improvised-whip': {
      items: [['rope'], ['branch']],
      exclusive: true,
      result: 'weapon',
    },
    'fishing-rod': {
      items: [['rope'], ['branch'], ['bone-hook']],
      exclusive: true,
      result: 'weapon',
    },
    fireplace: {
      items: [['stone'], ['stump'], ['straw-wheet']],
      exclusive: false,
      result: 'building',
    },
    barricades: {
      items: [['rope'], ['stump'], ['sharp-stick']],
      exclusive: false,
      result: 'building',
    },
    tape: {
      items: [['cloth'], ['glue']],
      exclusive: false,
      amount: 2,
      result: 'inventory',
    },
    'sharp-stick': {
      items: [['branch'], ['knife']],
      exclusive: false,
      result: 'inventory',
    },
    'bone-hook': {
      items: [['bones'], ['knife']],
      exclusive: false,
      result: 'inventory',
    },
    rope: {
      items: [['straw-wheet'], ['straw-wheet']],
      exclusive: false,
      result: 'inventory',
    },
  },
};
