export type Grid = number[][]

export interface BoxDims {
  w: number
  h: number
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export type DisplayMode = 'number' | 'hex' | 'alpha'

export interface GridConfig {
  boxDims: BoxDims
  label: string
  displayMode: DisplayMode
}

export const GRID_CONFIGS = {
  '9x9': { boxDims: { w: 3, h: 3 }, label: '9 x 9', displayMode: 'number' },
  '16x16': { boxDims: { w: 4, h: 4 }, label: '16 x 16', displayMode: 'hex' },
  '25x25': { boxDims: { w: 5, h: 5 }, label: '25 x 25', displayMode: 'alpha' },
} as const satisfies Record<string, GridConfig>

export type GridSizeKey = keyof typeof GRID_CONFIGS

/** Renders a cell's raw 1-based value as the character set its grid size uses to display it. */
export function formatCellValue(value: number, displayMode: DisplayMode): string {
  switch (displayMode) {
    case 'hex':
      return (value - 1).toString(16).toUpperCase()
    case 'alpha':
      return String.fromCharCode(64 + value)
    case 'number':
      return String(value)
  }
}
