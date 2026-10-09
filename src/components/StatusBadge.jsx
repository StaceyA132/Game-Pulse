const LABELS = { pre: 'Upcoming', in: '🔴 LIVE', post: 'Final' }

export function StatusBadge({ state, replay = false }) {
  return <strong>[{replay ? '⏪ REPLAY' : LABELS[state]}]</strong>
}
