import React, { useRef, useState } from 'react'
import './FileUpload.css'

export default function FileUpload({ onFileLoaded, loading, error }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = (files) => {
    if (files && files[0]) onFileLoaded(files[0])
  }

  return (
    <div
      className={`upload-zone ${dragOver ? 'upload-zone--drag' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        handleFiles(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="upload-zone__icon">⇪</div>
      <p className="upload-zone__title">
        {loading ? 'Parsing file…' : 'Drop a CSV or Excel file here'}
      </p>
      <p className="upload-zone__hint">or click to browse · .csv .xlsx .xls</p>
      {error && <p className="upload-zone__error">{error}</p>}
    </div>
  )
}
