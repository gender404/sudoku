import { useEffect, useState } from 'react'
import type { Difficulty, GridSizeKey } from '../../engine/types'
import { GRID_CONFIGS } from '../../engine/types'
import { useElapsedTimer } from '../../hooks/useElapsedTimer'
import './Controls.css'

interface ControlsProps {
  gridSize: GridSizeKey
  difficulty: Difficulty
  elapsedMs: number
  onPersistElapsed: (ms: number) => void
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
  elapsedMs,
  onPersistElapsed,
  complete,
  onGridSizeChange,
  onNewGame,
  onReset,
}: ControlsProps) {
  const [manuallyPaused, setManuallyPaused] = useState(false)

  // A fresh puzzle (new game or reset) always starts unpaused, even if the previous one was left paused.
  useEffect(() => {
    if (elapsedMs === 0) setManuallyPaused(false)
  }, [elapsedMs])

  const elapsedSeconds = useElapsedTimer(elapsedMs, onPersistElapsed, complete || manuallyPaused)
  const timerText = (manuallyPaused ? '⏸ ' : '') + formatTime(elapsedSeconds)

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

      <button
        type="button"
        className={'controls__timer' + (manuallyPaused ? ' controls__timer--paused' : '')}
        onClick={() => setManuallyPaused((prev) => !prev)}
        disabled={complete}
        aria-pressed={manuallyPaused}
        aria-label={`Pause timer - ${timerText}`}
      >
        {timerText}
      </button>
      {complete && <span className="controls__complete">Solved!</span>}
    </div>
  )
}
