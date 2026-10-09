import './StatusBadge.css'

const LABELS = { pre: 'Upcoming', in: 'Live', post: 'Final' }

export function StatusBadge({ state, replay = false }) {
  const kind = replay ? 'replay' : state
  return (
    <span className={`status-badge status-badge--${kind}`}>
      {kind === 'in' && <span className="live-dot" />}
      {replay ? '⏪ Replay' : LABELS[state]}
    </span>
  )
}
