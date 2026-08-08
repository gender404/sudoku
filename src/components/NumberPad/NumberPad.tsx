import './NumberPad.css'

interface NumberPadProps {
  size: number
  numbersDisabled: boolean
  clearDisabled: boolean
  highlightedValue: number | null
  onEnter: (value: number) => void
  onClear: () => void
}

export function NumberPad({
  size,
  numbersDisabled,
  clearDisabled,
  highlightedValue,
  onEnter,
  onClear,
}: NumberPadProps) {
  const numbers = Array.from({ length: size }, (_, i) => i + 1)

  return (
    <div className="number-pad">
      {numbers.map((n) => (
        <button
          key={n}
          type="button"
          className={
            'number-pad__button' + (n === highlightedValue ? ' number-pad__button--active' : '')
          }
          onClick={() => onEnter(n)}
          disabled={numbersDisabled}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        className="number-pad__button number-pad__button--clear"
        onClick={onClear}
        disabled={clearDisabled}
      >
        Clear
      </button>
    </div>
  )
}
