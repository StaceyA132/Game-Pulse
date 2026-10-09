// Helpers used by more than one sport's moment converter.

// 'LEE 1 – 2 ARS', using the game's display order of teams.
// `scoresById` maps a competitor id to their score at that moment.
export function scoreLine(game, scoresById) {
  const [first, second] = game.competitors
  return `${first.shortName} ${scoresById[first.id] ?? 0} – ${scoresById[second.id] ?? 0} ${second.shortName}`
}

export function teamInfo(game, teamId) {
  const team = game.competitors.find((c) => c.id === teamId)
  return team ? { name: team.name, nickname: team.nickname, shortName: team.shortName, logo: team.logo } : null
}

// The closing "Final" moment for a finished team game.
export function finalMoment(game) {
  const scores = Object.fromEntries(game.competitors.map((c) => [c.id, c.score]))
  const winner = game.competitors.find((c) => c.winner)
  return {
    id: `${game.id}-final`,
    type: 'final',
    label: 'Final',
    major: true,
    team: winner ? teamInfo(game, winner.id) : null,
    player: null,
    text: winner ? `${winner.name} win` : 'It ends level',
    score: scoreLine(game, scores),
    clock: 'Final',
  }
}
