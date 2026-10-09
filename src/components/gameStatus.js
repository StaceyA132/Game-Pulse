// Short status text for a game card or the ticker:
// upcoming -> start time, live -> ESPN's clock ('54'', 'Q3 8:24'),
// finished -> nothing extra unless it adds something ('Final/OT').
export function gameStatusText(game) {
  if (game.state === 'pre') {
    const start = new Date(game.startTime)
    const sameDay = start.toDateString() === new Date().toDateString()
    const time = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    return sameDay ? time : `${start.toLocaleDateString([], { month: 'short', day: 'numeric' })} · ${time}`
  }
  if (game.state === 'post' && /^(FT|Final)$/i.test(game.status)) return ''
  return game.status
}
