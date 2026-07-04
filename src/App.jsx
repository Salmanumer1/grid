import React, { useEffect, useMemo, useState } from 'react'
import FileUpload from './components/FileUpload.jsx'
import OperationBar from './components/OperationBar.jsx'
import DataTable from './components/DataTable.jsx'
import ChartPanel from './components/ChartPanel.jsx'
import Pagination from './components/Pagination.jsx'
import { toTable, getColumns, applySearch, applyOperation, toRows } from './utils/queryEngine.js'
import { parseFile } from './utils/fileParser.js'
import './App.css'

const PAGE_SIZE = 200

const DEFAULT_CONFIG = {
  operation: 'none',
  column: '',
  column2: '',
  aggFunc: 'count',
  sortDir: 'asc',
  filterOperator: 'eq',
  filterValue: ''
}

export default function App() {
  const [fileName, setFileName] = useState('')
  const [rawRows, setRawRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [page, setPage] = useState(1)

  const handleFileLoaded = async (file) => {
    setLoading(true)
    setUploadError('')
    try {
      const rows = await parseFile(file)
      setRawRows(rows)
      setFileName(file.name)
      setConfig(DEFAULT_CONFIG)
      setSearchTerm('')
      setPage(1)
    } catch (err) {
      setUploadError(err.message || 'Failed to parse file.')
    } finally {
      setLoading(false)
    }
  }

  const baseTable = useMemo(() => (rawRows.length ? toTable(rawRows) : null), [rawRows])
  const sourceColumns = useMemo(() => (baseTable ? getColumns(baseTable) : []), [baseTable])

  // Coerce the filter value to a number for numeric comparisons.
  const normalizedConfig = useMemo(() => {
    if (config.operation !== 'filter' || config.filterOperator === 'contains') return config
    const num = Number(config.filterValue)
    if (config.filterValue !== '' && !Number.isNaN(num)) {
      return { ...config, filterValue: num }
    }
    return config
  }, [config])

  const processedTable = useMemo(() => {
    if (!baseTable) return null
    const searched = applySearch(baseTable, searchTerm)
    return applyOperation(searched, normalizedConfig)
  }, [baseTable, searchTerm, normalizedConfig])

  const processedRows = useMemo(() => (processedTable ? toRows(processedTable) : []), [processedTable])
  const processedColumns = useMemo(() => (processedTable ? getColumns(processedTable) : []), [processedTable])

  useEffect(() => { setPage(1) }, [searchTerm, config])

  const totalRows = processedRows.length
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE))
  const pageRows = useMemo(
    () => processedRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [processedRows, page]
  )

  const resetAll = () => {
    setConfig(DEFAULT_CONFIG)
    setSearchTerm('')
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__brand-dot" />
          <span className="app__brand-name">DataForge</span>
          <span className="app__brand-tag mono">in-browser analytics engine</span>
        </div>
        {rawRows.length > 0 && (
          <div className="app__status mono">
            <span>{fileName}</span>
            <span className="app__status-sep">·</span>
            <span>{rawRows.length.toLocaleString()} rows</span>
            <span className="app__status-sep">·</span>
            <span>{sourceColumns.length} columns</span>
          </div>
        )}
      </header>

      <main className="app__main">
        {rawRows.length === 0 ? (
          <FileUpload onFileLoaded={handleFileLoaded} loading={loading} error={uploadError} />
        ) : (
          <>
            <OperationBar
              columns={sourceColumns}
              config={config}
              onChange={setConfig}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onReset={resetAll}
            />

            <DataTable rows={pageRows} columns={processedColumns} />

            <Pagination
              page={page}
              totalPages={totalPages}
              totalRows={totalRows}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />

            <ChartPanel rows={processedRows} columns={processedColumns} />

            <div className="app__reload">
              <button onClick={() => { setRawRows([]); setFileName('') }}>Load a different file</button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
