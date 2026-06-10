# Ao3-tide

a flat and clean skin for Ao3

## Build

```sh
npm run build
```

This writes:

- `dist/dark-base.css`
- `dist/dark-tablet.css`
- `dist/dark-phone.css`
- `dist/light-base.css`
- `dist/light-tablet.css`
- `dist/light-phone.css`
- `dist/ao3-user-skins.css`

`dist/ao3-user-skins.css` contains three AO3 site skins per theme, separated by
AO3 skin import markers: Base, Tablet, and Phone.

## Responsive Build

The original Tide instructions at
<https://archiveofourown.org/works/32660914> create separate AO3 site skins
for the base theme, the optional iPad/tablet fix, and the phone fix, then link
them with AO3 parent skins. This fork keeps the source CSS split the same way,
and writes AO3-safe split outputs.

To install on AO3, create three site skins for your chosen theme:

- Base: paste `dist/light-base.css` or `dist/dark-base.css`; leave Advanced
  Media at the default.
- Tablet: paste `dist/light-tablet.css` or `dist/dark-tablet.css`; set Advanced
  Media to only `only screen and (max-width: 62em)`.
- Phone: paste `dist/light-phone.css` or `dist/dark-phone.css`; set Advanced
  Media to only `only screen and (max-width: 42em)`, add Base and Tablet as parent
  skins, and use the Phone skin.

This matches AO3's skin model: responsive behavior comes from each skin's Media
setting, not from `@media` blocks inside one saved skin. Do not combine the
Base, Tablet, and Phone files into a single AO3 skin; AO3's CSS cleaner flattens
inline `@media` wrappers, which makes phone rules apply on desktop.

Important: for the Tablet and Phone skins, clear any other Media selections
such as `all` or `screen`. If Phone is saved with `screen` plus
`only screen and (max-width: 42em)`, AO3 will load the Phone skin on desktop
because `screen` matches desktop browsers.
