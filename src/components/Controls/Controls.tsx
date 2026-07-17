import type { Difficulty, GridSizeKey } from '../../engine/types'
import { GRID_CONFIGS } from '../../engine/types'
import './Controls.css'

interface ControlsProps {
  gridSize: GridSizeKey
  difficulty: Difficulty
  elapsedSeconds: number
  complete: boolean
  onGridSizeChange: (size: GridSizeKey) => void
  onNewGame: (difficulty: Difficulty) => void
  onReset: () => void
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function Controls({
  gridSize,
  difficulty,
  elapsedSeconds,
  complete,
  onGridSizeChange,
  onNewGame,
  onReset,
}: ControlsProps) {
  return (
    <div className="controls">
      <label className="controls__field">
        Grid
        <select
          value={gridSize}
          onChange={(e) => onGridSizeChange(e.target.value as GridSizeKey)}
        >
          {Object.entries(GRID_CONFIGS).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
      </label>

      <label className="controls__field">
        Difficulty
        <select value={difficulty} onChange={(e) => onNewGame(e.target.value as Difficulty)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>

      <button type="button" onClick={() => onNewGame(difficulty)}>
        New game
      </button>
      <button type="button" onClick={onReset}>
        Reset
      </button>

      <span className="controls__timer">{formatTime(elapsedSeconds)}</span>
      {complete && <span className="controls__complete">Solved!</span>}
    </div>
  )
}
