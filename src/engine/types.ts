export type Grid = number[][]

export interface BoxDims {
  w: number
  h: number
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface GridConfig {
  boxDims: BoxDims
  label: string
}

export const GRID_CONFIGS = {
  '9x9': { boxDims: { w: 3, h: 3 }, label: '9 x 9' },
  '16x16': { boxDims: { w: 4, h: 4 }, label: '16 x 16' },
  '25x25': { boxDims: { w: 5, h: 5 }, label: '25 x 25' },
} as const satisfies Record<string, GridConfig>

export type GridSizeKey = keyof typeof GRID_CONFIGS
