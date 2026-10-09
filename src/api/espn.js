// Talks to ESPN's public sports API and turns its responses into one
// simple "game" shape that the rest of the app can use for any sport:
//
// {
//   id, name, state: 'pre' | 'in' | 'post', status, startTime,
//   competitors: [{ name, shortName, score, winner }]
// }

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports'

// Live games first, then upcoming, then finished.
const STATE_ORDER = { in: 0, pre: 1, post: 2 }

// Tennis tournaments include hundreds of matches, so only keep ones near now.
const TENNIS_WINDOW_MS = 12 * 60 * 60 * 1000

export async function fetchGames(sport, league) {
  const response = await fetch(`${BASE_URL}/${league.path}/scoreboard`)
  if (!response.ok) {
    throw new Error(`ESPN request failed (${response.status})`)
  }
  const data = await response.json()
  const events = data.events ?? []

  let games
  if (sport.kind === 'sets') {
    games = events.flatMap(tennisMatches)
  } else if (sport.kind === 'leaderboard') {
    games = events.map(golfTournament)
  } else {
    games = events.map(teamGame)
  }

  return games.sort(
    (a, b) => STATE_ORDER[a.state] - STATE_ORDER[b.state] || new Date(a.startTime) - new Date(b.startTime),
  )
}

function statusOf(status) {
  return { state: status.type.state, status: status.type.shortDetail }
}

// Soccer, rugby, football, basketball, baseball, hockey:
// one event = one game between two teams.
function teamGame(event) {
  const competition = event.competitions[0]
  // ESPN lists the home team first. US sports name games "Away at Home",
  // so flip those to match; "Home vs Away" names (soccer, rugby) stay as is.
  const competitors = event.name.includes(' at ')
    ? [...competition.competitors].reverse()
    : competition.competitors
  return {
    id: event.id,
    name: event.name,
    startTime: event.date,
    ...statusOf(competition.status ?? event.status),
    competitors: competitors.map((c) => ({
      name: c.team.displayName,
      shortName: c.team.abbreviation,
      score: c.score,
      winner: c.winner ?? false,
    })),
  }
}

// Tennis: one event = a whole tournament, so pull out each singles match.
function tennisMatches(event) {
  const singles = (event.groupings ?? []).filter((g) => g.grouping.displayName.includes('Singles'))
  const now = Date.now()
  const nearNow = (match) =>
    match.status.type.state === 'in' || Math.abs(new Date(match.date) - now) < TENNIS_WINDOW_MS

  return singles.flatMap((group) =>
    group.competitions.filter(nearNow).map((match) => ({
      id: match.id,
      name: [event.name, group.grouping.displayName, match.round?.displayName].filter(Boolean).join(' · '),
      startTime: match.date,
      ...statusOf(match.status),
      competitors: match.competitors.map((p) => ({
        name: p.athlete?.displayName ?? 'TBD',
        shortName: p.athlete?.shortName ?? 'TBD',
        score: (p.linescores ?? []).map((set) => set.value).join(' '),
        winner: p.winner ?? false,
      })),
    })),
  )
}

// Golf: one event = a tournament; competitors are the top of the leaderboard.
function golfTournament(event) {
  const competition = event.competitions[0]
  const { state, status } = statusOf(competition.status ?? event.status)
  return {
    id: event.id,
    name: event.name,
    startTime: event.date,
    state,
    status,
    competitors: competition.competitors.slice(0, 5).map((p) => ({
      name: p.athlete.displayName,
      shortName: p.athlete.shortName,
      score: p.score,
      winner: state === 'post' && p.order === 1,
    })),
  }
}
