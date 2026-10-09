// Football, basketball, baseball, hockey: moments come from the game summary.
// The NFL provides a list of scoring plays; the other leagues give full
// play-by-play with each scoring play marked.

import { finalMoment, scoreLine, teamInfo } from './shared'

function clockFor(sport, play) {
  const n = play.period?.number
  const clock = play.clock?.displayValue
  if (sport.id === 'football' || sport.id === 'basketball') return n > 4 ? `OT ${clock}` : `Q${n} ${clock}`
  if (sport.id === 'hockey') return n > 3 ? `OT ${clock}` : `P${n} ${clock}`
  // Baseball has no clock: 'Top 2nd Inning'
  return [play.period?.type, play.period?.displayValue].filter(Boolean).join(' ')
}

// Decide whether a scoring play is worth a moment, and what to call it.
// Returns null to skip the play.
function describe(sport, play, leadChanged) {
  const typeText = play.type?.text ?? ''
  const text = play.text ?? ''

  if (sport.id === 'football') {
    // 'Field Goal Good' -> 'Field Goal'
    return { label: typeText.replace(/ Good$/, '') || 'Score', major: /touchdown/i.test(typeText) }
  }
  if (sport.id === 'hockey') {
    return { label: 'Goal', major: true }
  }
  if (sport.id === 'baseball') {
    return /homered/i.test(text) ? { label: 'Home run', major: true } : { label: 'Run scores', major: false }
  }
  // Basketball has ~100+ baskets a game, so keep only the highlights:
  // lead changes, dunks, and threes late in a close game.
  const clutch = play.period?.number >= 4 && Math.abs(play.homeScore - play.awayScore) <= 5
  if (leadChanged) return { label: 'Lead change', major: false }
  if (/dunk/i.test(typeText)) return { label: 'Dunk', major: false }
  if (play.scoreValue === 3 && clutch) return { label: 'Clutch three', major: true }
  return null
}

export function scoringMoments(sport, game, summary) {
  const home = game.competitors.find((c) => c.homeAway === 'home')
  const away = game.competitors.find((c) => c.homeAway === 'away')
  const plays = summary.scoringPlays ?? summary.plays ?? []
  const moments = []
  let lastLeader = null
  // Running score, for period markers (their own scores aren't reliable after shootouts).
  const scores = { [away.id]: 0, [home.id]: 0 }

  for (const play of plays) {
    // 'End of the 1st Quarter' style markers (only in full play-by-play).
    // Baseball has one per inning, which is too many to be interesting.
    const isPeriodEnd = sport.id !== 'baseball' && /^End of /.test(play.text ?? '') && !/Game|Shootout/.test(play.text)
    if (isPeriodEnd) {
      // ESPN sometimes repeats a marker (e.g. 'End of OT' twice).
      if (moments.at(-1)?.text === play.text) continue
      moments.push({
        id: `${game.id}-${play.id}`,
        type: 'period',
        label: 'End of period',
        major: false,
        team: null,
        player: null,
        text: play.text,
        score: scoreLine(game, scores),
        clock: clockFor(sport, play),
      })
      continue
    }
    if (!summary.scoringPlays && !play.scoringPlay) continue
    // Hockey shootout plays restart the count from 0, so skip them.
    if (play.awayScore + play.homeScore < scores[away.id] + scores[home.id]) continue
    scores[away.id] = play.awayScore
    scores[home.id] = play.homeScore

    const leader = play.homeScore > play.awayScore ? 'home' : play.awayScore > play.homeScore ? 'away' : lastLeader
    const leadChanged = lastLeader !== null && leader !== lastLeader
    lastLeader = leader

    const kind = describe(sport, play, leadChanged)
    if (!kind) continue

    moments.push({
      id: `${game.id}-${play.id}`,
      type: 'score',
      label: kind.label,
      major: kind.major,
      team: teamInfo(game, play.team?.id),
      player: play.participants?.[0]?.athlete?.displayName ?? null,
      text: play.text,
      score: scoreLine(game, { [away.id]: play.awayScore, [home.id]: play.homeScore }),
      clock: clockFor(sport, play),
    })
  }

  if (game.state === 'post') moments.push(finalMoment(game))
  return moments
}
