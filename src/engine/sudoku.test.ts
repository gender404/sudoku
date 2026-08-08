import { describe, expect, it } from 'vitest'
import type { BoxDims } from './types'
import { GRID_CONFIGS } from './types'
import { generateSolvedGrid } from './generate'
import { countSolutions, solve } from './solve'
import { carvePuzzle } from './carve'
import { findConflicts, isGridComplete } from './validate'

function assertValidSolvedGrid(grid: number[][], boxDims: BoxDims) {
  const size = boxDims.w * boxDims.h
  const expected = new Set(Array.from({ length: size }, (_, i) => i + 1))

  for (let r = 0; r < size; r++) {
    expect(new Set(grid[r])).toEqual(expected)
  }
  for (let c = 0; c < size; c++) {
    const col = grid.map((row) => row[c])
    expect(new Set(col)).toEqual(expected)
  }
  for (let br = 0; br < size; br += boxDims.h) {
    for (let bc = 0; bc < size; bc += boxDims.w) {
      const box: number[] = []
      for (let r = br; r < br + boxDims.h; r++) {
        for (let c = bc; c < bc + boxDims.w; c++) {
          box.push(grid[r][c])
        }
      }
      expect(new Set(box)).toEqual(expected)
    }
  }
}

describe.each([
  ['9x9', GRID_CONFIGS['9x9'].boxDims],
  ['16x16', GRID_CONFIGS['16x16'].boxDims],
  ['25x25', GRID_CONFIGS['25x25'].boxDims],
])('%s grid', (_label, boxDims) => {
  it('generates a valid solved grid', () => {
    assertValidSolvedGrid(generateSolvedGrid(boxDims), boxDims)
  })

  it('produces no conflicts and reads as complete on its own solved grid', () => {
    const grid = generateSolvedGrid(boxDims)
    const conflicts = findConflicts(grid, boxDims)
    expect(conflicts.flat().some(Boolean)).toBe(false)
    expect(isGridComplete(grid)).toBe(true)
  })

  it('carves a puzzle that keeps some clues and empties, all clues matching the solved grid', () => {
    const solved = generateSolvedGrid(boxDims)
    const puzzle = carvePuzzle(solved, boxDims, 'medium')
    expect(isGridComplete(puzzle)).toBe(false)

    for (let r = 0; r < puzzle.length; r++) {
      for (let c = 0; c < puzzle.length; c++) {
        if (puzzle[r][c] !== 0) {
          expect(puzzle[r][c]).toBe(solved[r][c])
        }
      }
    }
    expect(findConflicts(puzzle, boxDims).flat().some(Boolean)).toBe(false)
  })
})

// Full backtracking solve/uniqueness checks only run against 9x9. At 16x16 and 25x25, a carved
// puzzle can have well over 100 empty cells with only row/col/box masking (no advanced constraint
// propagation), which is combinatorially expensive to fully re-solve — measured directly for
// 16x16 (see carve.ts), and documented as a known gap for the first pass, not something to test here.
describe('9x9 solve + uniqueness', () => {
  it('solver re-solves a carved 9x9 puzzle back to a valid grid', () => {
    const boxDims = GRID_CONFIGS['9x9'].boxDims
    const solved = generateSolvedGrid(boxDims)
    const puzzle = carvePuzzle(solved, boxDims, 'medium')

    const resolved = solve(puzzle, boxDims)
    expect(resolved).not.toBeNull()
    assertValidSolvedGrid(resolved as number[][], boxDims)
  })

  it('carved 9x9 puzzles have exactly one solution at every difficulty', () => {
    const boxDims = GRID_CONFIGS['9x9'].boxDims
    const solved = generateSolvedGrid(boxDims)

    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      const puzzle = carvePuzzle(solved, boxDims, difficulty)
      expect(countSolutions(puzzle, boxDims, 2)).toBe(1)
    }
  })
})

describe('validate', () => {
  it('flags duplicate values sharing a row, column, or box', () => {
    const boxDims = GRID_CONFIGS['9x9'].boxDims
    const grid = generateSolvedGrid(boxDims)
    grid[0][1] = grid[0][0]

    const conflicts = findConflicts(grid, boxDims)
    expect(conflicts[0][0]).toBe(true)
    expect(conflicts[0][1]).toBe(true)
    expect(conflicts[3][3]).toBe(false)
  })

  it('does not flag zeros (empty cells) as duplicates', () => {
    const boxDims = GRID_CONFIGS['9x9'].boxDims
    const grid = generateSolvedGrid(boxDims)
    grid[0][0] = 0
    grid[0][1] = 0

    const conflicts = findConflicts(grid, boxDims)
    expect(conflicts[0][0]).toBe(false)
    expect(conflicts[0][1]).toBe(false)
  })
})
