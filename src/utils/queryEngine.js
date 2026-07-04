import * as aq from 'arquero'

export const OPERATIONS = [
  { id: 'none', label: 'None (raw data)' },
  { id: 'groupby', label: 'Group By' },
  { id: 'orderby', label: 'Order By' },
  { id: 'distinct', label: 'Distinct' },
  { id: 'filter', label: 'Filter' },
  { id: 'aggregate', label: 'Aggregate (whole table)' }
]

export const AGG_FUNCS = ['sum', 'count', 'average', 'min', 'max']

export const FILTER_OPERATORS = [
  { id: 'eq', label: '=' },
  { id: 'neq', label: '≠' },
  { id: 'gt', label: '>' },
  { id: 'gte', label: '>=' },
  { id: 'lt', label: '<' },
  { id: 'lte', label: '<=' },
  { id: 'contains', label: 'contains' }
]

/** Build an arquero table from an array of plain row objects. */
export function toTable(rows) {
  return aq.from(rows)
}

/** Column names, in original order, from an arquero table. */
export function getColumns(table) {
  return table.columnNames()
}

/**
 * Runs the free-text search bar across every column of the table.
 * Case-insensitive substring match; a row matches if ANY column
 * contains the term.
 */
export function applySearch(table, term) {
  if (!term || !term.trim()) return table
  const needle = term.trim().toLowerCase()
  const cols = table.columnNames()

  const rows = table.objects().filter((row) =>
    cols.some((c) => {
      const v = row[c]
      return v !== null && v !== undefined && String(v).toLowerCase().includes(needle)
    })
  )
  return aq.from(rows)
}

/**
 * Applies the currently selected top-bar operation to a table.
 * `config` shape:
 *  { operation, column, column2, aggFunc, filterOperator, filterValue }
 */
export function applyOperation(table, config) {
  const { operation, column, column2, aggFunc, filterOperator, filterValue } = config

  switch (operation) {
    case 'groupby': {
      if (!column) return table
      const fn = aggFunc || 'count'
      const valueCol = column2 || column
      const outName = `${fn}_${valueCol}`
      return table
        .groupby(column)
        .rollup({ [outName]: aq.op[fn === 'average' ? 'mean' : fn](valueCol) })
        .orderby(aq.desc(outName))
    }

    case 'orderby': {
      if (!column) return table
      const dir = config.sortDir === 'desc' ? aq.desc(column) : column
      return table.orderby(dir)
    }

    case 'distinct': {
      return column ? table.dedupe(column) : table.dedupe()
    }

    case 'filter': {
      if (!column || filterValue === undefined || filterValue === '') return table
      return table
        .params({ col: column, val: filterValue })
        .filter((d, $) => {
          const cell = d[$.col]
          switch (filterOperator) {
            case 'eq': return cell == $.val
            case 'neq': return cell != $.val
            case 'gt': return cell > $.val
            case 'gte': return cell >= $.val
            case 'lt': return cell < $.val
            case 'lte': return cell <= $.val
            case 'contains': return String(cell).toLowerCase().includes(String($.val).toLowerCase())
            default: return true
          }
        })
    }

    case 'aggregate': {
      if (!column) return table
      const fn = aggFunc || 'count'
      const outName = `${fn}_${column}`
      return table.rollup({ [outName]: aq.op[fn === 'average' ? 'mean' : fn](column) })
    }

    default:
      return table
  }
}

/** Converts an arquero table back into plain row objects for AG Grid / ECharts. */
export function toRows(table) {
  return table.objects()
}
