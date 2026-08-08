import { useState } from 'react'
import type { GridSizeKey } from './engine/types'
import { GRID_CONFIGS } from './engine/types'
import { useSudokuGame, type TypeSudokuGame } from './hooks/useSudokuGame'
import { Board } from './components/Board/Board'
import { NumberPad } from './components/NumberPad/NumberPad'
import { Controls } from './components/Controls/Controls'
import './App.css'

const LAST_GRID_SIZE_KEY = 'sudoku:last-grid-size'

function isGridSizeKey(value: string | null): value is GridSizeKey {
  return value !== null && value in GRID_CONFIGS
}

function loadLastGridSize(): GridSizeKey {
  const stored = localStorage.getItem(LAST_GRID_SIZE_KEY)
  return isGridSizeKey(stored) ? stored : '9x9'
}

interface GameScreenProps {
  gridSize: GridSizeKey
  onGridSizeChange: (size: GridSizeKey) => void
}

function GameScreen({ gridSize, onGridSizeChange }: GameScreenProps) {
  const game: TypeSudokuGame = useSudokuGame(gridSize)
  const displayMode = GRID_CONFIGS[gridSize].displayMode
  const selectedIsGiven = game.selected !== null && game.given[game.selected[0]][game.selected[1]]
  const selectedValue = game.selected ? game.values[game.selected[0]][game.selected[1]] : 0
  const activeValues = game.selected
    ? selectedValue !== 0
      ? [selectedValue]
      : game.notes[game.selected[0]][game.selected[1]]
    : game.highlightedValue !== null
      ? [game.highlightedValue]
      : []

  return (
    <div className="game">
      <Controls
        gridSize={gridSize}
        difficulty={game.difficulty}
        elapsedMs={game.elapsedMs}
        onPersistElapsed={game.setElapsedMs}
        complete={game.complete}
        onGridSizeChange={onGridSizeChange}
        onNewGame={game.newGame}
        onReset={game.resetProgress}
      />
      <Board
        values={game.values}
        given={game.given}
        conflicts={game.conflicts}
        notes={game.notes}
        selected={game.selected}
        highlightedValue={game.highlightedValue}
        boxDims={game.boxDims}
        displayMode={displayMode}
        onSelect={game.selectCell}
      />
      <NumberPad
        size={game.size}
        numbersDisabled={selectedIsGiven}
        activeValues={activeValues}
        notesMode={game.notesMode}
        displayMode={displayMode}
        onEnter={game.pressNumber}
        onToggleNotesMode={game.toggleNotesMode}
      />
    </div>
  )
}

function App() {
  const [gridSize, setGridSize] = useState<GridSizeKey>(loadLastGridSize)

  const handleGridSizeChange = (size: GridSizeKey) => {
    localStorage.setItem(LAST_GRID_SIZE_KEY, size)
    setGridSize(size)
  }

  return (
    <div className="app">
      <h1>Sudoku</h1>
      <GameScreen key={gridSize} gridSize={gridSize} onGridSizeChange={handleGridSizeChange} />
    </div>
  )
}

export default App
