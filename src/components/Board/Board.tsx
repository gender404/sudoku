import classNames from 'classnames'
import type { CSSProperties } from 'react'
import type { BoxDims, DisplayMode, Grid } from '../../engine/types'
import { formatCellValue } from '../../engine/types'
import './Board.css'

interface BoardProps {
  values: Grid
  given: boolean[][]
  conflicts: boolean[][]
  notes: number[][][]
  selected: [number, number] | null
  highlightedValue: number | null
  boxDims: BoxDims
  displayMode: DisplayMode
  onSelect: (row: number, col: number) => void
}

export function Board({
  values,
  given,
  conflicts,
  notes,
  selected,
  highlightedValue,
  boxDims,
  displayMode,
  onSelect,
}: BoardProps) {
  const size = values.length

  return (
    <div className="board" style={{ '--size': size } as CSSProperties}>
      {values.map((row, r) =>
        row.map((value, c) => {
          const isSelected = selected?.[0] === r && selected?.[1] === c
          const cellClassName = classNames('cell', given[r][c] ? 'cell--given' : 'cell--entry', {
            'cell--selected': isSelected,
            'cell--highlighted': value !== 0 && value === highlightedValue,
            'cell--conflict': conflicts[r][c],
            'cell--conflict-active': isSelected && conflicts[r][c],
            'cell--box-right': (c + 1) % boxDims.w === 0 && c !== size - 1,
            'cell--box-bottom': (r + 1) % boxDims.h === 0 && r !== size - 1,
          })

          const cellNotes = notes[r][c]

          return (
            <button
              key={`${r}-${c}`}
              type="button"
              className={cellClassName}
              onClick={() => onSelect(r, c)}
            >
              {value !== 0 ? (
                formatCellValue(value, displayMode)
              ) : cellNotes.length > 0 ? (
                <span className="cell__notes">
                  {[...cellNotes]
                    .sort((a, b) => a - b)
                    .map((n) => (
                      <span key={n} className="cell__note">
                        {formatCellValue(n, displayMode)}
                      </span>
                    ))}
                </span>
              ) : (
                ''
              )}
            </button>
          )
        }),
      )}
    </div>
  )
}
