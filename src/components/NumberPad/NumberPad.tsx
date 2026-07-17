import './NumberPad.css'

interface NumberPadProps {
  size: number
  disabled: boolean
  onEnter: (value: number) => void
  onClear: () => void
}

export function NumberPad({ size, disabled, onEnter, onClear }: NumberPadProps) {
  const numbers = Array.from({ length: size }, (_, i) => i + 1)

  return (
    <div className="number-pad">
      {numbers.map((n) => (
        <button
          key={n}
          type="button"
          className="number-pad__button"
          onClick={() => onEnter(n)}
          disabled={disabled}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        className="number-pad__button number-pad__button--clear"
        onClick={onClear}
        disabled={disabled}
      >
        Clear
      </button>
    </div>
  )
}
