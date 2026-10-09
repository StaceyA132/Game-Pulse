export function MomentFeed({ moments, newIds }) {
  return (
    <section>
      <h3>All moments ({moments.length})</h3>
      <ol>
        {moments.map((m) => (
          <li key={m.id}>
            {newIds.has(m.id) ? '🆕 ' : ''}[{m.clock}] {m.major ? '⭐ ' : ''}
            <strong>{m.label}</strong> — {m.text}
            {m.score && ` (${m.score})`}
          </li>
        ))}
      </ol>
    </section>
  )
}
