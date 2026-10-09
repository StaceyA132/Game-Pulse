// Golf: there are no "plays", just hole-by-hole scores for each player.
// We pick out the holes worth talking about for players near the top:
// holes-in-one, eagles, birdie streaks, and big blow-up holes.

const TOP_PLAYERS = 10
const STREAK_LENGTH = 3

function toPar(hole) {
  const value = hole.scoreType?.displayValue
  return value === 'E' || value == null ? 0 : parseInt(value, 10)
}

function formatToPar(total) {
  if (total === 0) return 'E'
  return total > 0 ? `+${total}` : `${total}`
}

// Walks one player's holes in the order they played them.
function playerMoments(game, player) {
  const name = player.athlete.displayName
  const moments = []
  let total = 0
  let streak = 0

  for (const round of player.linescores ?? []) {
    for (const hole of round.linescores ?? []) {
      const diff = toPar(hole)
      total += diff
      streak = diff < 0 ? streak + 1 : 0

      const moment = {
        id: `${game.id}-${player.id}-r${round.period}-h${hole.period}`,
        round: round.period,
        team: null,
        player: name,
        score: `${player.athlete.shortName} ${formatToPar(total)}`,
        clock: `R${round.period} · Hole ${hole.period}`,
      }

      if (hole.value === 1) {
        moments.push({ ...moment, type: 'ace', label: 'Hole-in-one', major: true, text: `${name} makes a hole-in-one on ${hole.period}` })
      } else if (diff <= -2) {
        const label = diff === -2 ? 'Eagle' : 'Albatross'
        moments.push({ ...moment, type: 'eagle', label, major: true, text: `${name} makes ${label.toLowerCase()} on ${hole.period}` })
      } else if (diff >= 2) {
        const label = diff === 2 ? 'Double bogey' : 'Triple bogey or worse'
        moments.push({ ...moment, type: 'bogey', label, major: false, text: `${name} drops shots with a ${label.toLowerCase()} on ${hole.period}` })
      } else if (streak === STREAK_LENGTH) {
        moments.push({ ...moment, type: 'birdie', label: 'Birdie streak', major: false, text: `${name} is on fire: ${STREAK_LENGTH} birdies in a row, through ${hole.period}` })
      }
    }
    // Streaks don't carry over between rounds.
    streak = 0
  }
  return moments
}

export function golfMoments(game) {
  const players = game.raw.competitions[0].competitors.slice(0, TOP_PLAYERS)

  // Round order; within a round, each player's holes stay in play order.
  const moments = players.flatMap((player) => playerMoments(game, player)).sort((a, b) => a.round - b.round)

  const leaders = players.filter((p) => p.score === players[0]?.score)
  if (leaders.length) {
    const names = leaders.map((p) => p.athlete.displayName).join(' and ')
    const leadScore = players[0].score
    const finished = game.state === 'post'
    const tied = leaders.length > 1

    let label = tied ? 'Tied for the lead' : 'Leader'
    let text = `${names} ${tied ? 'share' : 'leads'} the ${game.name} at ${leadScore}`
    if (finished) {
      label = tied ? 'Playoff' : 'Winner'
      text = tied ? `${names} finish tied at ${leadScore}` : `${names} wins the ${game.name} at ${leadScore}`
    }

    moments.push({
      id: `${game.id}-leader-${leaders.map((p) => p.id).join('-')}-${leadScore}${finished ? '-final' : ''}`,
      type: finished ? 'final' : 'leader',
      label,
      major: true,
      team: null,
      player: names,
      text,
      score: leaders.map((p) => `${p.athlete.shortName} ${p.score}`).join(', '),
      clock: game.status,
    })
  }

  return moments
}
