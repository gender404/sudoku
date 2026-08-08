import { useState } from 'react'
import type { GridSizeKey } from './engine/types'
import { useSudokuGame, type TypeSudokuGame } from './hooks/useSudokuGame'
import { Board } from './components/Board/Board'
import { NumberPad } from './components/NumberPad/NumberPad'
import { Controls } from './components/Controls/Controls'
import './App.css'

const LAST_GRID_SIZE_KEY = 'sudoku:last-grid-size'

function loadLastGridSize(): GridSizeKey {
  const stored = localStorage.getItem(LAST_GRID_SIZE_KEY)
  return stored === '9x9' || stored === '25x25' ? stored : '9x9'
}

interface GameScreenProps {
  gridSize: GridSizeKey
  onGridSizeChange: (size: GridSizeKey) => void
}

function GameScreen({ gridSize, onGridSizeChange }: GameScreenProps) {
  const game: TypeSudokuGame = useSudokuGame(gridSize)
  const selectedIsGiven = game.selected !== null && game.given[game.selected[0]][game.selected[1]]

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
        selected={game.selected}
        highlightedValue={game.highlightedValue}
        boxDims={game.boxDims}
        onSelect={game.selectCell}
      />
      <NumberPad
        size={game.size}
        numbersDisabled={selectedIsGiven}
        clearDisabled={game.selected === null || selectedIsGiven}
        highlightedValue={game.highlightedValue}
        onEnter={game.pressNumber}
        onClear={game.clearCell}
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
