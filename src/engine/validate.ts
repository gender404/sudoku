import type { BoxDims, Grid } from './types'

function markDuplicates(grid: Grid, conflicts: boolean[][], cells: [number, number][]) {
  const seen = new Map<number, [number, number][]>()
  for (const [r, c] of cells) {
    const value = grid[r][c]
    if (value === 0) continue
    const list = seen.get(value) ?? []
    list.push([r, c])
    seen.set(value, list)
  }
  for (const list of seen.values()) {
    if (list.length > 1) {
      for (const [r, c] of list) conflicts[r][c] = true
    }
  }
}

/** Returns a same-shaped grid of booleans flagging cells that duplicate a value in their row, column, or box. */
export function findConflicts(grid: Grid, boxDims: BoxDims): boolean[][] {
  const size = boxDims.w * boxDims.h
  const conflicts = grid.map((row) => row.map(() => false))

  for (let r = 0; r < size; r++) {
    markDuplicates(
      grid,
      conflicts,
      Array.from({ length: size }, (_, c) => [r, c]),
    )
  }
  for (let c = 0; c < size; c++) {
    markDuplicates(
      grid,
      conflicts,
      Array.from({ length: size }, (_, r) => [r, c]),
    )
  }
  for (let br = 0; br < size; br += boxDims.h) {
    for (let bc = 0; bc < size; bc += boxDims.w) {
      const cells: [number, number][] = []
      for (let r = br; r < br + boxDims.h; r++) {
        for (let c = bc; c < bc + boxDims.w; c++) {
          cells.push([r, c])
        }
      }
      markDuplicates(grid, conflicts, cells)
    }
  }

  return conflicts
}

export function isGridComplete(grid: Grid): boolean {
  return grid.every((row) => row.every((value) => value !== 0))
}
