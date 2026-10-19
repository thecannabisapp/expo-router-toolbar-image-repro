# expo-router `Stack.Toolbar.Button image` ignored on left/right placements

Minimal repro for two related issues with custom images in Expo Router native
stack toolbars (`expo-router` toolbar API, iOS):

1. **`Stack.Toolbar.Button image` is silently ignored on `placement="left"` /
   `placement="right"`.** The decoded image never renders; the button falls back
   to the SF Symbol given via `icon`. The same `image` prop **works** on
   `placement="bottom"`.
2. **`icon={{ uri }}` (image source) renders at the bitmap's natural pixel
   size** — a 512px source renders ~512pt tall and overflows the navigation
   bar. There is no sizing option on the button.

## Run

```bash
npm install
npx expo run:ios
```

Requires a dev build (the native toolbar API is not available in Expo Go).
Open the app on iOS:

- **Top-right, first button** — `image` prop fed with a decoded 36px
  `expo-image` ref (`useImage(url, { maxWidth: 36, maxHeight: 36 })`).
  *Expected:* 36pt avatar. *Actual:* SF Symbol placeholder; the decoded image
  is ignored.
- **Top-right, second button** — `icon={{ uri }}` with a 512px source.
  *Actual:* renders at natural pixel size (~512pt), overflowing the bar.
- **Bottom toolbar** — the same `image` prop without a placement.
  *Actual:* works (36pt image in the bottom toolbar).

## Key screen

[`src/app/index.tsx`](src/app/index.tsx) — a single screen with all three
buttons and on-screen expected/actual notes.

## Tested versions

Repro scaffolded with: `expo ~58.0.16`, `expo-router ~58.0.24`,
`react-native-screens ~4.30.0`, `react-native 0.88.0`, iOS Simulator
(iPhone 17 Pro Max, iOS 26.5), New Architecture.

Also reproduced on: `expo 57.0.17`, `expo-router 57.0.17`,
`react-native-screens 4.25.2`, `react-native 0.86.3`.

## Code-path analysis (why it drops the image)

For `placement="left"` / `"right"`, toolbar children are converted into
`unstable_headerLeftItems` / `unstable_headerRightItems` options
(`expo-router/build/layouts/stack-utils/toolbar/processHeaderItemsForPlatform.ios.js`),
then processed by `useHeaderConfigProps` into
`headerLeftBarButtonItems` / `headerRightBarButtonItems`
(`expo-router/build/react-navigation/native-stack/views/useHeaderConfigProps.js`),
and rendered natively by react-native-screens
(`src/components/helpers/prepareHeaderBarButtonItems.ts` →
`ios/RNSBarButtonItem.mm`).

That whole pipeline only understands these icon shapes:

- `icon.type === 'sfSymbol'` → `sfSymbolName`
- `icon.type === 'imageSource'` / `'templateSource'` → `imageSource` /
  `templateSource` (loaded by the RN image loader at natural size — no
  downscaling)
- `icon.type === 'xcasset'` → `xcassetName`

The button's `image` prop (an `expo-image` `SharedRef<'image'>` /
`ImageRef`) is carried through the item object but **never read** by any
consumer on this path. It is only consumed by expo-router's own Swift toolbar
host (`RouterToolbarItemView.swift` reads `customImage`), which is mounted for
`placement="bottom"` — which is why the bottom toolbar works.

Suggested directions (either would fix it):

- Map the `image` prop through the left/right pipeline (requires a
  SharedRef-capable bar button item in react-native-screens), or
- Route left/right buttons through expo-router's own toolbar host, or
- At minimum, `console.warn` (dev only) when `image` is used with a
  left/right placement, matching the existing warning for `icon` image
  sources on `placement="bottom"`.

## Related

- Custom RN views in header slots (`Stack.Toolbar.View`) have separate
  mounting issues on this stack: expo/expo#51825.
