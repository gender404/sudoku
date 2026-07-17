# Sudoku

A sudoku app for two grid sizes: standard 9x9 and a 25x25 variant, built with
Vite + React + TypeScript. No backend — each puzzle plays entirely on-device,
with progress saved to `localStorage` separately per grid size, so a 9x9 game
and a 25x25 game never collide even on the same device.

Wrapped with [Capacitor](https://capacitorjs.com/) so the same web build also
installs as a native iOS app.

## Engine (`src/engine/`)

Framework-agnostic TypeScript, generic over box dimensions so 9x9 (3x3 boxes)
and 25x25 (5x5 boxes) share one implementation:

- `generate.ts` — builds a solved grid via band/stack shuffling (no
  backtracking needed, so it's instant even at 625 cells).
- `solve.ts` — MRV (minimum-remaining-values) backtracking solver; also powers
  `countSolutions`, used as a uniqueness check.
- `carve.ts` — removes clues down to a difficulty target. For 9x9, every
  removal is re-verified with `countSolutions` to guarantee a unique solution.
  **For 25x25 this uniqueness check is skipped** — re-solving a
  300+-empty-cell 25x25 grid is combinatorially expensive with only
  row/col/box masking (no advanced constraint propagation), so the first pass
  just uses a more generous clue floor instead. A documented gap, not a
  silent one — the app itself never calls the solver during play, only while
  building a fresh puzzle, so this doesn't affect runtime performance.
- `validate.ts` — row/col/box conflict detection for live highlighting.

## Development

```bash
npm install
npm run dev      # start the Vite dev server
npm test         # run the engine's Vitest suite
npm run build    # production build to dist/
```

## Running on iOS

This Mac has full Xcode (not just Command Line Tools) and this version of
Capacitor uses Swift Package Manager instead of CocoaPods, so no `pod
install` step is needed.

```bash
npm run build       # refresh dist/
npx cap sync ios    # copy the web build into the iOS project
```

Then open `ios/App/App.xcodeproj` in Xcode (not a `.xcworkspace` — there
isn't one, since there's no CocoaPods step), pick a simulator or your device,
set your signing team under the App target's "Signing & Capabilities" tab if
running on a physical device, and hit Run.

Verified working: `xcodebuild ... -sdk iphonesimulator build` succeeds, and
the app boots and plays correctly in the iOS Simulator.

Not set up yet: App Store submission, and the Android platform (`npx cap add
android` would add it the same way iOS was added).
