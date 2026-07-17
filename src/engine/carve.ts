import type { BoxDims, Difficulty, Grid } from './types'
import { countSolutions } from './solve'

const CLUE_FRACTION: Record<Difficulty, number> = {
  easy: 0.55,
  medium: 0.45,
  hard: 0.35,
}

/** Above this grid size, uniqueness-checked carving (a countSolutions call per removal) is too slow for a first pass. */
const UNIQUENESS_CHECK_SIZE_LIMIT = 9

function shuffledIndices(count: number): number[] {
  const arr = Array.from({ length: count }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Removes clues from a solved grid down to a difficulty-based target.
 * For grids at or below UNIQUENESS_CHECK_SIZE_LIMIT (9x9), each removal is
 * re-checked with countSolutions to guarantee a unique solution. Larger
 * grids (25x25) skip that check and use a more generous clue floor instead —
 * a documented gap, not a silent one (see plan's "out of scope" section).
 */
export function carvePuzzle(solved: Grid, boxDims: BoxDims, difficulty: Difficulty): Grid {
  const size = boxDims.w * boxDims.h
  const puzzle = solved.map((row) => [...row])
  const cellOrder = shuffledIndices(size * size)
  const targetClues = Math.round(size * size * CLUE_FRACTION[difficulty])
  const checkUniqueness = size <= UNIQUENESS_CHECK_SIZE_LIMIT

  let clues = size * size

  for (const idx of cellOrder) {
    if (clues <= targetClues) break
    const row = Math.floor(idx / size)
    const col = idx % size
    const removed = puzzle[row][col]

    puzzle[row][col] = 0

    if (checkUniqueness && countSolutions(puzzle, boxDims, 2) !== 1) {
      puzzle[row][col] = removed
      continue
    }

    clues--
  }

  return puzzle
}
