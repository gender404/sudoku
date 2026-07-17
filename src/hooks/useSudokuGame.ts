import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Difficulty, Grid, GridSizeKey } from '../engine/types'
import { GRID_CONFIGS } from '../engine/types'
import { generateSolvedGrid } from '../engine/generate'
import { carvePuzzle } from '../engine/carve'
import { findConflicts, isGridComplete } from '../engine/validate'

interface PersistedState {
  puzzle: Grid
  values: Grid
  difficulty: Difficulty
  startedAt: number
}

function storageKey(gridSize: GridSizeKey): string {
  return `sudoku:${gridSize}`
}

function createGame(gridSize: GridSizeKey, difficulty: Difficulty): PersistedState {
  const boxDims = GRID_CONFIGS[gridSize].boxDims
  const solved = generateSolvedGrid(boxDims)
  const puzzle = carvePuzzle(solved, boxDims, difficulty)
  return {
    puzzle,
    values: puzzle.map((row) => [...row]),
    difficulty,
    startedAt: Date.now(),
  }
}

function loadGame(gridSize: GridSizeKey): PersistedState | null {
  const raw = localStorage.getItem(storageKey(gridSize))
  if (!raw) return null
  try {
    return JSON.parse(raw) as PersistedState
  } catch {
    return null
  }
}

export function useSudokuGame(gridSize: GridSizeKey) {
  const boxDims = GRID_CONFIGS[gridSize].boxDims
  const [state, setState] = useState<PersistedState>(
    () => loadGame(gridSize) ?? createGame(gridSize, 'medium'),
  )
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    Math.floor((Date.now() - state.startedAt) / 1000),
  )

  useEffect(() => {
    localStorage.setItem(storageKey(gridSize), JSON.stringify(state))
  }, [gridSize, state])

  useEffect(() => {
    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - state.startedAt) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [state.startedAt])

  const given = useMemo(
    () => state.puzzle.map((row) => row.map((value) => value !== 0)),
    [state.puzzle],
  )

  const conflicts = useMemo(() => findConflicts(state.values, boxDims), [state.values, boxDims])

  const complete = useMemo(
    () => isGridComplete(state.values) && !conflicts.flat().some(Boolean),
    [state.values, conflicts],
  )

  const setValue = useCallback(
    (value: number) => {
      if (!selected) return
      const [row, col] = selected
      if (given[row][col]) return
      setState((prev) => {
        const values = prev.values.map((r) => [...r])
        values[row][col] = value
        return { ...prev, values }
      })
    },
    [selected, given],
  )

  const clearCell = useCallback(() => setValue(0), [setValue])

  const newGame = useCallback(
    (difficulty: Difficulty) => {
      setState(createGame(gridSize, difficulty))
      setSelected(null)
    },
    [gridSize],
  )

  const resetProgress = useCallback(() => {
    setState((prev) => ({
      ...prev,
      values: prev.puzzle.map((row) => [...row]),
      startedAt: Date.now(),
    }))
    setSelected(null)
  }, [])

  return {
    values: state.values,
    given,
    conflicts,
    difficulty: state.difficulty,
    selected,
    selectCell: (row: number, col: number) => setSelected([row, col]),
    setValue,
    clearCell,
    newGame,
    resetProgress,
    complete,
    elapsedSeconds,
    size: boxDims.w * boxDims.h,
    boxDims,
  }
}
