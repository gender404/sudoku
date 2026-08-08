import type { CSSProperties } from 'react'
import type { BoxDims, Grid } from '../../engine/types'
import './Board.css'

interface BoardProps {
  values: Grid
  given: boolean[][]
  conflicts: boolean[][]
  selected: [number, number] | null
  highlightedValue: number | null
  boxDims: BoxDims
  onSelect: (row: number, col: number) => void
}

export function Board({
  values,
  given,
  conflicts,
  selected,
  highlightedValue,
  boxDims,
  onSelect,
}: BoardProps) {
  const size = values.length

  return (
    <div className="board" style={{ '--size': size } as CSSProperties}>
      {values.map((row, r) =>
        row.map((value, c) => {
          const isSelected = selected?.[0] === r && selected?.[1] === c
          const classNames = [
            'cell',
            given[r][c] ? 'cell--given' : 'cell--entry',
            isSelected && 'cell--selected',
            value !== 0 && value === highlightedValue && 'cell--highlighted',
            conflicts[r][c] && 'cell--conflict',
            isSelected && conflicts[r][c] && 'cell--conflict-active',
            (c + 1) % boxDims.w === 0 && c !== size - 1 && 'cell--box-right',
            (r + 1) % boxDims.h === 0 && r !== size - 1 && 'cell--box-bottom',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={`${r}-${c}`}
              type="button"
              className={classNames}
              onClick={() => onSelect(r, c)}
            >
              {value !== 0 ? value : ''}
            </button>
          )
        }),
      )}
    </div>
  )
}
