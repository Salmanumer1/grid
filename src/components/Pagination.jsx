import React from 'react'
import './Pagination.css'

export default function Pagination({ page, totalPages, totalRows, pageSize, onPageChange }) {
  if (totalRows === 0) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalRows)

  const goTo = (p) => onPageChange(Math.min(Math.max(p, 1), totalPages))

  return (
    <div className="pagination">
      <span className="pagination__summary mono">
        Showing {start.toLocaleString()}–{end.toLocaleString()} of {totalRows.toLocaleString()} rows
      </span>

      <div className="pagination__controls">
        <button onClick={() => goTo(1)} disabled={page === 1}>«</button>
        <button onClick={() => goTo(page - 1)} disabled={page === 1}>‹ Prev</button>
        <span className="pagination__page mono">
          Page {page} / {totalPages}
        </span>
        <button onClick={() => goTo(page + 1)} disabled={page === totalPages}>Next ›</button>
        <button onClick={() => goTo(totalPages)} disabled={page === totalPages}>»</button>
      </div>
    </div>
  )
}
