export const getUniqueArrayTestData: [number[], number[]][] = [
  [[], []],
  [[1], [1]],
  [[1, 1], [1]],
  [
    [3, 1, 2],
    [3, 1, 2],
  ],
  [
    [1, 3, 2, 1, 3, 4, 4, 4, 1],
    [1, 3, 2, 4],
  ],
]

export const getComplementTestData: [number[], number[], number[]][] = [
  [[], [], []],
  [[1], [], [1]],
  [[], [1], []],
  [[1, 2, 3], [1], [2, 3]],
  [
    [5, 2, 1, 2, 4, 6],
    [3, 2],
    [5, 1, 4, 6],
  ],
]

export const getIntersectionTestData: [number[], number[], number[]][] = [
  [[], [], []],
  [[1], [], []],
  [[], [1], []],
  [[1], [1], [1]],
  [[1, 2], [1], [1]],
  [[1], [1, 2], [1]],
  [
    [1, 2],
    [1, 2],
    [1, 2],
  ],
  [
    [1, 2],
    [1, 2],
    [1, 2],
  ],
  [
    [1, 2, 3, 4],
    [3, 4, 5],
    [3, 4],
  ],
]

export const getDoesContainsAllTestData: [number[], number[], boolean][] = [
  [[], [], true],
  [[1], [], true],
  [[], [1], false],
  [[1, 2, 3], [1], true],
  [[1, 2, 3], [1, 2], true],
  [[1, 2, 3], [1, 2, 3], true],
  [[1, 2, 3], [1, 2, 3, 4], false],
  [[1, 2, 3], [1, 2, 4], false],
]
