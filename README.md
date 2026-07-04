# DataForge — In-Browser Analytics Dashboard

A React app that lets you upload a CSV or Excel file and run SQL-like
operations (Group By, Order By, Distinct, Filter, Search, Sum, Count,
Avg, Min, Max) entirely in the browser — no backend, no database.

## Stack

| Library         | Role                                      |
|-----------------|-------------------------------------------|
| Papa Parse      | Parses CSV files                          |
| SheetJS (xlsx)  | Parses Excel files                        |
| Arquero         | SQL-like in-memory data engine            |
| AG Grid         | Virtualized, high-performance data table  |
| Apache ECharts  | Interactive charts (via echarts-for-react)|

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`) and
drag in a `.csv` or `.xlsx` file.

## File structure

```
analytics-dashboard/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx              # React root
│   ├── App.jsx                # Top-level state + layout
│   ├── App.css
│   ├── index.css              # Design tokens / global styles
│   ├── components/
│   │   ├── FileUpload.jsx     # Drag-and-drop file input
│   │   ├── FileUpload.css
│   │   ├── OperationBar.jsx   # Top bar: operation/column/agg/search
│   │   ├── OperationBar.css
│   │   ├── DataTable.jsx      # AG Grid wrapper
│   │   ├── DataTable.css
│   │   ├── ChartPanel.jsx     # ECharts wrapper
│   │   ├── ChartPanel.css
│   │   ├── Pagination.jsx     # 200-rows-per-page controls
│   │   └── Pagination.css
│   └── utils/
│       ├── fileParser.js      # CSV/Excel -> array of row objects
│       └── queryEngine.js     # Arquero operations (the "SQL engine")
```

## How the data flows

1. **`fileParser.js`** reads the uploaded file with Papa Parse (CSV) or
   SheetJS (Excel) and returns a plain array of row objects.
2. **`App.jsx`** wraps that array in an Arquero table (`toTable`).
3. Whenever you change the top-bar **operation** or type in the
   **search bar**, `App.jsx` re-runs `applySearch` then `applyOperation`
   from `queryEngine.js` and gets back a new Arquero table.
4. That result is converted to plain rows (`toRows`), sliced into
   200-row pages by `Pagination.jsx`, rendered in `DataTable.jsx`
   (AG Grid), and charted in full by `ChartPanel.jsx` (ECharts).

## Operations reference

- **Group By** — pick a group column, a value field, and an
  aggregation (SUM/COUNT/AVERAGE/MIN/MAX).
- **Order By** — pick a column and Ascending/Descending.
- **Distinct** — pick a column to de-duplicate on (or none, for
  whole-row distinct).
- **Filter** — pick a column, a condition (=, ≠, >, >=, <, <=,
  contains), and a value.
- **Aggregate** — runs one SUM/COUNT/AVERAGE/MIN/MAX across the
  *entire* table for a chosen column.
- **Search bar** — always active, matches the term against every
  column, independent of the operation above.

## Notes on scale

Arquero and AG Grid are both built for large in-memory datasets, but
"millions of rows" in a browser tab is still bounded by the user's
RAM. For files beyond a few hundred MB, consider:
- Parsing with `worker: true` in Papa Parse (already wired for you to
  flip on in `fileParser.js`).
- Loading only the columns you need before further processing.
