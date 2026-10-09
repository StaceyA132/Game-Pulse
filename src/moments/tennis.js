// Tennis: ESPN gives each player's games per set. Every finished set is a
// moment, and so is the match result.

function setScore(winnerSet, loserSet) {
  // Tiebreak sets show the loser's tiebreak points: 7-6(5)
  const tiebreak = winnerSet.tiebreak != null ? `(${Math.min(winnerSet.tiebreak, loserSet.tiebreak)})` : ''
  return `${winnerSet.value}-${loserSet.value}${tiebreak}`
}

export function tennisMoments(game) {
  const [a, b] = game.raw.competitors
  const aSets = a.linescores ?? []
  const bSets = b.linescores ?? []
  const finished = game.state === 'post'
  const name = (p) => p.athlete?.displayName ?? 'TBD'
  const moments = []
  const setsWon = { [a.id]: 0, [b.id]: 0 }

  // While live, the last set is still being played.
  const completed = finished ? aSets.length : aSets.length - 1

  for (let i = 0; i < completed; i++) {
    const aWon = aSets[i].winner ?? aSets[i].value > bSets[i].value
    const [winner, loser] = aWon ? [a, b] : [b, a]
    const [winnerSet, loserSet] = aWon ? [aSets[i], bSets[i]] : [bSets[i], aSets[i]]
    setsWon[winner.id]++

    moments.push({
      id: `${game.id}-set-${i + 1}`,
      type: 'set',
      label: 'Set won',
      major: false,
      team: null,
      player: name(winner),
      text: `${name(winner)} takes set ${i + 1} against ${name(loser)}, ${setScore(winnerSet, loserSet)}`,
      score: `Sets: ${a.athlete?.shortName} ${setsWon[a.id]} – ${setsWon[b.id]} ${b.athlete?.shortName}`,
      clock: `Set ${i + 1}`,
    })
  }

  if (finished) {
    const winner = a.winner ? a : b.winner ? b : null
    const loser = winner === a ? b : a
    if (winner) {
      const winnerSets = winner === a ? aSets : bSets
      const loserSets = winner === a ? bSets : aSets
      const line = winnerSets.map((set, i) => setScore(set, loserSets[i])).join(', ')
      moments.push({
        id: `${game.id}-match`,
        type: 'match',
        label: 'Match won',
        major: true,
        team: null,
        player: name(winner),
        text: `${name(winner)} beats ${name(loser)} ${line}`,
        score: `Sets: ${a.athlete?.shortName} ${setsWon[a.id]} – ${setsWon[b.id]} ${b.athlete?.shortName}`,
        clock: 'Final',
      })
    }
  }

  return moments
}
