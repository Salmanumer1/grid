import React, { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import './DataTable.css'

export default function DataTable({ rows, columns }) {
  const columnDefs = useMemo(
    () =>
      columns.map((col) => ({
        field: col,
        headerName: col,
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 130
      })),
    [columns]
  )

  const defaultColDef = useMemo(
    () => ({ flex: 1, minWidth: 100, sortable: true, resizable: true }),
    []
  )

  return (
    <div className="ag-theme-alpine data-table">
      <AgGridReact
        rowData={rows}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowHeight={34}
        headerHeight={38}
        animateRows={true}
        pagination={false /* pagination is handled by our own Pagination component */}
        suppressCellFocus={true}
      />
    </div>
  )
}
