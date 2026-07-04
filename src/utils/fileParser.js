import Papa from 'papaparse'
import * as XLSX from 'xlsx'

/**
 * Detects file type by extension and parses it into a plain array of
 * row objects. Both parsers run in "worker-free" mode for simplicity;
 * for truly huge files you can flip Papa's `worker: true` flag.
 */
export function parseFile(file) {
  const name = file.name.toLowerCase()

  if (name.endsWith('.csv')) {
    return parseCsv(file)
  }
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return parseExcel(file)
  }
  return Promise.reject(new Error('Unsupported file type. Please upload a .csv or .xlsx file.'))
}

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err)
    })
  })
}

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[firstSheetName]
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: null })
        resolve(rows)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}
