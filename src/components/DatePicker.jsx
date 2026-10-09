// `date` is 'YYYY-MM-DD', or '' for today.
export function DatePicker({ date, onChange }) {
  return (
    <section>
      <h2>Date</h2>
      <input type="date" value={date} onChange={(e) => onChange(e.target.value)} />{' '}
      <button onClick={() => onChange('')} disabled={!date}>
        Today
      </button>
    </section>
  )
}
