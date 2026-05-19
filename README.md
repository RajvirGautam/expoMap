# expoMap

Interactive floor map for tech expos and college fests. Click a booth to see who's there.

## Run locally

The map loads booth data with `fetch`, so serve the folder instead of opening the file directly:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Search

Type in the search box to dim booths that don't match by id, name or category.

- `/` focuses the search box
- `Enter` opens the first matching booth
- `Esc` clears the search

## Booth data

Booths live in `data/booths.json`. Each booth sits on an 8-column grid:

| field | meaning |
|---|---|
| `id` | booth label shown on the map |
| `name` | who is at the booth |
| `category` | `hardware`, `software`, `startup`, `food` or `info` |
| `col`, `row` | top-left grid cell (1-based) |
| `w`, `h` | width and height in cells |
