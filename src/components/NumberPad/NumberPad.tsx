import classNames from 'classnames'
import type { DisplayMode } from '../../engine/types'
import { formatCellValue } from '../../engine/types'
import './NumberPad.css'

interface NumberPadProps {
  size: number
  numbersDisabled: boolean
  activeValues: number[]
  filledValues: number[]
  notesMode: boolean
  displayMode: DisplayMode
  onEnter: (value: number) => void
  onToggleNotesMode: () => void
}

export function NumberPad({
  size,
  numbersDisabled,
  activeValues,
  filledValues,
  notesMode,
  displayMode,
  onEnter,
  onToggleNotesMode,
}: NumberPadProps) {
  const numbers = Array.from({ length: size }, (_, i) => i + 1)

  return (
    <div className={classNames('number-pad', { 'number-pad--notes-mode': notesMode })}>
      {numbers.map((n) => (
        <button
          key={n}
          type="button"
          className={classNames('number-pad__button', {
            'number-pad__button--active': activeValues.includes(n),
            'number-pad__button--filled': filledValues.includes(n),
          })}
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
