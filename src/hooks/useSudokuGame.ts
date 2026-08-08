import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BoxDims, Difficulty, Grid, GridSizeKey } from '../engine/types'
import { GRID_CONFIGS } from '../engine/types'
import { generateSolvedGrid } from '../engine/generate'
import { carvePuzzle } from '../engine/carve'
import { findConflicts, isGridComplete } from '../engine/validate'

export interface TypeSudokuGame {
  values: Grid
  given: boolean[][]
  conflicts: boolean[][]
  notes: number[][][]
  difficulty: Difficulty
  selected: [number, number] | null
  selectCell: (row: number, col: number) => void
  highlightedValue: number | null
  notesMode: boolean
  toggleNotesMode: () => void
  pressNumber: (value: number) => void
  setValue: (value: number) => void
  newGame: (difficulty: Difficulty) => void
  resetProgress: () => void
  complete: boolean
  elapsedMs: number
  setElapsedMs: (ms: number) => void
  size: number
  boxDims: BoxDims
}

interface PersistedState {
  puzzle: Grid
  values: Grid
  notes: number[][][]
  difficulty: Difficulty
  elapsedMs: number
}

const MAX_NOTES_PER_CELL = 4

function storageKey(gridSize: GridSizeKey): string {
  return `sudoku:${gridSize}`
}

function emptyNotes(size: number): number[][][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => []))
}

function createGame(gridSize: GridSizeKey, difficulty: Difficulty): PersistedState {
  const boxDims = GRID_CONFIGS[gridSize].boxDims
  const solved = generateSolvedGrid(boxDims)
  const puzzle = carvePuzzle(solved, boxDims, difficulty)
  return {
    puzzle,
    values: puzzle.map((row) => [...row]),
    notes: emptyNotes(boxDims.w * boxDims.h),
    difficulty,
    elapsedMs: 0,
  }
}

function loadGame(gridSize: GridSizeKey): PersistedState | null {
  const raw = localStorage.getItem(storageKey(gridSize))
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as PersistedState
    return { ...parsed, notes: parsed.notes ?? emptyNotes(parsed.puzzle.length) }
  } catch {
    return null
  }
}

export function useSudokuGame(gridSize: GridSizeKey): TypeSudokuGame {
  const boxDims = GRID_CONFIGS[gridSize].boxDims
  const [state, setState] = useState<PersistedState>(
    () => loadGame(gridSize) ?? createGame(gridSize, 'medium'),
  )
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [highlightedValue, setHighlightedValue] = useState<number | null>(null)
  const [notesMode, setNotesMode] = useState(false)

  useEffect(() => {
    localStorage.setItem(storageKey(gridSize), JSON.stringify(state))
  }, [gridSize, state])

  const setElapsedMs = useCallback((ms: number) => {
    setState((prev) => ({ ...prev, elapsedMs: ms }))
  }, [])

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

  const toggleHighlight = useCallback((value: number) => {
    setHighlightedValue((prev) => (prev === value ? null : value))
  }, [])

  const toggleNotesMode = useCallback(() => setNotesMode((prev) => !prev), [])

  const toggleNote = useCallback((row: number, col: number, value: number) => {
    setState((prev) => {
      const notes = prev.notes.map((r) => r.map((cell) => [...cell]))
      const cellNotes = notes[row][col]
      const idx = cellNotes.indexOf(value)
      if (idx !== -1) {
        cellNotes.splice(idx, 1)
      } else {
        if (cellNotes.length >= MAX_NOTES_PER_CELL) cellNotes.shift()
        cellNotes.push(value)
      }
      return { ...prev, notes }
    })
  }, [])

  const selectCell = useCallback(
    (row: number, col: number) => {
      if (given[row][col]) {
        setSelected(null)
        toggleHighlight(state.values[row][col])
        return
      }
      setHighlightedValue(null)
      setSelected((prev) => (prev && prev[0] === row && prev[1] === col ? null : [row, col]))
    },
    [given, state.values, toggleHighlight],
  )

  const pressNumber = useCallback(
    (value: number) => {
      if (selected) {
        const [row, col] = selected
        if (notesMode && state.values[row][col] === 0) {
          toggleNote(row, col, value)
        } else {
          setValue(state.values[row][col] === value ? 0 : value)
        }
      } else {
        toggleHighlight(value)
      }
    },
    [selected, notesMode, setValue, toggleHighlight, toggleNote, state.values],
  )

  const newGame = useCallback(
    (difficulty: Difficulty) => {
      setState(createGame(gridSize, difficulty))
      setSelected(null)
      setHighlightedValue(null)
      setNotesMode(false)
    },
    [gridSize],
  )

  const resetProgress = useCallback(() => {
    setState((prev) => ({
      ...prev,
      values: prev.puzzle.map((row) => [...row]),
      notes: emptyNotes(prev.puzzle.length),
      elapsedMs: 0,
    }))
    setSelected(null)
    setHighlightedValue(null)
    setNotesMode(false)
  }, [])

  return {
    values: state.values,
    given,
    conflicts,
    notes: state.notes,
    difficulty: state.difficulty,
    selected,
    selectCell,
    highlightedValue,
    notesMode,
    toggleNotesMode,
    pressNumber,
    setValue,
    newGame,
    resetProgress,
    complete,
    elapsedMs: state.elapsedMs ?? 0,
    setElapsedMs,
    size: boxDims.w * boxDims.h,
    boxDims,
  }
}
