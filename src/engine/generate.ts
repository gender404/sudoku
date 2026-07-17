import type { BoxDims, Grid } from './types'

function shuffledRange(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function basePattern(row: number, col: number, boxDims: BoxDims, size: number): number {
  return (boxDims.w * (row % boxDims.h) + Math.floor(row / boxDims.h) + col) % size
}

/**
 * Builds a fully solved grid via the standard band/stack-shuffle technique:
 * start from a base Latin square that already respects the box constraint,
 * then shuffle rows within bands, bands themselves, columns within stacks,
 * stacks themselves, and relabel digits. Every shuffle preserves validity,
 * so this needs no backtracking even at 25x25 (625 cells).
 */
export function generateSolvedGrid(boxDims: BoxDims): Grid {
  const size = boxDims.w * boxDims.h
  const bandCount = size / boxDims.h
  const stackCount = size / boxDims.w

  const bandOrder = shuffledRange(bandCount)
  const rowOrder: number[] = []
  for (const band of bandOrder) {
    for (const offset of shuffledRange(boxDims.h)) {
      rowOrder.push(band * boxDims.h + offset)
    }
  }

  const stackOrder = shuffledRange(stackCount)
  const colOrder: number[] = []
  for (const stack of stackOrder) {
    for (const offset of shuffledRange(boxDims.w)) {
      colOrder.push(stack * boxDims.w + offset)
    }
  }

  const digitMap = shuffledRange(size)

  const grid: Grid = []
  for (let r = 0; r < size; r++) {
    const row: number[] = []
    for (let c = 0; c < size; c++) {
      const base = basePattern(rowOrder[r], colOrder[c], boxDims, size)
      row.push(digitMap[base] + 1)
    }
    grid.push(row)
  }
  return grid
}
