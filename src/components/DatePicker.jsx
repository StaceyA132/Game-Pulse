// `date` is 'YYYY-MM-DD', or '' for today.
export function DatePicker({ date, onChange }) {
  return (
    <div className="date-picker">
      <input type="date" aria-label="Date" value={date} onChange={(e) => onChange(e.target.value)} />
      <button className="btn" aria-pressed={!date} onClick={() => onChange('')}>
        Today
      </button>
    </div>
  )
}
