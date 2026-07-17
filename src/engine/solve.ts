import type { BoxDims, Grid } from './types'

function popcount(n: number): number {
  let count = 0
  while (n !== 0) {
    n &= n - 1
    count++
  }
  return count
}

interface SearchContext {
  size: number
  working: number[][]
  rowMask: number[]
  colMask: number[]
  boxMask: number[]
  boxOf: (row: number, col: number) => number
  fullMask: number
}

function createContext(grid: Grid, boxDims: BoxDims): SearchContext {
  const size = boxDims.w * boxDims.h
  const boxesPerRow = size / boxDims.w
  const working = grid.map((row) => [...row])
  const rowMask = new Array(size).fill(0)
  const colMask = new Array(size).fill(0)
  const boxMask = new Array(size).fill(0)
  const boxOf = (row: number, col: number) =>
    Math.floor(row / boxDims.h) * boxesPerRow + Math.floor(col / boxDims.w)

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const value = working[r][c]
      if (value !== 0) {
        const bit = 1 << (value - 1)
        rowMask[r] |= bit
        colMask[c] |= bit
        boxMask[boxOf(r, c)] |= bit
      }
    }
  }

  return { size, working, rowMask, colMask, boxMask, boxOf, fullMask: (1 << size) - 1 }
}

/** Picks the empty cell with fewest remaining candidates (MRV heuristic) — keeps backtracking fast even at 25x25. */
function findBestEmpty(ctx: SearchContext) {
  const { size, working, rowMask, colMask, boxMask, boxOf, fullMask } = ctx
  let best: { row: number; col: number; candidates: number; count: number } | null = null

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (working[r][c] !== 0) continue
      const candidates = fullMask & ~(rowMask[r] | colMask[c] | boxMask[boxOf(r, c)])
      const count = popcount(candidates)
      if (count === 0) return { row: r, col: c, candidates, count: 0 }
      if (!best || count < best.count) {
        best = { row: r, col: c, candidates, count }
        if (count === 1) return best
      }
    }
  }
  return best
}

function place(ctx: SearchContext, row: number, col: number, bit: number, value: number) {
  ctx.working[row][col] = value
  ctx.rowMask[row] |= bit
  ctx.colMask[col] |= bit
  ctx.boxMask[ctx.boxOf(row, col)] |= bit
}

function unplace(ctx: SearchContext, row: number, col: number, bit: number) {
  ctx.working[row][col] = 0
  ctx.rowMask[row] &= ~bit
  ctx.colMask[col] &= ~bit
  ctx.boxMask[ctx.boxOf(row, col)] &= ~bit
}

export function solve(grid: Grid, boxDims: BoxDims): Grid | null {
  const ctx = createContext(grid, boxDims)

  function backtrack(): boolean {
    const cell = findBestEmpty(ctx)
    if (!cell) return true
    if (cell.count === 0) return false

    let remaining = cell.candidates
    while (remaining !== 0) {
      const bit = remaining & -remaining
      remaining ^= bit
      const value = Math.log2(bit) + 1
      place(ctx, cell.row, cell.col, bit, value)
      if (backtrack()) return true
      unplace(ctx, cell.row, cell.col, bit)
    }
    return false
  }

  return backtrack() ? ctx.working : null
}

/** Counts solutions up to `cap`, stopping early once reached — used as a uniqueness check (cap=2: stop once >1 found). */
export function countSolutions(grid: Grid, boxDims: BoxDims, cap = 2): number {
  const ctx = createContext(grid, boxDims)
  let count = 0

  function backtrack(): boolean {
    const cell = findBestEmpty(ctx)
    if (!cell) {
      count++
      return count >= cap
    }
    if (cell.count === 0) return false

    let remaining = cell.candidates
    while (remaining !== 0) {
      const bit = remaining & -remaining
      remaining ^= bit
      const value = Math.log2(bit) + 1
      place(ctx, cell.row, cell.col, bit, value)
      if (backtrack()) return true
      unplace(ctx, cell.row, cell.col, bit)
    }
    return false
  }

  backtrack()
  return count
}
