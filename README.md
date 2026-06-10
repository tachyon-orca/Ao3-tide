# Ao3-tide

a flat and clean skin for Ao3

## Build

```sh
npm run build
```

This writes:

- `dist/dark-combined.css`
- `dist/light-combined.css`
- `dist/ao3-user-skins.css`

`dist/ao3-user-skins.css` contains two AO3 site skins, `AO3 Tide Dark` and
`AO3 Tide Light`, separated by AO3 skin import markers.

## Responsive Build

The original Tide instructions at
<https://archiveofourown.org/works/32660914> create separate AO3 site skins
for the base theme, the optional iPad/tablet fix, and the phone fix, then link
them with AO3 parent skins. This fork keeps the source CSS split the same way,
but the build step combines those pieces into one adaptive skin per theme.

`scripts/build.js` appends the tablet and phone files after the base CSS:

- `ipad-fix.css` is wrapped in `@media screen and (max-width: 62em)`.
- `mobile-fix.css` is wrapped in `@media screen and (max-width: 42em)`.
- The phone block comes after the tablet block, so phone-specific rules win
  when both media queries match.

Use `dist/dark-combined.css`, `dist/light-combined.css`, or the generated
AO3 import file instead of manually creating parent-child skin relationships.
