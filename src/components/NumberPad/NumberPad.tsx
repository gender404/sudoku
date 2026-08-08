import type { DisplayMode } from '../../engine/types'
import { formatCellValue } from '../../engine/types'
import './NumberPad.css'

interface NumberPadProps {
  size: number
  numbersDisabled: boolean
  activeValues: number[]
  notesMode: boolean
  displayMode: DisplayMode
  onEnter: (value: number) => void
  onToggleNotesMode: () => void
}

export function NumberPad({
  size,
  numbersDisabled,
  activeValues,
  notesMode,
  displayMode,
  onEnter,
  onToggleNotesMode,
}: NumberPadProps) {
  const numbers = Array.from({ length: size }, (_, i) => i + 1)

  return (
    <div className={'number-pad' + (notesMode ? ' number-pad--notes-mode' : '')}>
      {numbers.map((n) => (
        <button
          key={n}
          type="button"
          className={
            'number-pad__button' + (activeValues.includes(n) ? ' number-pad__button--active' : '')
          }
          onClick={() => onEnter(n)}
          disabled={numbersDisabled}
          aria-pressed={activeValues.includes(n)}
        >
          {formatCellValue(n, displayMode)}
        </button>
      ))}
      <button
        type="button"
        className="number-pad__button number-pad__button--notes"
        onClick={onToggleNotesMode}
        aria-pressed={notesMode}
      >
        Notes
      </button>
    </div>
  )
}
