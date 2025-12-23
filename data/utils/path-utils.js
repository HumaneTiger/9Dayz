export function setupPath(pathsArray, x, y) {
  pathsArray[x][y] = true;
}

export function setupPathVer(pathsArray, x, y1, y2) {
  for (var vert = y1; vert <= y2; vert += 1) {
    pathsArray[x][vert] = true;
  }
}

export function setupPathHor(pathsArray, x1, x2, y) {
  for (var hor = x1; hor <= x2; hor += 1) {
    pathsArray[hor][y] = true;
  }
}

export function setupPathDiaDown(pathsArray, x1, x2, y) {
  for (var dia = 0; dia <= x2 - x1; dia += 1) {
    pathsArray[x1 + dia][y + dia] = true;
  }
}

export function setupPathDiaUp(pathsArray, x1, x2, y) {
  for (var dia = 0; dia <= x2 - x1; dia += 1) {
    pathsArray[x1 + dia][y - dia] = true;
  }
}

export function removePath(pathsArray, x, y) {
  pathsArray[x][y] = undefined;
}
