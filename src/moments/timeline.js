// Soccer and rugby: ESPN's scoreboard includes a timeline of match events
// (goals, tries, cards). It doesn't include the running score, so we add it up.

import { finalMoment, scoreLine, teamInfo } from './shared'

// Rugby events don't carry a points value, so look it up by type.
const RUGBY_POINTS = {
  try: 5,
  'penalty try': 7,
  conversion: 2,
  'penalty goal': 3,
  'drop goal': 3,
}

const MAJOR_LABELS = ['Goal', 'Try', 'Penalty try', 'Red card', 'Own goal']

// How each kind of event reads in a sentence: '<player> scores for <team>'.
// Phrases that don't end in 'for'/'to' read as '<player> (<team>) is shown a yellow card'.
const PHRASES = {
  Goal: 'scores for',
  'Penalty goal': 'scores a penalty for',
  'Own goal': 'turns it into their own net, gifting a goal to',
  'Shootout penalty': 'scores in the shootout for',
  Try: 'scores a try for',
  'Penalty try': 'is awarded a penalty try',
  Conversion: 'converts for',
  'Penalty goal (rugby)': 'kicks a penalty for',
  'Drop goal': 'lands a drop goal for',
  'Yellow card': 'is shown a yellow card',
  'Red card': 'is sent off with a red card',
}

function describe(label, sportId, player, team) {
  const key = sportId === 'rugby' && label === 'Penalty goal' ? 'Penalty goal (rugby)' : label
  const phrase = PHRASES[key]
  const who = player ?? team?.name ?? 'Someone'
  if (!phrase) return [label, player, team && `(${team.name})`].filter(Boolean).join(' ')
  if (/ (for|to)$/.test(phrase)) return `${who} ${phrase} ${team?.name ?? 'their team'}`
  return player && team ? `${player} (${team.name}) ${phrase}` : `${who} ${phrase}`
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function timelineMoments(sport, game) {
  const details = game.raw.competitions[0].details ?? []
  const scores = {}
  const seen = {}
  const moments = []

  for (const detail of details) {
    const typeText = detail.type.text
    const isCard = detail.yellowCard || detail.redCard || /card/i.test(typeText)
    const points =
      sport.id === 'rugby'
        ? (RUGBY_POINTS[typeText.toLowerCase()] ?? 0)
        : detail.scoringPlay && !detail.shootout
          ? detail.scoreValue
          : 0

    // Skip substitutions and anything else that isn't a score or a card.
    if (!points && !isCard && !(detail.scoringPlay && detail.shootout)) continue

    const teamId = detail.team?.id
    if (points) scores[teamId] = (scores[teamId] ?? 0) + points

    // Soccer goal types look like 'Goal - Header'; keep just 'Goal'.
    let label = capitalize(typeText.split(' - ')[0])
    if (detail.ownGoal) label = 'Own goal'
    if (detail.penaltyKick && points) label = 'Penalty goal'
    if (detail.shootout) label = 'Shootout penalty'

    const player = detail.athletesInvolved?.[0]?.displayName ?? null
    const team = teamInfo(game, teamId)
    const clock = detail.clock?.displayValue ?? ''

    // Same minute + type + player can happen twice, so count repeats.
    const key = `${clock}-${typeText}-${teamId}-${player}`
    seen[key] = (seen[key] ?? 0) + 1

    moments.push({
      id: `${game.id}-${key}-${seen[key]}`,
      type: isCard ? 'card' : 'score',
      label,
      major: MAJOR_LABELS.includes(label),
      team,
      player,
      text: describe(label, sport.id, player, team),
      score: points ? scoreLine(game, scores) : null,
      clock,
    })
  }

  if (game.state === 'post') moments.push(finalMoment(game))
  return moments
}
