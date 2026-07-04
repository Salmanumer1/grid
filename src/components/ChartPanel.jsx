import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import './ChartPanel.css'

function isNumeric(v) {
  return typeof v === 'number' && !Number.isNaN(v)
}

/** Picks a sensible {category, value} column pair from whatever the query engine returned. */
function pickAxes(rows, columns) {
  if (!rows.length) return null
  const sample = rows[0]
  const numericCols = columns.filter((c) => isNumeric(sample[c]))
  const categoryCols = columns.filter((c) => !numericCols.includes(c))
  if (!numericCols.length) return null
  return {
    category: categoryCols[0] || columns[0],
    value: numericCols[0]
  }
}

export default function ChartPanel({ rows, columns }) {
  const option = useMemo(() => {
    if (!rows || !rows.length) return null

    // Single-row aggregate result (e.g. whole-table SUM/AVG) -> big-number style bar.
    if (rows.length === 1) {
      const row = rows[0]
      return {
        backgroundColor: 'transparent',
        textStyle: { color: '#9aa7b6', fontFamily: 'JetBrains Mono' },
        xAxis: { type: 'category', data: columns, axisLabel: { color: '#9aa7b6' } },
        yAxis: { type: 'value', axisLabel: { color: '#9aa7b6' } },
        series: [{
          type: 'bar',
          data: columns.map((c) => row[c]),
          itemStyle: { color: '#f2b84b', borderRadius: [4, 4, 0, 0] }
        }],
        grid: { left: 50, right: 20, top: 20, bottom: 40 }
      }
    }

    const axes = pickAxes(rows, columns)
    if (!axes) return null

    const top = rows.slice(0, 30) // keep the chart legible
    return {
      backgroundColor: 'transparent',
      textStyle: { color: '#9aa7b6', fontFamily: 'JetBrains Mono' },
      tooltip: { trigger: 'axis' },
      grid: { left: 60, right: 20, top: 20, bottom: 70 },
      xAxis: {
        type: 'category',
        data: top.map((r) => String(r[axes.category])),
        axisLabel: { color: '#9aa7b6', rotate: 35, fontSize: 10 }
      },
      yAxis: { type: 'value', axisLabel: { color: '#9aa7b6' } },
      series: [{
        type: 'bar',
        data: top.map((r) => r[axes.value]),
        itemStyle: { color: '#3fd0c9', borderRadius: [4, 4, 0, 0] }
      }]
    }
  }, [rows, columns])

  return (
    <div className="chart-panel">
      <div className="chart-panel__label mono">VISUALIZATION</div>
      {option ? (
        <ReactECharts option={option} style={{ height: 320 }} theme="dark" />
      ) : (
        <div className="chart-panel__empty">No numeric field to chart yet — try Group By or Aggregate.</div>
      )}
    </div>
  )
}
