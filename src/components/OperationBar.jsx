import React from 'react'
import { OPERATIONS, AGG_FUNCS, FILTER_OPERATORS } from '../utils/queryEngine.js'
import './OperationBar.css'

export default function OperationBar({ columns, config, onChange, searchTerm, onSearchChange, onReset }) {
  const set = (patch) => onChange({ ...config, ...patch })

  const needsColumn = ['groupby', 'orderby', 'distinct', 'filter', 'aggregate'].includes(config.operation)
  const needsAggFunc = ['groupby', 'aggregate'].includes(config.operation)
  const needsValueColumn = config.operation === 'groupby'
  const needsSortDir = config.operation === 'orderby'
  const needsFilter = config.operation === 'filter'

  return (
    <div className="opbar">
      <div className="opbar__row">
        <div className="opbar__field">
          <label>Operation</label>
          <select value={config.operation} onChange={(e) => set({ operation: e.target.value })}>
            {OPERATIONS.map((op) => (
              <option key={op.id} value={op.id}>{op.label}</option>
            ))}
          </select>
        </div>

        {needsColumn && (
          <div className="opbar__field">
            <label>Column</label>
            <select value={config.column || ''} onChange={(e) => set({ column: e.target.value })}>
              <option value="">Select field…</option>
              {columns.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {needsValueColumn && (
          <div className="opbar__field">
            <label>Value field</label>
            <select value={config.column2 || ''} onChange={(e) => set({ column2: e.target.value })}>
              <option value="">Same as group field</option>
              {columns.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {needsAggFunc && (
          <div className="opbar__field">
            <label>Aggregation</label>
            <select value={config.aggFunc || 'count'} onChange={(e) => set({ aggFunc: e.target.value })}>
              {AGG_FUNCS.map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}
            </select>
          </div>
        )}

        {needsSortDir && (
          <div className="opbar__field">
            <label>Direction</label>
            <select value={config.sortDir || 'asc'} onChange={(e) => set({ sortDir: e.target.value })}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        )}

        {needsFilter && (
          <>
            <div className="opbar__field">
              <label>Condition</label>
              <select value={config.filterOperator || 'eq'} onChange={(e) => set({ filterOperator: e.target.value })}>
                {FILTER_OPERATORS.map((op) => <option key={op.id} value={op.id}>{op.label}</option>)}
              </select>
            </div>
            <div className="opbar__field">
              <label>Value</label>
              <input
                type="text"
                placeholder="e.g. 50"
                value={config.filterValue ?? ''}
                onChange={(e) => set({ filterValue: e.target.value })}
              />
            </div>
          </>
        )}

        <button className="opbar__reset" onClick={onReset}>Reset</button>
      </div>

      <div className="opbar__row opbar__row--search">
        <span className="opbar__search-icon">⌕</span>
        <input
          className="opbar__search"
          type="text"
          placeholder="Search across all columns…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button className="opbar__clear" onClick={() => onSearchChange('')}>✕</button>
        )}
      </div>
    </div>
  )
}
